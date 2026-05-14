"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, MapPin, ShieldCheck, Zap, X, Calendar, Clock, Check } from "lucide-react";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";
import { highlightCoachInText } from "@/lib/highlightCoachInText";
import { useToast } from "@/components/Toast";
import LoadingIcon from "@/components/Common/LoadingIcon";
import { formatDate, formatTime } from "@/lib/utils";

import WaiverForm from "@/components/Common/WaiverForm";
import { dateOfBirthFromAge, parseAgeYearsInput } from "@/lib/user-age-utils";

interface Class {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  room_name: string | null;
  room_type?: string;
  capacity: number;
  booked_count: number;
}

const PromosPage = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const toast = useToast();
  const sectionRef = useRef(null);

  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [formData, setFormData] = useState({
    classId: "",
    p1: { 
      name: "", phone: "", age: "", gender: "prefer_not_to_say",
      waiverAgreed: false, nricLast4: "", signature: ""
    },
    p2: { 
      name: "", phone: "", age: "", gender: "prefer_not_to_say",
      waiverAgreed: false, nricLast4: "", signature: ""
    },
  });

  const promos = [
    {
      id: "indoor-duo",
      title: "Studio Duo Trial",
      price: "$23",
      priceCents: 2300,
      tagline: "1-for-1 Special",
      description: "Perfect for a high-energy studio session. Valid for Zumba Step, Groove Stepper, or Thunderbolt.",
      location: "Studio Sessions",
      roomType: "studio",
      features: ["Two participants", "One price", "Full 60-min session", "Expert coaching"],
      accent: "border-lime-500",
      bg: "bg-white dark:bg-zinc-950",
    },
    {
      id: "outdoor-duo",
      title: "Outdoor Duo Trial",
      price: "$35",
      priceCents: 3500,
      tagline: "1-for-1 Special",
      description: "Fresh air, big energy. Join us at our signature outdoor location for a dual workout.",
      location: "OCBC Arena, Kallang",
      roomType: "outdoor",
      features: ["Two participants", "One price", "Fresh air vibes", "Community energy"],
      accent: "border-lime-400",
      bg: "bg-lime-500 text-black",
      isPremium: true,
    }
  ];

  const fetchClasses = async (date: string) => {
    setLoadingClasses(true);
    try {
      const response = await fetch(`/api/classes/public?date=${date}`);
      const result = await response.json();
      if (result.success) {
        setClasses(result.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchClasses(selectedDate);
    }
  }, [selectedDate, isModalOpen]);

  const handleBookClick = (promo: any) => {
    setSelectedPromo(promo);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId) {
      toast.error("Please select a class");
      return;
    }
    
    // Basic validation
    if (!formData.p1.name || !formData.p1.phone ||
        !formData.p2.name || !formData.p2.phone) {
      toast.error("Please fill in all participant details");
      return;
    }

    const age1 = parseAgeYearsInput(formData.p1.age);
    const age2 = parseAgeYearsInput(formData.p2.age);
    if (age1 == null || age2 == null) {
      toast.error("Please enter a valid age (1–120) for both participants");
      return;
    }

    const dob1 = dateOfBirthFromAge(age1);
    const dob2 = dateOfBirthFromAge(age2);
    if (!dob1 || !dob2) {
      toast.error("Could not process age. Please try again.");
      return;
    }

    // Waiver validation
    if (!formData.p1.waiverAgreed || !formData.p1.nricLast4 || !formData.p1.signature) {
      toast.error("You must agree to the waiver and provide NRIC/Signature");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/promos/duo-trial/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: formData.classId,
          promoId: selectedPromo.id,
          participant1: {
            name: formData.p1.name,
            phone: formData.p1.phone,
            dateOfBirth: dob1,
            gender: formData.p1.gender,
            nricLast4: formData.p1.nricLast4,
            signature: formData.p1.signature,
          },
          participant2: {
            name: formData.p2.name,
            phone: formData.p2.phone,
            dateOfBirth: dob2,
            gender: formData.p2.gender,
            nricLast4: formData.p2.nricLast4,
            signature: formData.p2.signature,
          },
        }),
      });

      const result = await response.json();
      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        throw new Error(result.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setProcessing(false);
    }
  };

  const filteredClasses = classes.filter(c => {
    const roomType = (c as any).rooms?.room_type || (c as any).room_type;
    return roomType === selectedPromo?.roomType;
  });

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
            sizes="100vw"
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
                  onClick={() => handleBookClick(promo)}
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
            * Duo trials are processed securely online. <br className="hidden sm:block" /> Select your session and provide details for both participants to proceed.
          </motion.p>


          {/* Booking Info */}
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter mb-8">How to Book</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { step: "01", text: "Choose your format (Studio or Outdoor)" },
                { step: "02", text: "Choose your preferred date" },
                { step: "03", text: "Select an available session & pay" }
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

      {/* Duo Trial Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
              onClick={() => setIsModalOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-7xl max-h-[90vh] bg-[#f6f4ee] dark:bg-zinc-950 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-black">
                <div>
                  <div className="text-lime-600 dark:text-lime-400 font-black text-[10px] uppercase tracking-[0.3em] mb-1">
                    Duo Trial Booking
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
                    {selectedPromo?.title} · <span className="text-lime-500">{selectedPromo?.price}</span>
                  </h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-12 h-12 border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-12">
                  
                  {/* Step 0: Date Selection */}
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-black text-lime-500 flex items-center justify-center font-black text-lg italic">01</div>
                      <h3 className="text-xl font-black uppercase italic tracking-tight">Choose a Date</h3>
                    </div>
                    <div className="max-w-xs">
                      <label htmlFor="promoDate" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                        Select Date
                      </label>
                      <input
                        type="date"
                        id="promoDate"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Step 1: Class Selection */}
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-black text-lime-500 flex items-center justify-center font-black text-lg italic">02</div>
                      <h3 className="text-xl font-black uppercase italic tracking-tight">Select Your Session</h3>
                    </div>

                    {loadingClasses ? (
                      <div className="py-12 flex justify-center">
                        <LoadingIcon size="md" showLabel />
                      </div>
                    ) : filteredClasses.length === 0 ? (
                      <div className="p-10 border-2 border-dashed border-black/10 dark:border-white/10 text-center">
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mb-2">No {selectedPromo?.roomType} classes available on this date.</p>
                        <p className="text-zinc-400 text-xs uppercase tracking-widest">Please try selecting another date above.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredClasses.map((cls) => {
                          const isSelected = formData.classId === cls.id;
                          const isFull = cls.booked_count + 1 >= cls.capacity;
                          
                          return (
                            <div 
                              key={cls.id}
                              onClick={() => !isFull && setFormData({ ...formData, classId: cls.id })}
                              className={`p-6 border-2 cursor-pointer transition-all relative overflow-hidden ${
                                isSelected 
                                  ? "border-lime-500 bg-white dark:bg-zinc-900 shadow-lg" 
                                  : isFull 
                                    ? "opacity-50 grayscale cursor-not-allowed border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900/30"
                                    : "border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 hover:border-lime-500/50"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-0 right-0 bg-lime-500 text-black px-3 py-1 text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                                  <Check className="w-3 h-3" /> SELECTED
                                </div>
                              )}
                              {isFull && (
                                <div className="absolute top-0 right-0 bg-zinc-500 text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                                  FULLY BOOKED
                                </div>
                              )}
                              <div className="text-lime-600 dark:text-lime-400 font-black text-[10px] uppercase tracking-widest mb-2">
                                {formatTime(cls.scheduled_at)} • {cls.duration_minutes} MIN
                              </div>
                              <h4 className="text-lg font-black uppercase italic tracking-tighter mb-2">{cls.title}</h4>
                              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-60">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(cls.scheduled_at)}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {cls.location || cls.room_name || "Main Studio"}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Participant Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Person 1 */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-black text-lime-500 flex items-center justify-center font-black text-lg italic">03</div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Participant 1 (Main)</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.p1.name}
                            onChange={(e) => setFormData({ ...formData, p1: { ...formData.p1, name: e.target.value } })}
                            className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors"
                            placeholder="NAME"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone *</label>
                            <input
                              type="tel"
                              required
                              value={formData.p1.phone}
                              onChange={(e) => setFormData({ ...formData, p1: { ...formData.p1, phone: e.target.value } })}
                              className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors"
                              placeholder="+65"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Age *</label>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={120}
                              step={1}
                              required
                              value={formData.p1.age}
                              onChange={(e) => setFormData({ ...formData, p1: { ...formData.p1, age: e.target.value } })}
                              className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors"
                              placeholder="YEARS"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Gender *</label>
                            <select
                              required
                              value={formData.p1.gender}
                              onChange={(e) => setFormData({ ...formData, p1: { ...formData.p1, gender: e.target.value } })}
                              className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors"
                            >
                              <option value="prefer_not_to_say">Prefer not to say</option>
                              <option value="female">Female</option>
                              <option value="male">Male</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Person 2 */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-black text-lime-500 flex items-center justify-center font-black text-lg italic">04</div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Participant 2</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.p2.name}
                            onChange={(e) => setFormData({ ...formData, p2: { ...formData.p2, name: e.target.value } })}
                            className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors"
                            placeholder="NAME"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone *</label>
                            <input
                              type="tel"
                              required
                              value={formData.p2.phone}
                              onChange={(e) => setFormData({ ...formData, p2: { ...formData.p2, phone: e.target.value } })}
                              className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors"
                              placeholder="+65"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Age *</label>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={120}
                              step={1}
                              required
                              value={formData.p2.age}
                              onChange={(e) => setFormData({ ...formData, p2: { ...formData.p2, age: e.target.value } })}
                              className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors"
                              placeholder="YEARS"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Gender *</label>
                            <select
                              required
                              value={formData.p2.gender}
                              onChange={(e) => setFormData({ ...formData, p2: { ...formData.p2, gender: e.target.value } })}
                              className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors"
                            >
                              <option value="prefer_not_to_say">Prefer not to say</option>
                              <option value="female">Female</option>
                              <option value="male">Male</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Liability waiver (last step before payment; payer signs for the duo) */}
                  <div className="w-full border-t border-black/10 dark:border-white/10 pt-12">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black text-lime-500 flex items-center justify-center font-black text-lg italic shrink-0">
                          05
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white">
                            Liability Waiver
                          </h3>
                          <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 max-w-3xl leading-relaxed">
                            Complete this last. The paying participant (Participant 1) signs on behalf of both people in this duo booking.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full max-w-none">
                      <WaiverForm
                        wide
                        hideTitle
                        participantName={formData.p1.name}
                        onAgreementChange={(agreed, details) =>
                          setFormData({
                            ...formData,
                            p1: {
                              ...formData.p1,
                              waiverAgreed: agreed,
                              nricLast4: details.nricLast4,
                              signature: details.signature,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-10 border-t border-black/10 dark:border-white/10 flex flex-col items-center">
                    <button
                      type="submit"
                      disabled={processing || !formData.classId}
                      className="w-full max-w-2xl py-6 bg-lime-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-xl disabled:opacity-30 flex items-center justify-center gap-4"
                    >
                      {processing ? (
                        <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                      ) : (
                        <>
                          PROCEED TO PAYMENT
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      By proceeding, you agree to our <Link href="/terms" className="text-lime-600 dark:text-lime-400 hover:underline">Terms & Conditions</Link>.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default PromosPage;

