/** Booking rows that consume a spot on class capacity (UI + enforcement). */
export const OCCUPIED_BOOKING_STATUSES = ['confirmed', 'attended'] as const

export type OccupiedBookingStatus = (typeof OCCUPIED_BOOKING_STATUSES)[number]
