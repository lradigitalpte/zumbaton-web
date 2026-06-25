# One Step Fitness Website Change Roadmap

## Goal
Rebrand the website from Zumbaton to **One Step Fitness** and implement the new class catalog, pricing rules, booking/payment flows, and content updates with minimal disruption.

Company name: **One Step Fitness**  
Slogan: **one step to change your life**

## Scope of Change

### Branding
- Replace all public-facing references of "Zumbaton" with "One Step Fitness".
- Update slogan sitewide.
- Keep technical/internal names unchanged initially if needed (to reduce deployment risk), then clean up in a later pass.

### Class Offerings
- **Zumba Step** (Coach: Robert)
- **Groove Stepper** (Coach: Laavania)
- **ThunderBolt Full Body Workout** (Tabata style)
- **Lil Steppers** (Kids)
- **ZumFiesta** (Outdoor class)
- **One Familia** (Family class with kids)

### Core Pricing Rules
- Trial class: `$23`
- Single session: `$30`
- 4 sessions: `$99`
- 8 sessions: `$185`
- 10 sessions: `$225`
- Unlimited (1 month): `$250`
- Validity: **1 month** for package plans above
- Mix-and-match allowed across:
  - Zumba Step
  - Groove Stepper
  - ThunderBolt Full Body Workout

### Lil Steppers Pricing
- Trial: `$18`
- 1 session: `$20`
- 4 sessions: `$75`
- Validity: **1 month**

### One Familia Pricing (one-time)
- 1 child + 1 adult = `$38`
- 1 child + 2 adults = `$56`
- 2 child + 1 adult = `$58`
- 2 child + 2 adults = `$76`
- Validity: **one-time only**

### ZumFiesta Pricing (one-time)
- 1 time purchase = `$28`
- No package plan for now

### Registration and Checkout Rules
1. **Account registration required only for package purchases**.
2. For one-time classes (ZumFiesta, One Familia, individual booking), user can:
   - pick slot
   - enter details (name, age, email, HP number, gender)
   - pay immediately
   - no account required

## ThunderBolt Content Requirements
Add a dedicated section/page describing ThunderBolt Tabata workout with benefits and considerations.

### Key points to publish
- Fat loss and afterburn effect (EPOC)
- Full-body conditioning (legs + core + optional upper body combos)
- Cardio/stamina and VO2 max improvements
- Coordination, agility, rhythm, and balance
- Time efficiency (30-60 min)
- Dual energy-system training (anaerobic + aerobic)
- Mental toughness and engagement
- Important safety/modification notes (beginner scaling, form, shoes, fatigue management)

## Delivery Plan (Phased)

## Phase 1 - Discovery and Alignment
- Confirm all naming and price values with business owner.
- Confirm which classes are package-eligible vs one-time direct checkout.
- Confirm whether age validation differs for kids/family classes.
- Confirm whether HP number format/validation is Singapore-specific.

**Exit criteria**
- Signed-off product rules document.
- No ambiguity in class-to-pricing mapping.

## Phase 2 - Data Model and Admin Setup
- Add/update class definitions in database.
- Add/update package definitions:
  - General mixed packages (trial/single/4/8/10/unlimited)
  - Lil Steppers package set
- Add one-time products:
  - ZumFiesta single purchase
  - One Familia combinations
- Tag products with purchase type:
  - `requires_account = true` (packages)
  - `requires_account = false` (one-time)
- Add validity rules:
  - `1_month`
  - `one_time`

**Exit criteria**
- Admin can create/edit all new offerings.
- Database correctly enforces product type and validity metadata.

## Phase 3 - Public Website Content + Rebrand
- Update header, footer, homepage hero, About, metadata, and SEO title/description.
- Replace class cards and schedule labels with new class names.
- Add ThunderBolt info content block/page.
- Add instructor attribution where needed (Robert, Laavania).

**Exit criteria**
- No stale "Zumbaton" branding in visible pages (except optional legal/internal references).
- New class catalog visible to users.

## Phase 4 - Booking and Checkout Flow Redesign
- Split checkout into two paths:
  1. **Package Purchase Path**: requires login/registration.
  2. **Instant Booking Path**: guest checkout (no account), collect name/age/email/HP/gender.
- Update slot selection UX for one-time classes.
- Ensure payment starts only after required details are collected.
- Generate booking record + payment status for guest purchases.
- Send confirmation email/SMS flow (if supported) for guests and members.

**Exit criteria**
- Package purchase blocked for guests.
- One-time booking works end-to-end without account creation.

## Phase 5 - Pricing Engine and Validation
- Enforce mix-and-match only for:
  - Zumba Step
  - Groove Stepper
  - ThunderBolt
- Block package redemption on ineligible classes (ZumFiesta, One Familia unless defined otherwise).
- Enforce validity windows:
  - one month from purchase for packages
  - one-time for event/family products
- Validate participant composition rules for One Familia checkout.

**Exit criteria**
- No pricing mismatch between UI and backend.
- Booking attempts follow all class/package constraints.

## Phase 6 - QA and UAT
- Test matrix:
  - guest one-time booking success/failure
  - member package purchase + redemption
  - expiry logic at 1 month
  - one-time redemption behavior
  - price display consistency on list/detail/checkout/payment pages
