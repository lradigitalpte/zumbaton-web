"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const PaymentSuccessPage = () => {
  const queryClient = useQueryClient();

  // Refresh data after successful payment
  useEffect(() => {
    // Invalidate all relevant queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['token-balance'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['user-packages'] });
    queryClient.invalidateQueries({ queryKey: ['packages'] });
  }, [queryClient]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl xl:text-3xl font-bold text-dark dark:text-white mb-3">
          Payment Successful! 🎉
        </h1>
        <p className="text-body-color dark:text-gray-400 mb-8">
          Your tokens have been added to your account. You can now book classes!
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/schedule"
            className="block w-full py-3 px-6 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Classes
          </Link>
          <Link
            href="/tokens"
            className="block w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 text-dark dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            View My Tokens
          </Link>
          <Link
            href="/dashboard"
            className="block text-primary hover:underline text-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
