"use client";

import { useAvailablePackages, usePurchasePackage } from "@/hooks/usePackages";

const PackagesPage = () => {
  const { data: packages = [], isLoading } = useAvailablePackages();
  const purchaseMutation = usePurchasePackage();

  const handlePurchase = (packageId: string) => {
    purchaseMutation.mutate({ packageId });
  };

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(priceCents / 100);
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-dark dark:text-white mb-2">
          Token Packages
        </h1>
        <p className="text-body-color dark:text-gray-400 max-w-2xl mx-auto">
          Purchase tokens to book your favorite classes. The more you buy, the more you save!
        </p>
      </div>

      {/* Packages Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <p className="text-body-color dark:text-gray-400 text-lg">No packages available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {packages.map((pkg, index) => {
            // Mark middle package or package with most tokens as popular
            const isPopular = index === Math.floor(packages.length / 2) || 
                             pkg.token_count === Math.max(...packages.map(p => p.token_count));

            return (
              <div
                key={pkg.id}
                className={`relative bg-white dark:bg-dark rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-lg ${
                  isPopular
                    ? "border-primary"
                    : "border-gray-100 dark:border-gray-800"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-dark dark:text-white mb-2">
                    {pkg.name}
                  </h3>
                  <p className="text-body-color dark:text-gray-400 text-sm mb-4">
                    {pkg.description || `${pkg.token_count} class tokens`}
                  </p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-dark dark:text-white">
                      {formatPrice(pkg.price_cents, pkg.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-primary">{pkg.token_count}</span>
                    <span className="text-body-color dark:text-gray-400">tokens</span>
                  </div>
                  <p className="text-sm text-body-color dark:text-gray-400 mt-1">
                    Valid for {pkg.validity_days} days
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
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
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchaseMutation.isPending}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isPopular
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-gray-100 dark:bg-gray-800 text-dark dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  } disabled:opacity-50`}
                >
                  {purchaseMutation.isPending ? "Processing..." : "Purchase"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-dark dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-dark dark:text-white mb-2">
              How do tokens work?
            </h3>
            <p className="text-body-color dark:text-gray-400 text-sm">
              Each token can be used to book one class. When you book a class, a token is reserved. 
              If you attend the class, the token is used. If you cancel at least 4 hours before, 
              the token is refunded.
            </p>
          </div>
          <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-dark dark:text-white mb-2">
              Do tokens expire?
            </h3>
            <p className="text-body-color dark:text-gray-400 text-sm">
              Yes, tokens have a validity period based on the package you purchase. 
              Make sure to use them before they expire!
            </p>
          </div>
          <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-dark dark:text-white mb-2">
              Can I get a refund?
            </h3>
            <p className="text-body-color dark:text-gray-400 text-sm">
              Token purchases are non-refundable, but unused tokens remain valid until their 
              expiration date. Contact support for special circumstances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagesPage;
