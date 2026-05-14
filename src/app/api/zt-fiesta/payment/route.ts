import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const HITPAY_ENV = process.env.HITPAY_ENV || "sandbox";
const HITPAY_API_URL =
  HITPAY_ENV === "live" ? "https://api.hit-pay.com/v1" : "https://api.sandbox.hit-pay.com/v1";
const HITPAY_API_KEY = process.env.HITPAY_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function isPublicHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    if (LOCAL_HOSTNAMES.has(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

const FiestaPaymentSchema = z.object({
  packageOption: z.enum(["1_session"]),
  customerName: z.string().min(1).max(200),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1).max(50),
  dateOfBirth: z.string().min(1),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  participantName: z.string().max(200).optional(),
  preferredDate: z.string().min(1),
  preferredTime: z.string().min(1),
  notes: z.string().max(1000).optional(),
  nricLast4: z.string().length(4, "NRIC last 4 characters required"),
  signature: z.string().min(1, "Signature is required"),
  waiverAgreed: z.literal(true, { errorMap: () => ({ message: "Waiver must be accepted" }) }),
});

const PACKAGE_MAP = {
  "1_session": { sessions: 1, priceCents: 2800, label: "1 session" },
} as const;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!HITPAY_API_KEY) {
      return NextResponse.json({ success: false, message: "Payment gateway not configured." }, { status: 500 });
    }

    const payload = await request.json();
    const parsed = FiestaPaymentSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message || "Invalid form data." },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const pkg = PACKAGE_MAP[body.packageOption];

    let actualClassId: string | null = null;
    let { data: placeholderClass } = await supabaseAdmin
      .from("classes")
      .select("id")
      .eq("title", "ZumFiesta Guest Booking")
      .maybeSingle();

    if (!placeholderClass) {
      const { data: newClass } = await supabaseAdmin
        .from("classes")
        .insert({
          title: "ZumFiesta Guest Booking",
          description: "System placeholder class for ZumFiesta guest checkout.",
          class_type: "dance",
          scheduled_at: new Date().toISOString(),
          capacity: 999,
          status: "cancelled",
        })
        .select("id")
        .single();
      placeholderClass = newClass;
    }
    actualClassId = placeholderClass?.id || null;

    const validFrom = new Date();
    const validUntil = new Date(validFrom);
    validUntil.setMonth(validUntil.getMonth() + 1);

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from("manual_class_enrollments")
      .insert({
        program_type: "zt_fiesta",
        source: "public_form",
        customer_name: body.customerName,
        customer_email: body.customerEmail.toLowerCase(),
        customer_phone: body.customerPhone,
        participant_name: body.participantName || null,
        package_code: body.packageOption,
        package_label: pkg.label,
        sessions_purchased: pkg.sessions,
        sessions_used: 0,
        price_cents: pkg.priceCents,
        currency: "SGD",
        payment_status: "pending",
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        attendance_status: "not_started",
        notes: [
          `DOB: ${body.dateOfBirth}`,
          `Gender: ${body.gender}`,
          `Preferred: ${body.preferredDate} ${body.preferredTime}`,
          `NRIC: ${body.nricLast4}`,
          `Signature: ${body.signature}`,
          body.notes?.trim() ? `Notes: ${body.notes.trim()}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
      })
      .select("id")
      .single();

    if (enrollmentError || !enrollment) {
      console.error("[ZT Fiesta Payment] Failed to create enrollment:", enrollmentError);
      return NextResponse.json({ success: false, message: "Unable to create enrollment record." }, { status: 500 });
    }

    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        class_id: actualClassId,
        is_trial_booking: false,
        amount_cents: pkg.priceCents,
        currency: "SGD",
        status: "pending",
        provider: "hitpay",
        metadata: {
          flow_type: "zt_fiesta",
          enrollment_id: enrollment.id,
          package_option: body.packageOption,
          package_label: pkg.label,
          customer_name: body.customerName,
          customer_email: body.customerEmail.toLowerCase(),
          customer_phone: body.customerPhone,
          participant_name: body.participantName || null,
          guest_date_of_birth: body.dateOfBirth,
          guest_gender: body.gender,
          preferred_date: body.preferredDate,
          preferred_time: body.preferredTime,
          nric_last_4: body.nricLast4,
          signature: body.signature,
          waiver_agreed: true,
          notes: body.notes || "",
          class_title: "ZumFiesta",
        },
      })
      .select()
      .single();

    if (paymentError || !paymentRecord) {
      console.error("[ZT Fiesta Payment] Failed to create payment:", paymentError);
      return NextResponse.json({ success: false, message: "Unable to create payment record." }, { status: 500 });
    }

    const referenceNumber = `ZTFIESTA-${Date.now()}`;
    const redirectUrl = `${APP_URL}/zt-fiesta/success?payment_id=${paymentRecord.id}`;
    const webhookUrl = `${APP_URL}/api/payments/webhook`;
    const cleanRedirectUrl = redirectUrl.replace(/([^:]\/)\/+/g, "$1");
    const cleanWebhookUrl = webhookUrl.replace(/([^:]\/)\/+/g, "$1");

    const hitpayPayload: Record<string, unknown> = {
      amount: (pkg.priceCents / 100).toFixed(2),
      currency: "SGD",
      email: body.customerEmail.toLowerCase(),
      name: body.customerName,
      purpose: `ZumFiesta: ${pkg.label}`,
      reference_number: referenceNumber,
      redirect_url: cleanRedirectUrl,
      send_email: true,
    };

    if (isPublicHttpUrl(cleanWebhookUrl)) {
      hitpayPayload.webhook = cleanWebhookUrl;
    }

    const hitpayResponse = await fetch(`${HITPAY_API_URL}/payment-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BUSINESS-API-KEY": HITPAY_API_KEY,
      },
      body: JSON.stringify(hitpayPayload),
    });

    const hitpayData = await hitpayResponse.json();

    if (!hitpayResponse.ok) {
      console.error("[ZT Fiesta Payment] HitPay request failed:", hitpayResponse.status, hitpayData);
      await supabaseAdmin
        .from("payments")
        .update({
          status: "failed",
          failure_reason: hitpayData?.message || hitpayData?.error || "HitPay request failed",
        })
        .eq("id", paymentRecord.id);
      return NextResponse.json(
        {
          success: false,
          message: "Unable to create payment request: " + (hitpayData?.message || hitpayData?.error || "Unknown error"),
        },
        { status: 500 },
      );
    }

    await supabaseAdmin
      .from("payments")
      .update({
        hitpay_payment_request_id: hitpayData.id,
        hitpay_payment_url: hitpayData.url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentRecord.id);

    return NextResponse.json({
      success: true,
      paymentUrl: hitpayData.url,
      paymentId: paymentRecord.id,
    });
  } catch (error) {
    console.error("[ZT Fiesta Payment] Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
