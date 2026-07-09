import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

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
      .select("id, status, metadata, class_id")
      .eq("id", paymentId)
      .eq("is_trial_booking", true)
      .maybeSingle();

    if (paymentError || !payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    const meta = (payment.metadata as Record<string, unknown>) || {};
    if (meta.flow_type !== "quick_trial") {
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
      .select("id, title, scheduled_at, capacity, status, is_outdoor, age_group")
      .eq("id", classId)
      .eq("status", "scheduled")
      .single();

    if (classErr || !cls) {
      return NextResponse.json({ success: false, error: "Class not available" }, { status: 404 });
    }

    // Must be an indoor adult/all trial option (no outdoor, no kids)
    if (cls.is_outdoor === true) {
      return NextResponse.json(
        { success: false, error: "Outdoor classes are not available for this offer" },
        { status: 400 }
      );
    }
    if (cls.age_group === "kid") {
      return NextResponse.json(
        { success: false, error: "Kids classes are not available for this offer" },
        { status: 400 }
      );
    }

    const { data: bookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("class_id", classId)
      .in("status", ["confirmed", "attended"]);

    const bookedCount = bookings?.length ?? 0;
    if (bookedCount >= (cls.capacity ?? 0)) {
      return NextResponse.json({ success: false, error: "This class is full" }, { status: 400 });
    }

    const guestName = typeof meta.guest_name === "string" ? meta.guest_name : "Guest";
    const guestEmail = typeof meta.guest_email === "string" ? meta.guest_email : "";
    const guestPhone = typeof meta.guest_phone === "string" ? meta.guest_phone : "";

    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        class_id: classId,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        is_trial_booking: true,
        status: "confirmed",
        tokens_used: 0,
        booked_at: new Date().toISOString(),
        payment_id: paymentId,
        cancellation_reason: "START QUICK TRIAL — PAID (class chosen by guest)",
      })
      .select("id")
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json(
        { success: false, error: bookingErr?.message || "Failed to record booking" },
        { status: 500 }
      );
    }

    const newMeta = {
      ...meta,
      selected_class_id: classId,
      selected_class_at: new Date().toISOString(),
      selected_class_source: "start_pick",
    };

    await supabase
      .from("payments")
      .update({ class_id: classId, metadata: newMeta, updated_at: new Date().toISOString() })
      .eq("id", paymentId);

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

