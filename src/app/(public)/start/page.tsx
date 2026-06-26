"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Sparkles, ShieldCheck, MapPin, Heart, Loader2 } from "lucide-react";
import { zumbaClasses } from "@/data/classes";
import { BookingWindowBanner } from "@/components/Booking/BookingWindowBanner";
import { useBookingWindowOpen } from "@/hooks/useBookingWindowOpen";
import { BOOKING_WINDOW_CLOSED_MESSAGE } from "@/lib/booking-window";

// Adult lineup featured on this page (kids/family routes to One Familia).
const ADULT_SLUGS = [
  "thunderbolt-bodyweight-steppers",
  "zumba-step",
  "groove-stepper",
  "thunderbolt-resistance-dance",
  "piloxing",
];
const lineup = ADULT_SLUGS.map((s) => zumbaClasses.find((c) => c.slug === s)).filter(
  (c): c is (typeof zumbaClasses)[number] => Boolean(c)
);

const formatPrice = (cents: number) => {
  const d = cents / 100;
  return `$${Number.isInteger(d) ? d : d.toFixed(2)}`;
};

export default function StartPage() {
  // Live, admin-editable promo price + availability + payment terms.
  const [promo, setPromo] = useState<{
    indoorPriceCents: number;
    outdoorPriceCents: number;
    live: boolean;
    paymentTerms: "full" | "deposit" | "none";
    depositPercent: number;
  }>({ indoorPriceCents: 2300, outdoorPriceCents: 3500, live: true, paymentTerms: "full", depositPercent: 50 });

  // The whole "booking": pick a venue + your details, then pay.
  const [venue, setVenue] = useState<"studio" | "outdoor">("studio");
  const [form, setForm] = useState({ name: "", phone: "", email: "", preferredNote: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // For "no payment" mode: an inline confirmation instead of a HitPay redirect.
  const [reserved, setReserved] = useState(false);
  const bookingWindowOpen = useBookingWindowOpen();

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
          });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const priceCents = venue === "outdoor" ? promo.outdoorPriceCents : promo.indoorPriceCents;
  // What they pay online now vs. owe at the studio.
  const chargeCents =
    promo.paymentTerms === "none"
      ? 0
      : promo.paymentTerms === "deposit"
        ? Math.max(1, Math.round((priceCents * promo.depositPercent) / 100))
        : priceCents;
  const balanceCents = Math.max(0, priceCents - chargeCents);
  const payOnline = promo.paymentTerms !== "none" && chargeCents > 0;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Please enter your name, phone and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email — your receipt is sent there.");
      return;
    }
    if (!bookingWindowOpen) {
      setError(BOOKING_WINDOW_CLOSED_MESSAGE);
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
          venue,
          preferredNote: form.preferredNote.trim() || undefined,
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

  return (
    <main className="bg-[#f6f4ee] dark:bg-black min-h-screen text-gray-900 dark:text-white">
      {/* ===== Hero ===== */}
      <section className="relative min-h-[82vh] flex items-center overflow-hidden bg-black pt-24">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/images/hero1z.jpg"
            alt="One Step Fitness dance class"
            fill
            className="object-cover opacity-50"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl"
          >
            <div className="text-lime-500 font-black text-xs md:text-sm uppercase tracking-[0.3em] mb-5 flex items-center gap-4">
              <span className="w-10 md:w-16 h-[2px] bg-lime-500" />
              Singapore Dance Fitness
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.82] mb-7">
              DANCE.<br />
              SWEAT.<br />
              <span className="text-lime-500">REPEAT.</span>
            </h1>
            <p className="max-w-xl text-white/85 font-bold text-sm md:text-base uppercase tracking-wider border-l-4 border-lime-500 pl-6 mb-8">
              Singapore&apos;s dance-fitness studio — certified coaches, playlists that move you,
              and a room full of good energy. Come try a class and find your rhythm.
            </p>

            {promo.live && (
              <div className="inline-flex items-center gap-2 bg-lime-500 text-black px-4 py-2 text-[11px] font-black uppercase tracking-widest mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                On now · 1-for-1 · bring a friend, one price
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {promo.live ? (
                <a
                  href="#join"
                  className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-lime-500 text-black font-black uppercase tracking-[0.2em] text-sm hover:bg-white transition-all"
                >
                  Try a class — {formatPrice(promo.indoorPriceCents)}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <a
                  href="#classes"
                  className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-lime-500 text-black font-black uppercase tracking-[0.2em] text-sm hover:bg-white transition-all"
                >
                  See the classes
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 border border-white/30 text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-black transition-all"
              >
                View schedule
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== JOIN: pay first, schedule later ===== */}
      <section id="join" className="py-16 md:py-24 bg-black text-white scroll-mt-20">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Pitch */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-lime-500 font-black text-xs uppercase tracking-[0.3em] mb-4">
                {promo.live ? "Your First Class" : "Booking"}
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.9] mb-6">
                BRING YOUR PERSON.<br />
                <span className="text-lime-500">DANCE TOGETHER.</span>
              </h2>
              <p className="text-white/70 font-medium text-sm md:text-base leading-relaxed mb-8">
                Enjoy a 1-for-1 session with someone you choose — no class to pick, no calendar to decode.
                Book your first visit at one simple price, and we&apos;ll message you personally to find a
                day and time that suits you — as soon as possible.
              </p>
              <ul className="space-y-3">
                {[
                  promo.live ? "1-for-1: you + your person, one price" : "Try any class, your pace",
                  "We reach out to schedule — you just show up",
                  "Straightforward pricing, no surprises",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-lime-500" /> {t}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-xs font-bold uppercase tracking-widest text-white/50">
                Curious about the lineup?{" "}
                <Link href="/classes" className="text-lime-500 hover:underline">Browse all classes</Link>
              </p>
            </motion.div>

            {/* The form (or a closed-promo notice / reserved confirmation) */}
            {promo.live ? (
              reserved ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border border-lime-500/40 bg-zinc-950 p-8 md:p-10 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-lime-500 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-3">You&apos;re on the list!</h3>
                  <p className="text-sm font-medium text-white/60 leading-relaxed max-w-sm">
                    Thanks, {form.name.split(" ")[0] || "there"}. We&apos;ll message you shortly to confirm your
                    class and arrange payment at the studio. No payment needed right now.
                  </p>
                </motion.div>
              ) : (
              <motion.form
                onSubmit={handleJoin}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="border border-white/15 bg-zinc-950 p-6 md:p-8 space-y-6"
              >
                <BookingWindowBanner open={bookingWindowOpen} />
                {/* Venue choice (sets the price) */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Where?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVenue("studio")}
                      className={`p-4 text-left border transition-colors ${
                        venue === "studio" ? "border-lime-500 bg-lime-500/10" : "border-white/15 hover:border-white/40"
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Studio</div>
                      <div className="text-2xl font-black italic tracking-tighter">{formatPrice(promo.indoorPriceCents)}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVenue("outdoor")}
                      className={`p-4 text-left border transition-colors ${
                        venue === "outdoor" ? "border-lime-500 bg-lime-500/10" : "border-white/15 hover:border-white/40"
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                        <MapPin className="w-3 h-3" /> Outdoor
                      </div>
                      <div className="text-2xl font-black italic tracking-tighter">{formatPrice(promo.outdoorPriceCents)}</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Your name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full bg-black border border-white/15 px-5 py-3 text-sm font-bold tracking-wide focus:border-lime-500 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+65"
                      className="w-full bg-black border border-white/15 px-5 py-3 text-sm font-bold tracking-wide focus:border-lime-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Email</label>
                    <input
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@email.com"
                      className="w-full bg-black border border-white/15 px-5 py-3 text-sm font-bold tracking-wide focus:border-lime-500 outline-none transition-colors normal-case"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                    When suits you? <span className="text-zinc-600">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.preferredNote}
                    onChange={(e) => setForm({ ...form, preferredNote: e.target.value })}
                    placeholder="e.g. weekday evenings, Saturday mornings…"
                    className="w-full bg-black border border-white/15 px-5 py-3 text-sm font-bold tracking-wide focus:border-lime-500 outline-none transition-colors"
                  />
                </div>

                {error && (
                  <div role="alert" className="p-3 border border-red-500/60 bg-red-950/40 text-red-200 text-xs font-bold uppercase tracking-wide">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing || !bookingWindowOpen}
                  className="w-full py-5 bg-lime-500 text-black font-black uppercase tracking-[0.2em] text-sm hover:bg-white transition-all disabled:opacity-40 flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : !bookingWindowOpen ? (
                    <>Booking closed</>
                  ) : (
                    <>
                      {!payOnline
                        ? "Book my first class"
                        : promo.paymentTerms === "deposit"
                          ? `Book with ${formatPrice(chargeCents)} deposit`
                          : `Book for ${formatPrice(chargeCents)}`}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">
                  {!payOnline
                    ? "No payment now · pay at the studio · we'll message you to schedule"
                    : promo.paymentTerms === "deposit" && balanceCents > 0
                      ? `${formatPrice(chargeCents)} now via HitPay · ${formatPrice(balanceCents)} at the studio`
                      : "Checkout via HitPay · we'll message you to find a time"}{" "}
                  · <Link href="/terms" className="text-lime-500 hover:underline">Terms</Link>
                </p>
              </motion.form>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="border border-white/15 bg-zinc-950 p-8 md:p-10 flex flex-col items-center text-center"
              >
                <Sparkles className="w-8 h-8 text-lime-500 mb-5" />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-3">Our offer is taking a break</h3>
                <p className="text-sm font-medium text-white/60 leading-relaxed mb-8 max-w-sm">
                  The current promo is closed for now, but you can still explore our classes and book a
                  spot. New offers drop regularly — check back soon.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <Link href="/classes" className="flex-1 py-4 bg-lime-500 text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition-all">
                    Browse classes
                  </Link>
                  <Link href="/contact" className="flex-1 py-4 border border-white/30 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-black transition-all">
                    Contact us
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Classes ===== */}
      <section id="classes" className="py-16 md:py-24 scroll-mt-20">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mb-14"
          >
            <div className="text-lime-600 dark:text-lime-400 font-black text-xs uppercase tracking-[0.3em] mb-4">
              The Classes
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.9] mb-6">
              PICK YOUR <span className="text-lime-500">VIBE</span>
            </h2>
            <p className="text-gray-600 dark:text-zinc-400 font-medium text-sm md:text-base leading-relaxed">
              Every class is a 60-minute dance-fitness session — some lean cardio, some lean strength,
              all of them fun. Tap any class to see the details, or join above and we&apos;ll help you choose.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {lineup.map((cls, i) => (
              <motion.div
                key={cls.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08, duration: 0.35 }}
              >
                <Link
                  href={`/classes/${cls.slug}`}
                  className="group border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col h-full hover:border-lime-500 transition-colors"
                >
                  <div className="relative h-32 sm:h-52 overflow-hidden">
                    <Image
                      src={cls.image}
                      alt={cls.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute top-0 left-0 bg-lime-500 text-black px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                      {cls.intensity}
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    <h3 className="text-base sm:text-xl font-black uppercase italic tracking-tighter mb-2 leading-none">{cls.name}</h3>
                    <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3 sm:mb-4">
                      <span>{cls.duration}</span>
                      <span>•</span>
                      <span>{cls.calories} cal</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-400 leading-relaxed flex-1 line-clamp-4 sm:line-clamp-none">
                      {cls.shortDescription}
                    </p>
                    <span className="mt-4 sm:mt-5 inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 group-hover:gap-3 transition-all">
                      View class <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Kids & family routes to its own page */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
            >
              <Link
                href="/zumfamilia"
                className="group border border-dashed border-black/20 dark:border-white/20 bg-transparent flex flex-col h-full items-center justify-center text-center p-5 sm:p-8 hover:border-lime-500 transition-colors min-h-full"
              >
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-lime-500 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-xl font-black uppercase italic tracking-tighter mb-2">Kids &amp; Family?</h3>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-400 leading-relaxed mb-4 sm:mb-5">
                  Bring the little ones to One Familia — our family dance sessions.
                </p>
                <span className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 group-hover:gap-3 transition-all">
                  Explore One Familia <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Why us ===== */}
      <section className="py-16 md:py-24 border-b border-black/10 dark:border-white/10">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "All Levels Welcome", text: "Never danced before? Perfect. Our coaches give modifications so everyone moves at their own pace." },
              { icon: Sparkles, title: "Certified Coaches", text: "Led by certified instructors with playlists spanning Afrobeats, EDM, Latin, K-Pop and more." },
              { icon: Users, title: "Better With a Friend", text: "Our 1-for-1 sessions are built for two — bring your partner, mate, or favourite dance buddy and enjoy a full class together, one price." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.35 }}
                className="border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-8"
              >
                <div className="w-12 h-12 bg-lime-500 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tight mb-3">{item.title}</h3>
                <p className="text-sm font-medium text-gray-600 dark:text-zinc-400 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="py-16 md:py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-center mb-14">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", text: "Book your first 1-for-1 session — quick and easy" },
              { step: "02", text: "We message you to find a time that works" },
              { step: "03", text: "Show up together and dance" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-black dark:bg-white text-lime-500 dark:text-black flex items-center justify-center font-black text-xl italic mb-4">
                  {s.step}
                </div>
                <p className="text-xs font-black uppercase tracking-widest leading-relaxed max-w-48">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="bg-lime-500 py-16 md:py-24 text-black text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/4 h-full bg-black/5 -skew-x-12 -translate-x-1/4" />
        <div className="container relative z-10 px-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-8">
            READY TO <br />
            <span className="bg-black text-lime-500 px-4 py-1 inline-block">START?</span>
          </h2>
          <a
            href={promo.live ? "#join" : "#classes"}
            className="inline-flex items-center gap-3 px-12 py-6 bg-black text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-zinc-900 transition-all shadow-2xl"
          >
            {promo.live ? "Try a class now" : "See the classes"}
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="mt-6 text-[11px] font-black uppercase tracking-widest text-black/60">
            Book first · we sort the schedule together · all levels welcome
          </p>
        </div>
      </section>
    </main>
  );
}
