# Zumbaton Web (User Portal) - Implementation Plan

## Overview
User-facing website for Zumbaton fitness app where members can:
- Browse and book fitness classes
- Purchase token packages
- Manage their bookings and profile
- View their token balance and history

## Tech Stack
- Next.js 16 with App Router
- React 19
- Tailwind CSS v4
- Supabase (shared backend with admin)
- Zod validation

## Pages to Build

### Public Pages
- `/` - Home page (customize existing template)
- `/classes` - Browse all available classes
- `/classes/[classId]` - Class detail with booking
- `/pricing` - Token packages for purchase
- `/about` - About Zumbaton
- `/contact` - Contact form

### Auth Pages (existing, need connection)
- `/signin` - Login
- `/signup` - Registration

### Protected Pages (require auth)
- `/dashboard` - User dashboard overview
- `/dashboard/bookings` - My bookings
- `/dashboard/tokens` - Token balance & history
- `/dashboard/profile` - Edit profile
- `/dashboard/packages` - My purchased packages

## Components to Build

### Layout Components
- `UserNav` - Navigation for logged-in users
- `DashboardLayout` - Layout for dashboard pages
- `AuthGuard` - Protect routes requiring auth

### Feature Components
- `ClassCard` - Display class in grid
- `ClassSchedule` - Weekly/daily class schedule view
- `BookingModal` - Modal to confirm booking
- `TokenBalance` - Display current token count
- `PackageCard` - Display package for purchase
- `BookingList` - List of user's bookings
- `TokenHistory` - Transaction history

## API Integration
Reuse schemas from admin project, create hooks for:
- `useAuth` - Authentication state
- `useClasses` - Fetch classes
- `useBookings` - User bookings
- `useTokens` - Token balance
- `usePackages` - Available packages

## Implementation Order
1. Auth context and hooks
2. Dashboard layout and navigation  
3. Classes browsing page
4. Class detail and booking
5. User dashboard
6. Token balance display
7. Booking management
8. Package purchase flow
