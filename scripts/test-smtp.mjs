/**
 * SMTP test — uses env vars from .env.local (or shell).
 * Usage: node scripts/test-smtp.mjs [recipient@email.com]
 */
import nodemailer from 'nodemailer'

const to = process.argv[2] || process.env.TEST_EMAIL
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
const smtpUser = process.env.SMTP_USER || process.env.SMTP_USERNAME
const smtpPassword = process.env.SMTP_PASSWORD
const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser
const fromName = process.env.SMTP_FROM_NAME || 'One Step Fitness'

if (!smtpUser || !smtpPassword) {
  console.error('Missing SMTP_USER and/or SMTP_PASSWORD in environment.')
  process.exit(1)
}

if (!to || !to.includes('@')) {
  console.error('Usage: node scripts/test-smtp.mjs recipient@email.com')
  process.exit(1)
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPassword },
})

console.log('Verifying SMTP connection...')
await transporter.verify()
console.log('OK — sending test email to', to)

const info = await transporter.sendMail({
  from: `"${fromName}" <${fromEmail}>`,
  to,
  subject: 'One Step Fitness - SMTP Test',
  text: 'If you received this email, your SMTP configuration is working correctly.',
  html: `<h2>SMTP Test</h2><p>If you received this email, your SMTP configuration is working correctly.</p><p>Sent at: ${new Date().toISOString()}</p>`,
})

console.log('SUCCESS')
console.log('Message ID:', info.messageId)
console.log('Response:', info.response)
