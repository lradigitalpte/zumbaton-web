"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import TickerStrip from "./TickerStrip";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

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
  const isSigninPage = usePathName === '/signin';
  
  // Header is now ALWAYS dark when it needs a background
  const needsBackground = sticky || isLightBackgroundPage;

  return (
    <>
      <header
        className={`header top-0 left-0 z-40 w-full flex flex-col transition-all duration-300 ${
          needsBackground
            ? "bg-black/95 shadow-2xl fixed z-9999 backdrop-blur-md border-b border-zinc-800"
            : "absolute bg-transparent pb-2 sm:pb-4"
        }`}
      >
        {!sticky && <TickerStrip />}
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="relative flex items-center justify-between w-full h-16 sm:h-20 md:h-24 lg:h-28">
            
            {/* LOGO - Left Aligned */}
            <div className="w-auto lg:w-1/4 flex items-center justify-start shrink-0">
              <Link href="/explore" className="flex items-center">
                <span className="inline-flex items-center justify-center">
                  <Image
                    src="/logo/One step fitness logo.png"
                    alt="One Step Fitness Logo"
                    width={300}
                    height={100}
                    className={`nav-logo-mobile h-12 sm:h-14 md:h-20 lg:h-[90px] w-auto object-contain lg:scale-150 origin-left transition-all duration-300 ${
                      needsBackground 
                        ? "drop-shadow-[0_2px_12px_rgba(132,204,22,0.2)]" 
                        : ""
                    }`}
                    priority
                  />
                </span>
              </Link>
            </div>

            {/* NAVIGATION - Centered on Desktop */}
            <div className={`fixed inset-0 z-40 lg:static lg:flex lg:flex-1 lg:justify-center lg:items-center ${navbarOpen ? "block" : "hidden lg:flex"}`}>
              {/* Mobile Overlay */}
              <div 
                className="fixed inset-0 bg-black/55 backdrop-blur-sm lg:hidden" 
                onClick={navbarToggleHandler}
                aria-hidden="true"
              />
              
              <nav className={`absolute right-0 top-0 h-screen w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800 lg:relative lg:h-auto lg:w-auto lg:max-h-none lg:bg-transparent lg:border-l-0 lg:shadow-none lg:transform-none lg:flex-row lg:items-center ${navbarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
                
                {/* Mobile Menu Header */}
                <div className="border-b border-gray-200 dark:border-gray-800 lg:hidden">
                  <div className="flex items-center justify-between p-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">Menu</h2>
                    <div className="flex items-center gap-2">
                      <button onClick={navbarToggleHandler} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="px-4 pb-4 grid grid-cols-1 gap-3">
                    <Link
                      href="/signin"
                      className="flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-3 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setNavbarOpen(false)}
                    >
                      Sign In
                    </Link>
                    <ThemeToggler showLabel />
                  </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto lg:overflow-visible">
                  <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-6 xl:gap-10 p-4 lg:p-0">
                    {menuData.map((menuItem, index) => (
                      <li key={index} className="group relative">
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            className={`flex items-center py-3 px-4 lg:py-2 lg:px-0 rounded-lg lg:rounded-none text-base font-medium transition-all relative ${
                              usePathName === menuItem.path
                                ? "text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-gray-800 lg:bg-transparent lg:after:absolute lg:after:-bottom-2 lg:after:left-0 lg:after:w-full lg:after:h-0.5 lg:after:bg-lime-400 lg:after:rounded-full"
                                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 lg:hover:bg-transparent lg:hover:text-lime-400"
                            }`}
                            onClick={() => setNavbarOpen(false)}
                          >
                            {menuItem.title}
                          </Link>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSubmenu(index)}
                              className="w-full flex items-center justify-between py-3 px-4 lg:py-2 lg:px-0 rounded-lg lg:rounded-none text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 lg:hover:bg-transparent lg:hover:text-lime-400 transition-all"
                            >
                              <span className="inline-flex items-center gap-1.5">{menuItem.title}</span>
                              <svg className={`w-4 h-4 transition-transform duration-300 ${openIndex === index ? "rotate-180" : "lg:group-hover:rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 lg:absolute lg:top-full lg:left-1/2 lg:-translate-x-1/2 lg:mt-4 lg:w-56 lg:bg-white dark:lg:bg-gray-900 lg:rounded-xl lg:shadow-2xl lg:border lg:border-gray-200 dark:lg:border-gray-800 lg:opacity-0 lg:invisible lg:group-hover:opacity-100 lg:group-hover:visible lg:group-hover:mt-2 ${openIndex === index ? "max-h-96 lg:max-h-none" : "max-h-0 lg:max-h-none"}`}>
                              <div className="pl-4 lg:pl-0 lg:p-2 space-y-1">
                                {menuItem.submenu?.map((submenuItem, subIndex) => (
                                  <Link
                                    href={submenuItem.path}
                                    key={subIndex}
                                    className="block py-2.5 px-4 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                    onClick={() => setNavbarOpen(false)}
                                  >
                                    {submenuItem.title}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            </div>

            {/* BUTTONS - Right Aligned */}
            <div className="w-auto lg:w-1/4 flex items-center justify-end gap-3 sm:gap-4 shrink-0 z-50">
              <Link
                href="/signin"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-black text-zinc-400 hover:text-lime-500 transition-colors uppercase tracking-widest"
              >
                Sign In
              </Link>
              <Link
                href="/trial-booking"
                className="rounded-xl px-5 sm:px-8 py-2.5 sm:py-3 text-sm font-black text-black bg-lime-500 hover:bg-yellow-400 shadow-[0_0_20px_rgba(132,204,22,0.3)] transition-all hover:scale-105 uppercase tracking-wider"
              >
                Join Now
              </Link>
              <div className="hidden lg:block ml-2">
                <ThemeToggler />
              </div>
              
              {/* Mobile Toggle Button */}
              <button
                onClick={navbarToggleHandler}
                className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
                aria-label="Toggle Menu"
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${navbarOpen ? "rotate-45 translate-y-2.5" : ""}`} />
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${navbarOpen ? "opacity-0" : ""}`} />
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${navbarOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </div>
              </button>
            </div>

          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
