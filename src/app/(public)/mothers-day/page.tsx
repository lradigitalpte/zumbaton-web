"use client";

import { ClassesHero, ClassesCTA } from "@/components/Classes";
import {
  CalendarHeart,
  Clock,
  Heart,
  MessageCircle,
  CheckCircle2,
  Gift,
  Phone,
} from "lucide-react";

const WHATSAPP_NUMBER = "6584927347";
const PHONE_DISPLAY = "+65 8492 7347";
const PHONE_TEL = "tel:+6584927347";
const CLASSES = [
  {
    id: "may9",
    date: "Saturday, May 9",
    time: "11:00 AM",
  },
  {
    id: "may10",
    date: "Sunday, May 10",
    time: "5:00 PM",
  },
] as const;

function whatsappHref(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const WA_SLOT = (date: string, time: string) =>
  `Hi! I'm interested in the Mother's Day promo ($30). I'd like to enquire about ${date} at ${time}. Please share payment details.`;

const WA_GENERAL =
  "Hi! I have a question about the Mother's Day promo ($30) for May 9 at 11am or May 10 at 5pm.";

export default function MothersDayPromoPage() {
  return (
    <>
      <ClassesHero
        title="Mother&apos;s Day Promo"
        breadcrumbs={[
          { label: "Home", href: "/explore" },
          { label: "Mother&apos;s Day" },
        ]}
      />

      <section className="relative overflow-hidden bg-white py-16 dark:bg-black md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(132,204,22,0.18),transparent_55%),radial-gradient(ellipse_55%_45%_at_100%_30%,rgba(251,176,64,0.14),transparent_45%)] dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(132,204,22,0.24),transparent_55%),radial-gradient(ellipse_55%_45%_at_100%_30%,rgba(251,176,64,0.18),transparent_45%)]" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-500 to-transparent" aria-hidden />

        <div className="container relative z-10 mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-5 py-2.5 text-sm font-black uppercase tracking-[0.18em] text-lime-700 shadow-[0_0_24px_rgba(132,204,22,0.16)] dark:text-lime-300"
            >
              <Gift className="h-4 w-4 text-yellow-500" />
              Mother&apos;s Day Promo
            </span>
            <h2 className="mt-10 text-4xl font-black uppercase italic tracking-tight text-gray-950 dark:text-white md:text-6xl lg:text-7xl lg:leading-[0.95]">
              A little time{" "}
              <span className="block text-yellow-500">
                for mum
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl border-l-4 border-lime-500 pl-5 text-left text-lg font-semibold leading-relaxed text-gray-700 dark:text-zinc-300 md:text-xl">
              Celebrate Mother&apos;s Day with a personal session made for care,
              confidence, and movement. Choose from the two class timings, reach
              out for enquiries, and we&apos;ll send payment details once your place
              is confirmed.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-lg gap-6 sm:grid-cols-2 sm:max-w-none">
            <div className="rounded-[1.75rem] border-2 border-yellow-400 bg-gray-950 p-8 text-center shadow-[0_24px_70px_-20px_rgba(101,163,13,0.45)] dark:border-lime-500">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-lime-400">
                  Promo price
                </p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="mx-auto text-6xl font-black text-yellow-400">
                    $30
                  </span>
                </p>
                <p className="mt-3 text-center text-sm font-semibold text-zinc-300">
                  Promo rate per session. Payment details are shared after we
                  confirm your booking.
                </p>
            </div>

            <div className="flex flex-col justify-center gap-5 rounded-[1.75rem] border border-gray-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-500 text-black shadow-lg shadow-lime-500/25">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    Thoughtful and personal
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    A focused private session with attention, care, and a pace that
                    feels right for the person attending.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-black shadow-lg shadow-yellow-400/25">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    How to book
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    Contact{" "}
                    <a
                      href={PHONE_TEL}
                      className="font-semibold text-lime-700 underline decoration-lime-500/40 underline-offset-2 hover:text-lime-600 dark:text-lime-400 dark:hover:text-lime-300"
                    >
                      {PHONE_DISPLAY}
                    </a>{" "}
                    on WhatsApp or by phone. We&apos;ll confirm and share the
                    payment steps.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div className="mb-12 flex items-center justify-center gap-4">
              <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent via-lime-500 to-yellow-400 opacity-80" />
              <h3 className="text-center text-2xl font-black uppercase italic text-gray-950 dark:text-white md:text-3xl">
                Pick a class timing
              </h3>
              <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent via-lime-500 to-yellow-400 opacity-80" />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {CLASSES.map((slot) => (
                <div
                  key={slot.id}
                  className="group relative rounded-[2rem] border border-gray-200 bg-white p-8 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-lime-500 hover:shadow-[0_22px_60px_-28px_rgba(132,204,22,0.8)] dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-lime-700 dark:text-lime-400">
                      <CalendarHeart className="h-5 w-5" />
                      <span className="text-sm font-black uppercase tracking-wider">
                        {slot.date}
                      </span>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                      <Clock className="h-8 w-8 shrink-0 text-yellow-500" />
                      <span className="text-3xl font-black text-gray-950 dark:text-white md:text-4xl">
                        {slot.time}
                      </span>
                    </div>
                    <ul className="mt-8 space-y-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-lime-500" />
                        Mother&apos;s Day promo class
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-lime-500" />
                        $30, payment after booking is confirmed
                      </li>
                    </ul>
                    <div className="mt-10">
                      <a
                        href={whatsappHref(WA_SLOT(slot.date, slot.time))}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Enquire on WhatsApp, ${PHONE_DISPLAY}`}
                        className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-lime-500 px-5 py-4 text-sm font-black text-black shadow-lg shadow-lime-500/25 transition hover:bg-yellow-400"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Enquire on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-20 max-w-2xl rounded-[2rem] border-2 border-lime-500 bg-gray-950 px-8 py-12 text-center text-white shadow-[0_28px_80px_-24px_rgba(132,204,22,0.6)]">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                  Questions?
                </p>
                <p className="mt-4 text-lg font-medium text-white/95">
                  Reach us on{" "}
                  <a
                    href={PHONE_TEL}
                    className="font-bold text-yellow-300 underline decoration-yellow-300/50 underline-offset-2 hover:text-yellow-200"
                  >
                    {PHONE_DISPLAY}
                  </a>{" "}
                  by WhatsApp or phone. We&apos;ll reply with availability and how
                  to complete payment.
                </p>
                <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                  <a
                    href={whatsappHref(WA_GENERAL)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Message on WhatsApp, ${PHONE_DISPLAY}`}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-lime-500 px-6 py-4 text-sm font-black text-black transition hover:bg-yellow-400"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Message on WhatsApp
                  </a>
                  <a
                    href={PHONE_TEL}
                    aria-label={`Call ${PHONE_DISPLAY}`}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border-2 border-lime-500/60 bg-transparent px-6 py-4 text-sm font-black text-white transition hover:border-yellow-400 hover:bg-white/5"
                  >
                    <Phone className="h-5 w-5" />
                    Call us
                  </a>
                </div>
          </div>
        </div>
      </section>

      <ClassesCTA />
    </>
  );
}
