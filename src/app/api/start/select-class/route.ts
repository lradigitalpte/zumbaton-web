import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import {
  BOOKING_WINDOW_CLOSED_MESSAGE,
  isBookingWindowOpen,
  logBookingWindowRejection,
} from "@/lib/booking-window";

export const dynamic = "force-dynamic";

function isPaid(status: string | null | undefined) {
  const s = (status || "").toLowerCase();
  return s === "succeeded" || s === "completed";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { paymentId?: string; classId?: string };
    const paymentId = body.paymentId;
    const classId = body.classId;
    if (!paymentId || !classId) {
      return NextResponse.json(
        { success: false, error: "paymentId and classId are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("id, status, amount_cents, currency, metadata, class_id")
      .eq("id", paymentId)
      .eq("is_trial_booking", true)
      .maybeSingle();

    if (paymentError || !payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    const meta = (payment.metadata as Record<string, unknown>) || {};
    const flowType = meta.flow_type;
    const venue = typeof meta.venue === "string" ? meta.venue : null;
    const canSelectClass = flowType === "quick_trial" || flowType === "quick_join";
    if (!canSelectClass) {
      return NextResponse.json(
        { success: false, error: "This payment is not eligible for trial class selection" },
        { status: 400 }
      );
    }

    if (!isPaid(payment.status)) {
      return NextResponse.json(
        { success: false, error: "Payment not completed yet" },
        { status: 400 }
      );
    }

    // Idempotency: already selected
    const existingSelected =
      (typeof meta.selected_class_id === "string" ? meta.selected_class_id : null) ||
      (typeof payment.class_id === "string" ? payment.class_id : null);
    if (existingSelected) {
      return NextResponse.json({
        success: true,
        data: { alreadySelected: true, classId: existingSelected },
      });
    }

    // Validate class exists and has space
    const { data: cls, error: classErr } = await supabase
      .from("classes")
      .select("id, title, scheduled_at, capacity, status, is_outdoor, age_group, location, instructor_name")
      .eq("id", classId)
      .eq("status", "scheduled")
      .single();

    if (classErr || !cls) {
      return NextResponse.json({ success: false, error: "Class not available" }, { status: 404 });
    }

    // Class venue must match what the guest paid for (indoor vs outdoor pricing differs).
    const wantsOutdoor = venue === "outdoor";
    if (Boolean(cls.is_outdoor) !== wantsOutdoor) {
      return NextResponse.json(
        {
          success: false,
          error: wantsOutdoor
            ? "Please choose one of our outdoor sessions."
            : "Outdoor classes are not available for this offer.",
        },
        { status: 400 }
      );
    }
    if (cls.age_group === "kid") {
      return NextResponse.json(
        { success: false, error: "Kids classes are not available for this offer" },
        { status: 400 }
      );
    }

    // Match the regular trial-booking rule. Client filtering is only UX;
    // this server check prevents stale pages or direct requests bypassing it.
    if (!isBookingWindowOpen(cls.scheduled_at)) {
      logBookingWindowRejection("start trial class selection");
      return NextResponse.json(
        { success: false, error: BOOKING_WINDOW_CLOSED_MESSAGE },
        { status: 400 }
      );
    }

    const { data: bookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("class_id", classId)
      .in("status", ["confirmed", "attended"]);

    const guestName = typeof meta.guest_name === "string" ? meta.guest_name : "Guest";
    const guestEmail = typeof meta.guest_email === "string" ? meta.guest_email : "";
    const guestPhone = typeof meta.guest_phone === "string" ? meta.guest_phone : "";
    const companionName = typeof meta.companion_name === "string" ? meta.companion_name : "";
    const companionEmail = typeof meta.companion_email === "string" ? meta.companion_email : "";
    const companionPhone = typeof meta.companion_phone === "string" ? meta.companion_phone : "";
    const hasCompanion = Boolean(companionName && companionEmail);

    const bookedCount = bookings?.length ?? 0;
    const spotsNeeded = hasCompanion ? 2 : 1;
    if (bookedCount + spotsNeeded > (cls.capacity ?? 0)) {
      return NextResponse.json(
        {
          success: false,
          error: hasCompanion ? "Not enough spots left in this class for both guests" : "This class is full",
        },
        { status: 400 }
      );
    }

    const bookingsToInsert = [
      {
        class_id: classId,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        is_trial_booking: true,
        status: "confirmed" as const,
        tokens_used: 0,
        booked_at: new Date().toISOString(),
        payment_id: paymentId,
        cancellation_reason: "START TRIAL — PAID (class chosen by guest)",
      },
    ];
    if (hasCompanion) {
      bookingsToInsert.push({
        class_id: classId,
        guest_name: companionName,
        guest_email: companionEmail,
        guest_phone: companionPhone,
        is_trial_booking: true,
        status: "confirmed" as const,
        tokens_used: 0,
        booked_at: new Date().toISOString(),
        payment_id: paymentId,
        cancellation_reason: "START TRIAL — PAID (companion, class chosen by guest)",
      });
    }

    const { data: insertedBookings, error: bookingErr } = await supabase
      .from("bookings")
      .insert(bookingsToInsert)
      .select("id");

    if (bookingErr || !insertedBookings || insertedBookings.length === 0) {
      return NextResponse.json(
        { success: false, error: bookingErr?.message || "Failed to record booking" },
        { status: 500 }
      );
    }
    const booking = insertedBookings[0]
    const companionBooking = hasCompanion ? insertedBookings[1] : null

    const newMeta = {
      ...meta,
      needs_scheduling: false,
      lead_status: "scheduled",
      selected_class_id: classId,
      selected_class_at: new Date().toISOString(),
      selected_class_source: "start_pick",
      booked_booking_id: booking.id,
      booked_companion_booking_id: companionBooking?.id || null,
      booked_class_id: classId,
      booked_class_title: cls.title,
      booked_class_at: cls.scheduled_at,
    };

    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({ class_id: classId, metadata: newMeta, updated_at: new Date().toISOString() })
      .eq("id", paymentId);
    if (paymentUpdateError) {
      console.error("[Start Select Class] Failed to update payment:", paymentUpdateError);
    }

    // Resolve the earlier "needs scheduling" alert now that the guest chose a class.
    const resolvedAt = new Date().toISOString();
    const { error: resolveNotificationError } = await supabase
      .from("notifications")
      .update({ status: "read", read_at: resolvedAt })
      .contains("data", { payment_id: paymentId, needs_scheduling: true })
      .is("read_at", null);
    if (resolveNotificationError) {
      console.error("[Start Select Class] Failed to resolve scheduling alerts:", resolveNotificationError);
    }

    const scheduledAt = new Date(cls.scheduled_at);
    const classDate = scheduledAt.toLocaleDateString("en-SG", {
      weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Singapore",
    });
    const classTime = scheduledAt.toLocaleTimeString("en-SG", {
      hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Singapore",
    });
    const classLocation = cls.location || "One Step Fitness studio";

    // Notify active admins in-app that no manual scheduling action is required.
    const { data: adminUsers, error: adminError } = await supabase
      .from("user_profiles")
      .select("id")
      .in("role", ["admin", "super_admin"])
      .eq("is_active", true);
    if (adminError) {
      console.error("[Start Select Class] Failed to load admin recipients:", adminError);
    } else if (adminUsers?.length) {
      const { error: notificationError } = await supabase.from("notifications").insert(
        adminUsers.map((admin) => ({
          user_id: admin.id,
          type: "trial_booking",
          channel: "in_app",
          subject: "CLASS SELECTED — trial booking confirmed",
          body: `${guestName}${hasCompanion ? ` (+1: ${companionName})` : ""} selected ${cls.title} on ${classDate} at ${classTime}. No scheduling follow-up is needed.`,
          status: "sent",
          sent_at: resolvedAt,
          data: {
            payment_id: paymentId,
            booking_id: booking.id,
            class_id: classId,
            needs_scheduling: false,
            guest_name: guestName,
            class_name: cls.title,
            class_at: cls.scheduled_at,
          },
        }))
      );
      if (notificationError) {
        console.error("[Start Select Class] Failed to create class-selected notifications:", notificationError);
      }
    }

    // Email both the guest and configured staff. Email failures must not undo a valid booking.
    try {
      const { sendTrialBookingConfirmationEmail, sendTrialBookingAdminNotificationEmail } = await import("@/lib/email");
      const { getStaffAlertRecipients } = await import("@/lib/alert-email-recipients");
      const amount = Number(payment.amount_cents || 0) / 100;
      const currency = payment.currency || "SGD";
      if (guestEmail.includes("@") && !guestEmail.includes("@guest.")) {
        const guestResult = await sendTrialBookingConfirmationEmail({
          guestEmail, guestName, className: cls.title, classDate, classTime,
          classLocation, instructorName: cls.instructor_name || undefined, amount, currency,
        });
        if (!guestResult.success) console.error("[Start Select Class] Guest confirmation email failed:", guestResult.error);
      }
      if (hasCompanion && companionEmail.includes("@") && !companionEmail.includes("@guest.")) {
        const companionResult = await sendTrialBookingConfirmationEmail({
          guestEmail: companionEmail, guestName: companionName, className: cls.title, classDate, classTime,
          classLocation, instructorName: cls.instructor_name || undefined, amount: 0, currency,
        });
        if (!companionResult.success) console.error("[Start Select Class] Companion confirmation email failed:", companionResult.error);
      }
      const adminEmails = await getStaffAlertRecipients(supabase);
      if (adminEmails.length) {
        const adminResult = await sendTrialBookingAdminNotificationEmail({
          adminEmails, guestName, guestEmail, guestPhone, className: cls.title, classDate, classTime,
          classLocation, instructorName: cls.instructor_name || undefined, amount, currency, bookingId: booking.id,
        });
        if (!adminResult.success) console.error("[Start Select Class] Staff class-selected email failed:", adminResult.error);
      }
    } catch (emailError) {
      console.error("[Start Select Class] Non-critical confirmation email error:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: { bookingId: booking.id, classId },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

