/**
 * One Step Fitness email kit.
 *
 * Shared building blocks for every transactional email, matching the member
 * dashboard UI: black hero card, lime pill buttons, soft white cards on a
 * #ececec tray, Inter type. Everything is table-based with inline styles so it
 * renders in Gmail, Outlook and Apple Mail, and reflows on phones.
 *
 * All helpers take already-escaped HTML for "html" params; use `esc()` on any
 * user-supplied value before passing it in.
 */

export const FONT = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif"

export const COLORS = {
  tray: '#ececec',
  ink: '#18181b',
  body: '#52525b',
  muted: '#71717a',
  faint: '#a1a1aa',
  soft: '#f4f4f5',
  line: '#e4e4e7',
  lime: '#a3e635',
  limeInk: '#4d7c0f',
  hero: '#000000',
  tile: '#18181b',
  danger: '#ef4444',
  pending: '#3f3f46',
} as const

export const STUDIO_EMAIL = 'hello@onestepfitness.sg'
export const STUDIO_WHATSAPP_URL = 'https://wa.me/6584927347'
export const STUDIO_PHONE_DISPLAY = '+65 8492 7347'
export const STUDIO_PHONE_TEL = '+6584927347'

const C = COLORS

/** Public member-facing site (never the admin host). */
export function siteUrl(): string {
  const fallback = 'https://onestepfitness.sg'
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || fallback
  return (url.includes('admin.') ? fallback : url).replace(/\/$/, '')
}

export function adminUrl(): string {
  return (process.env.NEXT_PUBLIC_ADMIN_APP_URL || process.env.ADMIN_APP_URL || 'https://admin.onestepfitness.sg').replace(/\/$/, '')
}

const logoUrl = () => `${siteUrl()}/email/logo-dark.png`
export const studioPhotoUrl = () => `${siteUrl()}/email/studio.jpg`

