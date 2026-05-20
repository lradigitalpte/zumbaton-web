const PLACEHOLDER_DOMAIN = '@guest.onestepfitness.sg'

/**
 * Placeholder email when only a phone number was collected (HitPay + DB require an address).
 * Stable per phone + optional slot so duplicate-phone duo bookings do not collide.
 */
export function placeholderGuestEmailFromPhone(phone: string, slot?: string): string {
  const digits = phone.replace(/\D/g, '') || '0'
  const s = slot ? `.${slot.replace(/[^a-z0-9]/gi, '').slice(0, 12)}` : ''
  return `guest${s}+${digits}${PLACEHOLDER_DOMAIN}`
}

export function isPlaceholderGuestEmail(email: string): boolean {
  return email.toLowerCase().endsWith(PLACEHOLDER_DOMAIN)
}

/** Use a real address when provided; otherwise fall back to phone placeholder. */
export function resolveGuestEmail(
  email: string | undefined,
  phone: string,
  slot?: string
): string {
  const raw = (email || '').trim()
  if (raw.includes('@') && !raw.includes(' ') && !isPlaceholderGuestEmail(raw)) {
    return raw.toLowerCase()
  }
  return placeholderGuestEmailFromPhone(phone, slot)
}
