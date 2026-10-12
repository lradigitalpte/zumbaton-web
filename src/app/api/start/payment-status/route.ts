import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const HITPAY_ENV = process.env.HITPAY_ENV || "sandbox";
const HITPAY_API_URL =
  HITPAY_ENV === "live" ? "https://api.hit-pay.com/v1" : "https://api.sandbox.hit-pay.com/v1";
const HITPAY_API_KEY = process.env.HITPAY_API_KEY;

function isPaid(status: string | null | undefined) {
  const s = (status || "").toLowerCase();
  return s === "succeeded" || s === "completed";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("payment_id");
    if (!paymentId) {
      return NextResponse.json({ success: false, error: "payment_id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: payment, error } = await supabase
      .from("payments")
      .select("id, status, class_id, amount_cents, currency, hitpay_payment_request_id, metadata, created_at")
      .eq("id", paymentId)
      .eq("is_trial_booking", true)
      .maybeSingle();

    if (error || !payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    const meta = (payment.metadata as Record<string, unknown>) || {};
    const flowType = typeof meta.flow_type === "string" ? meta.flow_type : null;
    const venue = typeof meta.venue === "string" ? meta.venue : null;
    const canSelectClass = flowType === "quick_trial" || flowType === "quick_join";

    const selectedClassId =
      (typeof meta.selected_class_id === "string" ? meta.selected_class_id : null) ||
      (typeof payment.class_id === "string" ? payment.class_id : null);

    // If pending, sync with HitPay and confirm the booking (same as /api/trial-booking/status),
    // so the class is booked even if the webhook is late or missed.
    if (
      !isPaid(payment.status) &&
      (payment.status === "pending" || payment.status === "in_progress") &&
      payment.hitpay_payment_request_id &&
      HITPAY_API_KEY
    ) {
      try {
        const hitpayRes = await fetch(
          `${HITPAY_API_URL}/payment-requests/${payment.hitpay_payment_request_id}`,
          { headers: { "X-BUSINESS-API-KEY": HITPAY_API_KEY } }
        );
        const hitpayData = hitpayRes.ok ? await hitpayRes.json() : null;
        const hitpayStatus = (hitpayData?.status as string | undefined)?.toLowerCase?.() ?? null;
        if (hitpayStatus === "completed" || hitpayStatus === "succeeded") {
          const hitpayPaymentId = (hitpayData?.payments?.[0]?.id as string | undefined) ?? null;

          // Only the request that flips pending → succeeded does the follow-up work,
          // so a page refresh (or the webhook arriving) can't double-send emails.
          const { data: flipped } = await supabase
            .from("payments")
            .update({ status: "succeeded", hitpay_payment_id: hitpayPaymentId, updated_at: new Date().toISOString() })
            .eq("id", paymentId)
            .in("status", ["pending", "in_progress"])
            .select("id");
          payment.status = "succeeded";

          if (flipped && flipped.length > 0) {
            // Confirm draft bookings (metadata.draft_booking_id(s) or linked by payment_id).
            // The webhook will see the payment as already processed, so this must happen here.
            const draftIds = new Set<string>();
            if (typeof meta.draft_booking_id === "string") draftIds.add(meta.draft_booking_id);
            if (Array.isArray(meta.draft_booking_ids)) {
              for (const id of meta.draft_booking_ids) if (typeof id === "string") draftIds.add(id);
            }
            const { data: byPayment } = await supabase
              .from("bookings")
              .select("id")
              .eq("payment_id", paymentId)
              .eq("status", "draft")
              .eq("is_trial_booking", true);
            for (const b of byPayment || []) draftIds.add(b.id);

            if (draftIds.size > 0) {
              await supabase
                .from("bookings")
                .update({
                  status: "confirmed",
                  payment_id: paymentId,
                  booked_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .in("id", [...draftIds])
                .eq("status", "draft");
            }

            const guestName = typeof meta.guest_name === "string" ? meta.guest_name : "Guest";
            const guestEmail = typeof meta.guest_email === "string" ? meta.guest_email : "";
            const guestPhone = typeof meta.guest_phone === "string" ? meta.guest_phone : "";
            const classTitle = typeof meta.class_title === "string" ? meta.class_title : "Trial Class";
            const amountCents = typeof payment.amount_cents === "number" ? payment.amount_cents : 0;
            const currency = typeof payment.currency === "string" ? payment.currency : "SGD";

            // Guest confirmation email (the webhook would normally send this)
            if (guestEmail && selectedClassId) {
              void Promise.resolve().then(async () => {
                const { data: cls } = await supabase
                  .from("classes")
                  .select("title, scheduled_at, location, instructor_name")
                  .eq("id", selectedClassId)
                  .maybeSingle();
                if (!cls) return;
                const { sendTrialBookingConfirmationEmail } = await import("@/lib/email");
                await sendTrialBookingConfirmationEmail({
                  guestEmail,
                  guestName,
                  className: cls.title,
                  classDate: new Date(cls.scheduled_at).toLocaleDateString("en-SG", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Singapore",
                  }),
                  classTime: new Date(cls.scheduled_at).toLocaleTimeString("en-SG", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Singapore",
                  }),
                  classLocation: cls.location || "TBA",
                  instructorName: cls.instructor_name || undefined,
                  amount: amountCents / 100,
                  currency,
                });
              }).catch((emailErr: unknown) => {
                console.error("[Start Payment Status] Guest confirmation email failed:", emailErr);
              });
            }

            void Promise.resolve().then(async () => {
              const { sendPaymentAlertEmail } = await import("@/lib/email");
              await sendPaymentAlertEmail({
                paymentId,
                event: "succeeded",
                paymentType: "trial-booking",
                source: "status-sync",
                amount: amountCents / 100,
                currency,
                guestName,
                guestEmail,
                guestPhone,
                className: classTitle,
              });
            }).catch((alertErr: unknown) => {
              console.error("[Start Payment Status] Payment alert send failed:", alertErr);
            });

            void (async () => {
              const { createAndSendInvoice } = await import("@/lib/invoicing");
              await createAndSendInvoice({
                paymentId,
                hitpayPaymentId,
                amountCents,
                currency,
                description: `${classTitle} — Trial Class`,
                guestName,
                guestEmail,
                guestPhone,
              });
            })().catch((invoiceErr: unknown) => {
              console.error("[Start Payment Status] Invoice send failed:", invoiceErr);
            });
          }
        }
      } catch (syncErr) {
        console.error("[Start Payment Status] HitPay sync error:", syncErr);
        // non-fatal: return current status
      }
    }

    let selectedClass: {
      id: string;
      title: string;
      scheduled_at: string;
      duration_minutes: number;
      location: string | null;
      instructor_name: string | null;
    } | null = null;

    if (selectedClassId) {
      const { data: cls } = await supabase
        .from("classes")
        .select("id, title, scheduled_at, duration_minutes, location, instructor_name")
        .eq("id", selectedClassId)
        .maybeSingle();
      if (cls) selectedClass = cls;
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: payment.status,
        isPaid: isPaid(payment.status),
        flowType,
        venue,
        canSelectClass,
        guestName: typeof meta.guest_name === "string" ? meta.guest_name : "",
        guestEmail: typeof meta.guest_email === "string" ? meta.guest_email : "",
        guestPhone: typeof meta.guest_phone === "string" ? meta.guest_phone : "",
        selectedClassId,
        selectedClass,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

