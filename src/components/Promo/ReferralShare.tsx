"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";

export default function ReferralShare() {
  const { user } = useAuth();
  const toast = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchReferralCode();
    }
  }, [user]);

  const fetchReferralCode = async () => {
    try {
      // Get auth token from Supabase session
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setReferralCode(generateCodeFromUserId(user!.id));
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/referrals/my-code', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setReferralCode(data.code || generateCodeFromUserId(user!.id));
      } else {
        // Generate code from user ID as fallback
        setReferralCode(generateCodeFromUserId(user!.id));
      }
    } catch (error) {
      console.error('Failed to fetch referral code:', error);
      setReferralCode(generateCodeFromUserId(user!.id));
    } finally {
      setIsLoading(false);
    }
  };

  const generateCodeFromUserId = (userId: string): string => {
    // Generate code: ZUMB-{first 8 chars of user ID}
    return `ZUMB-${userId.substring(0, 8).toUpperCase()}`;
  };

  const referralLink = referralCode 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${referralCode}`
    : '';

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied!', 'Referral link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy', 'Please copy manually');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        {/* Referral Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Your Referral Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralCode || ''}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-500"
            />
            <button
              onClick={() => referralCode && copyToClipboard(referralCode)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Referral Link */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Your Referral Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-500"
            />
            <button
              onClick={() => referralLink && copyToClipboard(referralLink)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="text-green-700 dark:text-green-400">How it works:</strong> When someone signs up using your referral code, they get 8% off their first package purchase. Share your code with friends and help them save!
            </p>
          </div>
        </div>
    </div>
  );
}

