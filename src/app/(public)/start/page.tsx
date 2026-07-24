"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Star,
  ShieldCheck,
  MapPin,
  Loader2,
  Clock,
  MessageCircle,
  Phone,
  HeartPulse,
  Timer,
  CalendarDays,
  Flame,
  Users,
} from "lucide-react";
import { HorizontalScrollCarousel } from "@/components/Common/HorizontalScrollCarousel";
import { OfferCountdownBadge, useOfferCountdown } from "@/components/Start/OfferCountdown";

// ── Editable marketing constants ──────────────────────────────────────────
// Anchor price the trial is discounted from (regular single-class rate).
const REGULAR_PRICE_CENTS = 3000; // $30
// Social proof — replace with your real figures before scaling ad spend.
const RATING = "4.9";
const REVIEW_COUNT = "300+";
// What the guest is promised after booking.
const RESPONSE_PROMISE = "within 2 hours (9am to 9pm)";
// Studio contact (used for the minimal header + footer).
const PHONE_DISPLAY = "+65 8492 7347";
const WHATSAPP_URL = "https://wa.me/6584927347";
const STUDIO_EMAIL = "hello@onestepfitness.sg";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("2 Jalan Klapa, #2-A, Singapore 199314")}`;

const TESTIMONIALS = [
  {
    quote:
      "I hadn't danced in years, but I felt comfortable from my very first class.",
    tag: "New to dance fitness",
  },
  {
    quote:
      "I was nervous before coming, but the coach and everyone in the room made me feel welcome.",
    tag: "Nervous first-timer",
  },
  {
    quote:
      "Now it is the highlight of my week. I finally found a workout I actually look forward to.",
    tag: "Now a regular",
  },
];

const CLASS_TASTER = ["Zumba Step", "Groove Stepper", "Piloxing", "Thunderbolt"];

const formatPrice = (cents: number) => {
  const d = cents / 100;
  return `$${Number.isInteger(d) ? d : d.toFixed(2)}`;
};

function formatOfferEndDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  return new Date(y, m - 1, d).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function StartPage() {
  const [promo, setPromo] = useState<{
    indoorPriceCents: number;
    outdoorPriceCents: number;
    live: boolean;
    paymentTerms: "full" | "deposit" | "none";
    depositPercent: number;
    outdoorAvailable: boolean;
    startPageMode: "quick_join" | "trial";
    endDate: string | null;
  }>({
    indoorPriceCents: 2300,
    outdoorPriceCents: 3500,
    live: true,
    paymentTerms: "full",
    depositPercent: 50,
    outdoorAvailable: false,
    startPageMode: "quick_join",
    endDate: null,
  });

  const [venue, setVenue] = useState<"studio" | "outdoor">("studio");
  const [form, setForm] = useState({ name: "", phone: "", email: "", preferredNote: "" });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/promos/config")
      .then((r) => r.json())
      .then((res) => {
        if (active && res?.success && res.data) {
          setPromo({
            indoorPriceCents: res.data.indoorPriceCents ?? 2300,
            outdoorPriceCents: res.data.outdoorPriceCents ?? 3500,
            live: res.data.live ?? true,
            paymentTerms: res.data.paymentTerms ?? "full",
            depositPercent: res.data.depositPercent ?? 50,
            outdoorAvailable: res.data.outdoorAvailable === true,
            startPageMode: res.data.startPageMode === "trial" ? "trial" : "quick_join",
            endDate: res.data.endDate ?? null,
          });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!promo.outdoorAvailable && venue === "outdoor") setVenue("studio");
  }, [promo.outdoorAvailable, venue]);

  const isDuoBooking = promo.startPageMode === "quick_join" && promo.live;
  const isFastTrial = !isDuoBooking;

  const priceCents =
    isFastTrial || venue === "studio" ? promo.indoorPriceCents : promo.outdoorPriceCents;
  const chargeCents =
    promo.paymentTerms === "none"
      ? 0
      : promo.paymentTerms === "deposit"
        ? Math.max(1, Math.round((priceCents * promo.depositPercent) / 100))
        : priceCents;
  const balanceCents = Math.max(0, priceCents - chargeCents);
  const payOnline = promo.paymentTerms !== "none" && chargeCents > 0;
  const showAnchor = priceCents < REGULAR_PRICE_CENTS;
  const savingCents = Math.max(0, REGULAR_PRICE_CENTS - priceCents);
  const offerEndsLabel = promo.endDate ? formatOfferEndDate(promo.endDate) : null;
  const countdown = useOfferCountdown();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Please enter your name, phone and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email. Your receipt is sent there.");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the terms and waiver to continue.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/promos/quick-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          venue: isDuoBooking ? venue : "studio",
          bookingFlow: isDuoBooking ? "duo" : "trial",
          preferredNote: form.preferredNote.trim() || undefined,
          termsAgreed: true,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
          return;
        }
        if (result.reserved) {
          setReserved(true);
          return;
        }
      }
      setError(result.message || result.error || "Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const ctaLabel = !payOnline
    ? "Reserve my risk-free trial"
    : promo.paymentTerms === "deposit"
      ? `Claim my trial, ${formatPrice(chargeCents)} deposit`
      : `Claim my risk-free trial, ${formatPrice(chargeCents)}`;

  return (
    <main className="bg-[#f6f4ee] text-gray-900">
      {/* ── Limited-time strip + session countdown ── */}
      <div className="bg-lime-500 text-black">
        <div className="mx-auto max-w-6xl px-4 py-2.5 sm:py-3">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide sm:text-sm">
              <Timer className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              {countdown.expired ? "Claim this intro offer" : "Claim this offer ends in"}
            </p>
            <OfferCountdownBadge
              size="md"
              className="bg-red-600 text-white shadow-sm ring-2 ring-red-700/20 animate-pulse"
            />
          </div>
          <p className="mt-1 text-center text-[11px] font-bold leading-snug text-black/80 sm:text-xs">
            {offerEndsLabel
              ? `Promo ends ${offerEndsLabel}.`
              : countdown.expired
                ? "Timer ended. Intro pricing may still be available."
                : "First class intro pricing. Claim it before the timer ends."}
          </p>
        </div>
      </div>

      {/* ── Minimal header ── */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f4ee]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-4">
          <Link href="/explore" className="relative block h-9 w-24 shrink-0 sm:h-11 sm:w-32 md:h-12 md:w-40" aria-label="One Step Fitness home">
            <Image
              src="/logo/One step fitness logo.png"
              alt="One Step Fitness"
              fill
              className="object-contain object-left"
              sizes="(max-width: 640px) 96px, 160px"
              priority
            />
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-black sm:inline-flex"
            >
              <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}
            </a>
            <a
              href="#book"
              className="whitespace-nowrap bg-lime-500 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-black transition-colors hover:bg-black hover:text-white sm:px-5 sm:text-sm"
            >
              Claim my trial
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero + Form ── */}
      <section className="relative overflow-hidden border-b border-black/5 bg-[#f6f4ee]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 px-4 py-6 sm:gap-10 sm:px-6 sm:py-10 lg:grid-cols-2 lg:gap-14 lg:py-16">
          {/* Pitch — below form on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="order-1 lg:order-1"
          >
            <p className="mb-3 text-xs font-black uppercase text-lime-700">See yourself in the room</p>
            <div className="mb-4 inline-flex items-center gap-2 bg-black px-3 py-2 text-[10px] font-black uppercase text-white sm:text-xs">
              <ShieldCheck className="h-4 w-4 shrink-0 text-lime-400" />
              100% money-back guarantee
            </div>

            <h1 className="mb-5 text-[2.6rem] font-black uppercase italic leading-[0.9] text-gray-900 sm:text-6xl lg:text-7xl">
              FINALLY, A
              <br />
              WORKOUT YOU&apos;LL
              <br />
              <span className="text-lime-600">ENJOY.</span>
            </h1>

            <p className="mb-5 max-w-lg text-base font-semibold leading-relaxed text-gray-700 sm:text-lg">
              Try your first class completely risk free. If you don&apos;t enjoy it, we&apos;ll refund your{" "}
              {formatPrice(priceCents)}.
            </p>

            <ul className="mb-6 grid gap-2 sm:grid-cols-2">
              {[
                "Perfect for busy professionals",
                "Burn 400 to 800 calories",
                "Complete beginners welcome",
                "Friendly, supportive community",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm font-semibold text-gray-800">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 sm:mt-0" /> {t}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-5 border-t border-black/10 pt-6">
              <div className="relative w-[42%] max-w-[190px] shrink-0 rounded-[1.7rem] border-[5px] border-zinc-700 bg-zinc-900 p-1.5 shadow-xl">
                <div className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-zinc-900" />
                <video
                  className="aspect-[9/16] w-full rounded-[1.2rem] bg-black object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  aria-label="Inside a One Step Fitness class"
                >
                  <source
                    src="/videos/1784880267014-4ab2896b-c8e1-4a99-ba68-c73c2e8951bd.mp4#t=0.1"
                    type="video/mp4"
                  />
                  Your browser does not support embedded video.
                </video>
              </div>
              <div>
                <p className="mb-2 text-xl font-black uppercase italic leading-tight text-gray-900 sm:text-2xl">
                  This is what fun fitness looks like.
                </p>
                <p className="text-xs font-medium leading-relaxed text-gray-600 sm:text-sm">
                  High energy, welcoming coaches and room to follow along at your own pace.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Booking card — first on mobile */}
          <motion.div
            id="book"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="order-2 scroll-mt-[4.5rem] sm:scroll-mt-24 lg:order-2"
          >
            {reserved ? (
              <div className="border border-lime-500 bg-white p-8 text-center shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-lime-500">
                  <Check className="h-8 w-8 text-black" />
                </div>
                <h2 className="mb-3 text-2xl font-black uppercase italic tracking-tighter text-gray-900">
                  You&apos;re in!
                </h2>
                <p className="mx-auto max-w-sm text-sm font-medium leading-relaxed text-gray-600">
                  Thanks, {form.name.split(" ")[0] || "there"}. We&apos;ll message you {RESPONSE_PROMISE}{" "}
                  to confirm your class. No payment needed right now.
                </p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="overflow-hidden border border-black/10 bg-white shadow-xl">
                {/* Price comparison — large and impossible to miss */}
                {showAnchor && (
                  <div className="border-b border-black/10 bg-lime-500 px-4 py-3.5 sm:px-6 sm:py-5">
                    <div className="mb-2.5 flex flex-wrap items-center justify-center gap-2">
                      <p className="text-center text-[10px] font-black uppercase tracking-wide text-black/70 sm:text-[11px]">
                        Your risk-free first class
                      </p>
                    </div>
                    <div className="mx-auto flex max-w-md items-center justify-center gap-2.5 sm:gap-4">
                      <span className="text-lg font-black italic leading-none text-black/30 line-through sm:text-2xl">
                        {formatPrice(REGULAR_PRICE_CENTS)}
                      </span>
                      <span className="text-3xl font-black italic leading-none tracking-tighter text-black sm:text-5xl">
                        {formatPrice(priceCents)}
                      </span>
                      <span className="shrink-0 bg-black px-2.5 py-1.5 text-xs font-black uppercase text-lime-500 sm:px-3 sm:py-2 sm:text-sm">
                        Save {formatPrice(savingCents)}
                      </span>
                    </div>
                    <p className="mt-3 text-center text-xs font-bold text-black/75">
                      {isDuoBooking ? "Bring a friend for the same price. " : ""}
                      Book now, attend an eligible class within 12 months.
                    </p>
                    {offerEndsLabel && (
                      <p className="mt-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-black/70 sm:text-xs">
                        Offer ends {offerEndsLabel}
                      </p>
                    )}
                  </div>
                )}

                {!showAnchor && (
                  <div className="border-b border-black/10 bg-lime-500/20 px-6 py-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-800">
                      Your risk-free first class
                    </p>
                    <p className="text-5xl font-black italic leading-none tracking-tighter text-gray-900">
                      {formatPrice(priceCents)}
                    </p>
                  </div>
                )}

                <div className="space-y-4 p-4 sm:p-6 md:p-8">
                  {isDuoBooking && promo.outdoorAvailable && (
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Where?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setVenue("studio")}
                          className={`border p-3 text-left transition-colors ${
                            venue === "studio"
                              ? "border-lime-600 bg-lime-500/15"
                              : "border-black/10 hover:border-black/30"
                          }`}
                        >
                          <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Studio
                          </div>
                          <div className="text-xl font-black italic tracking-tighter text-gray-900">
                            {formatPrice(promo.indoorPriceCents)}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVenue("outdoor")}
                          className={`border p-3 text-left transition-colors ${
                            venue === "outdoor"
                              ? "border-lime-600 bg-lime-500/15"
                              : "border-black/10 hover:border-black/30"
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <MapPin className="h-3 w-3" /> Outdoor
                          </div>
                          <div className="text-xl font-black italic tracking-tighter text-gray-900">
                            {formatPrice(promo.outdoorPriceCents)}
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="s-name" className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Your name
                    </label>
                    <input
                      id="s-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full name"
                      className="w-full border border-black/15 bg-[#f6f4ee] px-4 py-3 text-sm font-semibold text-gray-900 placeholder:font-medium placeholder:normal-case placeholder:text-gray-400 focus:border-lime-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="s-phone" className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Phone
                      </label>
                      <input
                        id="s-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+65 9123 4567"
                        className="w-full border border-black/15 bg-[#f6f4ee] px-4 py-3 text-sm font-semibold text-gray-900 placeholder:font-medium placeholder:normal-case placeholder:text-gray-400 focus:border-lime-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="s-email" className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Email
                      </label>
                      <input
                        id="s-email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@email.com"
                        className="w-full border border-black/15 bg-[#f6f4ee] px-4 py-3 text-sm font-semibold text-gray-900 placeholder:font-medium placeholder:normal-case placeholder:text-gray-400 focus:border-lime-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="s-when" className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                      When suits you?{" "}
                      <span className="font-medium normal-case tracking-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      id="s-when"
                      type="text"
                      value={form.preferredNote}
                      onChange={(e) => setForm({ ...form, preferredNote: e.target.value })}
                      placeholder="Weekday evenings, Saturday mornings…"
                      className="w-full border border-black/15 bg-[#f6f4ee] px-4 py-3 text-sm font-semibold text-gray-900 placeholder:font-medium placeholder:normal-case placeholder:text-gray-400 focus:border-lime-600 focus:outline-none"
                    />
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 border border-black/10 bg-[#f6f4ee] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-lime-600"
                    />
                    <span className="text-xs leading-relaxed text-gray-600">
                      I agree to the{" "}
                      <Link href="/terms" className="font-semibold text-lime-700 hover:underline">
                        Terms &amp; Conditions
                      </Link>{" "}
                      and participation waiver.
                    </span>
                  </label>

                  {error && (
                    <div role="alert" className="border border-red-400 bg-red-50 px-3 py-2.5 text-xs font-semibold leading-relaxed text-red-800">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={processing || !agreedToTerms}
                    className="flex w-full items-center justify-center gap-2 bg-lime-500 py-4 text-xs font-black uppercase tracking-wide text-black transition-all hover:bg-black hover:text-white disabled:opacity-40 sm:gap-3 sm:text-sm sm:tracking-[0.15em]"
                  >
                    {processing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="space-y-1.5 pt-1 text-center">
                    <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-800">
                      <ShieldCheck className="h-4 w-4 text-lime-600" />
                      Don&apos;t enjoy your first class? Get a full refund.
                    </p>
                    <p className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                      <Clock className="h-3.5 w-3.5 text-lime-600" />
                      We&apos;ll message you {RESPONSE_PROMISE} to confirm your class.
                    </p>
                    {payOnline && promo.paymentTerms === "deposit" && balanceCents > 0 && (
                      <p className="text-xs text-gray-500">
                        {formatPrice(chargeCents)} now to secure your spot, {formatPrice(balanceCents)} at
                        the studio.
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400">
                      No account needed. Secure online checkout. Valid for 12 months.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Social proof band ── */}
      <section className="bg-black py-10 text-white sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-black uppercase text-lime-400">Everything included</p>
              <h2 className="max-w-xl text-3xl font-black uppercase italic leading-none sm:text-5xl">
                More than a discounted class.
              </h2>
            </div>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-white/65">
              One simple purchase gives you the time and freedom to try One Step Fitness your way.
            </p>
          </div>
          <div className="grid grid-cols-2 border-l border-t border-white/20 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Risk-free", text: "Full refund if you do not enjoy class." },
              { icon: Users, title: "Bring a friend", text: "Two first-timers can join for the same price." },
              { icon: CalendarDays, title: "12 months", text: "Plenty of time to choose an eligible class." },
              { icon: Flame, title: "Beginner ready", text: "Follow modifications and move at your pace." },
            ].map((item) => (
              <div key={item.title} className="border-b border-r border-white/20 p-4 sm:p-6">
                <item.icon className="mb-4 h-6 w-6 text-lime-400" />
                <h3 className="mb-2 text-sm font-black uppercase sm:text-lg">{item.title}</h3>
                <p className="text-xs leading-relaxed text-white/60 sm:text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white py-5 sm:py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 items-center justify-items-center gap-3 px-4 sm:flex sm:flex-row sm:justify-center sm:gap-8 sm:px-6">
          <div className="flex items-center justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-lime-600 text-lime-600 sm:h-4 sm:w-4" />
            ))}
            <span className="ml-1 text-xs font-black uppercase tracking-wide text-gray-900 sm:text-sm sm:tracking-widest">
              {RATING}/5
            </span>
          </div>
          <p className="text-center text-[10px] font-bold uppercase leading-snug tracking-wide text-gray-600 sm:text-xs sm:tracking-widest">
            Loved by {REVIEW_COUNT} dancers
          </p>
        </div>
      </section>

      {/* ── Testimonials — swipe on mobile, grid on desktop ── */}
      <section className="overflow-hidden bg-black py-12 text-white sm:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-16">
          <div>
            <p className="mb-3 text-xs font-black uppercase text-lime-400">More than a workout</p>
            <h2 className="mb-5 text-4xl font-black uppercase italic leading-none sm:text-6xl">
              Leave lighter than you arrived.
            </h2>
            <p className="max-w-md text-sm font-medium leading-relaxed text-white/65 sm:text-base">
              Make time for your health, shake off the day and build consistency with people who make
              showing up feel good.
            </p>
            <a
              href="#book"
              className="mt-7 inline-flex items-center gap-2 bg-lime-500 px-6 py-3.5 text-xs font-black uppercase text-black transition-colors hover:bg-white"
            >
              Claim my risk-free trial
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="flex justify-center">
            <div className="relative w-[72%] max-w-[270px] rounded-[2rem] border-[7px] border-zinc-700 bg-zinc-900 p-2 shadow-2xl">
              <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-zinc-900" />
              <video
                className="aspect-[9/16] w-full rounded-[1.45rem] bg-black object-cover"
                controls
                playsInline
                preload="metadata"
                aria-label="One Step Fitness community energy"
              >
                <source
                  src="/videos/1784880287420-3471528f-961d-47d1-ba6b-f0da5a1525b2.mp4#t=0.1"
                  type="video/mp4"
                />
                Your browser does not support embedded video.
              </video>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f4ee] py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-6 text-center text-2xl font-black uppercase italic tracking-tighter text-gray-900 sm:mb-8 sm:text-4xl">
            WHAT FIRST-TIMERS SAY
          </h2>

          <div className="md:hidden">
            <HorizontalScrollCarousel id="start-reviews-carousel" hint="Swipe">
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  data-carousel-card
                  className="flex w-[min(82vw,300px)] shrink-0 snap-start flex-col border border-black/10 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex gap-1">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="h-3 w-3 fill-lime-600 text-lime-600" />
                    ))}
                  </div>
                  <p className="mb-4 flex-1 text-sm font-medium leading-relaxed text-gray-700">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="text-[10px] font-black uppercase tracking-wide text-lime-700">
                    {t.tag}
                  </div>
                </div>
              ))}
            </HorizontalScrollCarousel>
          </div>

          <div className="mx-auto hidden max-w-5xl grid-cols-3 gap-4 md:grid">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="flex flex-col border border-black/10 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-lime-600 text-lime-600" />
                  ))}
                </div>
                <p className="mb-6 flex-1 text-sm font-medium leading-relaxed text-gray-700">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="text-[11px] font-black uppercase tracking-widest text-lime-700">
                  {t.tag}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works — 3-col grid even on mobile ── */}
      <section className="border-t border-black/10 bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="mb-6 text-center text-2xl font-black uppercase italic tracking-tighter text-gray-900 sm:mb-10 sm:text-4xl">
            How It Works
          </h2>
          <div className="mx-auto grid max-w-lg grid-cols-3 gap-2 sm:max-w-none sm:gap-8">
            {[
              { step: "01", text: "Reserve and pay online in under a minute" },
              { step: "02", text: "Choose any eligible class within 12 months" },
              { step: "03", text: "Dance risk free. Love it or get a refund" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center rounded border border-black/10 bg-[#f6f4ee] p-2.5 text-center sm:border-0 sm:bg-transparent sm:p-0">
                <div className="mb-2 flex h-10 w-10 items-center justify-center bg-lime-500 text-sm font-black italic text-black sm:mb-4 sm:h-14 sm:w-14 sm:text-xl">
                  {s.step}
                </div>
                <p className="text-[9px] font-black uppercase leading-snug tracking-wide text-gray-700 sm:max-w-48 sm:text-xs sm:leading-relaxed sm:tracking-widest">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why us — 2-col mobile grid, 3-col desktop ── */}
      <section className="bg-[#f6f4ee] py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 md:max-w-none md:grid-cols-3 md:gap-4">
            {[
              {
                icon: HeartPulse,
                title: "Enjoy Exercise Again",
                text: "Great music and guided movement turn a serious workout into the best hour of your week.",
              },
              {
                icon: Flame,
                title: "Build Consistency",
                text: "A welcoming class you look forward to makes it easier to keep prioritising your health.",
              },
              {
                icon: Users,
                title: "Find Your Community",
                text: "Move without judgement alongside friendly people and coaches who want you to succeed.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="border border-black/10 bg-white p-5 shadow-sm sm:p-8 md:col-span-1 [&:last-child]:col-span-2 md:[&:last-child]:col-span-1"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center bg-lime-500 sm:mb-6 sm:h-12 sm:w-12">
                  <item.icon className="h-5 w-5 text-black sm:h-6 sm:w-6" />
                </div>
                <h3 className="mb-2 text-sm font-black uppercase italic tracking-tight text-gray-900 sm:mb-3 sm:text-xl">{item.title}</h3>
                <p className="text-xs font-medium leading-relaxed text-gray-600 sm:text-sm">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8">
            <span className="mr-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Classes you can try:
            </span>
            {CLASS_TASTER.map((c) => (
              <span
                key={c}
                className="border border-black/15 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-gray-700"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden bg-lime-500 py-12 text-center text-black sm:py-20">
        <div className="absolute left-0 top-0 h-full w-1/4 -translate-x-1/4 -skew-x-12 bg-black/5" />
        <div className="relative z-10 mx-auto max-w-3xl px-4">
          <h2 className="mb-5 text-3xl font-black uppercase italic leading-none tracking-tighter sm:mb-6 sm:text-6xl">
            READY TO <span className="bg-black px-2 py-0.5 text-lime-500 sm:px-3 sm:py-1">START?</span>
          </h2>
          {showAnchor ? (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5 sm:mb-8 sm:gap-4">
              <span className="text-lg font-black italic text-black/35 line-through sm:text-2xl">
                {formatPrice(REGULAR_PRICE_CENTS)}
              </span>
              <span className="text-3xl font-black italic tracking-tighter sm:text-5xl">
                {formatPrice(priceCents)}
              </span>
              <span className="bg-black px-3 py-1.5 text-xs font-black uppercase tracking-wide text-lime-500 sm:px-4 sm:py-2 sm:text-sm">
                Save {formatPrice(savingCents)}
              </span>
            </div>
          ) : (
            <p className="mb-8 text-sm font-bold uppercase tracking-widest text-black/70">
              Your first class is closer than you think.
            </p>
          )}
          {offerEndsLabel && (
            <p className="mb-6 text-xs font-bold uppercase tracking-widest text-black/70">
              Limited time. Ends {offerEndsLabel}
            </p>
          )}
          <a
            href="#book"
            className="inline-flex items-center gap-3 bg-black px-12 py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-gray-900"
          >
            Claim my risk-free trial
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ── Slim footer ── */}
      <footer className="border-t border-black/10 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left sm:px-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            <a href="tel:+6584927347" className="hover:text-gray-900">
              {PHONE_DISPLAY}
            </a>
            <span className="mx-2 text-gray-300">|</span>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">
              2 Jalan Klapa, Singapore 199314
            </a>
            <span className="mx-2 text-gray-300">|</span>
            <a href={`mailto:${STUDIO_EMAIL}`} className="hover:text-gray-900">
              {STUDIO_EMAIL}
            </a>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-gray-900">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp us
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
          © {new Date().getFullYear()} One Step Fitness. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
