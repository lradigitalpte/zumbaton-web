import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const paymentId = request.nextUrl.searchParams.get("payment_id");
    if (!paymentId) {
      return NextResponse.json({ success: false, message: "Missing payment_id" }, { status: 400 });
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("id, status, amount_cents, currency, metadata")
      .eq("id", paymentId)
      .maybeSingle();

    if (paymentError || !payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    const metadata = (payment.metadata as Record<string, unknown> | null) || {};
    const enrollmentId = typeof metadata.enrollment_id === "string" ? metadata.enrollment_id : null;
    let enrollmentStatus: string | null = null;

    if (enrollmentId) {
      const { data: enrollment } = await supabaseAdmin
        .from("manual_class_enrollments")
        .select("payment_status")
        .eq("id", enrollmentId)
        .maybeSingle();
      enrollmentStatus = enrollment?.payment_status || null;
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentStatus: payment.status,
        enrollmentStatus,
        packageLabel: metadata.package_label || "1 session",
        customerName: metadata.customer_name || "",
        preferredDate: metadata.preferred_date || "",
        preferredTime: metadata.preferred_time || "",
        amount: payment.amount_cents / 100,
        currency: payment.currency,
      },
    });
  } catch (error) {
    console.error("[ZT Fiesta Status] Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
