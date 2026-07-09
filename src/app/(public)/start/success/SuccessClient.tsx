"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Check, Clock, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { formatDate, formatTime } from "@/lib/utils";
import { getTrialBookingDisplayTitle } from "@/lib/trial-booking-display";

type SelectedClass = {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  instructor_name: string | null;
};

type PaymentStatus = {
  loading: boolean;
  isPaid: boolean;
  isQuickTrial: boolean;
  selectedClass: SelectedClass | null;
};

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const [status, setStatus] = useState<PaymentStatus>({
    loading: !!paymentId,
    isPaid: false,
    isQuickTrial: false,
    selectedClass: null,
  });

  useEffect(() => {
    if (!paymentId) {
      setStatus({ loading: false, isPaid: false, isQuickTrial: false, selectedClass: null });
      return;
    }

    let active = true;
    fetch(`/api/start/payment-status?payment_id=${encodeURIComponent(paymentId)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((res) => {
        if (!active) return;
        if (!res?.success) {
          setStatus({ loading: false, isPaid: false, isQuickTrial: false, selectedClass: null });
          return;
        }
        setStatus({
          loading: false,
          isPaid: res.data?.isPaid === true,
          isQuickTrial: res.data?.isQuickTrial === true,
          selectedClass: res.data?.selectedClass ?? null,
        });
      })
      .catch(() => {
        if (!active) return;
        setStatus({ loading: false, isPaid: false, isQuickTrial: false, selectedClass: null });
      });

    return () => {
      active = false;
    };
  }, [paymentId]);

  const hasSelectedClass = !!status.selectedClass;
  const showPickClassCta = !!paymentId && !hasSelectedClass && !status.loading;
  const awaitingPaymentConfirm =
    !!paymentId && !status.loading && !status.isPaid && !hasSelectedClass;

  return (
    <main className="flex min-h-screen flex-col bg-[#f6f4ee] text-gray-900">
      <header className="border-b border-black/10 bg-[#f6f4ee]/95 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/explore"
            className="relative block h-9 w-24 shrink-0 sm:h-11 sm:w-32"
            aria-label="One Step Fitness home"
          >
            <Image
              src="/logo/One step fitness logo.png"
              alt="One Step Fitness"
              fill
              className="object-contain object-left"
              sizes="96px"
              priority
            />
          </Link>
          <Link
            href="/explore"
            className="text-[11px] font-black uppercase tracking-widest text-gray-600 transition-colors hover:text-black sm:text-xs"
          >
            Visit site
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl text-center"
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center bg-lime-500">
            <Check className="h-10 w-10 text-black" />
          </div>

          <div className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-lime-600">
            You&apos;re In
          </div>
          <h1 className="mb-6 text-4xl font-black uppercase italic leading-[0.9] tracking-tighter sm:text-5xl">
            YOU&apos;RE <span className="text-lime-500">ALL SET!</span>
          </h1>

          {hasSelectedClass && status.selectedClass ? (
            <p className="mb-8 text-sm font-medium leading-relaxed text-gray-600 md:text-base">
              Your trial class is booked. Our team will message you soon to confirm — keep an eye on your
              phone and email.
            </p>
          ) : showPickClassCta ? (
            <p className="mb-8 text-sm font-medium leading-relaxed text-gray-600 md:text-base">
              Payment received. Pick a class now, or we&apos;ll message you to schedule. Keep an eye on your
              phone and email.
            </p>
          ) : awaitingPaymentConfirm ? (
            <p className="mb-8 text-sm font-medium leading-relaxed text-gray-600 md:text-base">
              We&apos;re confirming your payment. This usually takes a moment — refresh shortly or we&apos;ll
              message you to schedule your class.
            </p>
          ) : (
            <p className="mb-8 text-sm font-medium leading-relaxed text-gray-600 md:text-base">
              Lovely, you&apos;re booked. Our team will message you as soon as possible to confirm your class.
              Keep an eye on your phone and email.
            </p>
          )}

          {hasSelectedClass && status.selectedClass && (
            <div className="mb-8 border border-lime-600/30 bg-white p-6 text-left">
              <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-lime-700">
                Your trial class
              </p>
              <p className="text-xl font-black uppercase italic tracking-tighter text-gray-900">
                {getTrialBookingDisplayTitle(status.selectedClass.title)}
              </p>
              <div className="mt-4 space-y-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-lime-600" />
                  {formatDate(status.selectedClass.scheduled_at)} · {formatTime(status.selectedClass.scheduled_at)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-lime-600" />
                  {status.selectedClass.duration_minutes} min
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-lime-600" />
                  {status.selectedClass.location || "Studio"}
                </p>
                {status.selectedClass.instructor_name && (
                  <p className="normal-case tracking-normal text-gray-600">
                    with {status.selectedClass.instructor_name}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mb-10 border border-black/10 bg-white p-6 text-left">
            <div className="flex items-start gap-4">
              <MessageCircle className="mt-0.5 h-6 w-6 shrink-0 text-lime-500" />
              <div>
                <div className="mb-1 text-sm font-black uppercase tracking-widest">What happens next</div>
                <p className="text-xs font-medium leading-relaxed text-gray-600">
                  {hasSelectedClass
                    ? "We'll reach out on WhatsApp or phone to confirm your class. A receipt has also been emailed to you."
                    : showPickClassCta
                      ? "We'll reach out on WhatsApp or phone to confirm your class — or pick one now below. A receipt has been emailed to you."
                      : "We'll reach out on WhatsApp or phone to confirm your class. A receipt has been emailed to you."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            {status.loading && paymentId ? (
              <div className="h-14 w-56 animate-pulse bg-black/10" />
            ) : (
              showPickClassCta && (
                <Link
                  href={`/start/pick-class?payment_id=${encodeURIComponent(paymentId)}`}
                  className="inline-flex items-center gap-3 bg-lime-500 px-10 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-black hover:text-white"
                >
                  Pick a trial class now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )
            )}
            <Link
              href="/explore"
              className={`inline-flex items-center gap-3 px-10 py-4 text-sm font-black uppercase tracking-[0.2em] transition-all ${
                showPickClassCta
                  ? "bg-black text-white hover:bg-lime-500 hover:text-black"
                  : "bg-lime-500 text-black hover:bg-black hover:text-white"
              }`}
            >
              Back to home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