export function esc(value: unknown): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }
  return String(value ?? '').replace(/[&<>"']/g, (m) => map[m])
}

export function firstName(name: string | undefined | null): string {
  return (name || '').trim().split(/\s+/)[0] || 'there'
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

/** Plain-text paragraphs to HTML paragraphs (escapes input). */
export function textToParagraphs(text: string, color: string = C.body): string {
  return text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => para(esc(p).replace(/\n/g, '<br>'), { color }))
    .join('')
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function emailShell(opts: { preheader: string; hero: string; cards: string[]; footerNote?: string }): string {
  const spacer = `<tr><td style="height:8px;line-height:8px;font-size:0">&nbsp;</td></tr>`
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>One Step Fitness</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
body{margin:0;padding:0;background:${C.tray};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
a{text-decoration:none}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
@media only screen and (max-width:620px){
 .px{padding-left:22px!important;padding-right:22px!important}
 .hero-h{font-size:32px!important;line-height:36px!important}
 .bday{font-size:48px!important;line-height:48px!important;letter-spacing:-1.5px!important}
 .mega{font-size:96px!important;line-height:84px!important}
 .btn,.btn td,.btn a{display:block!important;width:100%!important;text-align:center!important;box-sizing:border-box!important}
 .stack td.col{display:block!important;width:100%!important;padding:0 0 8px 0!important}
 .outer{padding:10px 8px 24px!important}
}
</style>
</head>
<body style="margin:0;padding:0;background:${C.tray};font-family:${FONT}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(opts.preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.tray}"><tr><td align="center" class="outer" style="padding:24px 12px 36px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="background:${C.hero};border-radius:28px;overflow:hidden">${opts.hero}</td></tr>
${opts.cards.filter(Boolean).map((c) => `${spacer}<tr><td>${c}</td></tr>`).join('')}
${spacer}
<tr><td>${footer(opts.footerNote)}</td></tr>
</table>
</td></tr></table>
</body>
</html>`
}

function footer(note?: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:22px 24px 4px">
<p style="margin:0 0 8px;font:700 13px/18px ${FONT};color:${C.ink}">One Step Fitness</p>
<p style="margin:0 0 12px;font:400 12px/20px ${FONT};color:${C.muted}">One step to change your life · Singapore<br>
<a href="mailto:${STUDIO_EMAIL}" style="color:${C.ink};font-weight:600;white-space:nowrap">${STUDIO_EMAIL}</a><br>
<a href="${STUDIO_WHATSAPP_URL}" style="color:${C.ink};font-weight:600;white-space:nowrap">WhatsApp +65&nbsp;8492&nbsp;7347</a></p>
<p style="margin:0;font:400 11px/18px ${FONT};color:${C.faint}">${note ? `${note}<br>` : ''}© ${new Date().getFullYear()} One Step Fitness</p>
</td></tr></table>`
}

// ---------------------------------------------------------------------------
// Hero (black card)
// ---------------------------------------------------------------------------

/** Logo on the left, small label or chip (html) on the right. */
export function logoRow(rightHtml = ''): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td class="px" style="padding:26px 32px 0"><img src="${logoUrl()}" width="104" alt="One Step Fitness" style="display:block;width:104px;height:auto;border:0"></td>
<td class="px" align="right" style="padding:26px 32px 0;font:600 11px/16px ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${C.faint}">${rightHtml}</td>
</tr></table>`
}

export function eyebrow(text: string, color: string = C.lime): string {
  return `<p style="margin:0 0 10px;font:700 11px/16px ${FONT};letter-spacing:.16em;text-transform:uppercase;color:${color}">${text}</p>`
}

/** Lime highlight span for use inside hero titles. */
export function lime(html: string): string {
  return `<span style="color:${C.lime}">${html}</span>`
}

export function chip(text: string, tone: 'lime' | 'danger' | 'pending' = 'lime'): string {
  const [bg, fg] = tone === 'danger' ? [C.danger, '#ffffff'] : tone === 'pending' ? [C.pending, '#ffffff'] : [C.lime, C.ink]
  return `<span style="display:inline-block;background:${bg};color:${fg};font:800 11px/1 ${FONT};letter-spacing:.12em;text-transform:uppercase;padding:7px 11px;border-radius:999px;white-space:nowrap">${text}</span>`
}

export function hero(opts: {
  eyebrow: string
  title: string
  sub?: string
  right?: string
  extra?: string
  size?: 'lg' | 'md'
}): string {
  const big = opts.size !== 'md'
  return `${logoRow(opts.right || '')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="px" style="padding:${big ? 34 : 30}px 32px ${big ? 34 : 30}px">
${eyebrow(opts.eyebrow)}
<h1 class="hero-h" style="margin:0;font:800 ${big ? '40px/44px' : '32px/38px'} ${FONT};letter-spacing:${big ? '-1.2px' : '-.9px'};color:#ffffff">${opts.title}</h1>
${opts.sub ? `<p style="margin:14px 0 0;font:400 15px/24px ${FONT};color:${C.faint}">${opts.sub}</p>` : ''}
${opts.extra || ''}
</td></tr></table>`
}

export function heroPhoto(alt = 'Members dancing on step boards at the One Step Fitness studio'): string {
  return `<div style="height:22px;line-height:22px;font-size:0">&nbsp;</div><img src="${studioPhotoUrl()}" width="536" alt="${esc(alt)}" style="display:block;width:100%;max-width:536px;height:auto;border-radius:18px;border:0">`
}

// ---------------------------------------------------------------------------
// Cards and content
// ---------------------------------------------------------------------------

export function card(inner: string, opts: { bg?: string; pad?: string } = {}): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="px" style="background:${opts.bg || '#ffffff'};border-radius:22px;padding:${opts.pad || '28px 32px'}">${inner}</td></tr></table>`
}

export function darkCard(inner: string): string {
  return card(inner, { bg: C.tile })
}

export function heading(html: string, color: string = C.ink): string {
  return `<h2 style="margin:0 0 8px;font:700 19px/26px ${FONT};letter-spacing:-.3px;color:${color}">${html}</h2>`
}

export function para(html: string, opts: { color?: string; margin?: string; size?: number } = {}): string {
  const size = opts.size || 15
  return `<p style="margin:${opts.margin || '0 0 14px'};font:400 ${size}px/${Math.round(size * 1.6)}px ${FONT};color:${opts.color || C.body}">${html}</p>`
}

export function strong(html: string): string {
  return `<b style="color:${C.ink}">${html}</b>`
}

export function spacer(px = 16): string {
  return `<div style="height:${px}px;line-height:${px}px;font-size:0">&nbsp;</div>`
}

export function button(label: string, href: string, variant: 'lime' | 'dark' | 'white' = 'lime'): string {
  const style =
    variant === 'lime'
      ? `background:${C.lime};color:${C.ink};border:1px solid ${C.lime}`
      : variant === 'dark'
        ? `background:${C.tile};color:#ffffff;border:1px solid ${C.tile}`
        : `background:#ffffff;color:${C.ink};border:1px solid ${C.line}`
  return `<table role="presentation" cellpadding="0" cellspacing="0" class="btn" style="margin-top:6px"><tr><td style="border-radius:999px"><a href="${esc(href)}" style="display:inline-block;${style};font:700 15px/1 ${FONT};padding:16px 28px;border-radius:999px">${label}</a></td></tr></table>`
}

/** Side-by-side pill links (stack on phones). First one is lime. */
export function actionRow(actions: Array<[label: string, href: string]>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stack"><tr>
${actions
  .map(
    ([label, href], i) =>
      `<td class="col" style="padding:0 ${i < actions.length - 1 ? 8 : 0}px 0 0"><a href="${esc(href)}" style="display:block;text-align:center;background:${i === 0 ? C.lime : '#ffffff'};color:${C.ink};border:1px solid ${i === 0 ? C.lime : C.line};font:700 14px/1 ${FONT};padding:14px 10px;border-radius:999px;white-space:nowrap">${label}</a></td>`,
  )
  .join('')}
</tr></table>`
}

/** Label / value table on a soft grey panel. Values are html. */
export function detailRows(rows: Array<[label: string, valueHtml: string] | null | undefined | false>): string {
  const list = rows.filter(Boolean) as Array<[string, string]>
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.soft};border-radius:18px">
${list
  .map(([label, value], i) => {
    const border = i ? `border-top:1px solid ${C.line};` : ''
    return `<tr><td style="padding:14px 18px;${border}font:600 11px/16px ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${C.muted};vertical-align:top">${label}</td>
<td align="right" style="padding:14px 18px;${border}font:600 14px/20px ${FONT};color:${C.ink};word-break:break-word">${value}</td></tr>`
  })
  .join('')}
</table>`
}

/** Dashboard-style number tiles. Values are html. */
export function statTiles(tiles: Array<{ value: string; label: string; dark?: boolean }>): string {
  const width = Math.floor(100 / tiles.length)
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stack"><tr>
${tiles
  .map(
    (t, i) => `<td class="col" width="${width}%" style="padding:0 ${i < tiles.length - 1 ? 8 : 0}px 0 0;vertical-align:top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:${t.dark ? C.tile : '#ffffff'};border-radius:18px;padding:16px 16px 14px">
<p style="margin:0;font:800 26px/30px ${FONT};letter-spacing:-.6px;color:${t.dark ? C.lime : C.ink}">${t.value}</p>
<p style="margin:6px 0 0;font:600 10px/14px ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${t.dark ? C.faint : C.muted}">${t.label}</p>
</td></tr></table></td>`,
  )
  .join('')}
</tr></table>`
}

/** Big monospaced code block (OTP, voucher, temporary password). */
export function codeBlock(code: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:${C.tile};border-radius:16px;padding:20px 12px;font:800 28px/34px ui-monospace,Menlo,Consolas,monospace;letter-spacing:4px;color:${C.lime};word-break:break-all">${esc(code)}</td></tr></table>`
}

/** A quoted note (member note, reason, message). Input is escaped here. */
export function quoteCard(label: string, text: string): string {
  return card(
    `${eyebrow(label, C.muted)}<p style="margin:0;padding:14px 16px;background:${C.soft};border-radius:14px;font:400 15px/24px ${FONT};color:${C.ink}">${esc(text).replace(/\n/g, '<br>')}</p>`,
  )
}

/** Fallback link under a button for clients that block buttons. */
export function linkFallback(href: string): string {
  return para(
    `If the button doesn't work, copy this link into your browser:<br><a href="${esc(href)}" style="color:${C.ink};font-weight:600;word-break:break-all">${esc(href)}</a>`,
    { color: C.muted, size: 13, margin: '16px 0 0' },
  )
}

// ---------------------------------------------------------------------------
// Class ticket (calendar tile + class info + detail rows)
// ---------------------------------------------------------------------------

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** Pull day + month out of the many date strings callers send. */
export function dayMonth(dateText: string): { day: string; mon: string } | null {
  const s = (dateText || '').trim()
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return { day: String(Number(m[3])), mon: MONTHS[Number(m[2]) - 1] || '' }
  m = s.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,})/)
  if (m && MONTHS.includes(m[2].slice(0, 3).toUpperCase())) return { day: m[1], mon: m[2].slice(0, 3).toUpperCase() }
  m = s.match(/\b([A-Za-z]{3,})\s+(\d{1,2})\b/)
  if (m && MONTHS.includes(m[1].slice(0, 3).toUpperCase())) return { day: m[2], mon: m[1].slice(0, 3).toUpperCase() }
  return null
}

