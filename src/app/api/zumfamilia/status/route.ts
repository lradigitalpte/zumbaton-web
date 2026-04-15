import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const HITPAY_ENV = process.env.HITPAY_ENV || "sandbox";
const HITPAY_API_URL =
  HITPAY_ENV === "live" ? "https://api.hit-pay.com/v1" : "https://api.sandbox.hit-pay.com/v1";
const HITPAY_API_KEY = process.env.HITPAY_API_KEY;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("payment_id");
    if (!paymentId) {
      return NextResponse.json({ success: false, message: "payment_id is required" }, { status: 400 });
    }

    let { data: payment, error } = await supabaseAdmin
      .from("payments")
      .select("*, classes(*)")
      .eq("id", paymentId)
      .single();

    if (error || !payment) {
      return NextResponse.json({ success: false, message: "Payment not found." }, { status: 404 });
    }

    const metadata = (payment.metadata as Record<string, any>) || {};
    const isZumFamilia = metadata.flow_type === "zumfamilia";
    if (!isZumFamilia) {
      return NextResponse.json({ success: false, message: "Not a ZumFamilia payment." }, { status: 400 });
    }

    if ((payment.status === "pending" || payment.status === "in_progress") && payment.hitpay_payment_request_id && HITPAY_API_KEY) {
      const syncResponse = await fetch(`${HITPAY_API_URL}/payment-requests/${payment.hitpay_payment_request_id}`, {
        headers: { "X-BUSINESS-API-KEY": HITPAY_API_KEY },
      });
      const syncData = syncResponse.ok ? await syncResponse.json() : null;
      const hitpayStatus = syncData?.status?.toLowerCase();

      if (hitpayStatus === "completed" || hitpayStatus === "succeeded") {
        const hitpayPaymentId = syncData?.payments?.[0]?.id || null;
        await supabaseAdmin
          .from("payments")
          .update({ status: "succeeded", hitpay_payment_id: hitpayPaymentId, updated_at: new Date().toISOString() })
          .eq("id", payment.id);

        const draftBookingId = typeof metadata.draft_booking_id === "string" ? metadata.draft_booking_id : null;
        if (draftBookingId) {
          await supabaseAdmin
            .from("bookings")
            .update({ status: "confirmed", payment_id: payment.id, booked_at: new Date().toISOString() })
            .eq("id", draftBookingId);
        } else {
          await supabaseAdmin
            .from("bookings")
            .update({ status: "confirmed", booked_at: new Date().toISOString() })
            .eq("payment_id", payment.id);
        }

        const refreshed = await supabaseAdmin.from("payments").select("*, classes(*)").eq("id", payment.id).single();
        if (refreshed.data) payment = refreshed.data;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount_cents / 100,
        currency: payment.currency,
        packageLabel: metadata.package_label || "ZumFamilia",
        className: payment.classes?.title || "Class",
        classDateTime: payment.classes?.scheduled_at || null,
      },
    });
  } catch (error) {
    console.error("[ZumFamilia Status] Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
