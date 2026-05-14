"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, MapPin, ShieldCheck, Zap } from "lucide-react";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";
import { highlightCoachInText } from "@/lib/highlightCoachInText";

const PromosPage = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const sectionRef = useRef(null);

  const promos = [
    {
      id: "indoor-duo",
      title: "Studio Duo Trial",
      price: "$23",
      tagline: "1-for-1 Special",
      description: "Perfect for a high-energy studio session. Valid for Zumbaton, Groove Stepper, or Thunderbolt.",
      location: "Studio Sessions",
      features: ["Two participants", "One price", "Full 60-min session", "Expert coaching"],
      accent: "border-lime-500",
      bg: "bg-white dark:bg-zinc-950",
    },
    {
      id: "outdoor-duo",
      title: "Outdoor Duo Trial",
      price: "$35",
      tagline: "1-for-1 Special",
      description: "Fresh air, big energy. Join us at our signature outdoor location for a dual workout.",
      location: "OCBC Arena, Kallang",
      features: ["Two participants", "One price", "Fresh air vibes", "Community energy"],
      accent: "border-lime-400",
      bg: "bg-lime-500 text-black",
      isPremium: true,
    }
  ];

  return (
    <main className="bg-[#f6f4ee] dark:bg-black min-h-screen text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center overflow-hidden bg-black pt-24">
        <div className="absolute inset-0 -z-10">
          <Image 
            src="/images/hero/hero2.jpeg"
            alt="One Step Fitness Promos"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <div className="text-lime-500 font-black text-xs md:text-sm uppercase tracking-[0.3em] mb-4 flex items-center gap-4">
              <span className="w-8 md:w-12 h-[2px] bg-lime-500"></span>
              Limited Time Offers
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-6">
              WHAT&apos;S <span className="text-lime-500">NEW</span>
            </h1>
            <p className="max-w-xl text-white/80 font-bold text-sm md:text-base uppercase tracking-wider border-l-4 border-lime-500 pl-6">
              Exclusive 1-for-1 trial specials. Bring a friend, share the energy, and start your journey together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Promo Content */}
      <section className="py-16 md:py-24">
        <div className="container px-4 sm:px-6 lg:px-8">
          
          {/* No Referral Fee Policy */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-20 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-sm"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-lime-500 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-black" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight mb-2">No Hidden Fees. Ever.</h2>
              <p className="text-gray-600 dark:text-zinc-400 font-medium text-sm md:text-base uppercase tracking-tight">
                At One Step Fitness, we believe in transparency. There are <span className="text-lime-600 dark:text-lime-400 font-bold">zero referral fees</span> or hidden registration costs for any of our trial promos. Just pure dance energy.
              </p>
            </div>
          </motion.div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {promos.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col p-8 md:p-12 border-t-8 ${promo.accent} ${promo.bg} shadow-xl`}
              >
                <div className="mb-8">
                  <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${promo.isPremium ? 'bg-black text-lime-500' : 'bg-lime-500 text-black'}`}>
                    {promo.tagline}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">{promo.title}</h3>
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-70 mb-6">
                    <MapPin className="w-4 h-4" />
                    {promo.location}
                  </div>
                  <div className="text-6xl md:text-7xl font-black italic tracking-tighter mb-6">
                    {promo.price}
                    <span className="text-sm font-black uppercase tracking-widest opacity-40 ml-2">/ duo</span>
                  </div>
                  <p className="font-medium text-sm md:text-base leading-relaxed uppercase tracking-tight opacity-80">
                    {promo.description}
                  </p>
                </div>

                <div className="flex-1 space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 mb-4">
                    <ShieldCheck className="w-4 h-4" />
                    Secure Online Payment
                  </div>
                  <ul className="space-y-4">
                    {promo.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                        <Zap className={`w-4 h-4 ${promo.isPremium ? 'text-black' : 'text-lime-500'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={openWhatsAppModal}
                  className={`w-full py-5 text-center font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 ${
                    promo.isPremium 
                      ? 'bg-black text-white hover:bg-zinc-900' 
                      : 'bg-black dark:bg-white text-white dark:text-black hover:bg-lime-500 hover:text-black'
                  }`}
                >
                  <span>Book & Pay Duo Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Online Payment Note */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-24"
          >
            * Duo trials are processed via WhatsApp to ensure both participants are registered. <br className="hidden sm:block" /> Online payment link will be sent once details are confirmed.
          </motion.p>

          {/* Booking Info */}
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter mb-8">How to Book</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { step: "01", text: "Choose your format (Studio or Outdoor)" },
                { step: "02", text: "Click 'Book Duo Trial' to WhatsApp us" },
                { step: "03", text: "Provide details for both participants" }
              ].map((step, sIdx) => (
                <div key={sIdx} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-black text-lime-500 flex items-center justify-center font-black text-xl mb-4">
                    {step.step}
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-lime-500 py-16 md:py-24 text-black text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/4 h-full bg-black/5 -skew-x-12 -translate-x-1/4"></div>
        <div className="container relative z-10 px-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-8">
            READY TO <br />
            <span className="bg-black text-lime-500 px-4 py-1 inline-block">START?</span>
          </h2>
          <button 
            onClick={openWhatsAppModal}
            className="px-12 py-6 bg-black text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-zinc-900 transition-all shadow-2xl"
          >
            WhatsApp Us Now
          </button>
        </div>
      </section>
    </main>
  );
};

export default PromosPage;
