import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Dev-only helper: create a fake "paid" quick_trial payment so you can test
 * /start/pick-class without doing a real HitPay checkout.
 */
export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Not available" }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
    };

    const guestName = (body.guestName || "Test Guest").trim();
    const guestEmail = (body.guestEmail || "test@example.com").trim().toLowerCase();
    const guestPhone = (body.guestPhone || "+65 9000 0000").trim();

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("payments")
      .insert({
        is_trial_booking: true,
        amount_cents: 2300,
        currency: "SGD",
        status: "succeeded",
        provider: "hitpay",
        metadata: {
          flow_type: "quick_trial",
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          needs_scheduling: true,
          lead_status: "new",
          reference_number: `DEBUG-QUICK-TRIAL-${Date.now()}`,
        },
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: error?.message || "Failed to seed payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { paymentId: data.id } });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

