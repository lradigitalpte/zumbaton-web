"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, MessageCircle, ArrowRight } from "lucide-react";

export default function StartSuccessPage() {
  return (
    <main className="bg-[#f6f4ee] dark:bg-black min-h-screen text-gray-900 dark:text-white flex items-center justify-center px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full text-center"
      >
        <div className="w-20 h-20 bg-lime-500 flex items-center justify-center mx-auto mb-8">
          <Check className="w-10 h-10 text-black" />
        </div>

        <div className="text-lime-600 dark:text-lime-400 font-black text-xs uppercase tracking-[0.3em] mb-4">
          You&apos;re In
        </div>
        <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-[0.9] mb-6">
          PAYMENT <span className="text-lime-500">DONE!</span>
        </h1>
        <p className="text-gray-600 dark:text-zinc-400 font-medium text-sm md:text-base leading-relaxed mb-10">
          That&apos;s the hard part over. Our team will message you shortly — usually within 24 hours —
          to lock in a day and time for your 1-for-1 class. Keep an eye on your phone and email.
        </p>

        <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 mb-10 text-left">
          <div className="flex items-start gap-4">
            <MessageCircle className="w-6 h-6 text-lime-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-black uppercase tracking-widest text-sm mb-1">What happens next</div>
              <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 leading-relaxed">
                We&apos;ll reach out on WhatsApp/phone to schedule you and your friend. A payment receipt
                has also been emailed to you. No further action needed right now.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-3 px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-sm hover:bg-lime-500 hover:text-black transition-all"
        >
          Back to home
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </main>
  );
}
