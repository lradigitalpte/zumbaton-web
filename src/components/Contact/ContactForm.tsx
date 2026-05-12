"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Send, Phone, Mail, Clock, Facebook, Instagram, Youtube, ArrowRight } from "lucide-react";
import LoadingIcon from "@/components/Common/LoadingIcon";

const ContactForm = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send message');
      }

      setIsSubmitting(false);
      setSubmitted(true);
      e.currentTarget.reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setIsSubmitting(false);
      alert(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-[#f6f4ee] dark:bg-black overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Content - 5 Columns */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="text-lime-600 dark:text-lime-400 font-black text-sm md:text-base uppercase tracking-[0.3em] mb-6">
              Get In Touch
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-8">
              WE&apos;D LOVE TO <br />
              <span className="text-lime-500 underline decoration-4 underline-offset-8">HEAR FROM YOU</span>
            </h2>
            <p className="text-lg md:text-xl font-medium uppercase tracking-tight text-gray-600 dark:text-zinc-400 mb-12">
              Have questions about our classes, packages, or anything else? 
              Fill out the form and our team will get back to you within 24 hours.
            </p>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 gap-4 mb-12">
              {[
                { icon: Phone, label: "Call Us", value: "+65 8492 7347", href: "tel:+6584927347" },
                { icon: Mail, label: "Email Us", value: "hello@onestepfitness.sg", href: "mailto:hello@onestepfitness.sg" },
                { icon: Clock, label: "Business Hours", value: "Mon - Sun: 9AM - 9PM" }
              ].map((info, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-6 flex items-center gap-6 group hover:border-lime-500 transition-colors duration-300">
                  <div className="w-12 h-12 bg-black dark:bg-zinc-800 flex items-center justify-center text-lime-500 group-hover:bg-lime-500 group-hover:text-black transition-colors duration-300">
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{info.label}</h4>
                    {info.href ? (
                      <a href={info.href} className="text-base font-black uppercase italic tracking-tighter text-gray-900 dark:text-white hover:text-lime-500 transition-colors">
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-base font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
                        {info.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Follow Us</span>
              <div className="flex gap-4">
                {[Facebook, Instagram, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-900 dark:text-white hover:bg-lime-500 hover:text-black hover:border-lime-500 transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form - 7 Columns */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <form 
              onSubmit={handleSubmit}
              className="bg-white dark:bg-zinc-900 p-8 md:p-12 border border-black/10 dark:border-white/10 shadow-2xl relative"
            >
              {/* Form Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 -skew-x-12 -z-10"></div>
              
              {submitted ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-lime-500 flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <Send className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white mb-4">Message Sent!</h3>
                  <p className="text-lg font-medium uppercase tracking-tight text-gray-600 dark:text-zinc-400">Thank you for reaching out. We&apos;ll get back to you soon.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Full Name <span className="text-lime-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold focus:border-lime-500 outline-none transition-colors rounded-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Email Address <span className="text-lime-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold focus:border-lime-500 outline-none transition-colors rounded-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold focus:border-lime-500 outline-none transition-colors rounded-none"
                        placeholder="+65 8492 7347"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Subject <span className="text-lime-500">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold focus:border-lime-500 outline-none transition-colors rounded-none appearance-none"
                      >
                        <option value="">Select a subject</option>
                        <option value="packages">Package Inquiry</option>
                        <option value="classes">Class Information</option>
                        <option value="pricing">Pricing & Plans</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Message <span className="text-lime-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      className="w-full bg-zinc-50 dark:bg-black border border-black/10 dark:border-white/10 px-6 py-4 text-gray-900 dark:text-white font-bold focus:border-lime-500 outline-none transition-colors rounded-none resize-none"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 bg-lime-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-xl disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {isSubmitting ? (
                      <LoadingIcon size="sm" className="!flex-row gap-2 !mt-0" />
                    ) : (
                      <>
                        SEND MESSAGE
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
      
      {/* Background Accent */}
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-lime-500/5 skew-x-12 -z-10 pointer-events-none"></div>
    </section>
  );
};

export default ContactForm;
