# HitPay Trial Booking – Local Testing

## Do **not** use `http://localhost:3000` as the webhook URL in HitPay

HitPay’s servers call your webhook over the internet. They **cannot** reach `http://localhost:3000` because that address only exists on your machine.

So in the HitPay dashboard, the webhook URL should **never** be `http://localhost:3000/api/payments/webhook`.

---

## Using sandbox for testing (local and Vercel)

**Yes – use sandbox env for testing.** Set sandbox in **both** local and Vercel while you test.

- **Local:** In `.env.local` set `HITPAY_ENV=sandbox` (or leave unset; default is sandbox), plus your **sandbox** API key and **sandbox** webhook salt. Local will then use HitPay sandbox (no real money).
- **Vercel:** Add the **same** sandbox env vars in Vercel (Settings → Environment Variables): `HITPAY_ENV=sandbox`, `HITPAY_API_KEY` = sandbox key, `HITPAY_SALT` = sandbox salt. Then the Vercel deployment also uses sandbox. **Vercel will work** for sandbox testing too.

When you’re ready to go live, switch both to `HITPAY_ENV=live` and use the **live** API key and **live** webhook salt.

---

## How to test the trial booking flow locally

You have two main options.

### Option A: Use your Vercel URL (simplest)

Use the **same** webhook URL you use in production: your **public** app URL.

1. **In HitPay (Developers → Webhook Endpoints)**  
   - URL: `https://zumbaton-web.vercel.app/api/payments/webhook`  
   - Salt: your HitPay webhook salt (same as in production).

2. **When running the app locally**  
   In `.env.local` set:
   ```env
   NEXT_PUBLIC_APP_URL=https://zumbaton-web.vercel.app
   ```
   So that when you create a trial booking from localhost, the app still tells HitPay:
   - **Redirect URL:** `https://zumbaton-web.vercel.app/trial-booking/success?payment_id=...`
   - **Webhook URL:** `https://zumbaton-web.vercel.app/api/payments/webhook`

3. **Use the same Supabase project**  
   Local app and Vercel should use the same Supabase (same `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`), so:
   - Draft booking and payment are created in that DB when you submit the form on localhost.
   - After payment, HitPay calls the **Vercel** webhook; Vercel updates the **same** DB.
   - User is redirected to the **Vercel** success page.

Result: you can test the form and payment flow from localhost, while the webhook runs on Vercel and updates the shared DB. You do **not** add `localhost:3000` anywhere in HitPay.

---

### Option B: Full local testing with a tunnel (ngrok)

If you want the webhook to hit your **local** server (e.g. to debug webhook code):

1. **Expose localhost with ngrok** (or similar):
   ```bash
   npx ngrok http 3000
   ```
   You get a URL like `https://abc123.ngrok.io`.

2. **In `.env.local`:**
   ```env
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   ```
   (Use the URL ngrok shows; it changes each time unless you have a fixed domain.)

3. **In HitPay (Developers → Webhook Endpoints)**  
   Either add a **second** webhook for testing, or temporarily set:
   - URL: `https://abc123.ngrok.io/api/payments/webhook`
   - Salt: same as production.

4. Run your app: `npm run dev`.  
   When you create a trial booking, the app will send HitPay:
   - Redirect: `https://abc123.ngrok.io/trial-booking/success?payment_id=...`
   - Webhook: `https://abc123.ngrok.io/api/payments/webhook`  
   HitPay can reach both because ngrok forwards them to your localhost.

Note: ngrok URLs change on free tier; update HitPay and/or `.env.local` when the URL changes.

---

## Env vars for HitPay (local and Vercel)

In `.env.local` (and in Vercel for sandbox testing) you need:

```env
# HitPay Sandbox (testing)
HITPAY_API_KEY=your_sandbox_api_key
HITPAY_SALT=your_webhook_salt_from_hitpay_dashboard
HITPAY_ENV=sandbox

# So the app knows where to send redirect + webhook URLs
NEXT_PUBLIC_APP_URL=https://zumbaton-web.vercel.app
```

- **Sandbox credentials** (API key + Salt) come from the HitPay dashboard (sandbox mode).  
- **Webhook Salt** is the one you set in HitPay under **Developers → Webhook Endpoints** (the “Salt” field). It must match what you put in `HITPAY_SALT` so signature verification works.

---

## Summary

| Question | Answer |
|----------|--------|
| Should I add `localhost:3000` in HitPay? | **No.** HitPay cannot call localhost. |
| For local testing, what URL do I use? | Either keep **Vercel** as webhook URL (Option A) or use an **ngrok** URL (Option B). |
| Where do I set the webhook URL? | In HitPay dashboard: **Developers → Webhook Endpoints**. The app also sends a webhook URL with each payment request; that comes from `NEXT_PUBLIC_APP_URL` + `/api/payments/webhook`. |
| Will Vercel work with sandbox? | **Yes.** Set the same sandbox env vars on Vercel (`HITPAY_ENV=sandbox`, sandbox API key, sandbox salt). Both local and Vercel can use sandbox for testing. |
