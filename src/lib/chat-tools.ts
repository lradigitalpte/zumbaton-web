/**
 * Tool implementations for the AI chat widget (Phase 1 — no embeddings).
 *
 * Each tool wraps an existing, already-trusted data path (getPublicClasses,
 * getDuoPromoConfig) rather than querying Supabase directly, so the chat
 * route can't drift from what the rest of the site shows.
 */

import { getPublicClasses, formatClassScheduleLine } from '@/lib/classes-server'
import { getDuoPromoConfig, isDuoPromoExpired } from '@/lib/duo-promo-config'

const SG_TIMEZONE = 'Asia/Singapore'

export const CHAT_TOOLS = [
  {
    name: 'get_schedule',
    description:
      "Get One Step Fitness's upcoming scheduled classes, with spots remaining, price, instructor, and location. Use this for any question about class times, availability, or what's on a given day.",
    parametersJsonSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Start date, YYYY-MM-DD. Optional.' },
        to: { type: 'string', description: 'End date, YYYY-MM-DD. Optional.' },
        class_type: {
          type: 'string',
          description:
            "Filter by class type, e.g. 'zumba', 'yoga', 'pilates', 'hiit', 'dance', 'strength', 'cardio', 'stretch'. Optional.",
        },
      },
    },
  },
  {
    name: 'get_promo_pricing',
    description:
      "Get the current 1-for-1 Duo Trial promo pricing and how a visitor can book it (pay online now, reserve and pay at the studio, or both). Use this for any pricing or 'how do I try it' question.",
    parametersJsonSchema: {
      type: 'object',
      properties: {},
    },
  },
]

export async function runChatTool(name: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (name === 'get_schedule') {
    return getScheduleResult(input)
  }
  if (name === 'get_promo_pricing') {
    return getPromoPricingResult()
  }
  return { error: `Unknown tool: ${name}` }
}

async function getScheduleResult(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const from = typeof input.from === 'string' ? input.from : undefined
  const to = typeof input.to === 'string' ? input.to : undefined
  const classType = typeof input.class_type === 'string' ? input.class_type.toLowerCase() : undefined

  const classes = await getPublicClasses({ from, to })
  const filtered = classType ? classes.filter((c) => c.class_type.toLowerCase() === classType) : classes

  if (filtered.length === 0) {
    return { classes: [], note: 'No scheduled classes found for that range.' }
  }

  const results = filtered.slice(0, 20).map((cls) => ({
    title: cls.title,
    class_type: cls.class_type,
    when: formatClassScheduleLine(cls),
    when_iso: cls.scheduled_at,
    duration_minutes: cls.duration_minutes,
    instructor: cls.instructor_name || 'TBA',
    location: cls.location || (cls.is_outdoor ? 'Outdoor' : 'Studio'),
    spots_left: Math.max(0, cls.capacity - cls.booked_count),
    capacity: cls.capacity,
    trial_price_sgd: cls.trial_price_cents != null ? cls.trial_price_cents / 100 : null,
  }))

  return { timezone: SG_TIMEZONE, classes: results }
}

async function getPromoPricingResult(): Promise<Record<string, unknown>> {
  const config = await getDuoPromoConfig()

  if (!config.active || isDuoPromoExpired(config)) {
    return {
      active: false,
      note: 'The 1-for-1 Duo Trial promo is not currently running.',
    }
  }

  return {
    active: true,
    indoor_price_sgd: config.indoorPriceCents / 100,
    outdoor_price_sgd: config.outdoorPriceCents / 100,
    booking_mode: config.bookingMode,
    payment_terms: config.paymentTerms,
    deposit_percent: config.paymentTerms === 'deposit' ? config.depositPercent : undefined,
    end_date: config.endDate,
    how_to_book:
      'Direct the visitor to /start (fastest, pay-first, staff schedules them after) or /promos (pick a class and date up front).',
  }
}
