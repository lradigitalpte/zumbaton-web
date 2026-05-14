/**
 * Placeholder email when only a phone number was collected (HitPay + DB require an address).
 * Stable per phone + optional slot so duplicate-phone duo bookings do not collide.
 */
export function placeholderGuestEmailFromPhone(phone: string, slot?: string): string {
  const digits = phone.replace(/\D/g, '') || '0'
  const s = slot ? `.${slot.replace(/[^a-z0-9]/gi, '').slice(0, 12)}` : ''
  return `guest${s}+${digits}@guest.onestepfitness.sg`
}
