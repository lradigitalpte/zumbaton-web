/**
 * Public API: active header ticker announcements (no auth).
 * GET /api/announcements/active
 *
 * Supports placeholders filled from DB:
 *   {{EARLY_BIRD_REMAINING}} – spots left (0–40)
 *   {{EARLY_BIRD_DISCOUNT}}  – e.g. 10
 *   {{EARLY_BIRD_MONTHS}}    – e.g. 2
 * Announcements that use these placeholders are hidden when 0 spots left.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const EARLY_BIRD_LIMIT = 40
const EARLY_BIRD_DISCOUNT = 10
const EARLY_BIRD_MONTHS = 2

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json([], { status: 200 })
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch early bird stats from DB (same logic as /api/promos/availability)
    const { count } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('early_bird_eligible', true)
    const earlyBirdRemaining = Math.max(0, EARLY_BIRD_LIMIT - (count ?? 0))

    const { data, error } = await supabase
      .from('announcements')
      .select('id, message, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[API announcements/active]', error)
      return NextResponse.json([], { status: 200 })
    }

    const list = (data ?? []) as { id: string; message: string; sort_order: number }[]
    const hasEarlyBirdPlaceholder = (msg: string) =>
      /\{\{EARLY_BIRD_REMAINING\}\}|\{\{EARLY_BIRD_DISCOUNT\}\}|\{\{EARLY_BIRD_MONTHS\}\}/.test(msg)

    const out: { id: string; message: string; sort_order: number }[] = []
    for (const row of list) {
      // Hide early-bird-only messages when no spots left
      if (hasEarlyBirdPlaceholder(row.message) && earlyBirdRemaining === 0) continue

      let message = row.message
        .replace(/\{\{EARLY_BIRD_REMAINING\}\}/g, String(earlyBirdRemaining))
        .replace(/\{\{EARLY_BIRD_DISCOUNT\}\}/g, String(EARLY_BIRD_DISCOUNT))
        .replace(/\{\{EARLY_BIRD_MONTHS\}\}/g, String(EARLY_BIRD_MONTHS))

      out.push({ ...row, message })
    }

    return NextResponse.json(out)
  } catch (e) {
    console.error('[API announcements/active]', e)
    return NextResponse.json([], { status: 200 })
  }
}
