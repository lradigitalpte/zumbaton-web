"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

const Header = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => window.removeEventListener("scroll", handleStickyNavbar);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (navbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [navbarOpen]);

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const usePathName = usePathname();
  
  // Pages with light backgrounds that need dark text on header
  const lightBackgroundPages = ['/signin', '/signup', '/forgot-password', '/schedule', '/packages'];
  const isLightBackgroundPage = lightBackgroundPages.some(path => usePathName?.startsWith(path));
  
  // Force sticky/background on light pages when not scrolled
  const needsBackground = sticky || isLightBackgroundPage;

  return (
    <>
      <header
        className={`header top-0 left-0 z-40 w-full flex items-center transition-all duration-300 ${
          needsBackground
            ? "dark:bg-gray-dark dark:shadow-sticky-dark shadow-sticky fixed z-[9999] bg-white/95 backdrop-blur-sm"
            : "absolute bg-transparent pb-2 sm:pb-4"
        }`}
      >
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="relative flex items-center justify-between">
            <div className="w-32 sm:w-40 md:w-60 max-w-full flex-shrink-0">
              <Link
                href="/"
                className={`flex items-center gap-2 sm:gap-3 ${
                  needsBackground ? "py-2 sm:py-3 lg:py-2" : "py-3 sm:py-4 md:py-8"
                }`}
              >
                {/* Logo on soft dark patch – rounded, subtle shadow, no hard edges */}
                <span className="inline-flex items-center justify-center rounded-xl bg-gray-800/90 dark:bg-gray-950/90 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg shadow-black/15 ring-1 ring-white/5">
                  <Image
                    src="/logo/zumbaton logo (transparent).png"
                    alt="Zumbaton Logo"
                    width={80}
                    height={80}
                    className="h-10 sm:h-12 md:h-16 w-auto object-contain"
                    priority
                  />
                </span>
              </Link>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <button
                onClick={navbarToggleHandler}
                id="navbarToggler"
                aria-label="Mobile Menu"
                className={`ring-primary block rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:ring-2 lg:hidden z-50 touch-center transition-colors ${
                  needsBackground ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
              >
                <span
                  className={`relative my-1 sm:my-1.5 block h-0.5 w-6 sm:w-[30px] transition-all duration-300 ${
                    needsBackground ? "bg-black dark:bg-white" : "bg-white"
                  } ${navbarOpen ? "top-[7px] rotate-45" : ""}`}
                />
                <span
                  className={`relative my-1 sm:my-1.5 block h-0.5 w-6 sm:w-[30px] transition-all duration-300 ${
                    needsBackground ? "bg-black dark:bg-white" : "bg-white"
                  } ${navbarOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`relative my-1 sm:my-1.5 block h-0.5 w-6 sm:w-[30px] transition-all duration-300 ${
                    needsBackground ? "bg-black dark:bg-white" : "bg-white"
                  } ${navbarOpen ? "top-[-8px] -rotate-45" : ""}`}
                />
              </button>
              
              {/* Mobile Menu Overlay */}
              {navbarOpen && (
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                  onClick={navbarToggleHandler}
                />
              )}

              <nav
                id="navbarCollapse"
                className={`navbar fixed top-0 right-0 z-50 h-screen w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:h-auto lg:w-auto lg:max-h-none lg:overflow-visible lg:transform-none lg:shadow-none lg:bg-transparent lg:dark:bg-transparent ${
                  navbarOpen
                    ? "translate-x-0"
                    : "translate-x-full lg:translate-x-0"
                }`}
              >
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                  <div className="flex items-center gap-2">
                    <div className="lg:hidden">
                      <ThemeToggler />
                    </div>
                    <button
                      onClick={navbarToggleHandler}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Close Menu"
                    >
                      <svg
                        className="w-6 h-6 text-gray-600 dark:text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="overflow-y-auto h-[calc(100vh-80px)] lg:overflow-visible lg:h-auto">
                  <ul className="flex flex-col lg:flex-row lg:space-x-8 xl:space-x-12 lg:justify-center p-4 lg:p-0">
                    {menuData.map((menuItem, index) => (
                      <li key={index} className="group relative">
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            className={`flex items-center py-3 px-4 rounded-lg text-base font-medium transition-colors lg:py-6 lg:px-0 lg:rounded-none relative ${
                              usePathName === menuItem.path
                                ? "text-lime-400 lg:text-lime-400 lg:bg-transparent lg:after:absolute lg:after:bottom-0 lg:after:left-0 lg:after:w-full lg:after:h-[2px] lg:after:bg-lime-400 lg:after:rounded-full"
                                : needsBackground
                                ? "text-gray-700 hover:text-lime-400 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-lime-400 dark:hover:bg-gray-800 lg:hover:bg-transparent"
                                : "text-gray-700 hover:text-lime-400 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-lime-400 dark:hover:bg-gray-800 lg:text-white/90 lg:hover:text-white lg:hover:bg-transparent"
                            }`}
                            onClick={() => setNavbarOpen(false)}
                          >
                            {menuItem.title}
                          </Link>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSubmenu(index)}
                              className={`w-full flex items-center justify-between py-3 px-4 rounded-lg text-base font-medium transition-colors lg:py-6 lg:px-0 lg:rounded-none ${
                                needsBackground
                                  ? "text-gray-700 hover:text-lime-400 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-lime-400 dark:hover:bg-gray-800 lg:hover:bg-transparent"
                                  : "text-gray-700 hover:text-lime-400 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-lime-400 dark:hover:bg-gray-800 lg:text-white/90 lg:hover:text-white lg:hover:bg-transparent"
                              }`}
                            >
                              {menuItem.title}
                              <svg
                                className={`w-5 h-5 transition-transform lg:hidden ${
                                  openIndex === index ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                            <div
                              className={`overflow-hidden transition-all duration-300 lg:absolute lg:top-full lg:left-0 lg:w-64 lg:bg-white lg:dark:bg-gray-800 lg:rounded-lg lg:shadow-xl lg:border lg:border-gray-200 lg:dark:border-gray-700 lg:opacity-0 lg:invisible lg:group-hover:opacity-100 lg:group-hover:visible ${
                                openIndex === index ? "max-h-96 lg:max-h-none" : "max-h-0 lg:max-h-none"
                              }`}
                            >
                              <div className="pl-4 lg:pl-0 lg:p-4 space-y-1">
                                {menuItem.submenu?.map((submenuItem, subIndex) => (
                                  <Link
                                    href={submenuItem.path}
                                    key={subIndex}
                                    className="block py-2 px-4 rounded-lg text-sm text-gray-600 hover:text-lime-400 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-lime-400 dark:hover:bg-gray-800 transition-colors lg:px-3"
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
            <div className="hidden lg:flex items-center justify-end gap-3 sm:gap-4 lg:gap-5 ml-3 sm:ml-4 flex-shrink-0">
                <Link
                  href="/signin"
                  className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-medium transition-colors ${
                    needsBackground
                      ? "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      : "text-green-300 hover:text-white"
                  }`}
                >
                  Sign In
                </Link>
                <button
                  onClick={() => {
                    openWhatsAppModal();
                    setNavbarOpen(false);
                  }}
                  className={`rounded-lg px-5 sm:px-6 md:px-7 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-semibold text-white shadow-md transition-colors ${
                    sticky
                      ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Join Now
                </button>
                <div className="flex-shrink-0 relative z-50 ml-2 sm:ml-3">
                  <ThemeToggler />
                </div>
            </div>
            <div className={`flex lg:hidden items-center gap-2 sm:gap-3 flex-shrink-0 transition-opacity duration-300 ${navbarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <Link
                  href="/signin"
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors rounded-lg ${
                    needsBackground
                      ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Sign In
                </Link>
                <button
                  onClick={() => {
                    openWhatsAppModal();
                    setNavbarOpen(false);
                  }}
                  className={`rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-md transition-colors ${
                    sticky
                      ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Join Now
                </button>
                <div className="flex-shrink-0 relative z-50">
                  <ThemeToggler />
                </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
