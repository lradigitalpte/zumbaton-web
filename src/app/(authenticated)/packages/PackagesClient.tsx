"use client";

import { useState, useMemo, useEffect } from "react";
import { useAvailablePackages } from "@/hooks/usePackages";
import PaymentModal from "@/components/Payment/PaymentModal";
import { useAuth } from "@/context/AuthContext";

interface Package {
  id: string;
  name: string;
  description?: string;
  token_count: number;
  price_cents: number;
  currency: string;
  validity_days: number;
  package_type: 'adult' | 'kid' | 'all';
  age_requirement?: string | null;
}

export default function PackagesClient({ initialPromo }: { initialPromo?: { hasEarlyBirdDiscount?: boolean; earlyBirdDaysLeft?: number | null; earlyBirdExpiresAt?: string | null } | null }) {
  const { data: adultPackages = [], isLoading: isLoadingAdults } = useAvailablePackages('adults');
  const { data: kidsPackages = [], isLoading: isLoadingKids } = useAvailablePackages('kids');
  const { user } = useAuth();
  const isLoading = isLoadingAdults || isLoadingKids;
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [promo, setPromo] = useState(initialPromo || null);
  const [hasPurchasedTrial, setHasPurchasedTrial] = useState(false);
  const [trialPackageId, setTrialPackageId] = useState<string | null>(null);
  const [isCheckingTrial, setIsCheckingTrial] = useState(true);

  // Debug logging
  console.log('[PackagesClient] Initial promo data:', JSON.stringify(initialPromo, null, 2));
  console.log('[PackagesClient] Promo state:', JSON.stringify(promo, null, 2));
  console.log('[PackagesClient] User from context:', user?.id);

  // Fetch promo data using user context if not available from server
  useEffect(() => {
    if (user?.id && (!promo || !promo.hasEarlyBirdDiscount)) {
      console.log('[PackagesClient] Fetching promo for user:', user.id);
      
      // Use the debug API that we know works
      fetch(`/api/promos/debug?userId=${user.id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          }
          return res.json()
        })
        .then(data => {
          console.log('[PackagesClient] Promo debug result:', data);
          if (data.eligibility) {
            setPromo(data.eligibility);
          }
        })
        .catch(err => console.warn('[PackagesClient] Promo fetch failed:', err));
    }
  }, [user, promo]);

  // Check if user has purchased trial package
  useEffect(() => {
    if (user?.id) {
      setIsCheckingTrial(true);
      fetch(`/api/packages/trial-check?userId=${user.id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          }
          return res.json()
        })
        .then(data => {
          if (data.success && data.data) {
            setHasPurchasedTrial(data.data.hasPurchasedTrial);
            setTrialPackageId(data.data.trialPackageId);
          }
        })
        .catch(err => {
          console.warn('[PackagesClient] Trial check failed:', err);
          // On error, allow trial to show (fail open)
          setHasPurchasedTrial(false);
        })
        .finally(() => {
          setIsCheckingTrial(false);
        });
    } else {
      setIsCheckingTrial(false);
    }
  }, [user]);

  const handlePurchase = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsPaymentModalOpen(true);
  };

  const handleClosePayment = () => {
    setIsPaymentModalOpen(false);
    setSelectedPackage(null);
  };

  // Filter out trial package if user has already purchased it
  const filteredAdultPackages = useMemo(() => {
    if (!hasPurchasedTrial || !trialPackageId) {
      return adultPackages;
    }
    return adultPackages.filter(pkg => pkg.id !== trialPackageId);
  }, [adultPackages, hasPurchasedTrial, trialPackageId]);

  const filteredKidsPackages = useMemo(() => {
    if (!hasPurchasedTrial || !trialPackageId) {
      return kidsPackages;
    }
    return kidsPackages.filter(pkg => pkg.id !== trialPackageId);
  }, [kidsPackages, hasPurchasedTrial, trialPackageId]);

  // Decide which single package should display the early-bird badge (one badge only)
  const preferredBadgePackageId = useMemo(() => {
    if (!promo?.hasEarlyBirdDiscount) return null;
    if (filteredAdultPackages && filteredAdultPackages.length > 0) {
      const popularIndex = Math.floor(filteredAdultPackages.length / 2);
      const candidate = filteredAdultPackages[popularIndex] ?? filteredAdultPackages.reduce((a, b) => (a.token_count >= b.token_count ? a : b));
      return candidate?.id ?? null;
    }
    if (filteredKidsPackages && filteredKidsPackages.length > 0) {
      const popularIndex = Math.floor(filteredKidsPackages.length / 2);
      const candidate = filteredKidsPackages[popularIndex] ?? filteredKidsPackages.reduce((a, b) => (a.token_count >= b.token_count ? a : b));
      return candidate?.id ?? null;
    }
    return null;
  }, [promo, filteredAdultPackages, filteredKidsPackages]);

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: currency || "SGD",
    }).format(priceCents / 100);
  };

  return (
    <div className="pb-6">
      <div className="text-center mb-6 xl:mb-10">
        <h1 className="text-2xl xl:text-3xl font-bold text-dark dark:text-white mb-2">
          Token Packages
        </h1>
        <p className="text-sm xl:text-base text-body-color dark:text-gray-400 max-w-2xl mx-auto px-4">
          Purchase tokens to book your favorite classes. The more you buy, the more you save!
        </p>
        
        {/* Early Steppers Promo Banner */}
        {promo?.hasEarlyBirdDiscount && (
          <div className="mt-4 mx-auto max-w-lg px-4">
            <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-center shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-orange-400/5 rounded-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm xl:text-base font-bold text-amber-800 dark:text-amber-200">
                      Early Bird Discount
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        10% OFF
                      </span>
                      <span className="ml-1">all packages</span>
                    </p>
                  </div>
                </div>
                {promo.earlyBirdDaysLeft != null && (
                  <div className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-1 border border-amber-200 dark:border-amber-600">
                    <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      {promo.earlyBirdDaysLeft} days left
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Adults Packages Section */}
      <div className="mb-12 xl:mb-16">
        <div className="text-center mb-6 xl:mb-8">
          <h2 className="text-xl xl:text-2xl font-bold text-dark dark:text-white mb-2">
            Adults Packages
          </h2>
          <p className="text-sm xl:text-base text-body-color dark:text-gray-400">
            Choose a package that fits your schedule
          </p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredAdultPackages.length === 0 ? (
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-8 xl:p-12 text-center">
            <p className="text-body-color dark:text-gray-400 text-base xl:text-lg">No adult packages available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-6 max-w-5xl mx-auto">
            {filteredAdultPackages.map((pkg, index) => {
              const isPopular = index === Math.floor(filteredAdultPackages.length / 2) || 
                               pkg.token_count === Math.max(...filteredAdultPackages.map(p => p.token_count));

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
              )
            })}
          </div>
        )}
      </div>

      {filteredKidsPackages.length > 0 && (
        <div className="mb-12 xl:mb-16">
          <div className="text-center mb-6 xl:mb-8">
            <h2 className="text-xl xl:text-2xl font-bold text-dark dark:text-white mb-2">
              Kids Packages (5-12 years)
            </h2>
            <p className="text-sm xl:text-base text-body-color dark:text-gray-400">
              Must be accompanied by a parent/guardian
            </p>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-6 max-w-5xl mx-auto">
            {filteredKidsPackages.map((pkg, index) => {
              const isPopular = index === Math.floor(filteredKidsPackages.length / 2) || 
                               pkg.token_count === Math.max(...filteredKidsPackages.map(p => p.token_count));

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
                    {pkg.age_requirement && (
                      <p className="text-[9px] xl:text-xs text-orange-600 dark:text-orange-400 mb-2 font-semibold">
                        {pkg.age_requirement}
                      </p>
                    )}
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
                      <span>Parent/guardian required</span>
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
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-8 xl:mt-16 max-w-5xl mx-auto px-4 xl:px-0">
        <h2 className="text-lg xl:text-xl font-bold text-dark dark:text-white text-center mb-2">
          Token Usage Guidelines
        </h2>
        <p className="text-sm text-body-color dark:text-gray-400 text-center mb-6 xl:mb-8">
          Important information about your token packages
        </p>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-5">
            <h3 className="text-sm xl:text-base font-semibold text-dark dark:text-white mb-1.5 xl:mb-2">
              How do tokens work?
            </h3>
            <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 leading-relaxed">
              Each token allows you to book one class. Tokens are automatically reserved when you book and used when you attend. Cancel at least 4 hours before class to get your token back.
            </p>
          </div>
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-5">
            <h3 className="text-sm xl:text-base font-semibold text-dark dark:text-white mb-1.5 xl:mb-2">
              Do tokens expire?
            </h3>
            <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 leading-relaxed">
              Yes, all tokens have validity periods shown in each package. Expired tokens cannot be used and are not refundable. Plan your classes accordingly.
            </p>
          </div>
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-5">
            <h3 className="text-sm xl:text-base font-semibold text-dark dark:text-white mb-1.5 xl:mb-2">
              Can I transfer or freeze tokens?
            </h3>
            <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 leading-relaxed">
              No, tokens are non-transferable between accounts and cannot be frozen or paused. They remain active until used or expired.
            </p>
          </div>
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-5">
            <h3 className="text-sm xl:text-base font-semibold text-dark dark:text-white mb-1.5 xl:mb-2">
              Refund policy
            </h3>
            <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 leading-relaxed">
              Token purchases are final and non-refundable. Unused tokens remain valid until expiry. Contact support only for technical issues with your purchase.
            </p>
          </div>
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-5">
            <h3 className="text-sm xl:text-base font-semibold text-dark dark:text-white mb-1.5 xl:mb-2">
              Late cancellations & no-shows
            </h3>
            <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 leading-relaxed">
              Same-day cancellations or not attending will result in token forfeiture. No exceptions or refunds apply.
            </p>
          </div>
          <div className="bg-white dark:bg-dark rounded-xl xl:rounded-xl rounded-2xl shadow-sm xl:shadow-sm shadow-md border border-gray-100 dark:border-gray-800 p-4 xl:p-5">
            <h3 className="text-sm xl:text-base font-semibold text-dark dark:text-white mb-1.5 xl:mb-2">
              Package validity
            </h3>
            <p className="text-xs xl:text-sm text-body-color dark:text-gray-400 leading-relaxed">
              Validity periods start immediately upon purchase. Choose packages that match your class frequency to avoid token wastage.
            </p>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePayment}
        selectedPackage={selectedPackage}
        promoData={promo}
      />
    </div>
  );
}
