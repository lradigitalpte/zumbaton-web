"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Facebook, Instagram, Youtube, ArrowRight, MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    classes: [
      { name: "Groove Stepper", href: "/classes/groove-stepper" },
      { name: "Zumba Step", href: "/classes/zumbaton" },
      { name: "Lil Steppers", href: "/classes/lil-steppers" },
      { name: "ThunderBolt", href: "/classes/thunderbolt-full-body-workout" },
      { name: "View Schedule", href: "/schedule" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Instructors", href: "/instructors" },
      { name: "Kids & Family", href: "/zumfamilia" },
      { name: "Outdoor Classes", href: "/zt-fiesta" },
    ],
    support: [
      { name: "FAQ", href: "/faq" },
      { name: "Contact Us", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  const socialLinks = [
    { name: "Facebook", href: "https://www.facebook.com/zumbaton", icon: Facebook },
    { name: "Instagram", href: "https://www.instagram.com/zumbatonsg", icon: Instagram },
    { name: "YouTube", href: "https://youtube.com", icon: Youtube },
  ];

  return (
    <footer className="relative bg-black overflow-hidden pt-20 border-t border-white/10">
      {/* High-Impact Background Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-lime-500/5 -skew-x-12 -z-10 pointer-events-none"></div>

      <div className="container px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 pb-20 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <Link href="/explore" className="inline-block mb-10 group">
              <div className="relative">
                <Image
                  src="/logo/One step fitness logo.png"
                  alt="One Step Fitness Logo"
                  width={280}
                  height={90}
                  className="h-16 sm:h-20 w-auto object-contain brightness-110"
                />
                <div className="absolute -bottom-2 left-0 w-0 h-1 bg-lime-500 transition-all duration-500 group-hover:w-full"></div>
              </div>
            </Link>
            
            <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white mb-6 leading-none">
              ONE STEP TO <br />
              <span className="text-lime-500">CHANGE YOUR LIFE</span>
            </h3>
            
            <p className="text-lg font-medium uppercase tracking-tight text-zinc-400 max-w-md mb-10">
              Experience the joy of dance fitness. Book classes, track your progress, and 
              connect with our vibrant community.
            </p>

            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 border border-white/10 flex items-center justify-center text-white hover:bg-lime-500 hover:text-black hover:border-lime-500 transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900 p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 -skew-x-12 -z-10 transition-all group-hover:bg-lime-500/10"></div>
              
              <div className="text-lime-500 font-black text-xs uppercase tracking-[0.3em] mb-4">
                Stay Updated
              </div>
              <h4 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-8">
                JOIN OUR <span className="text-lime-500">NEWSLETTER</span>
              </h4>
              
              <form className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="YOUR EMAIL ADDRESS"
                  className="flex-1 bg-black border border-white/10 px-6 py-4 text-white font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors rounded-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-lime-500 text-black px-10 py-4 font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-300 shadow-xl flex items-center justify-center gap-3"
                >
                  SUBSCRIBE
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
              <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-20">
          <div>
            <h5 className="text-lime-500 font-black text-xs uppercase tracking-[0.3em] mb-8">Classes</h5>
            <ul className="space-y-4">
              {footerLinks.classes.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="text-lime-500 font-black text-xs uppercase tracking-[0.3em] mb-8">Company</h5>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-lime-500 font-black text-xs uppercase tracking-[0.3em] mb-8">Support</h5>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h5 className="text-lime-500 font-black text-xs uppercase tracking-[0.3em] mb-8">Contact</h5>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-lime-500 shrink-0 mt-1" />
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 leading-relaxed">
                  2 JALAN KLAPA, #2-A, <br /> SINGAPORE 199314
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-lime-500 shrink-0" />
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">+65 8492 7347</p>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-lime-500 shrink-0" />
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">HELLO@ONESTEPFITNESS.SG</p>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-lime-500 shrink-0" />
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">9AM - 9PM DAILY</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="py-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
            © {currentYear} ONE STEP FITNESS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-8">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
              DESIGNED BY <span className="text-white">LRA DIGITAL</span>
            </p>
            <Link href="/trial-booking" className="text-xs font-black uppercase tracking-widest text-lime-500 hover:text-white transition-colors">
              JOIN THE TRIBE
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
