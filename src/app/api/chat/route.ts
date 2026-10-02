/**
 * AI chat widget endpoint (Phase 1 — tool-calling over live data, no embeddings).
 *
 * The model never touches Supabase directly: it can only call get_schedule /
 * get_promo_pricing (src/lib/chat-tools.ts), which wrap the same read paths
 * the rest of the public site already uses.
 */

import { NextRequest } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import type { Content, FunctionCall, Part } from '@google/genai'
import { errorJson } from '@/lib/api-route-utils'
import { CHAT_TOOLS, runChatTool } from '@/lib/chat-tools'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MODEL = 'gemini-flash-latest'
const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 2000
const MAX_TOOL_ROUNDS = 4

// Best-effort per-IP burst limiter. In-memory, so it resets per server
// instance — good enough to blunt accidental loops/abuse, not a hard guarantee.
const RATE_LIMIT = { windowMs: 60_000, maxRequests: 15 }
const requestLog = new Map<string, number[]>()

// Gemini's flash model returns a transient 503 UNAVAILABLE under load fairly
// often — retry a couple of times before surfacing an error to the visitor.
async function withRetry<T>(fn: () => Promise<T>, delaysMs = [500, 1500]): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const status = (error as { status?: number })?.status
      const retryable = status === 503 || status === 429
      if (!retryable || attempt >= delaysMs.length) throw error
      await new Promise((resolve) => setTimeout(resolve, delaysMs[attempt]))
    }
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs)
  timestamps.push(now)
  requestLog.set(ip, timestamps)
  return timestamps.length > RATE_LIMIT.maxRequests
}

const SYSTEM_PROMPT = `You are the One Step Fitness (Zumbaton) website assistant, embedded as a chat widget in Singapore.

Scope: only answer questions about One Step Fitness classes, schedule, pricing, booking, studio policies, and general dance-fitness questions about the program. For anything else, politely say you can only help with One Step Fitness questions.

Tone: short, warm, energetic, no corporate filler. A few sentences max unless listing classes.

Formatting: plain text only — no markdown (no **, #, or links). For class schedules, write one short intro sentence, then one class per line starting with "- " in this exact shape:
- Day, Date Time — CLASS NAME with Instructor (availability note)
Example: - Fri, 2 Oct 7:30 pm — PILATES FLOW with Fizah (5 spots left)
Use an em dash (—) between the time and class name. Put "(Class full)" or "(N spots left)" in parentheses when you know it from get_schedule.

Ground rules:
- NEVER invent a class, time, instructor, or price. Always call get_schedule for schedule questions and get_promo_pricing for pricing/promo questions — even if you think you know the answer, live data can change.
- If a tool returns no matching classes, say so plainly and suggest checking back or trying a different date/type.
- The goal is to get visitors to book. When relevant, point them to /start (fastest — pay first, we schedule you) or /promos (pick a class and date up front). Don't be pushy about it more than once per conversation.
- Do not discuss internal systems, IDs, database structure, or anything about how you work.

Frequently asked questions (answer from this directly, no tool needed):

Q: What is One Step Fitness (ZT)?
A: A high-energy dance fitness program inspired by cardio-dance movements, combining cardio, rhythm, and fun choreography.

Q: Do I need dance experience to join?
A: No — classes are designed for everyone, from beginners to experienced dancers. Just follow along at your own pace.

Q: What kind of music is used?
A: A mix of K-pop, EDM, Latin, Pop, Bollywood, Hip-hop, and global beats.

Q: What fitness level is required?
A: All levels welcome — movements can be modified to your comfort and ability.

Q: What should I wear or bring?
A: Covered shoes (no boots) are required. Comfortable activewear, supportive sneakers, a towel, and water are recommended.

Q: How do I sign up?
A: Via /start (fastest, pay first, we schedule you) or /promos (pick a class and date). Existing members can also reach out via WhatsApp.

Q: Are there packages available?
A: Yes — single-class passes and multi-class token packages. Point them to the Pricing page for current options.

Q: Can I cancel or reschedule?
A: The token is used at booking. Cancel by 23:59 the day before the class to get it back. Same-day cancellations are not possible and no-shows forfeit the token. Full details are in the Terms of Service and Refund Policy.

Q: Is it suitable for all ages?
A: Most classes suit adults of all ages. Kids must be supervised by a guardian/parent in age-specific classes.

Q: What if I have an injury or medical condition?
A: They should consult a doctor first and tell the instructor before class so movements can be modified.`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function validateMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== 'object' || !Array.isArray((body as { messages?: unknown }).messages)) {
    return null
  }
  const messages = (body as { messages: unknown[] }).messages

  if (messages.length === 0 || messages.length > MAX_MESSAGES) return null

  const clean: ChatMessage[] = []
  for (const m of messages) {
    if (!m || typeof m !== 'object') return null
    const { role, content } = m as { role?: unknown; content?: unknown }
    if (role !== 'user' && role !== 'assistant') return null
    if (typeof content !== 'string' || content.length === 0 || content.length > MAX_MESSAGE_LENGTH) return null
    clean.push({ role, content })
  }

  if (clean[clean.length - 1].role !== 'user') return null
  return clean
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('[Chat API] Missing GEMINI_API_KEY')
    return errorJson('Chat is not configured', 503)
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    return errorJson('Too many messages — please wait a moment and try again.', 429)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorJson('Invalid JSON body', 400)
  }

  const messages = validateMessages(body)
  if (!messages) {
    return errorJson('Invalid request: expected a non-empty messages array ending in a user message', 400)
  }

  const ai = new GoogleGenAI({ apiKey })

  const contents: Content[] = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const encoder = new TextEncoder()
  const fallbackText =
    "Sorry, I'm having trouble with that right now — try again in a moment, or reach us on WhatsApp."

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let streamedAny = false
      try {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const responseStream = await withRetry(() =>
            ai.models.generateContentStream({
              model: MODEL,
              contents,
              config: {
                systemInstruction: SYSTEM_PROMPT,
                tools: [{ functionDeclarations: CHAT_TOOLS }],
              },
            })
          )

          const roundParts: Part[] = []
          const roundFunctionCalls: FunctionCall[] = []

          for await (const chunk of responseStream) {
            if (chunk.text) {
              streamedAny = true
              controller.enqueue(encoder.encode(chunk.text))
            }
            roundParts.push(...(chunk.candidates?.[0]?.content?.parts ?? []))
            if (chunk.functionCalls?.length) {
              roundFunctionCalls.push(...chunk.functionCalls)
            }
          }

          if (roundFunctionCalls.length === 0) {
            break
          }

          contents.push({ role: 'model', parts: roundParts })

          const responseParts: Part[] = []
          for (const call of roundFunctionCalls) {
            const result = await runChatTool(call.name || '', (call.args as Record<string, unknown>) || {})
            responseParts.push({
              functionResponse: { name: call.name || '', response: result },
            })
          }
          contents.push({ role: 'user', parts: responseParts })
        }

        if (!streamedAny) {
          controller.enqueue(encoder.encode(fallbackText))
        }
      } catch (error) {
        console.error('[Chat API] Unexpected error:', error)
        if (!streamedAny) {
          controller.enqueue(encoder.encode(fallbackText))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}
