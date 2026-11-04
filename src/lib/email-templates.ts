/**
 * Email templates for One Step Fitness.
 *
 * Every template is built from the shared kit in ./email-kit (dashboard look:
 * black hero, lime pills, white cards on a grey tray). Each returns html + a
 * plain-text version. Escape every user-supplied value with esc().
 */

import {
  COLORS,
  STUDIO_EMAIL,
  STUDIO_PHONE_DISPLAY,
  STUDIO_WHATSAPP_URL,
  actionRow,
  adminUrl,
  button,
  card,
  chip,
  classTicket,
  codeBlock,
  contactCard,
  darkCard,
  detailRows,
  emailShell,
  esc,
  eyebrow,
  firstName,
  heading,
  hero,
  heroPhoto,
  lime,
  linkFallback,
  logoRow,
  para,
  plural,
  quoteCard,
  siteUrl,
  spacer,
  staffFooterCard,
  statTiles,
  strong,
  textToParagraphs,
  FONT,
} from './email-kit'

export interface EmailTemplateData {
  userName?: string
  [key: string]: unknown
}

type Template = { html: string; text: string }

const C = COLORS
const year = () => new Date().getFullYear()
const textFooter = () => `© ${year()} One Step Fitness · ${STUDIO_EMAIL} · WhatsApp ${STUDIO_PHONE_DISPLAY}`
const lines = (...parts: Array<string | null | undefined | false>) =>
  parts.filter((p) => p !== null && p !== undefined && p !== false).join('\n').replace(/\n{3,}/g, '\n\n').trim()

const CANCEL_RULE = 'Cancel by 23:59 the day before your class and your token goes straight back to your balance.'

