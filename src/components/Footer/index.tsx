"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Phone, Mail, Clock } from "lucide-react";
import { SOCIAL_LINKS } from "@/constants/social-links";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    classes: [
      { name: "Groove Stepper", href: "/classes/groove-stepper" },
      { name: "Zumba Step", href: "/classes/zumba-step" },
      { name: "Lil Steppers", href: "/classes/lil-steppers" },
      { name: "Thunderbolt", href: "/classes#thunderbolt-series" },
      { name: "View Schedule", href: "/schedule" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Blog", href: "/blog" },
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

  return (
    <footer className="relative overflow-x-clip border-t border-white/10 bg-black pt-20">
      {/* Background accent — clipped so skew never causes horizontal scroll */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-[8%] top-0 h-full w-[38%] max-w-[min(420px,45vw)] bg-lime-500/5 -skew-x-12" />
      </div>

      <div className="container relative z-10 mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 pb-20 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="min-w-0 lg:col-span-5">
            <Link href="/explore" className="group mb-8 inline-block max-w-full">
              <div className="relative max-w-[200px] sm:max-w-[220px]">
                <Image
                  src="/logo/One step fitness logo.png"
                  alt="One Step Fitness Logo"
                  width={200}
                  height={66}
                  className="h-auto w-full object-contain object-left brightness-110"
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
              {SOCIAL_LINKS.map((social) => (
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
          <div className="min-w-0 lg:col-span-7">
            <div className="group relative overflow-hidden bg-zinc-900 p-8 md:p-12">
              <div
                className="pointer-events-none absolute -right-4 top-0 z-0 h-32 w-32 overflow-hidden"
                aria-hidden
              >
                <div className="absolute inset-0 bg-lime-500/5 -skew-x-12 transition-all group-hover:bg-lime-500/10" />
              </div>
              
              <div className="relative z-10 text-lime-500 font-black text-xs uppercase tracking-[0.3em] mb-4">
                Stay Updated
              </div>
              <h4 className="relative z-10 text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-8">
                JOIN OUR <span className="text-lime-500">NEWSLETTER</span>
              </h4>
              
              <form className="relative z-10 flex min-w-0 flex-col gap-4 sm:flex-row">
                <input
                  type="email"
                  placeholder="YOUR EMAIL ADDRESS"
                  className="min-w-0 flex-1 rounded-none border border-white/10 bg-black px-4 py-4 font-bold uppercase tracking-widest text-white outline-none transition-colors focus:border-lime-500 sm:px-6"
                  required
                />
                <button
                  type="submit"
                  className="flex shrink-0 items-center justify-center gap-3 bg-lime-500 px-6 py-4 font-black uppercase tracking-[0.2em] text-black shadow-xl transition-all duration-300 hover:bg-white sm:px-10"
                >
                  SUBSCRIBE
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
              <p className="relative z-10 mt-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-20 md:grid-cols-4 md:gap-12">
          <div className="min-w-0">
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

          <div className="min-w-0">
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

          <div className="min-w-0">
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

          <div className="col-span-2 min-w-0 md:col-span-1">
            <h5 className="text-lime-500 font-black text-xs uppercase tracking-[0.3em] mb-8">Contact</h5>
            <div className="space-y-6">
              <div className="flex min-w-0 items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-lime-500" />
                <p className="min-w-0 text-xs font-black uppercase leading-relaxed tracking-widest text-zinc-400 break-words">
                  2 JALAN KLAPA, #2-A, <br /> SINGAPORE 199314
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-lime-500" />
                <p className="min-w-0 text-xs font-black uppercase tracking-widest text-zinc-400 break-all sm:break-normal">
                  +65 8492 7347
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-lime-500" />
                <p className="min-w-0 text-xs font-black uppercase tracking-widest text-zinc-400 break-all">
                  HELLO@ONESTEPFITNESS.SG
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-lime-500" />
                <p className="min-w-0 text-xs font-black uppercase tracking-widest text-zinc-400">8AM - 9PM DAILY</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="flex flex-col flex-wrap items-center gap-6 border-t border-white/10 py-10 sm:flex-row sm:justify-between">
          <p className="min-w-0 text-center text-xs font-black uppercase tracking-widest text-zinc-500 sm:text-left">
            © {currentYear} ONE STEP FITNESS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-6 sm:gap-8">
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
