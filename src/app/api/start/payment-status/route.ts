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
      .select("id, status, class_id, hitpay_payment_request_id, metadata, created_at")
      .eq("id", paymentId)
      .eq("is_trial_booking", true)
      .maybeSingle();

    if (error || !payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    const meta = (payment.metadata as Record<string, unknown>) || {};
    const flowType = typeof meta.flow_type === "string" ? meta.flow_type : null;
    const isQuickTrial = flowType === "quick_trial";

    // If pending, attempt a lightweight HitPay poll (same as other flows)
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
          await supabase
            .from("payments")
            .update({ status: "succeeded", updated_at: new Date().toISOString() })
            .eq("id", paymentId);
          payment.status = "succeeded";
        }
      } catch {
        // non-fatal: return current status
      }
    }

    const selectedClassId =
      (typeof meta.selected_class_id === "string" ? meta.selected_class_id : null) ||
      (typeof payment.class_id === "string" ? payment.class_id : null);

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
        isQuickTrial,
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

