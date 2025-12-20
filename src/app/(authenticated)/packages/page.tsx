"use client";

import { useState } from "react";
import { useAvailablePackages } from "@/hooks/usePackages";
import PaymentModal from "@/components/Payment/PaymentModal";

interface Package {
  id: string;
  name: string;
  description?: string;
  token_count: number;
  price_cents: number;
  currency: string;
  validity_days: number;
}

const PackagesPage = () => {
  const { data: packages = [], isLoading } = useAvailablePackages();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePurchase = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsPaymentModalOpen(true);
  };

  const handleClosePayment = () => {
    setIsPaymentModalOpen(false);
    setSelectedPackage(null);
  };

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(priceCents / 100);
  };

  return (
    <div className="pb-6">
      {/* Mobile-First Header */}
      <div className="text-center mb-6 xl:mb-10">
        <h1 className="text-2xl xl:text-3xl font-bold text-dark dark:text-white mb-2">
          Token Packages
        </h1>
        <p className="text-sm xl:text-base text-body-color dark:text-gray-400 max-w-2xl mx-auto px-4">
          Purchase tokens to book your favorite classes. The more you buy, the more you save!
        </p>
      </div>

      {/* Packages Grid - Mobile: 2 columns, Desktop: 3 columns */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-8 xl:p-12 text-center">
          <p className="text-body-color dark:text-gray-400 text-base xl:text-lg">No packages available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-6 max-w-5xl mx-auto">
          {packages.map((pkg, index) => {
            // Mark middle package or package with most tokens as popular
            const isPopular = index === Math.floor(packages.length / 2) || 
                             pkg.token_count === Math.max(...packages.map(p => p.token_count));

            return (
              <div
                key={pkg.id}
                className={`relative bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border-2 p-3 xl:p-6 transition-all hover:shadow-lg xl:hover:shadow-lg active:scale-[0.98] xl:active:scale-100 ${
                  isPopular
                    ? "border-primary"
                    : "border-gray-100 dark:border-gray-800"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-2 xl:-top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-[9px] xl:text-xs font-bold px-2 xl:px-3 py-0.5 xl:py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-3 xl:mb-6">
                  <h3 className="text-sm xl:text-xl font-bold text-dark dark:text-white mb-1 xl:mb-2 line-clamp-1">
                    {pkg.name}
                  </h3>
                  <p className="text-[10px] xl:text-sm text-body-color dark:text-gray-400 mb-2 xl:mb-4 line-clamp-2">
                    {pkg.description || `${pkg.token_count} class tokens`}
                  </p>
                  <div className="mb-1 xl:mb-2">
                    <span className="text-xl xl:text-4xl font-bold text-dark dark:text-white">
                      {formatPrice(pkg.price_cents, pkg.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 xl:gap-2 flex-wrap">
                    <span className="text-lg xl:text-2xl font-bold text-primary">{pkg.token_count}</span>
                    <span className="text-[10px] xl:text-base text-body-color dark:text-gray-400">tokens</span>
                  </div>
                  <p className="text-[9px] xl:text-sm text-body-color dark:text-gray-400 mt-0.5 xl:mt-1">
                    Valid for {pkg.validity_days} days
                  </p>
                </div>

                {/* Features List - Hidden on mobile, shown on desktop */}
                <ul className="hidden xl:block space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-body-color dark:text-gray-400 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{pkg.token_count} class tokens</span>
                  </li>
                  <li className="flex items-center gap-2 text-body-color dark:text-gray-400 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Valid for {pkg.validity_days} days</span>
                  </li>
                  <li className="flex items-center gap-2 text-body-color dark:text-gray-400 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{isPopular ? "Best value!" : "Flexible option"}</span>
                  </li>
                </ul>

                <button
                  onClick={() => handlePurchase(pkg)}
                  className={`w-full py-2 xl:py-3 rounded-lg xl:rounded-lg rounded-xl text-xs xl:text-base font-bold xl:font-medium transition-all active:scale-95 xl:active:scale-100 shadow-md xl:shadow-none ${
                    isPopular
                      ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20 xl:shadow-none"
                      : "bg-gray-100 dark:bg-gray-800 text-dark dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Purchase
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ Section - Mobile Optimized */}
      <div className="mt-8 xl:mt-16 max-w-3xl mx-auto px-4 xl:px-0">
        <h2 className="text-lg xl:text-xl font-bold text-dark dark:text-white text-center mb-4 xl:mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3 xl:space-y-4">
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-5">
            <h3 className="text-sm xl:text-base font-semibold text-dark dark:text-white mb-1.5 xl:mb-2">
              How do tokens work?
            </h3>
            <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 leading-relaxed">
              Each token can be used to book one class. When you book a class, a token is reserved. 
              If you attend the class, the token is used. If you cancel at least 4 hours before, 
              the token is refunded.
            </p>
          </div>
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-5">
            <h3 className="text-sm xl:text-base font-semibold text-dark dark:text-white mb-1.5 xl:mb-2">
              Do tokens expire?
            </h3>
            <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 leading-relaxed">
              Yes, tokens have a validity period based on the package you purchase. 
              Make sure to use them before they expire!
            </p>
          </div>
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-5">
            <h3 className="text-sm xl:text-base font-semibold text-dark dark:text-white mb-1.5 xl:mb-2">
              Can I get a refund?
            </h3>
            <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 leading-relaxed">
              Token purchases are non-refundable, but unused tokens remain valid until their 
              expiration date. Contact support for special circumstances.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePayment}
        selectedPackage={selectedPackage}
      />
    </div>
  );
};

export default PackagesPage;
