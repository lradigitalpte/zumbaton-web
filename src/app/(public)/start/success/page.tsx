"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, MessageCircle, ArrowRight } from "lucide-react";

export default function StartSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f6f4ee] text-gray-900">
      <header className="border-b border-black/10 bg-[#f6f4ee]/95 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/explore" className="relative block h-9 w-24 shrink-0 sm:h-11 sm:w-32" aria-label="One Step Fitness home">
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
          <p className="mb-10 text-sm font-medium leading-relaxed text-gray-600 md:text-base">
            Lovely, you&apos;re booked. Our team will message you as soon as possible
            to confirm your class and find a time that works. Keep an eye on your phone and email.
          </p>

          <div className="mb-10 border border-black/10 bg-white p-6 text-left">
            <div className="flex items-start gap-4">
              <MessageCircle className="mt-0.5 h-6 w-6 shrink-0 text-lime-500" />
              <div>
                <div className="mb-1 text-sm font-black uppercase tracking-widest">What happens next</div>
                <p className="text-xs font-medium leading-relaxed text-gray-600">
                  We&apos;ll reach out on WhatsApp or phone to confirm your class. A receipt
                  has also been emailed to you. No further action needed right now.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-3 bg-black px-10 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-lime-500 hover:text-black"
          >
            Back to home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