export function classTicket(opts: {
  className: string
  classDate: string
  classTime?: string
  status?: string
  instructorName?: string
  cancelled?: boolean
  rows?: Array<[string, string] | null | undefined | false>
}): string {
  const dm = dayMonth(opts.classDate)
  const tileBg = opts.cancelled ? C.soft : C.tile
  const tileFg = opts.cancelled ? C.faint : C.lime
  const tile = dm
    ? `<p style="margin:0;font:800 26px/28px ${FONT};color:${tileFg}">${esc(dm.day)}</p><p style="margin:2px 0 0;font:700 10px/12px ${FONT};letter-spacing:.14em;color:${C.faint}">${esc(dm.mon)}</p>`
    : `<p style="margin:0;font:800 24px/28px ${FONT};color:${tileFg}">&#10003;</p>`
  const meta = [opts.classDate, opts.classTime, opts.instructorName].filter(Boolean).map(esc).join(' · ')
  const statusColor = opts.cancelled ? C.muted : C.limeInk
  const rows = (opts.rows || []).filter(Boolean)
  return card(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="68" style="vertical-align:top"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:${tileBg};border-radius:16px;width:64px;height:68px">${tile}</td></tr></table></td>
<td style="padding-left:16px;vertical-align:middle">
${opts.status ? `<p style="margin:0 0 4px;font:700 10px/14px ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${statusColor}">${esc(opts.status)}</p>` : ''}
<p style="margin:0;font:700 18px/24px ${FONT};color:${opts.cancelled ? C.faint : C.ink};${opts.cancelled ? 'text-decoration:line-through;' : ''}">${esc(opts.className)}</p>
<p style="margin:2px 0 0;font:400 14px/20px ${FONT};color:${C.muted}">${meta}</p>
</td></tr></table>${rows.length ? `${spacer(16)}${detailRows(rows)}` : ''}`)
}

// ---------------------------------------------------------------------------
// Staff emails
// ---------------------------------------------------------------------------

/** Contact card with one-tap WhatsApp / Call / Email (only for what we have). */
export function contactCard(opts: { name: string; email?: string | null; phone?: string | null; extraRows?: Array<[string, string] | null | false> }): string {
  const digits = (opts.phone || '').replace(/[^\d+]/g, '')
  const waDigits = digits.replace(/^\+/, '')
  const waNumber = waDigits.length === 8 ? `65${waDigits}` : waDigits
  const actions: Array<[string, string]> = []
  if (waNumber) actions.push(['WhatsApp', `https://wa.me/${waNumber}`])
  if (digits) actions.push(['Call', `tel:${digits}`])
  if (opts.email && opts.email.includes('@')) actions.push(['Email', `mailto:${opts.email}`])
  return card(
    `${eyebrow('Contact', C.muted)}${heading(esc(opts.name))}${spacer(6)}${detailRows([
      opts.email ? ['Email', esc(opts.email)] : null,
      opts.phone ? ['Phone', esc(opts.phone)] : null,
      ...(opts.extraRows || []),
    ])}${actions.length ? `${spacer(16)}${actionRow(actions)}` : ''}`,
  )
}

export function staffFooterCard(label: string, path: string): string {
  return card(
    `${button(label, `${adminUrl()}${path}`, 'dark')}<p style="margin:12px 0 0;font:400 12px/18px ${FONT};color:${C.muted}">Sent to studio staff. Change recipients in Admin › Settings › Alert emails.</p>`,
    { pad: '22px 32px' },
  )
}
