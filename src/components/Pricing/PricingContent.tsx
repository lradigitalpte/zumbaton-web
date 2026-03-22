"use client";

import { useAvailablePackages } from "@/hooks/usePackages";
import Link from "next/link";
import { motion } from "framer-motion";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

const PricingContent = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const { data: adultPackages = [], isLoading: isLoadingAdults, error: errorAdults } = useAvailablePackages('adults');
  const { data: kidsPackages = [], isLoading: isLoadingKids, error: errorKids } = useAvailablePackages('kids');
  const isLoading = isLoadingAdults || isLoadingKids;
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('PricingContent - Adult packages:', adultPackages);
    console.log('PricingContent - Kids packages:', kidsPackages);
    if (errorAdults) console.error('Error loading adult packages:', errorAdults);
    if (errorKids) console.error('Error loading kids packages:', errorKids);
  }

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: currency || "SGD",
    }).format(priceCents / 100);
  };

  const formatValidity = (days: number) => {
    if (days === 7) return "1 week";
    if (days === 30) return "1 month";
    if (days === 60) return "2 months";
    if (days === 90) return "3 months";
    return `${days} days`;
  };

  return (
    <section className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-900">
      <div className="container px-3 sm:px-4">
        {/* Adults Packages Section */}
        <div className="mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1 bg-green-100 dark:bg-green-600/20 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold mb-4">
              Adults Packages
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Packages for Everyone
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Find a dance fitness class that feels like your own. Beginner-friendly, feel-good classes for all.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : errorAdults ? (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-12 text-center">
              <p className="text-red-600 dark:text-red-400 text-lg">Error loading packages. Please try again later.</p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-red-500 text-sm mt-2">{String(errorAdults)}</p>
              )}
            </div>
          ) : adultPackages.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No adult packages available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {adultPackages.map((pkg, index) => {
                const isPopular = index === Math.floor(adultPackages.length / 2);
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 ${
                      isPopular
                        ? "border-green-600 dark:border-green-500 scale-105 md:scale-105"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 dark:bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg z-10">
                        Most Popular
                      </div>
                    )}
                    <div className="p-6 md:p-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{pkg.description || `${pkg.token_count} class tokens`}</p>
                      
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400">
                            {formatPrice(pkg.price_cents, pkg.currency)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {pkg.token_count} {pkg.token_count === 1 ? 'token' : 'tokens'} • Valid for {formatValidity(pkg.validity_days)}
                        </p>
                      </div>

                      <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{pkg.token_count} class {pkg.token_count === 1 ? 'token' : 'tokens'}</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Valid for {formatValidity(pkg.validity_days)}</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>All class types included</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Easy online booking</span>
                        </li>
                      </ul>

                      <button
                        type="button"
                        onClick={openWhatsAppModal}
                        className={`block w-full text-center py-3 px-6 rounded-lg font-bold transition-all ${
                          isPopular
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        }`}
                      >
                        Get Started
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kids Packages Section */}
        {kidsPackages.length > 0 && (
          <div className="mb-16 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 md:mb-12"
            >
              <span className="inline-block px-4 py-1 bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-400 rounded-full text-sm font-semibold mb-4">
                Kids Packages
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Packages for Kids (5-12 years)
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                Must be accompanied by a parent/guardian
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {kidsPackages.map((pkg, index) => {
                const isPopular = index === Math.floor(kidsPackages.length / 2);
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 ${
                      isPopular
                        ? "border-orange-500 dark:border-orange-400 scale-105 md:scale-105"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 dark:bg-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg z-10">
                        Most Popular
                      </div>
                    )}
                    <div className="p-6 md:p-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">{pkg.description || `${pkg.token_count} class tokens`}</p>
                      {pkg.age_requirement && (
                        <p className="text-orange-600 dark:text-orange-400 text-xs font-semibold mb-4 italic">
                          {pkg.age_requirement}
                        </p>
                      )}
                      
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-4xl md:text-5xl font-bold text-orange-600 dark:text-orange-400">
                            {formatPrice(pkg.price_cents, pkg.currency)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {pkg.token_count} {pkg.token_count === 1 ? 'token' : 'tokens'} • Valid for {formatValidity(pkg.validity_days)}
                        </p>
                      </div>

                      <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{pkg.token_count} class {pkg.token_count === 1 ? 'token' : 'tokens'}</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Valid for {formatValidity(pkg.validity_days)}</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Parent/guardian required</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>All class types included</span>
                        </li>
                      </ul>

                      <button
                        type="button"
                        onClick={openWhatsAppModal}
                        className={`block w-full text-center py-3 px-6 rounded-lg font-bold transition-all ${
                          isPopular
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        }`}
                      >
                        Get Started
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 rounded-2xl p-8 md:p-12 text-center text-white"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Dancing?</h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto text-lg">
            Join our community and find your dance fitness class. One beat. One step. One happy you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={openWhatsAppModal}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-all"
            >
              Sign Up Now
            </button>
            <Link
              href="/schedule"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border-2 border-white/30 transition-all"
            >
              View Schedule
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingContent;

