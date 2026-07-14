import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { placeholderGuestEmailFromPhone } from "@/lib/guest-email-placeholder";
import {
  BOOKING_WINDOW_CLOSED_MESSAGE,
  isBookingWindowOpen,
  logBookingWindowRejection,
} from "@/lib/booking-window";

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

const ZumFamiliaSchema = z.object({
  classId: z.string().uuid("Invalid class ID").optional().or(z.null()),
  customSchedule: z.string().optional(),
  packageOption: z.enum(["1c1a", "1c2a", "2c1a", "2c2a", "test"]),
  parentName: z.string().min(1).max(200),
  parentEmail: z.string().max(200).optional(),
  parentPhone: z.string().min(1).max(50),
  childName: z.string().min(1).max(200),
  childDateOfBirth: z.string().min(1),
  notes: z.string().max(1000).optional(),
  nricLast4: z.string().length(4, "NRIC last 4 characters required"),
  signature: z.string().min(1, "Signature is required"),
  waiverAgreed: z.literal(true, { errorMap: () => ({ message: "Waiver must be accepted" }) }),
});

const PRICE_MAP = {
  "1c1a": { label: "1 child + 1 adult", priceCents: 3800 },
  "1c2a": { label: "1 child + 2 adults", priceCents: 5600 },
  "2c1a": { label: "2 children + 1 adult", priceCents: 5800 },
  "2c2a": { label: "2 children + 2 adults", priceCents: 7600 },
  "test": { label: "HitPay Test Package", priceCents: 100 },
} as const;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!HITPAY_API_KEY) {
      return NextResponse.json({ success: false, message: "Payment gateway not configured." }, { status: 500 });
    }

    const payload = await request.json();
    const parsed = ZumFamiliaSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message || "Invalid form data." }, { status: 400 });
    }

    const body = parsed.data;
    const parentEmailRaw = (body.parentEmail || "").trim();
    const parentEmail =
      parentEmailRaw.includes("@") && !parentEmailRaw.includes(" ")
        ? parentEmailRaw.toLowerCase()
        : placeholderGuestEmailFromPhone(body.parentPhone);
    const pricing = PRICE_MAP[body.packageOption];

    let classTitle = "Custom Schedule: " + (body.customSchedule || "TBD");
    let actualClassId = body.classId;

    if (actualClassId) {
      const { data: classData, error: classError } = await supabaseAdmin
        .from("classes")
        .select("*")
        .eq("id", actualClassId)
        .eq("status", "scheduled")
        .single();

      if (classError || !classData) {
        return NextResponse.json({ success: false, message: "Selected class is not available." }, { status: 404 });
      }
      if (!isBookingWindowOpen(classData.scheduled_at)) {
        logBookingWindowRejection("zumfamilia payment");
        return NextResponse.json({ success: false, message: BOOKING_WINDOW_CLOSED_MESSAGE }, { status: 400 });
      }
      classTitle = classData.title;
    } else {
      // Find or create a placeholder class for custom schedules to satisfy DB constraints
      let { data: customClass } = await supabaseAdmin
        .from("classes")
        .select("id")
        .eq("title", "ZumFamilia Custom Schedule")
        .maybeSingle();

      if (!customClass) {
        const { data: newClass } = await supabaseAdmin
          .from("classes")
          .insert({
            title: "ZumFamilia Custom Schedule",
            description: "System placeholder class for custom schedule requests.",
            class_type: "dance",
            scheduled_at: new Date().toISOString(),
            capacity: 999,
            status: "cancelled", // keeps it off public schedule
          })
          .select("id")
          .single();
        customClass = newClass;
      }
      actualClassId = customClass?.id || null;
    }

    // We may not be able to create a bookings record if class_id is NOT NULL or if we don't have it.
    // Let's try creating it with class_id = body.classId || null. If it fails, that's okay, we'll store all details in the payment metadata.
    let draftBookingId = null;
    const { data: draftBooking, error: draftError } = await supabaseAdmin
      .from("bookings")
      .insert({
        class_id: actualClassId,
        guest_name: body.childName,
        guest_email: parentEmail,
        guest_phone: body.parentPhone,
        guest_date_of_birth: body.childDateOfBirth,
        status: "draft",
        is_trial_booking: true,
        tokens_used: 0,
        booked_at: new Date().toISOString(),
        cancellation_reason: [
          body.notes || (body.customSchedule ? `Requested Schedule: ${body.customSchedule}` : null),
          `Parent: ${body.parentName} | NRIC: ${body.nricLast4} | Sign: ${body.signature}`,
        ]
          .filter(Boolean)
          .join(" | "),
      })
      .select()
      .single();

    if (!draftError && draftBooking) {
      draftBookingId = draftBooking.id;
    }

    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        class_id: actualClassId,
        is_trial_booking: true,
        amount_cents: pricing.priceCents,
        currency: "SGD",
        status: "pending",
        provider: "hitpay",
        metadata: {
          flow_type: "zumfamilia",
          draft_booking_id: draftBookingId,
          package_option: body.packageOption,
          package_label: pricing.label,
          parent_name: body.parentName,
          parent_email: parentEmail,
          parent_phone: body.parentPhone,
          child_name: body.childName,
          child_date_of_birth: body.childDateOfBirth,
          custom_schedule: body.customSchedule || null,
          notes: body.notes || "",
          class_title: classTitle,
          nric_last_4: body.nricLast4,
          signature: body.signature,
          waiver_agreed: body.waiverAgreed,
        },
      })
      .select()
      .single();

    if (paymentError || !paymentRecord) {
      console.error("[ZumFamilia Payment] paymentError:", paymentError);
      return NextResponse.json({ success: false, message: "Unable to create payment record." }, { status: 500 });
    }

    if (draftBookingId) {
      await supabaseAdmin.from("bookings").update({ payment_id: paymentRecord.id }).eq("id", draftBookingId);
    }

    const referenceNumber = `ZUMFAM-${actualClassId || "CUSTOM"}-${Date.now()}`;
    const redirectUrl = `${APP_URL}/zumfamilia/success?payment_id=${paymentRecord.id}`;
    const webhookUrl = `${APP_URL}/api/payments/webhook`;

    // Ensure URLs are properly formatted (no trailing slashes except for root)
    const cleanRedirectUrl = redirectUrl.replace(/([^:]\/)\/+/g, '$1');
    const cleanWebhookUrl = webhookUrl.replace(/([^:]\/)\/+/g, '$1');

    const hitpayPayload: Record<string, unknown> = {
      amount: (pricing.priceCents / 100).toFixed(2),
      currency: "SGD",
      email: parentEmail,
      name: body.parentName,
      purpose: `ZumFamilia: ${pricing.label}`,
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
      console.error("[ZumFamilia Payment] HitPay request failed:", hitpayResponse.status, hitpayData);
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed", failure_reason: hitpayData?.message || hitpayData?.error || "HitPay request failed" })
        .eq("id", paymentRecord.id);

      void Promise.resolve().then(async () => {
        const { sendPaymentAlertEmail } = await import("@/lib/email");
        await sendPaymentAlertEmail({
          paymentId: paymentRecord.id,
          event: "failed",
          paymentType: "trial-booking",
          source: "checkout-created",
          amount: paymentRecord.amount_cents / 100,
          currency: paymentRecord.currency,
          guestName: body.childName,
          guestEmail: parentEmail,
          className: classTitle,
          failureReason: (hitpayData?.message || hitpayData?.error || "HitPay request failed") as string,
        });
      }).catch((alertErr: unknown) => {
        console.error("[ZumFamilia Payment] Non-critical: failed to send failed payment alert:", alertErr);
      });

      return NextResponse.json({ success: false, message: "Unable to create payment request: " + (hitpayData?.message || hitpayData?.error || "Unknown error") }, { status: 500 });
    }

    await supabaseAdmin
      .from("payments")
      .update({
        hitpay_payment_request_id: hitpayData.id,
        hitpay_payment_url: hitpayData.url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentRecord.id);

    void Promise.resolve().then(async () => {
      const { sendPaymentAlertEmail } = await import("@/lib/email");
      await sendPaymentAlertEmail({
        paymentId: paymentRecord.id,
        event: "initiated",
        paymentType: "trial-booking",
        source: "checkout-created",
        amount: paymentRecord.amount_cents / 100,
        currency: paymentRecord.currency,
        guestName: body.childName,
        guestEmail: parentEmail,
        className: classTitle,
      });
    }).catch((alertErr: unknown) => {
      console.error("[ZumFamilia Payment] Non-critical: failed to send initiated payment alert:", alertErr);
    });

    return NextResponse.json({
      success: true,
      paymentUrl: hitpayData.url,
      paymentId: paymentRecord.id,
    });
  } catch (error) {
    console.error("[ZumFamilia Payment] Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
