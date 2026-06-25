/**
 * Resend test — loads .env.local when present.
 * Usage: node scripts/test-email.mjs recipient@email.com
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resend } from 'resend'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

const to = process.argv[2] || process.env.TEST_EMAIL
const apiKey = process.env.RESEND_API_KEY
const fromEmail =
  process.env.EMAIL_FROM ||
  process.env.RESEND_FROM_EMAIL ||
  process.env.SMTP_FROM_EMAIL
const fromName =
  process.env.EMAIL_FROM_NAME ||
  process.env.RESEND_FROM_NAME ||
  process.env.SMTP_FROM_NAME ||
  'One Step Fitness'

if (!apiKey) {
  console.error('Missing RESEND_API_KEY in environment.')
  process.exit(1)
}

if (!fromEmail) {
  console.error('Missing EMAIL_FROM (or RESEND_FROM_EMAIL) in environment.')
  process.exit(1)
}

if (!to || !to.includes('@')) {
  console.error('Usage: node scripts/test-email.mjs recipient@email.com')
  process.exit(1)
}

const resend = new Resend(apiKey)
const from = `${fromName} <${fromEmail}>`

console.log('Sending test email via Resend to', to)

const { data, error } = await resend.emails.send({
  from,
  to: [to],
  subject: 'One Step Fitness - Email Test',
  text: 'If you received this email, your Resend configuration is working correctly.',
  html: `<h2>Email Test</h2><p>If you received this email, your Resend configuration is working correctly.</p><p>Sent at: ${new Date().toISOString()}</p>`,
})

if (error) {
  console.error('FAILED:', error.message || error)
  process.exit(1)
}

console.log('SUCCESS')
console.log('Message ID:', data?.id)