- Mobile responsiveness checks for booking and payment pages.
- Regression checks for auth, dashboard, and existing payments.

**Exit criteria**
- UAT sign-off from business owner.
- Zero blocker issues for launch.

## Phase 7 - Launch and Post-Launch
- Deploy with migration and rollback notes.
- Monitor failed checkouts and booking errors.
- Monitor no-account booking abandonment.
- Collect first-week feedback and adjust UI copy/flows quickly.

**Exit criteria**
- Stable conversion flow.
- No critical payment/booking defects.

## Implementation Checklist (Practical)
- [ ] Rebrand copy and SEO to One Step Fitness.
- [ ] Add all new class types and instructors.
- [ ] Configure new pricing tables and validity metadata.
- [ ] Build guest checkout form (name, age, email, HP, gender).
- [ ] Restrict account requirement to package products only.
- [ ] Implement One Familia composition pricing logic.
- [ ] Add ThunderBolt benefits section/page.
- [ ] Validate package mix-and-match eligibility.
- [ ] Run full QA/UAT matrix.
- [ ] Go live and monitor analytics/errors.

## Open Decisions to Confirm Before Build
- Should guest checkout create a lightweight customer profile for future matching?
- Should users be able to convert guest bookings into accounts later?
- Are refunds/reschedule rules different for one-time vs package bookings?
- Is WhatsApp confirmation needed in addition to email?
- Do we keep any legacy URLs, or redirect all old branding routes immediately?

Summarize the issue and suggest fixes for the following lint item:
Title: Security Definer View
Entity: public.upcoming_classes_summary
Schema: public
Issue Details: View `public.upcoming_classes_summary` is defined with the SECURITY DEFINER property
Description: Detects views defined with the SECURITY DEFINER property. These views enforce Postgres permissions and row level security policies (RLS) of the view creator, rather than that of the querying user...Summarize the issue and suggest fixes for the following lint item:
Title: Security Definer View
Entity: public.admin_dashboard_metrics
Schema: public
Issue Details: View `public.admin_dashboard_metrics` is defined with the SECURITY DEFINER property
Description: Detects views defined with the SECURITY DEFINER property. These views enforce Postgres permissions and row level security policies (RLS) of the view creator, rather than that of the querying user.. Summarize the issue and suggest fixes for the following lint item:
Title: Security Definer View
Entity: public.user_profiles_with_stats
Schema: public
Issue Details: View `public.user_profiles_with_stats` is defined with the SECURITY DEFINER property
Description: Detects views defined with the SECURITY DEFINER property. These views enforce Postgres permissions and row level security policies (RLS) of the view creator, rather than that of the querying user.. Summarize the issue and suggest fixes for the following lint item:
Title: Security Definer View
Entity: public.rooms_with_usage
Schema: public
Issue Details: View `public.rooms_with_usage` is defined with the SECURITY DEFINER property
Description: Detects views defined with the SECURITY DEFINER property. These views enforce Postgres permissions and row level security policies (RLS) of the view creator, rather than that of the querying user.. Summarize the issue and suggest fixes for the following lint item:
Title: Security Definer View
Entity: public.categories_with_usage
Schema: public
Issue Details: View `public.categories_with_usage` is defined with the SECURITY DEFINER property
Description: Detects views defined with the SECURITY DEFINER property. These views enforce Postgres permissions and row level security policies (RLS) of the view creator, rather than that of the querying user..Summarize the issue and suggest fixes for the following lint item:
Title: Security Definer View
Entity: public.user_token_balances
Schema: public
Issue Details: View `public.user_token_balances` is defined with the SECURITY DEFINER property
Description: Detects views defined with the SECURITY DEFINER property. These views enforce Postgres permissions and row level security policies (RLS) of the view creator, rather than that of the querying user.. Summarize the issue and suggest fixes for the following lint item:
Title: Security Definer View
Entity: public.user_no_show_counts
Schema: public
Issue Details: View `public.user_no_show_counts` is defined with the SECURITY DEFINER property
Description: Detects views defined with the SECURITY DEFINER property. These views enforce Postgres permissions and row level security policies (RLS) of the view creator, rather than that of the querying user..Summarize the issue and suggest fixes for the following lint item:
Title: RLS Disabled in Public
Entity: public.referral_vouchers
Schema: public
Issue Details: Table `public.referral_vouchers` is public, but RLS has not been enabled.
Description: Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST...Summarize the issue and suggest fixes for the following lint item:
Title: RLS Disabled in Public
Entity: public.announcements
Schema: public
Issue Details: Table `public.announcements` is public, but RLS has not been enabled.
Description: Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST..Summarize the issue and suggest fixes for the following lint item:
Title: RLS Disabled in Public
Entity: public.password_reset_otps
Schema: public
Issue Details: Table `public.password_reset_otps` is public, but RLS has not been enabled.
Description: Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST..Summarize the issue and suggest fixes for the following lint item:
Title: Security Definer View
Entity: public.user_no_show_counts
Schema: public
Issue Details: View `public.user_no_show_counts` is defined with the SECURITY DEFINER property
Description: Detects views defined with the SECURITY DEFINER property. These views enforce Postgres permissions and row level security policies (RLS) of the view creator, rather than that of the querying user