function formatMoney(amount: number, currency = 'SGD'): string {
  try {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`
  }
}

function formatLongDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Singapore' })
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', timeZone: 'Asia/Singapore' })
}

// ===========================================================================
// Member emails
// ===========================================================================

export function getWelcomeEmailTemplate(data: { userName: string }): Template {
  const site = siteUrl()
  const step = (n: number, title: string, desc: string) => `<tr>
<td width="44" style="vertical-align:top;padding:0 0 18px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" style="width:34px;height:34px;background:${C.tile};border-radius:11px;font:800 14px/34px ${FONT};color:${C.lime}">${n}</td></tr></table></td>
<td style="vertical-align:top;padding:0 0 18px 6px"><p style="margin:0;font:700 15px/22px ${FONT};color:${C.ink}">${title}</p><p style="margin:2px 0 0;font:400 14px/21px ${FONT};color:${C.muted}">${desc}</p></td></tr>`

  const html = emailShell({
    preheader: 'Your first class is three taps away.',
    hero: hero({
      eyebrow: 'Welcome to the family',
      title: `You're in, ${esc(firstName(data.userName))}.<br>Let's get moving.`,
      sub: 'Dance cardio and step workouts for every level. Your first class is three taps away.',
      extra: heroPhoto(),
    }),
    cards: [
      card(`${eyebrow('Your first week', C.muted)}${heading('Three steps to your first class')}${spacer(10)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${step(1, 'Grab a token pack', 'One token books one class. Packs stay valid for 6 months.')}
${step(2, 'Pick a class', 'Browse the weekly schedule and book in seconds.')}
${step(3, 'Show up and have fun', 'Arrive 10 minutes early. Bring water and a towel.')}
</table>
${button('See token packs', `${site}/packages`)}${spacer(8)}${button('Browse classes', `${site}/classes`, 'white')}`),
    ],
  })

  const text = lines(
    `Welcome to One Step Fitness, ${data.userName}!`,
    '',
    'Your first class is three steps away:',
    '1. Grab a token pack. One token books one class. Packs stay valid for 6 months.',
    '2. Pick a class from the weekly schedule.',
    '3. Show up and have fun. Arrive 10 minutes early with water and a towel.',
    '',
    `See token packs: ${site}/packages`,
    `Browse classes: ${site}/classes`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getTokenPurchaseEmailTemplate(data: {
  userName: string
  packageName: string
  tokenCount: number
  amount: number
  currency?: string
  expiresAt: string
}): Template {
  const site = siteUrl()
  const amount = formatMoney(data.amount, data.currency || 'SGD')
  const expiry = formatLongDate(data.expiresAt)

  const html = emailShell({
    preheader: `${plural(data.tokenCount, 'token')} added. Valid until ${expiry}.`,
    hero: hero({
      eyebrow: 'Payment received',
      title: esc(amount),
      sub: `Thanks, ${esc(firstName(data.userName))}. ${plural(data.tokenCount, 'token')} ${data.tokenCount === 1 ? 'is' : 'are'} now in your account.`,
      right: chip('Paid'),
    }),
    cards: [
      statTiles([
        { value: `+${data.tokenCount}`, label: 'Tokens added', dark: true },
        { value: esc(formatShortDate(data.expiresAt)), label: 'Valid until' },
      ]),
      card(`${eyebrow('Receipt', C.muted)}${detailRows([
        ['Package', esc(data.packageName)],
        ['Tokens', String(data.tokenCount)],
        ['Valid until', esc(expiry)],
        ['Total paid', esc(amount)],
      ])}${spacer(18)}${button('Book a class', `${site}/classes`)}${spacer(8)}${button('View my packages', `${site}/my-packages`, 'white')}`),
    ],
  })

  const text = lines(
    'Payment received',
    '',
    `Hi ${data.userName},`,
    '',
    `Thanks for your payment. ${plural(data.tokenCount, 'token')} ${data.tokenCount === 1 ? 'has' : 'have'} been added to your account.`,
    '',
    `Package: ${data.packageName}`,
    `Tokens: ${data.tokenCount}`,
    `Valid until: ${expiry}`,
    `Total paid: ${amount}`,
    '',
    `Book a class: ${site}/classes`,
    `View my packages: ${site}/my-packages`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getTokenExpiryWarningEmailTemplate(data: {
  userName: string
  tokensRemaining: number
  expiresAt: string
}): Template {
  const site = siteUrl()
  const expiry = formatLongDate(data.expiresAt)
  const days = Math.max(0, Math.ceil((new Date(data.expiresAt).getTime() - Date.now()) / 86_400_000))
  const daysLabel = plural(days, 'day')

  const html = emailShell({
    preheader: `${plural(data.tokensRemaining, 'token')} expire on ${expiry}. Book a class before then.`,
    hero: hero({
      eyebrow: 'Use them before they go',
      title: `${lime(esc(plural(data.tokensRemaining, 'token')))} ${data.tokensRemaining === 1 ? 'expires' : 'expire'} in ${esc(daysLabel)}.`,
      sub: `They expire on ${esc(expiry)}. Book a class before then so none go to waste.`,
    }),
    cards: [
      statTiles([
        { value: String(data.tokensRemaining), label: 'Expiring', dark: true },
        { value: esc(formatShortDate(data.expiresAt)), label: 'Expiry date' },
        { value: String(days), label: 'Days left' },
      ]),
      card(`${heading('Book now, dance later')}${para('Unused tokens are lost after the expiry date and can’t be restored. Book a class now to use them.')}${button('Book a class', `${site}/classes`)}`),
    ],
  })

  const text = lines(
    'Your tokens are expiring soon',
    '',
    `Hi ${data.userName},`,
    '',
    `${plural(data.tokensRemaining, 'token')} expire in ${daysLabel}, on ${expiry}.`,
    'Unused tokens are lost after the expiry date. Book a class now to use them.',
    '',
    `Book a class: ${site}/classes`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getClassReminderEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  instructorName?: string
}): Template {
  const site = siteUrl()
  const tick = (t: string) => `<tr><td width="26" style="vertical-align:top;font:800 14px/22px ${FONT};color:${C.limeInk}">&#10003;</td><td style="font:400 15px/22px ${FONT};color:${C.body};padding-bottom:8px">${t}</td></tr>`

  const html = emailShell({
    preheader: `${data.className} at ${data.classTime}. Arrive 10 minutes early.`,
    hero: hero({
      eyebrow: 'Class in 3 hours',
      title: `${esc(data.className)}<br>${lime(esc(data.classTime))} today.`,
      sub: `See you soon, ${esc(firstName(data.userName))}. Your spot is saved.`,
    }),
    cards: [
      classTicket({
        className: data.className,
        classDate: data.classDate,
        classTime: data.classTime,
        instructorName: data.instructorName,
        status: 'Confirmed',
        rows: [['Location', esc(data.classLocation)]],
      }),
      card(`${heading('Bring along')}<table role="presentation" cellpadding="0" cellspacing="0">${tick('Water bottle')}${tick('Small towel')}${tick('Comfortable workout clothes and clean trainers')}</table>
${spacer(8)}${para('Please arrive 10 minutes early so you can settle in.')}${button('View my bookings', `${site}/my-bookings`, 'dark')}`),
    ],
  })

  const text = lines(
    'Class reminder',
    '',
    `Hi ${data.userName},`,
    '',
    'Your class starts in 3 hours.',
    '',
    `Class: ${data.className}`,
    `Date: ${data.classDate}`,
    `Time: ${data.classTime}`,
    `Location: ${data.classLocation}`,
    data.instructorName ? `Instructor: ${data.instructorName}` : null,
    '',
    'Please arrive 10 minutes early. Bring water, a towel and comfortable workout clothes.',
    '',
    `View bookings: ${site}/my-bookings`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getStreakReminderSubject(streakWeeks: number): string {
  const streakLabel = streakWeeks === 1 ? '1-week streak' : `${streakWeeks}-week streak`
  return `Your ${streakLabel} ends Sunday`
}

export function getStreakReminderEmailTemplate(data: {
  userName: string
  streakWeeks: number
  bookUrl: string
}): Template {
  const streakLabel = data.streakWeeks === 1 ? '1-week streak' : `${data.streakWeeks}-week streak`
  const shown = Math.min(Math.max(data.streakWeeks, 0), 7)
  const block = (done: boolean) =>
    `<td style="width:30px;height:30px;border-radius:9px;background:${done ? C.lime : 'transparent'};border:2px ${done ? 'solid' : 'dashed'} ${done ? C.lime : '#52525b'};font:800 12px/30px ${FONT};color:${done ? C.ink : C.faint};text-align:center">${done ? '&#10003;' : '?'}</td><td style="width:6px;font-size:0">&nbsp;</td>`
  const weeks = `<table role="presentation" cellpadding="0" cellspacing="0"><tr>${Array.from({ length: shown }, () => block(true)).join('')}${block(false)}</tr></table>`

  const heroHtml = `${logoRow('Week streak')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="px" style="padding:34px 32px 34px">
${eyebrow('Keep it going')}
<p class="mega" style="margin:0;font:900 120px/104px ${FONT};letter-spacing:-5px;color:${C.lime}">${data.streakWeeks}</p>
<h1 class="hero-h" style="margin:14px 0 0;font:800 36px/40px ${FONT};letter-spacing:-1px;color:#ffffff">${data.streakWeeks === 1 ? 'week' : 'weeks'} in a row, ${esc(firstName(data.userName))}.</h1>
<p style="margin:12px 0 22px;font:400 15px/24px ${FONT};color:${C.faint}">One class before Sunday keeps your streak alive.</p>
${weeks}
</td></tr></table>`

  const html = emailShell({
    preheader: `Your ${streakLabel} ends Sunday. Come once this week to keep it.`,
    hero: heroHtml,
    cards: [
      card(`${heading(`${data.streakWeeks + 1} is one class away`)}${para('Pick any class this week. Lunchtime, evening or weekend, they all count.')}${button('Book a class', data.bookUrl)}`),
    ],
  })

  const text = lines(
    'Keep your streak',
    '',
    `Hi ${data.userName},`,
    '',
    `Your ${streakLabel} ends Sunday if you don't come in this week. One class is enough.`,
    '',
    `Book a class: ${data.bookUrl}`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getBookingConfirmationEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  tokensUsed: number
  instructorName?: string
}): Template {
  const site = siteUrl()
  const html = emailShell({
    preheader: `${data.className} · ${data.classDate} · ${data.classTime}`,
    hero: hero({
      eyebrow: 'Booking confirmed',
      title: `See you on the floor, ${esc(firstName(data.userName))}.`,
      sub: 'Your spot is saved. Here are the details.',
      right: chip('Booked'),
    }),
    cards: [
      classTicket({
        className: data.className,
        classDate: data.classDate,
        classTime: data.classTime,
        instructorName: data.instructorName,
        status: 'Confirmed',
        rows: [
          ['Location', esc(data.classLocation)],
          ['Tokens used', String(data.tokensUsed)],
        ],
      }),
      card(`${heading('Need to cancel?')}${para(CANCEL_RULE)}${para('We’ll also send you a reminder 3 hours before class.', { color: C.muted, size: 14 })}${button('Manage booking', `${site}/my-bookings`, 'dark')}`),
    ],
  })

  const text = lines(
    'Booking confirmed',
    '',
    `Hi ${data.userName},`,
    '',
    'Your spot is saved.',
    '',
    `Class: ${data.className}`,
    `Date: ${data.classDate}`,
    `Time: ${data.classTime}`,
    `Location: ${data.classLocation}`,
    data.instructorName ? `Instructor: ${data.instructorName}` : null,
    `Tokens used: ${data.tokensUsed}`,
    '',
    CANCEL_RULE,
    'We’ll send you a reminder 3 hours before class.',
    '',
    `Manage booking: ${site}/my-bookings`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getTokenAdjustmentEmailTemplate(data: {
  userName: string
  tokensChange: number
  newBalance: number
  reason: string
  adjustedBy?: string
}): Template {
  const site = siteUrl()
  const added = data.tokensChange > 0
  const change = `${added ? '+' : ''}${data.tokensChange}`
  const amount = plural(Math.abs(data.tokensChange), 'token')

  const html = emailShell({
    preheader: `New balance: ${plural(data.newBalance, 'token')}`,
    hero: hero({
      eyebrow: 'Balance updated',
      title: added ? `${lime(`+${esc(amount)}`)}<br>added to your account.` : `${esc(amount)} removed<br>from your account.`,
      sub: `Hi ${esc(firstName(data.userName))}, our team has updated your token balance.`,
    }),
    cards: [
      statTiles([
        { value: change, label: 'Change' },
        { value: String(data.newBalance), label: 'New balance', dark: true },
      ]),
      quoteCard('Reason', data.reason),
      card(`${data.adjustedBy ? para(`Updated by ${strong(esc(data.adjustedBy))}. Questions? Just reply to this email.`, { color: C.muted, size: 14 }) : ''}${button('Book a class', `${site}/classes`)}${spacer(8)}${button('View my packages', `${site}/my-packages`, 'white')}`, { pad: '22px 32px' }),
    ],
  })

  const text = lines(
    'Token balance updated',
    '',
    `Hi ${data.userName},`,
    '',
    `Change: ${change} tokens`,
    `New balance: ${data.newBalance} tokens`,
    `Reason: ${data.reason}`,
    data.adjustedBy ? `Updated by: ${data.adjustedBy}` : null,
    '',
    `View your packages: ${site}/my-packages`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getAdminCreatedUserEmailTemplate(data: {
  userName: string
  email: string
  temporaryPassword?: string
  createdBy?: string
}): Template {
  const site = siteUrl()
  const html = emailShell({
    preheader: data.temporaryPassword ? 'Sign in with your temporary password and set your own.' : 'Your account is ready. Sign in to book classes.',
    hero: hero({
      eyebrow: 'Account ready',
      title: `Welcome, ${esc(firstName(data.userName))}.<br>Your account is set up.`,
      sub: 'Our team created your account. Sign in to book classes and track your tokens.',
    }),
    cards: [
      card(`${eyebrow('Sign-in details', C.muted)}${detailRows([['Email', esc(data.email)]])}
${data.temporaryPassword ? `${spacer(14)}${eyebrow('Temporary password', C.muted)}${codeBlock(data.temporaryPassword)}${para('Please change it after you sign in.', { color: C.muted, size: 14, margin: '14px 0 0' })}` : ''}
${spacer(18)}${button('Sign in', `${site}/signin`)}
${data.temporaryPassword ? `${spacer(8)}${button('Change my password', `${site}/forgot-password`, 'white')}` : ''}`),
    ],
  })

  const text = lines(
    `Welcome to One Step Fitness, ${data.userName}!`,
    '',
    'Your account has been created by our team.',
    '',
    `Email: ${data.email}`,
    data.temporaryPassword ? `Temporary password: ${data.temporaryPassword}` : null,
    data.temporaryPassword ? 'Please change this password after your first sign-in.' : null,
    '',
    `Sign in: ${site}/signin`,
    data.temporaryPassword ? `Change your password: ${site}/forgot-password` : null,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getBookingCancellationEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  classTime: string
  tokensRefunded: number
  penalty?: boolean
  reason?: string
}): Template {
  const site = siteUrl()
  const refunded = data.tokensRefunded > 0
  const html = emailShell({
    preheader: refunded ? `${plural(data.tokensRefunded, 'token')} refunded to your balance.` : `Booking cancelled: ${data.className}`,
    hero: hero({
      eyebrow: 'Booking cancelled',
      title: refunded ? `Your ${data.tokensRefunded === 1 ? 'token is' : 'tokens are'} back.` : 'Your booking is cancelled.',
      sub: refunded
        ? `We've cancelled your spot and returned ${esc(plural(data.tokensRefunded, 'token'))} to your balance.`
        : data.penalty
          ? 'This was a late cancellation, so the token was used.'
          : "We've cancelled your spot.",
    }),
    cards: [
      classTicket({ className: data.className, classDate: data.classDate, classTime: data.classTime, status: 'Cancelled', cancelled: true }),
      refunded ? statTiles([{ value: `+${data.tokensRefunded}`, label: 'Tokens refunded', dark: true }]) : '',
      data.reason ? quoteCard('Reason', data.reason) : '',
      card(`${heading('Find another class')}${para(data.penalty && !refunded ? `Next time: ${CANCEL_RULE.charAt(0).toLowerCase()}${CANCEL_RULE.slice(1)}` : 'Pick a class that fits your week.')}${button('Book another class', `${site}/classes`)}`),
    ],
  })

  const text = lines(
    'Booking cancelled',
    '',
    `Hi ${data.userName},`,
    '',
    'Your booking has been cancelled.',
    '',
    `Class: ${data.className}`,
    `Date: ${data.classDate}`,
    `Time: ${data.classTime}`,
    refunded ? `Tokens: ${plural(data.tokensRefunded, 'token')} refunded` : data.penalty ? 'Note: late cancellation, token used' : null,
    data.reason ? `Reason: ${data.reason}` : null,
    '',
    `Book another class: ${site}/classes`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getWaitlistPromotionEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  confirmUrl: string
  expiresIn?: string
}): Template {
  const html = emailShell({
    preheader: `A spot opened in ${data.className}. Confirm it before it goes to the next person.`,
    hero: hero({
      eyebrow: "You're off the waitlist",
      title: 'A spot just opened for you.',
      sub: `Confirm it soon or it goes to the next person on the list.`,
      right: data.expiresIn ? chip(esc(data.expiresIn)) : '',
    }),
    cards: [
      classTicket({
        className: data.className,
        classDate: data.classDate,
        status: 'Spot held',
        rows: [data.expiresIn ? ['Hold expires', esc(data.expiresIn)] : null],
      }),
      card(`${button('Confirm my spot', data.confirmUrl)}${linkFallback(data.confirmUrl)}`, { pad: '22px 32px' }),
    ],
  })

  const text = lines(
    'A spot is available',
    '',
    `Hi ${data.userName},`,
    '',
    'A spot has opened up in the class you were waiting for.',
    '',
    `Class: ${data.className}`,
    `Date: ${data.classDate}`,
    data.expiresIn ? `Hold expires: ${data.expiresIn}` : null,
    '',
    "Confirm soon. If you don't, the spot goes to the next person on the waitlist.",
    '',
    `Confirm my spot: ${data.confirmUrl}`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getClassCancellationEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  classTime: string
  tokensRefunded: number
}): Template {
  const site = siteUrl()
  const html = emailShell({
    preheader: `Sorry, ${data.className} is cancelled. Your ${data.tokensRefunded === 1 ? 'token has' : 'tokens have'} been refunded.`,
    hero: hero({
      eyebrow: 'Class cancelled',
      title: 'Sorry, this class is off.',
      sub: `We've had to cancel ${esc(data.className)} on ${esc(data.classDate)}. ${data.tokensRefunded > 0 ? `${esc(plural(data.tokensRefunded, 'token'))} ${data.tokensRefunded === 1 ? 'is' : 'are'} already back in your account.` : ''}`,
    }),
    cards: [
      classTicket({ className: data.className, classDate: data.classDate, classTime: data.classTime, status: 'Cancelled by studio', cancelled: true }),
      data.tokensRefunded > 0 ? statTiles([{ value: `+${data.tokensRefunded}`, label: 'Tokens refunded', dark: true }]) : '',
      card(`${heading('Pick another class')}${para('We’re sorry for the change of plans. There are plenty of other classes this week.')}${button("See this week's classes", `${site}/classes`)}`),
    ],
  })

  const text = lines(
    'Class cancelled',
    '',
    `Hi ${data.userName},`,
    '',
    "We're sorry, but this class has been cancelled by our team.",
    '',
    `Class: ${data.className}`,
    `Date: ${data.classDate}`,
    `Time: ${data.classTime}`,
    `Tokens: ${plural(data.tokensRefunded, 'token')} refunded`,
    '',
    `Browse other classes: ${site}/classes`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getNoShowWarningEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  classTime: string
  tokensConsumed: number
  noShowCount: number
  isFlagged?: boolean
}): Template {
  const site = siteUrl()
  const html = emailShell({
    preheader: `${plural(data.tokensConsumed, 'token')} used. ${CANCEL_RULE}`,
    hero: hero({
      eyebrow: 'Missed class',
      title: `We missed you, ${esc(firstName(data.userName))}.`,
      sub: `You were booked for ${esc(data.className)} on ${esc(data.classDate)} at ${esc(data.classTime)}.`,
    }),
    cards: [
      statTiles([
        { value: String(data.tokensConsumed), label: data.tokensConsumed === 1 ? 'Token used' : 'Tokens used' },
        { value: String(data.noShowCount), label: 'Missed classes', dark: true },
      ]),
      card(`${heading('Next time, cancel by 23:59 the day before')}${para('Cancel before then and your token comes straight back. You can cancel any booking from My bookings.')}${button('My bookings', `${site}/my-bookings`, 'dark')}`),
      data.isFlagged
        ? darkCard(`${eyebrow('Account flagged')}${para("You've missed several classes, so your account has been flagged. Message us and we'll sort it out together.", { color: C.faint, margin: '0 0 16px' })}${button('WhatsApp the studio', STUDIO_WHATSAPP_URL)}`)
        : '',
    ],
  })

  const text = lines(
    'We missed you',
    '',
    `Hi ${data.userName},`,
    '',
    'You missed a class you were booked for.',
    '',
    `Class: ${data.className}`,
    `Date: ${data.classDate}`,
    `Time: ${data.classTime}`,
    `Tokens used: ${data.tokensConsumed}`,
    `Missed classes: ${data.noShowCount}`,
    '',
    data.isFlagged ? "Your account has been flagged because of several missed classes. Message us and we'll sort it out together." : null,
    '',
    CANCEL_RULE,
    '',
    `View bookings: ${site}/my-bookings`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getForgotPasswordEmailTemplate(data: {
  userName: string
  resetLink: string
  expiresIn?: string
}): Template {
  const expires = data.expiresIn || 'in 1 hour'
  const html = emailShell({
    preheader: `Reset your password. The link expires ${expires}.`,
    hero: hero({
      eyebrow: 'Password reset',
      title: 'Set a new password.',
      sub: `Tap the button below to choose a new password. The link expires ${esc(expires)}.`,
      size: 'md',
    }),
    cards: [
      card(`${button('Reset password', data.resetLink)}${linkFallback(data.resetLink)}`),
      card(`${heading("Didn't ask for this?")}${para('You can ignore this email. Your password stays the same.', { margin: '0' })}`),
    ],
  })

  const text = lines(
    'Reset your password',
    '',
    `Hi ${data.userName},`,
    '',
    'Use this link to reset your password:',
    data.resetLink,
    '',
    `The link expires ${expires}. If you didn't ask for this, ignore this email. Your password stays the same.`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getForgotPasswordOTPEmailTemplate(data: {
  userName: string
  otpCode: string
  verifyUrl?: string
  expiresIn?: string
}): Template {
  const expires = data.expiresIn || 'in 15 minutes'
  const digits = data.otpCode.split('')
  const boxes = `<table role="presentation" cellpadding="0" cellspacing="6" style="margin:22px 0 0 -6px"><tr>${digits
    .map(
      (d) =>
        `<td align="center" style="width:44px;height:58px;background:${C.tile};border:1px solid #3f3f46;border-radius:14px;font:800 28px/58px ui-monospace,Menlo,Consolas,monospace;color:${C.lime}">${esc(d)}</td>`,
    )
    .join('')}</tr></table>`

  const html = emailShell({
    preheader: `${data.otpCode} is your code. It expires ${expires}.`,
    hero: hero({
      eyebrow: 'Password reset',
      title: "Here's your code.",
      sub: `Enter it on the password reset page. It expires ${esc(expires)}.`,
      extra: boxes,
      size: 'md',
    }),
    cards: [
      data.verifyUrl ? card(`${button('Open reset page', data.verifyUrl)}`, { pad: '22px 32px' }) : '',
      card(`${heading("Didn't ask for this?")}${para('You can ignore this email. Your password stays the same. Never share this code, even with our team.', { margin: '0' })}`),
    ],
  })

  const text = lines(
    'Reset your password',
    '',
    `Hi ${data.userName},`,
    '',
    `Your verification code: ${data.otpCode}`,
    `It expires ${expires}.`,
    data.verifyUrl ? `Reset page: ${data.verifyUrl}` : null,
    '',
    "If you didn't ask for this, ignore this email. Your password stays the same. Never share this code.",
    '',
    textFooter(),
  )
  return { html, text }
}

export function getPasswordResetEmailTemplate(data: {
  userName: string
  newPassword: string
  resetBy?: string
}): Template {
  const signin = `${adminUrl()}/signin`
  const html = emailShell({
    preheader: 'Your password was reset by our team.',
    hero: hero({
      eyebrow: 'Password reset',
      title: 'Your password was reset.',
      sub: `Hi ${esc(firstName(data.userName))}, our team set a new password for you. Please change it after you sign in.`,
      size: 'md',
    }),
    cards: [
      card(`${eyebrow('New password', C.muted)}${codeBlock(data.newPassword)}
${data.resetBy ? para(`Reset by ${strong(esc(data.resetBy))}.`, { color: C.muted, size: 14, margin: '14px 0 0' }) : ''}
${spacer(18)}${button('Sign in', signin)}`),
      card(`${heading("Didn't ask for this?")}${para(`Contact us right away at <a href="mailto:${STUDIO_EMAIL}" style="color:${C.ink};font-weight:600">${STUDIO_EMAIL}</a>.`, { margin: '0' })}`),
    ],
  })

  const text = lines(
    'Password reset',
    '',
    `Hi ${data.userName},`,
    '',
    'Your password has been reset by our team.',
    `New password: ${data.newPassword}`,
    'Please change this password after you sign in.',
    data.resetBy ? `Reset by: ${data.resetBy}` : null,
    '',
    `Sign in: ${signin}`,
    '',
    `If you didn't ask for this, contact us right away at ${STUDIO_EMAIL}.`,
    '',
    textFooter(),
  )
  return { html, text }
}

/**
 * Birthday email. Never shows the member's age: `age` is accepted for
 * backwards compatibility but deliberately ignored.
 */
export function getBirthdayEmailTemplate(data: { userName: string; age?: number }): Template {
  const site = siteUrl()
  const name = esc(firstName(data.userName))
  const confetti = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px"><tr>${['#03a862', '#f9e510', '#1e90ff', C.lime, '#ffffff', '#03a862', '#f9e510']
    .map((c) => `<td style="width:22px;height:6px;background:${c};border-radius:3px;font-size:0;line-height:0">&nbsp;</td><td style="width:6px;font-size:0">&nbsp;</td>`)
    .join('')}</tr></table>`

  const heroHtml = `${logoRow('Birthday')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td class="px" style="padding:34px 32px 0">${confetti}
${eyebrow('Today is all yours')}
<h1 class="bday" style="margin:0;font:900 64px/62px ${FONT};letter-spacing:-2.5px;color:${C.lime}">Happy<br>birthday,</h1>
<p class="bday" style="margin:4px 0 0;font:900 64px/62px ${FONT};letter-spacing:-2.5px;color:#ffffff">${name}.</p>
<p style="margin:14px 0 0;font:400 15px/24px ${FONT};color:${C.faint}">Everyone at One Step Fitness is cheering for you today.</p>
</td></tr>
<tr><td style="padding:16px 12px 12px">${heroPhoto()}</td></tr>
</table>`

  const html = emailShell({
    preheader: 'Everyone at One Step Fitness is cheering for you today.',
    hero: heroHtml,
    cards: [
      card(`${eyebrow('A note from the studio', C.muted)}${heading('Thank you for stepping with us')}
${para('Every class is better because you’re in it. Your energy on the floor lifts the whole room, and we’re grateful you chose to spend part of your year with us.')}
${para('We hope this next year brings you strong legs, good music and plenty of reasons to smile.', { margin: '0' })}`),
      darkCard(`${eyebrow('Celebrate on the step')}<p style="margin:0 0 8px;font:800 24px/30px ${FONT};letter-spacing:-.6px;color:#ffffff">Dance your birthday in.</p>
${para('Bring your best friend, pick your favourite class this week, and celebrate with us.', { color: C.faint, margin: '0 0 20px' })}
${button('Book a birthday class', `${site}/classes`)}`),
      card(`${para('With love,', { margin: '0' })}<p style="margin:2px 0 0;font:700 15px/24px ${FONT};color:${C.ink}">The One Step Fitness team</p>`, { pad: '22px 32px' }),
    ],
  })

  const text = lines(
    `Happy birthday, ${firstName(data.userName)}!`,
    '',
    'Everyone at One Step Fitness is cheering for you today.',
    '',
    "Thank you for stepping with us. Every class is better because you're in it, and we're grateful you chose to spend part of your year with us.",
    '',
    'We hope this next year brings you strong legs, good music and plenty of reasons to smile.',
    '',
    `Dance your birthday in. Book a class this week: ${site}/classes`,
    '',
    'With love,',
    'The One Step Fitness team',
    '',
    textFooter(),
  )
  return { html, text }
}

export function getTrialBookingConfirmationEmailTemplate(data: {
  guestName: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  instructorName?: string
  amount: number
  currency: string
}): Template {
  const amount = `${data.currency} ${data.amount.toFixed(2)}`
  const html = emailShell({
    preheader: `${data.className} · ${data.classDate} · ${data.classTime}. Arrive 10 minutes early.`,
    hero: hero({
      eyebrow: 'Trial booked',
      title: `Your first class is booked, ${esc(firstName(data.guestName))}.`,
      sub: "We can't wait to meet you.",
      right: chip('Paid'),
      extra: heroPhoto(),
    }),
    cards: [
      classTicket({
        className: data.className,
        classDate: data.classDate,
        classTime: data.classTime,
        instructorName: data.instructorName,
        status: 'Trial',
        rows: [
          ['Location', esc(data.classLocation)],
          ['Paid', esc(amount)],
        ],
      }),
      card(`${heading("First time? Here's what to bring")}${para('Water, a small towel and comfortable workout clothes. Please arrive 10 minutes early so we can welcome you. No experience needed: the coach shows every move.')}
${para('Enjoyed it? Ask our team at the front desk about setting up a membership.', { color: C.muted, size: 14 })}
${button('WhatsApp us a question', STUDIO_WHATSAPP_URL, 'dark')}`),
    ],
  })

  const text = lines(
    'Trial class booked',
    '',
    `Hi ${data.guestName},`,
    '',
    'Your trial class is confirmed.',
    '',
    `Class: ${data.className}`,
    `Date: ${data.classDate}`,
    `Time: ${data.classTime}`,
    `Location: ${data.classLocation}`,
    data.instructorName ? `Instructor: ${data.instructorName}` : null,
    `Paid: ${amount}`,
    '',
    'Please arrive 10 minutes early. Bring water, a small towel and comfortable workout clothes.',
    'Enjoyed it? Ask our team at the front desk about setting up a membership.',
    '',
    textFooter(),
  )
  return { html, text }
}

export function getPickClassLinkEmailTemplate(data: {
  guestName: string
  venueLabel: string
  pickClassUrl: string
}): Template {
  const name = firstName(data.guestName)
  const html = emailShell({
    preheader: `Your ${data.venueLabel} is paid. Choose a time that suits you.`,
    hero: hero({
      eyebrow: 'Choose your class',
      title: `Pick a time that suits you, ${esc(name)}.`,
      sub: `Your ${esc(data.venueLabel)} is paid. Choose your session now, or reply to this email and our team will schedule it for you.`,
      right: chip('Paid'),
    }),
    cards: [card(`${button('Pick my trial class', data.pickClassUrl)}${linkFallback(data.pickClassUrl)}`)],
  })

  const text = lines(
    'Pick your class',
    '',
    `Hi ${name},`,
    '',
    `Your payment for ${data.venueLabel} is confirmed. Choose your session now, or reply to this email and our team will schedule it for you.`,
    '',
    `Pick my trial class: ${data.pickClassUrl}`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getCheckoutReminderEmailTemplate(data: {
  customerName: string
  itemLabel: string
  itemDetail?: string
  amountLabel: string
  checkoutUrl: string
}): Template {
  const name = firstName(data.customerName)
  const html = emailShell({
    preheader: `${data.itemLabel} isn't confirmed yet. Pick up where you left off.`,
    hero: hero({
      eyebrow: 'Still thinking?',
      title: `Your ${esc(data.itemLabel)} is waiting.`,
      sub: `Hi ${esc(name)}, your checkout wasn't completed, so this isn't confirmed yet. Pick up where you left off.`,
    }),
    cards: [
      card(`${detailRows([['Item', esc(data.itemLabel)], data.itemDetail ? ['Details', esc(data.itemDetail)] : null, ['Total', esc(data.amountLabel)]])}${spacer(18)}${button('Finish my payment', data.checkoutUrl)}
${para("Card declined or PayNow timed out? Just reply to this email and we'll help. If you've already paid, you can ignore this message.", { color: C.muted, size: 14, margin: '16px 0 0' })}`),
    ],
  })

  const text = lines(
    "Your payment didn't go through",
    '',
    `Hi ${name},`,
    '',
    "Your checkout wasn't completed, so this isn't confirmed yet:",
    `${data.itemLabel} — ${data.amountLabel}`,
    data.itemDetail || null,
    '',
    `Finish my payment: ${data.checkoutUrl}`,
    '',
    "Card declined or PayNow timed out? Reply to this email and we'll help. If you've already paid, ignore this message.",
    '',
    textFooter(),
  )
  return { html, text }
}

export function getReferralVoucherEmailTemplate(data: {
  userName: string
  voucherCode: string
  discountPercent: number
}): Template {
  const site = siteUrl()
  const html = emailShell({
    preheader: `Use code ${data.voucherCode} for ${data.discountPercent}% off your next token pack.`,
    hero: hero({
      eyebrow: 'Referral reward',
      title: `${lime(`${data.discountPercent}% off`)}<br>your next pack.`,
      sub: `Hi ${esc(firstName(data.userName))}, here's a discount on your next token package.`,
    }),
    cards: [
      card(`${eyebrow('Your code', C.muted)}${codeBlock(data.voucherCode)}${para('Enter it at checkout when you buy tokens on the app or website. One-time use.', { color: C.muted, size: 14, margin: '14px 0 18px' })}${button('Buy tokens', `${site}/packages`)}`),
    ],
  })

  const text = lines(
    'Your referral discount',
    '',
    `Hi ${data.userName},`,
    '',
    `You've received a ${data.discountPercent}% discount voucher for your next token package.`,
    `Your voucher code: ${data.voucherCode}`,
    '',
    'Enter it at checkout when you buy tokens on the app or website. One-time use.',
    '',
    `Buy tokens: ${site}/packages`,
    '',
    textFooter(),
  )
  return { html, text }
}

export function getRegistrationFormEmailTemplate(data: { userName: string; formUrl: string }): Template {
  const html = emailShell({
    preheader: 'One quick form to finalise your membership. The link expires in 7 days.',
    hero: hero({
      eyebrow: 'Before you start',
      title: `One quick form, ${esc(firstName(data.userName))}.`,
      sub: 'Please fill in the membership terms and conditions form. It’s needed to finalise your membership.',
    }),
    cards: [
      card(`${button('Complete the form', data.formUrl)}${para('This link expires in 7 days. Need a new one? Just reply to this email.', { color: C.muted, size: 14, margin: '16px 0 0' })}${linkFallback(data.formUrl)}`),
    ],
    footerNote: "If you didn't expect this, you can ignore this email.",
  })

  const text = lines(
    'Complete your registration',
    '',
    `Hi ${data.userName},`,
    '',
    'Please fill in the membership terms and conditions form. It is needed to finalise your membership.',
    '',
    `Form link: ${data.formUrl}`,
    '',
    'This link expires in 7 days. Need a new one? Reply to this email.',
    '',
    textFooter(),
  )
  return { html, text }
}

export function getRegistrationFormCompletedEmailTemplate(data: { userName: string }): Template {
  const tick = (t: string) => `<tr><td width="26" style="vertical-align:top;font:800 14px/22px ${FONT};color:${C.limeInk}">&#10003;</td><td style="font:400 15px/22px ${FONT};color:${C.body};padding-bottom:8px">${t}</td></tr>`
  const html = emailShell({
    preheader: 'Your signed registration form is attached as a PDF.',
    hero: hero({
      eyebrow: 'Registration complete',
      title: `Thanks, ${esc(firstName(data.userName))}. You're registered.`,
      sub: 'Your form is attached to this email as a PDF. Please keep it for your records.',
      right: chip('Done'),
    }),
    cards: [
      card(`${heading('What happens next')}<table role="presentation" cellpadding="0" cellspacing="0">${tick('Our staff review and countersign your form')}${tick('You get a final copy with all signatures')}${tick('Your membership is fully activated')}</table>
${spacer(6)}${para('Questions? Just reply to this email. Welcome to the One Step Fitness family!', { margin: '0' })}`),
    ],
  })

  const text = lines(
    'Registration complete',
    '',
    `Hi ${data.userName},`,
    '',
    'Thank you for completing your One Step Fitness membership registration.',
    'Your form is attached to this email as a PDF. Please keep it for your records.',
    '',
    'What happens next:',
    '- Our staff review and countersign your form',
    '- You get a final copy with all signatures',
    '- Your membership is fully activated',
    '',
    'Questions? Reply to this email. Welcome to the One Step Fitness family!',
    '',
    textFooter(),
  )
  return { html, text }
}

export function getInvoiceEmailTemplate(data: {
  toName: string
  invoiceNumber: string
  amountLabel: string
  issuedDateLabel: string
  description: string
  pdfUrl: string
}): Template {
  const html = emailShell({
    preheader: `${data.amountLabel} · ${data.description}`,
    hero: hero({
      eyebrow: `Invoice ${esc(data.invoiceNumber)}`,
      title: esc(data.amountLabel),
      sub: `Hi ${esc(firstName(data.toName))}, thanks for your payment. Here's your invoice for ${esc(data.description)}.`,
      right: chip('Paid'),
    }),
    cards: [
      card(`${detailRows([
        ['Invoice no.', esc(data.invoiceNumber)],
        ['Issued', esc(data.issuedDateLabel)],
        ['Description', esc(data.description)],
        ['Total paid', esc(data.amountLabel)],
      ])}${spacer(18)}${button('Download invoice (PDF)', data.pdfUrl)}${linkFallback(data.pdfUrl)}`),
    ],
  })

  const text = lines(
    `Invoice ${data.invoiceNumber} — One Step Fitness`,
    '',
    `Hi ${data.toName},`,
    '',
    `Thanks for your payment. Here's your invoice for ${data.description}.`,
    '',
    `Invoice number: ${data.invoiceNumber}`,
    `Issued: ${data.issuedDateLabel}`,
    `Description: ${data.description}`,
    `Total paid: ${data.amountLabel}`,
    '',
    `Download your invoice: ${data.pdfUrl}`,
    '',
    textFooter(),
  )
  return { html, text }
}

/** Personal follow-up written by staff (lead outreach). */
export function getLeadFollowUpEmailTemplate(data: {
  leadName: string
  bodyText: string
  subject?: string
}): Template {
  const site = siteUrl()
  const trialUrl = `${site}/trial-booking`
  const scheduleUrl = `${site}/schedule`
  const preheader = (data.subject || 'A message from One Step Fitness').slice(0, 120)

  const html = emailShell({
    preheader,
    hero: `${logoRow('Message')}${spacer(26)}`,
    cards: [
      card(`${textToParagraphs(data.bodyText)}${spacer(4)}${actionRow([
        ['Book a trial class', trialUrl],
        ['WhatsApp us', STUDIO_WHATSAPP_URL],
      ])}
<p style="margin:16px 0 0;font:400 14px/22px ${FONT};color:${C.muted}"><a href="${esc(scheduleUrl)}" style="color:${C.ink};font-weight:600;text-decoration:underline">View the class schedule</a> or just reply to this email.</p>`),
    ],
  })

  const text = lines(
    data.bodyText,
    '',
    '---',
    `Book a trial class: ${trialUrl}`,
    `Class schedule: ${scheduleUrl}`,
    `WhatsApp: ${STUDIO_WHATSAPP_URL}`,
    `Phone: ${STUDIO_PHONE_DISPLAY}`,
    `Email: ${STUDIO_EMAIL}`,
    '',
    'Reply to this email and our team will get back to you shortly.',
    '',
    textFooter(),
  )
  return { html, text }
}

// ===========================================================================
// Staff emails
// ===========================================================================

export function getTrialBookingAdminNotificationEmailTemplate(data: {
  guestName: string
  guestEmail: string
  guestPhone: string
  guestDateOfBirth?: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  instructorName?: string
  amount: number
  currency: string
  bookingId: string
}): Template {
  const amount = `${data.currency} ${data.amount.toFixed(2)}`
  const dob = data.guestDateOfBirth
    ? new Date(data.guestDateOfBirth).toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const html = emailShell({
    preheader: `Paid ${amount} · ${data.className} · ${data.classDate} ${data.classTime}`,
    hero: hero({
      eyebrow: 'New trial booking',
      title: `${esc(data.guestName)} booked a trial class.`,
      sub: 'First visit. Send a quick welcome message before class.',
      right: chip(`Paid ${esc(amount)}`),
      size: 'md',
    }),
    cards: [
      classTicket({
        className: data.className,
        classDate: data.classDate,
        classTime: data.classTime,
        instructorName: data.instructorName,
        status: 'Trial',
        rows: [
          ['Location', esc(data.classLocation)],
          ['Booking ID', esc(data.bookingId)],
        ],
      }),
      contactCard({ name: data.guestName, email: data.guestEmail, phone: data.guestPhone, extraRows: [dob ? ['Date of birth', esc(dob)] : null] }),
      staffFooterCard('Open trial bookings', '/trial-bookings'),
    ],
  })

  const text = lines(
    'New trial class booking',
    '',
    `Guest: ${data.guestName}`,
    `Email: ${data.guestEmail}`,
    `Phone: ${data.guestPhone}`,
    dob ? `Date of birth: ${dob}` : null,
    '',
    `Class: ${data.className}`,
    `Date: ${data.classDate}`,
    `Time: ${data.classTime}`,
    `Location: ${data.classLocation}`,
    data.instructorName ? `Instructor: ${data.instructorName}` : null,
    `Paid: ${amount}`,
    `Booking ID: ${data.bookingId}`,
    '',
    `Open in admin: ${adminUrl()}/trial-bookings`,
  )
  return { html, text }
}

export function getMemberBookingAdminNotificationEmailTemplate(data: {
  memberName: string
  memberEmail: string
  memberPhone?: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  instructorName?: string
  tokensUsed: number
  bookingId?: string
  bookingNote?: string
}): Template {
  const html = emailShell({
    preheader: `${plural(data.tokensUsed, 'token')} used · ${data.className} · ${data.classDate} ${data.classTime}`,
    hero: hero({
      eyebrow: 'New member booking',
      title: `${esc(data.memberName)} booked ${esc(data.className)}.`,
      right: chip(esc(plural(data.tokensUsed, 'token'))),
      size: 'md',
    }),
    cards: [
      classTicket({
        className: data.className,
        classDate: data.classDate,
        classTime: data.classTime,
        instructorName: data.instructorName,
        status: 'Confirmed',
        rows: [
          ['Location', esc(data.classLocation)],
          ['Tokens used', String(data.tokensUsed)],
          data.bookingId ? ['Booking ID', esc(data.bookingId)] : null,
        ],
      }),
      data.bookingNote ? quoteCard('Note from member', data.bookingNote) : '',
      contactCard({ name: data.memberName, email: data.memberEmail, phone: data.memberPhone }),
      staffFooterCard('Open classes', '/classes'),
    ],
  })

  const text = lines(
    'New class booking',
    '',
    `Member: ${data.memberName}`,
    `Email: ${data.memberEmail}`,
    data.memberPhone ? `Phone: ${data.memberPhone}` : null,
    '',
    `Class: ${data.className}`,
    `Date: ${data.classDate}`,
    `Time: ${data.classTime}`,
    `Location: ${data.classLocation}`,
    data.instructorName ? `Instructor: ${data.instructorName}` : null,
    `Tokens used: ${data.tokensUsed}`,
    data.bookingNote ? `Note: ${data.bookingNote}` : null,
    data.bookingId ? `Booking ID: ${data.bookingId}` : null,
  )
  return { html, text }
}

export function getMemberBookingTutorNotificationEmailTemplate(data: {
  memberName: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  tokensUsed?: number
  bookingNote?: string
}): Template {
  const html = emailShell({
    preheader: `${data.memberName} joined ${data.className} · ${data.classDate} ${data.classTime}`,
    hero: hero({
      eyebrow: 'New student',
      title: `${esc(data.memberName)} joined your class.`,
      sub: `${esc(data.className)}, ${esc(data.classDate)} at ${esc(data.classTime)}.`,
      size: 'md',
    }),
    cards: [
      classTicket({
        className: data.className,
        classDate: data.classDate,
        classTime: data.classTime,
        rows: [
          ['Student', esc(data.memberName)],
          ['Location', esc(data.classLocation)],
          typeof data.tokensUsed === 'number' ? ['Tokens used', String(data.tokensUsed)] : null,
        ],
      }),
      data.bookingNote ? quoteCard('Note from student', data.bookingNote) : '',
    ],
  })

  const text = lines(
    'New student booked',
    '',
    `${data.memberName} has booked your class:`,
    '',
    `Class: ${data.className}`,
    `Date: ${data.classDate}`,
    `Time: ${data.classTime}`,
    `Location: ${data.classLocation}`,
    typeof data.tokensUsed === 'number' ? `Tokens used: ${data.tokensUsed}` : null,
    data.bookingNote ? `Note: ${data.bookingNote}` : null,
  )
  return { html, text }
}

export function getPaymentAlertEmailTemplate(data: {
  event: 'initiated' | 'succeeded' | 'failed'
  paymentType: 'package-purchase' | 'trial-booking'
  paymentId: string
  source: string
  amount: number
  currency?: string
  packageName?: string
  tokenCount?: number
  className?: string
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  failureReason?: string
}): Template & { title: string } {
  const amount = formatMoney(Number(data.amount), data.currency || 'SGD')
  const isTrial = data.paymentType === 'trial-booking'
  const item = isTrial ? `trial class${data.className ? ` (${data.className})` : ''}` : data.packageName || 'a package'
  const what = isTrial ? 'Trial booking' : 'Package purchase'

  const meta = {
    initiated: { eyebrow: 'Payment started', chip: chip('Pending', 'pending'), title: `${esc(data.customerName)} is checking out.`, sub: `${esc(amount)} for ${esc(item)}. Payment isn't confirmed yet.`, label: 'Started' },
    succeeded: { eyebrow: 'Payment received', chip: chip('Succeeded'), title: esc(amount), sub: `${esc(data.customerName)} paid for ${esc(item)}.`, label: 'Successful' },
    failed: { eyebrow: 'Payment failed', chip: chip('Failed', 'danger'), title: `${esc(amount)} didn't go through.`, sub: `${esc(data.customerName)} tried to pay for ${esc(item)}.`, label: 'Failed' },
  }[data.event]
  const title = `${isTrial ? 'Trial Booking' : 'Package'} Payment ${meta.label}`

  const html = emailShell({
    preheader: `${meta.label}: ${amount} · ${what} · ${data.customerName}`,
    hero: hero({ eyebrow: meta.eyebrow, title: meta.title, sub: meta.sub, right: meta.chip, size: 'md' }),
    cards: [
      data.event === 'failed' && data.failureReason ? quoteCard('Reason', data.failureReason) : '',
      card(`${eyebrow('Payment', C.muted)}${detailRows([
        ['Type', what],
        isTrial ? ['Class', esc(data.className || 'Unknown class')] : ['Package', esc(data.packageName || 'Unknown package')],
        data.tokenCount != null ? ['Tokens', String(data.tokenCount)] : null,
        ['Amount', esc(amount)],
        ['Source', esc(data.source)],
        ['Payment ID', esc(data.paymentId)],
      ])}${data.event === 'initiated' ? para("You'll get another email when this payment succeeds or fails.", { color: C.muted, size: 14, margin: '16px 0 0' }) : ''}`),
      contactCard({ name: data.customerName, email: data.customerEmail, phone: data.customerPhone }),
      staffFooterCard('Open revenue report', '/reports/revenue'),
    ],
  })

  const text = lines(
    title,
    '',
    data.event === 'initiated'
      ? 'A customer started checkout. Payment has not been confirmed yet.'
      : data.event === 'failed'
        ? 'The payment attempt failed or was cancelled. No successful payment was recorded.'
        : 'The payment was completed successfully.',
    '',
    `Customer: ${data.customerName}`,
    `Email: ${data.customerEmail || 'Not available'}`,
    data.customerPhone ? `Phone: ${data.customerPhone}` : null,
    `Amount: ${amount}`,
    `Type: ${what}`,
    isTrial ? `Class: ${data.className || 'Unknown class'}` : `Package: ${data.packageName || 'Unknown package'}`,
    data.tokenCount != null ? `Tokens: ${data.tokenCount}` : null,
    `Source: ${data.source}`,
    `Payment ID: ${data.paymentId}`,
    data.failureReason ? `Failure reason: ${data.failureReason}` : null,
  )
  return { html, text, title }
}

export function getContactFormEmailTemplate(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}): Template {
  const html = emailShell({
    preheader: data.message.slice(0, 120),
    hero: hero({
      eyebrow: 'Website enquiry',
      title: `${esc(data.name)} sent a message.`,
      sub: esc(data.subject),
      right: chip('New'),
      size: 'md',
    }),
    cards: [
      quoteCard('Message', data.message),
      contactCard({ name: data.name, email: data.email, phone: data.phone }),
      card(para(`Reply to this email to answer ${strong(esc(data.name))} directly.`, { color: C.muted, size: 14, margin: '0' }), { pad: '20px 32px' }),
    ],
  })

  const text = lines(
    'New contact form submission',
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    `Subject: ${data.subject}`,
    '',
    'Message:',
    data.message,
    '',
    '---',
    `Reply to this email to respond to ${data.name}.`,
  )
  return { html, text }
}
