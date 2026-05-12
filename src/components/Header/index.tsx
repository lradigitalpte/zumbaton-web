"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import TickerStrip from "./TickerStrip";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu as MenuIcon, ChevronDown, ArrowRight } from "lucide-react";

const Header = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => setNavbarOpen(!navbarOpen);

  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    setSticky(window.scrollY >= 80);
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => window.removeEventListener("scroll", handleStickyNavbar);
  }, []);

  useEffect(() => {
    document.body.style.overflow = navbarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [navbarOpen]);

  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: number) => setOpenIndex(openIndex === index ? -1 : index);

  const usePathName = usePathname();
  const lightBackgroundPages = ['/signin', '/signup', '/forgot-password', '/schedule', '/packages'];
  const isLightBackgroundPage = lightBackgroundPages.some(path => usePathName?.startsWith(path));
  
  const needsBackground = sticky || isLightBackgroundPage;

  return (
    <>
      <header
        className={`header top-0 left-0 z-50 w-full flex flex-col transition-all duration-500 ${
          needsBackground
            ? "bg-black shadow-2xl fixed z-9999 border-b border-white/10"
            : "absolute bg-transparent"
        }`}
      >
        {!sticky && <TickerStrip />}
        
        <div className="w-full px-3 sm:px-6 lg:px-12">
          <div className="relative flex min-h-[4rem] w-full items-center justify-between gap-2 py-2 sm:h-20 sm:min-h-0 sm:py-0 lg:h-32">
            
            {/* LOGO — larger on small screens; width cap keeps room for actions */}
            <div className="flex min-w-0 flex-1 items-center sm:flex-initial sm:min-w-0">
              <Link href="/explore" className="group flex max-w-[8.75rem] items-center sm:max-w-[11rem] md:max-w-none">
                <div className="relative w-full">
                  <Image
                    src="/logo/One step fitness logo.png"
                    alt="One Step Fitness Logo"
                    width={200}
                    height={66}
                    className={`h-8 w-auto max-h-8 max-w-full object-contain object-left transition-all duration-500 sm:h-10 sm:max-h-none md:h-12 lg:h-16 ${
                      needsBackground ? "brightness-110" : ""
                    }`}
                    priority
                  />
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime-500 transition-all duration-500 group-hover:w-full" />
                </div>
              </Link>
            </div>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden xl:flex flex-1 justify-center items-center">
              <ul className="flex items-center gap-2 xl:gap-4">
                {menuData.map((menuItem, index) => (
                  <li key={index} className="group relative">
                    {menuItem.path ? (
                      <Link
                        href={menuItem.path}
                        className={`px-3 xl:px-4 py-2 text-sm xl:text-base font-black uppercase tracking-wider transition-all duration-300 relative ${
                          usePathName === menuItem.path
                            ? "text-lime-500"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        {menuItem.title}
                        {usePathName === menuItem.path && (
                          <motion.div 
                            layoutId="navUnderline"
                            className="absolute -bottom-1 left-3 xl:left-4 right-3 xl:right-4 h-0.5 bg-lime-500"
                          />
                        )}
                      </Link>
                    ) : (
                      <div className="relative group">
                        <button
                          onClick={() => handleSubmenu(index)}
                          className="flex items-center gap-1.5 px-3 xl:px-4 py-2 text-sm xl:text-base font-black uppercase tracking-wider text-white/70 hover:text-white transition-all duration-300"
                        >
                          {menuItem.title}
                          <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
                        </button>
                        
                        {/* Brutalist Dropdown */}
                        <div className="absolute top-full left-0 mt-2 w-64 bg-black border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                          <div className="p-2 space-y-1">
                            {menuItem.submenu?.map((submenuItem, subIndex) => (
                              <Link
                                href={submenuItem.path}
                                key={subIndex}
                                className="flex items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-lime-500 transition-all duration-300"
                              >
                                {submenuItem.title}
                                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* ACTIONS — Sign In visible below xl (mobile / tablet) */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-6">
              <Link
                href="/signin"
                className="whitespace-nowrap px-1.5 py-1.5 text-[11px] font-black uppercase tracking-wide text-white hover:text-lime-400 sm:px-2.5 sm:text-xs xl:px-4 xl:py-2 xl:text-sm xl:tracking-wider xl:text-white/70 xl:hover:text-lime-500"
              >
                Sign In
              </Link>
              
              <Link
                href="/trial-booking"
                className="bg-lime-500 px-3 py-2 text-center text-[11px] font-black uppercase leading-tight tracking-wide text-black shadow-xl transition-all hover:bg-white sm:px-4 sm:py-2.5 sm:text-xs lg:px-8 lg:py-4 lg:text-sm"
              >
                Join Now
              </Link>

              <div className="hidden sm:block">
                <ThemeToggler />
              </div>
              
              <button
                onClick={navbarToggleHandler}
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 sm:h-11 sm:w-11 xl:hidden"
                aria-label="Toggle Menu"
              >
                {navbarOpen ? <X className="w-5 h-5 text-white" /> : <MenuIcon className="w-5 h-5 text-white" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {navbarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] xl:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={navbarToggleHandler} />
            
            {/* Menu Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-black border-l border-white/10 flex flex-col p-6 sm:p-10"
            >
              <div className="flex items-center justify-between mb-6 sm:mb-10">
                <Image
                  src="/logo/One step fitness logo.png"
                  alt="Logo"
                  width={180}
                  height={58}
                  className="h-8 w-auto max-h-8 max-w-[9.5rem] object-contain object-left sm:h-10 sm:max-h-none sm:max-w-[12rem]"
                />
                <button onClick={navbarToggleHandler} className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center border border-white/10 hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <ul className="space-y-4 sm:space-y-6">
                  {menuData.map((menuItem, index) => (
                    <li key={index}>
                      {menuItem.path ? (
                        <Link
                          href={menuItem.path}
                          className={`block text-2xl sm:text-4xl font-black uppercase italic tracking-tighter transition-colors ${
                            usePathName === menuItem.path ? "text-lime-500" : "text-white hover:text-lime-500"
                          }`}
                          onClick={() => setNavbarOpen(false)}
                        >
                          {menuItem.title}
                        </Link>
                      ) : (
                        <div className="space-y-4">
                          <button
                            onClick={() => handleSubmenu(index)}
                            className="flex items-center justify-between w-full text-2xl sm:text-4xl font-black uppercase italic tracking-tighter text-white"
                          >
                            {menuItem.title}
                            <ChevronDown className={`w-6 h-6 sm:w-8 sm:h-8 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {openIndex === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-4 sm:pl-6 border-l-2 border-lime-500/30 space-y-3 sm:space-y-4"
                              >
                                {menuItem.submenu?.map((sub, idx) => (
                                  <Link
                                    key={idx}
                                    href={sub.path}
                                    className="block text-lg sm:text-xl font-black uppercase italic tracking-tighter text-zinc-500 hover:text-lime-500"
                                    onClick={() => setNavbarOpen(false)}
                                  >
                                    {sub.title}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-8 space-y-3 border-t border-white/10 pt-8 sm:space-y-4">
                <Link
                  href="/signin"
                  className="block border border-white/20 py-3 text-center text-xs font-black uppercase tracking-widest text-white transition-colors hover:border-lime-500 hover:text-lime-400"
                  onClick={() => setNavbarOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/trial-booking"
                  className="block bg-lime-500 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-black shadow-2xl transition-all hover:bg-white active:scale-[0.99] sm:py-5"
                  onClick={() => setNavbarOpen(false)}
                >
                  Join Now
                </Link>
                <div className="flex justify-center">
                  <ThemeToggler showLabel />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
