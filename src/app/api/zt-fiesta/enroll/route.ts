import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

const FiestaSchema = z.object({
  packageOption: z.enum(["1_session", "2_sessions", "4_sessions"]),
  customerName: z.string().min(1).max(200),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1).max(50),
  participantName: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

const PACKAGE_MAP = {
  "1_session": { sessions: 1, priceCents: 2800, label: "1 session" },
  "2_sessions": { sessions: 2, priceCents: 5400, label: "2 sessions" },
  "4_sessions": { sessions: 4, priceCents: 10500, label: "4 sessions" },
} as const;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = await request.json();
    const parsed = FiestaSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message || "Invalid input." }, { status: 400 });
    }

    const body = parsed.data;
    const pkg = PACKAGE_MAP[body.packageOption];

    const validFrom = new Date();
    const validUntil = new Date(validFrom);
    validUntil.setMonth(validUntil.getMonth() + 1);

    const { data, error } = await supabaseAdmin
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
        notes: body.notes || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[ZT Fiesta Enroll] Failed to create enrollment:", error);
      return NextResponse.json({ success: false, message: "Unable to save enrollment." }, { status: 500 });
    }

    return NextResponse.json({ success: true, enrollmentId: data.id });
  } catch (error) {
    console.error("[ZT Fiesta Enroll] Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
