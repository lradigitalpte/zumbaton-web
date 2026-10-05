"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import TickerStrip from "./TickerStrip";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu as MenuIcon, ChevronDown, ArrowRight } from "lucide-react";

const Header = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => setNavbarOpen(!navbarOpen);

  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    setSticky(window.scrollY >= 48);
  };
  useEffect(() => {
    handleStickyNavbar();
    window.addEventListener("scroll", handleStickyNavbar);
    return () => window.removeEventListener("scroll", handleStickyNavbar);
  }, []);

  useEffect(() => {
    document.body.style.overflow = navbarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navbarOpen]);

  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: number) => setOpenIndex(openIndex === index ? -1 : index);

  const usePathName = usePathname();
  const lightBackgroundPages = ["/signin", "/signup", "/forgot-password", "/schedule", "/packages"];
  const isLightBackgroundPage =
    lightBackgroundPages.some((path) => usePathName?.startsWith(path)) ||
    usePathName?.endsWith("/success") === true;

  /** Cream/light page at top — dark nav copy on frosted light bar */
  const lightShell = isLightBackgroundPage && !sticky;
  /** Dark hero / scrolled — light nav copy on dark bar */
  const darkShell = !lightShell;

  const navLinkMuted = lightShell
    ? "text-gray-800/90 hover:text-black"
    : "text-white/90 hover:text-white";
  const navLinkActive = lightShell ? "text-lime-600" : "text-lime-400";
  const actionLinkClass = lightShell
    ? "text-gray-900 hover:text-lime-600"
    : "text-white/95 hover:text-lime-400";
  const menuButtonClass = lightShell
    ? "border-black/10 bg-black/5 hover:bg-black/10 text-gray-900"
    : "border-white/20 bg-white/10 hover:bg-white/15 text-white";
  const menuIconClass = lightShell ? "text-gray-900" : "text-white";

  const barShellClass = sticky
    ? "rounded-none border-x-0 border-t-0 border-b border-white/10 bg-black/95 shadow-lg backdrop-blur-xl"
    : lightShell
      ? "rounded-xl border-black/10 bg-white/92 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-md"
      : "rounded-xl border-white/12 bg-black/65 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl";

  return (
    <>
      <header className="header fixed left-0 top-0 z-50 flex w-full flex-col transition-all duration-300">
        {!sticky && <TickerStrip />}

        <div
          className={`w-full transition-all duration-300 ${sticky ? "pt-0" : "px-4 pt-2 sm:px-6 lg:px-10 xl:px-12"}`}
        >
          <div className={`w-full border ${barShellClass}`}>
            <div className="flex h-14 w-full items-center gap-4 px-4 sm:h-[3.75rem] sm:gap-6 sm:px-6 lg:px-8 xl:px-10">
              {/* Logo — flush start */}
              <div className="flex shrink-0 items-center">
                <Link href="/explore" className="group flex items-center">
                  <div className="relative">
                    <Image
                      src="/logo/One step fitness logo.png"
                      alt="One Step Fitness Logo"
                      width={160}
                      height={53}
                      className={`h-8 w-auto max-h-8 object-contain object-left transition-all duration-300 sm:h-9 lg:h-10 ${
                        darkShell && !sticky ? "brightness-110 drop-shadow-md" : ""
                      }`}
                      priority
                      loading="eager"
                    />
                    <div className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-lime-500 transition-all duration-300 group-hover:w-full" />
                  </div>
                </Link>
              </div>

              {/* Desktop nav — centered band, compact */}
              <nav className="hidden min-w-0 flex-1 justify-center xl:flex">
                <ul className="flex max-w-3xl flex-wrap items-center justify-center gap-x-0.5 gap-y-1 xl:gap-x-1">
                {menuData.map((menuItem, index) => (
                  <li key={index} className="group relative">
                    {menuItem.path ? (
                      <Link
                        href={menuItem.path}
                        className={`relative px-2.5 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-200 xl:px-3.5 xl:text-[13px] ${
                          usePathName === menuItem.path ? navLinkActive : navLinkMuted
                        }`}
                      >
                        {menuItem.title}
                        {usePathName === menuItem.path && (
                          <motion.div
                            layoutId="navUnderline"
                            className={`absolute -bottom-0.5 left-2.5 right-2.5 h-px xl:left-3 xl:right-3 ${lightShell ? "bg-lime-600" : "bg-lime-400"}`}
                          />
                        )}
                      </Link>
                    ) : (
                      <div className="relative group">
                        <button
                          onClick={() => handleSubmenu(index)}
                          className={`relative flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-200 xl:px-3.5 xl:text-[13px] ${navLinkMuted}`}
                        >
                          {menuItem.title}
                          {menuItem.isNew && (
                            <span className="absolute -right-2 -top-2 flex h-4 min-w-[2rem] items-center justify-center bg-red-600 px-1 text-[8px] font-black text-white shadow-md">
                              NEW
                            </span>
                          )}
                          <ChevronDown
                            className="h-4 w-4 shrink-0 opacity-90 transition-transform duration-300 group-hover:rotate-180 xl:h-[18px] xl:w-[18px]"
                            strokeWidth={2.5}
                          />
                        </button>

                        <div className="invisible absolute left-0 top-full z-50 mt-1 w-56 translate-y-1 border border-white/10 bg-black/95 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="space-y-0.5 p-1.5">
                            {menuItem.submenu?.map((submenuItem, subIndex) => (
                              <Link
                                href={submenuItem.path}
                                key={subIndex}
                                className="group/sub relative flex items-center justify-between px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 transition-all duration-200 hover:bg-lime-500 hover:text-black"
                              >
                                <div className="flex items-center gap-2">
                                  {submenuItem.title}
                                  {submenuItem.isNew && (
                                    <span className="bg-red-600 px-1 py-0.5 text-[7px] leading-none text-white">NEW</span>
                                  )}
                                </div>
                                <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover/sub:translate-x-0 group-hover/sub:opacity-100" />
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

              {/* Actions — flush end; Try Now outermost on desktop */}
              <div className="ml-auto flex shrink-0 items-center justify-end gap-2 sm:gap-3 lg:gap-4">
                <Link
                  href="/signin"
                  className={`hidden whitespace-nowrap text-xs font-bold uppercase tracking-wider sm:inline-block ${actionLinkClass}`}
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className={`hidden whitespace-nowrap text-xs font-bold uppercase tracking-wider xl:inline-block ${actionLinkClass}`}
                >
                  Join
                </Link>

                <div className="hidden sm:block">
                  <ThemeToggler compact onDarkBackground={darkShell} />
                </div>

                <Link
                  href="/trial-booking"
                  className="shrink-0 rounded-lg bg-lime-500 px-4 py-2.5 text-[11px] font-black uppercase tracking-wide text-black shadow-md transition-all hover:bg-white hover:shadow-lg sm:px-5 sm:text-xs lg:px-6 lg:py-3"
                >
                  Try Now!
                </Link>

                <button
                  onClick={navbarToggleHandler}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border xl:hidden ${menuButtonClass}`}
                  aria-label="Toggle Menu"
                >
                  {navbarOpen ? (
                    <X className={`h-5 w-5 ${menuIconClass}`} />
                  ) : (
                    <MenuIcon className={`h-5 w-5 ${menuIconClass}`} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer so fixed header does not cover content on light pages */}
      <div className={`pointer-events-none ${sticky ? "h-14 sm:h-[3.75rem]" : "h-[4.25rem] sm:h-[4.75rem]"}`} aria-hidden />

      {/* Mobile menu */}
      <AnimatePresence>
        {navbarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] xl:hidden"
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={navbarToggleHandler} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-black p-6 sm:p-10"
            >
              <div className="mb-6 flex items-center justify-between sm:mb-10">
                <Image
                  src="/logo/One step fitness logo.png"
                  alt="Logo"
                  width={160}
                  height={52}
                  className="h-8 w-auto max-w-[9.5rem] object-contain object-left sm:h-10"
                />
                <button
                  onClick={navbarToggleHandler}
                  className="flex h-9 w-9 items-center justify-center border border-white/10 transition-colors hover:bg-white/5 sm:h-11 sm:w-11"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <nav className="custom-scrollbar flex-1 overflow-y-auto pr-2">
                <ul className="space-y-4 sm:space-y-6">
                  {menuData.map((menuItem, index) => (
                    <li key={index}>
                      {menuItem.path ? (
                        <Link
                          href={menuItem.path}
                          className={`relative flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter transition-colors sm:text-4xl ${
                            usePathName === menuItem.path ? "text-lime-500" : "text-white hover:text-lime-500"
                          }`}
                          onClick={() => setNavbarOpen(false)}
                        >
                          {menuItem.title}
                          {menuItem.isNew && (
                            <span className="relative bg-red-600 px-2 py-1 text-[10px] not-italic tracking-normal text-white">
                              NEW
                            </span>
                          )}
                        </Link>
                      ) : (
                        <div className="space-y-4">
                          <button
                            onClick={() => handleSubmenu(index)}
                            className="relative flex w-full items-center justify-between text-2xl font-black uppercase italic tracking-tighter text-white sm:text-4xl"
                          >
                            <div className="flex items-center gap-3">
                              {menuItem.title}
                              {menuItem.isNew && (
                                <span className="bg-red-600 px-2 py-1 text-[10px] not-italic tracking-normal text-white">NEW</span>
                              )}
                            </div>
                            <ChevronDown
                              className={`h-6 w-6 transition-transform sm:h-8 sm:w-8 ${openIndex === index ? "rotate-180" : ""}`}
                            />
                          </button>
                          <AnimatePresence>
                            {openIndex === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-3 overflow-hidden border-l-2 border-lime-500/30 pl-4 sm:space-y-4 sm:pl-6"
                              >
                                {menuItem.submenu?.map((sub, idx) => (
                                  <Link
                                    key={idx}
                                    href={sub.path}
                                    className="block text-lg font-black uppercase italic tracking-tighter text-zinc-500 hover:text-lime-500 sm:text-xl"
                                    onClick={() => setNavbarOpen(false)}
                                  >
                                    <div className="flex items-center gap-2">
                                      {sub.title}
                                      {sub.isNew && (
                                        <span className="bg-red-600 px-1.5 py-0.5 text-[10px] not-italic tracking-normal text-white">
                                          NEW
                                        </span>
                                      )}
                                    </div>
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
                  href="/signup"
                  className="block border border-white/20 py-3 text-center text-xs font-black uppercase tracking-widest text-white transition-colors hover:border-lime-500 hover:text-lime-400"
                  onClick={() => setNavbarOpen(false)}
                >
                  Join — Sign Up
                </Link>
                <Link
                  href="/trial-booking"
                  className="block bg-lime-500 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-black shadow-2xl transition-all hover:bg-white active:scale-[0.99] sm:py-5"
                  onClick={() => setNavbarOpen(false)}
                >
                  Try Now!
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
