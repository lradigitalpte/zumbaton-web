"use client";



import { useState, useMemo, useEffect } from "react";

import Link from "next/link";

import { useAvailablePackages } from "@/hooks/usePackages";

import PaymentModal from "@/components/Payment/PaymentModal";

import { useAuth } from "@/context/AuthContext";

import { useProfile } from "@/hooks/useProfile";

import { useTokenBalanceStats } from "@/hooks/useTokenTransactions";

import { getUserType } from "@/lib/user-age-utils";
import { formatPackageValidity } from "@/lib/packages-utils";

import MemberMobilePageShell from "@/components/Dashboard/MemberMobilePageShell";



interface Package {

  id: string;

  name: string;

  description?: string;

  token_count: number;

  is_unlimited?: boolean;

  price_cents: number;

  currency: string;

  validity_days: number;

  package_type: "adult" | "kid" | "all";

  age_requirement?: string | null;

}



type CatalogTab = "adults" | "kids";



function sortPackages(packages: Package[]) {

  return [...packages].sort((a, b) => {

    if (a.is_unlimited) return 1;

    if (b.is_unlimited) return -1;

    return a.token_count - b.token_count;

  });

}



function getBestValuePackageId(packages: Package[]): string | null {

  const finite = packages.filter((p) => !p.is_unlimited && p.token_count > 1);

  if (finite.length === 0) return null;

  let best = finite[0];

  let bestPerToken = best.price_cents / best.token_count;

  for (const p of finite) {

    const perToken = p.price_cents / p.token_count;

    if (perToken < bestPerToken) {

      best = p;

      bestPerToken = perToken;

    }

  }

  return best.id;

}



function getDropInPerClassCents(packages: Package[]): number | null {

  const single = packages.find((p) => !p.is_unlimited && p.token_count === 1);

  return single ? single.price_cents : null;

}



function cleanPackageTagline(name: string, description?: string | null): string | null {

  if (!description?.trim()) return null;

  let text = description.trim();

  if (text.toLowerCase() === name.trim().toLowerCase()) return null;

  text = text

    .replace(/\.\s*valid for \d+\s*month?s?\.?/gi, "")

    .replace(/valid for \d+\s*month?s?\.?/gi, "")

    .replace(/\s+/g, " ")

    .trim()

    .replace(/^[\s.,]+|[\s.,]+$/g, "");

  if (!text || text.length < 4) return null;

  return text;

}



const GUIDELINES = [

  {

    title: "How do tokens work?",

    body: "Each token books one class. Cancel by 23:59 the day before to get it back — not on the same day as class.",

  },

  {

    title: "Do tokens expire?",

    body: "Yes. Each package shows its validity. Expired tokens cannot be used or refunded.",

  },

  {

    title: "Transfer or freeze?",

    body: "Tokens stay on your account only. They cannot be transferred, frozen, or paused.",

  },

  {

    title: "Refund policy",

    body: "Purchases are final. Unused tokens work until they expire. Contact support for payment issues only.",

  },

  {

    title: "Late cancel & no-shows",

    body: "Same-day cancels or no-shows forfeit the token.",

  },

  {

    title: "When validity starts",

    body: "The clock starts when you buy. Pick a pack that matches how often you come in.",

  },

] as const;



export default function PackagesClient({

  initialPromo,

}: {

  initialPromo?: {

    hasEarlyBirdDiscount?: boolean;

    earlyBirdDaysLeft?: number | null;

    earlyBirdExpiresAt?: string | null;

  } | null;

}) {

  const {

    data: adultPackages = [],

    isLoading: isLoadingAdults,

    isFetching: isFetchingAdults,

    isError: isAdultsError,

    error: adultsError,

    refetch: refetchAdults,

  } = useAvailablePackages("adults");

  const {

    data: kidsPackages = [],

    isLoading: isLoadingKids,

    isFetching: isFetchingKids,

    isError: isKidsError,

    error: kidsError,

    refetch: refetchKids,

  } = useAvailablePackages("kids");

  const { user } = useAuth();

  const { data: profile } = useProfile();

  const { data: tokenBalance, isLoading: isLoadingBalance } = useTokenBalanceStats(user?.id);



  const isLoading = isLoadingAdults || isLoadingKids || isFetchingAdults || isFetchingKids;

  const hasPackageLoadError = isAdultsError || isKidsError;

  const packageLoadError = (adultsError || kidsError) as Error | null;



  const userType = useMemo(() => {

    if (!profile?.dateOfBirth) return null;

    return getUserType(profile.dateOfBirth);

  }, [profile?.dateOfBirth]);



  const displayAdultPackages = useMemo(() => {

    if (userType === null) return adultPackages;

    return userType === "adult" ? adultPackages : [];

  }, [adultPackages, userType]);



  const displayKidsPackages = useMemo(() => {

    if (userType === null) return kidsPackages;

    return userType === "kid" ? kidsPackages : [];

  }, [kidsPackages, userType]);



  const showCatalogTabs =

    userType === null && displayAdultPackages.length > 0 && displayKidsPackages.length > 0;



  const [catalogTab, setCatalogTab] = useState<CatalogTab>("adults");

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [promo, setPromo] = useState(initialPromo || null);

  const [hasPurchasedTrial, setHasPurchasedTrial] = useState(false);

  const [trialPackageId, setTrialPackageId] = useState<string | null>(null);



  useEffect(() => {

    if (!user?.id) return;

    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), 12000);

    (async () => {

      try {

        const { apiFetchJson } = await import("@/lib/api-fetch");

        const data = await apiFetchJson<{ success: boolean; data?: typeof promo }>(

          "/api/promos/eligibility",

          { method: "GET", requireAuth: true, cache: "no-store", signal: controller.signal }

        );

        if (data?.success && data?.data) setPromo(data.data);

        else setPromo(null);

      } catch {

        setPromo(null);

      } finally {

        clearTimeout(timeoutId);

      }

    })();

    return () => {

      clearTimeout(timeoutId);

      controller.abort();

    };

  }, [user?.id]);



  useEffect(() => {

    if (!user?.id) return;

    fetch(`/api/packages/trial-check?userId=${user.id}`)

      .then((res) => (res.ok ? res.json() : Promise.reject()))

      .then((data) => {

        if (data.success && data.data) {

          setHasPurchasedTrial(data.data.hasPurchasedTrial);

          setTrialPackageId(data.data.trialPackageId);

        }

      })

      .catch(() => setHasPurchasedTrial(false));

  }, [user]);



  const filterTrial = (packages: Package[]) => {

    if (hasPurchasedTrial && trialPackageId) {

      return packages.filter((pkg) => pkg.id !== trialPackageId);

    }

    return packages;

  };



  const filteredAdultPackages = useMemo(

    () => sortPackages(filterTrial(displayAdultPackages)),

    [displayAdultPackages, hasPurchasedTrial, trialPackageId]

  );



  const filteredKidsPackages = useMemo(

    () => sortPackages(filterTrial(displayKidsPackages)),

    [displayKidsPackages, hasPurchasedTrial, trialPackageId]

  );



  const bestValueAdultId = useMemo(

    () => getBestValuePackageId(filteredAdultPackages),

    [filteredAdultPackages]

  );

  const bestValueKidsId = useMemo(

    () => getBestValuePackageId(filteredKidsPackages),

    [filteredKidsPackages]

  );



  const handlePurchase = (pkg: Package) => {

    setSelectedPackage(pkg);

    setIsPaymentModalOpen(true);

  };



  const handleClosePayment = () => {

    setIsPaymentModalOpen(false);

    setSelectedPackage(null);

  };



  const formatPrice = (priceCents: number, currency: string) =>

    new Intl.NumberFormat("en-SG", {

      style: "currency",

      currency: currency || "SGD",

    }).format(priceCents / 100);



  const pricePerClassCents = (pkg: Package) => {

    if (pkg.is_unlimited || pkg.token_count <= 0) return null;

    return Math.round(pkg.price_cents / pkg.token_count);

  };



  const renderPackageCard = (

    pkg: Package,

    bestValueId: string | null,

    dropInPerClassCents: number | null,

    showAge = false

  ) => {

    const isBestValue = bestValueId === pkg.id;

    const isDropIn = !pkg.is_unlimited && pkg.token_count === 1;

    const perClassCents = pricePerClassCents(pkg);

    const perClass = perClassCents != null ? formatPrice(perClassCents, pkg.currency) : null;

    const tagline = cleanPackageTagline(pkg.name, pkg.description);



    const savingsPercent =

      dropInPerClassCents != null && perClassCents != null && pkg.token_count > 1

        ? Math.max(0, Math.round((1 - perClassCents / dropInPerClassCents) * 100))

        : null;



    const purchaseLabel = isDropIn

      ? "Buy drop-in"

      : pkg.is_unlimited

        ? "Get unlimited"

        : `Get ${pkg.token_count} tokens`;



    if (isDropIn) {

      return (

        <button

          key={pkg.id}

          type="button"

          onClick={() => handlePurchase(pkg)}

          className="w-full overflow-hidden rounded-[1.35rem] border border-dashed border-zinc-300 bg-zinc-50/90 p-4 text-left transition-transform active:scale-[0.99] dark:border-zinc-600 dark:bg-zinc-900/50"

        >

          <div className="flex gap-3">

            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white">

              <span className="text-xl font-bold leading-none tabular-nums">1</span>

              <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-80">

                token

              </span>

            </div>

            <div className="min-w-0 flex-1">

              <h3 className="text-base font-bold text-zinc-900 dark:text-white">{pkg.name}</h3>

              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">

                Try one class · {pkg.validity_days}-day validity

              </p>

              <span className="mt-2 inline-flex rounded-full bg-zinc-200/80 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">

                Drop-in

              </span>

            </div>

          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-zinc-200/80 pt-4 dark:border-zinc-700 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Total</p>

              <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white xl:text-4xl">

                {formatPrice(pkg.price_cents, pkg.currency)}

              </p>

            </div>

            <span className="w-full rounded-full bg-zinc-900 py-3.5 text-center text-sm font-bold text-white sm:w-auto sm:px-5 dark:bg-zinc-100 dark:text-zinc-900">

              Buy drop-in

            </span>

          </div>

        </button>

      );

    }



    return (

      <div

        key={pkg.id}

        className={`relative overflow-hidden rounded-[1.35rem] transition-transform active:scale-[0.99] xl:p-0 ${

          isBestValue

            ? "bg-gradient-to-br from-lime-100 via-white to-white shadow-[0_12px_40px_rgba(163,230,53,0.25)] ring-2 ring-lime-400 dark:from-lime-950/40 dark:via-dark dark:to-dark"

            : "border border-zinc-200/80 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-dark"

        }`}

      >

        {isBestValue && (

          <div className="absolute left-0 top-0 h-full w-1 bg-lime-400 xl:hidden" aria-hidden />

        )}



        <div className="p-4 xl:p-6">

          {isBestValue && (

            <span className="mb-3 inline-flex rounded-full bg-lime-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-900">

              Best value

            </span>

          )}



          <div className="flex gap-3">

            <div

              className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ${

                isBestValue

                  ? "bg-zinc-900 text-lime-400"

                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"

              }`}

            >

              <span className="text-xl font-bold leading-none tabular-nums">

                {pkg.is_unlimited ? "∞" : pkg.token_count}

              </span>

              <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-80">

                {pkg.is_unlimited ? "pass" : "tokens"}

              </span>

            </div>



            <div className="min-w-0 flex-1">

              <h3 className="text-base font-bold leading-snug text-zinc-900 dark:text-white xl:text-xl">

                {pkg.name}

              </h3>

              {tagline && (

                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">

                  {tagline}

                </p>

              )}

              {showAge && pkg.age_requirement && (

                <span className="mt-1.5 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">

                  Ages {pkg.age_requirement}

                </span>

              )}

            </div>

          </div>



          <div className="mt-3 flex flex-wrap gap-2">

            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">

              {pkg.validity_days} days validity

            </span>

            {perClass && (

              <span className="rounded-full bg-lime-100 px-2.5 py-1 text-[11px] font-semibold text-lime-900 dark:bg-lime-900/40 dark:text-lime-300">

                {perClass} / class

              </span>

            )}

            {savingsPercent != null && savingsPercent > 0 && (

              <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-lime-400">

                Save {savingsPercent}% vs drop-in

              </span>

            )}

          </div>



          <ul className="mt-3 hidden space-y-1.5 xl:block">

            <li className="text-sm text-zinc-600 dark:text-zinc-400">✓ Book any eligible class</li>

            <li className="text-sm text-zinc-600 dark:text-zinc-400">

              ✓ Valid for {formatPackageValidity(pkg.validity_days)} from purchase

            </li>

          </ul>



          <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between xl:mt-5">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Total</p>

              <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white xl:text-4xl">

                {formatPrice(pkg.price_cents, pkg.currency)}

              </p>

            </div>

            <button

              type="button"

              onClick={() => handlePurchase(pkg)}

              className={`w-full rounded-full px-5 py-3.5 text-sm font-bold transition-transform active:scale-[0.98] sm:w-auto sm:min-w-[9rem] xl:w-full ${

                isBestValue

                  ? "bg-zinc-900 text-white shadow-lg shadow-lime-400/20 hover:bg-zinc-800"

                  : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"

              }`}

            >

              {purchaseLabel}

            </button>

          </div>

        </div>

      </div>

    );

  };



  const renderPackageSection = (

    title: string,

    hint: string,

    packages: Package[],

    bestValueId: string | null,

    showAge = false

  ) => {

    if (packages.length === 0) {

      return (

        <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center dark:border-zinc-800 dark:bg-dark">

          <p className="text-sm text-zinc-600 dark:text-zinc-400">No packages available right now.</p>

        </div>

      );

    }



    const dropInPerClassCents = getDropInPerClassCents(packages);

    const dropIns = packages.filter((p) => !p.is_unlimited && p.token_count === 1);

    const packs = packages.filter((p) => p.is_unlimited || p.token_count !== 1);



    return (

      <>

        {!showCatalogTabs && (

          <div className="mb-4">

            <h2 className="text-lg font-bold text-zinc-900 dark:text-white md:text-xl">{title}</h2>

            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{hint}</p>

          </div>

        )}



        {(dropIns.length > 0 || packs.length > 0) && (

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

            {dropIns.map((pkg) =>

              renderPackageCard(pkg, bestValueId, dropInPerClassCents, showAge)

            )}

            {packs.map((pkg) =>

              renderPackageCard(pkg, bestValueId, dropInPerClassCents, showAge)

            )}

          </div>

        )}

      </>

    );

  };



  const showAdults =

    !showCatalogTabs

      ? filteredAdultPackages.length > 0

      : catalogTab === "adults" && filteredAdultPackages.length > 0;

  const showKids =

    !showCatalogTabs

      ? filteredKidsPackages.length > 0

      : catalogTab === "kids" && filteredKidsPackages.length > 0;



  return (

    <MemberMobilePageShell

      eyebrow="Tokens"

      title="Buy tokens"

      description="One token = one class. Larger packs lower your cost per visit."

      showDescriptionOnMobile

      maxWidthClass="md:max-w-5xl"

    >

      {!isLoadingBalance && (

        <div className="mb-5 flex items-center justify-between gap-3 rounded-[1.25rem] bg-zinc-900 p-4 text-white">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-wide text-lime-400">

              Your balance

            </p>

            <p className="text-3xl font-bold tabular-nums">{tokenBalance?.available ?? 0}</p>

            <p className="text-xs text-zinc-400">tokens ready to book</p>

          </div>

          <Link

            href="/my-packages"

            className="shrink-0 rounded-full border border-zinc-600 px-4 py-2 text-xs font-bold text-white active:scale-[0.98]"

          >

            My packages

          </Link>

        </div>

      )}



      {promo?.hasEarlyBirdDiscount && (

        <div className="mb-5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-800 dark:from-amber-950/40 dark:to-orange-950/40">

          <p className="text-sm font-bold text-amber-900 dark:text-amber-100">

            Early bird — 10% off all packs

          </p>

          {promo.earlyBirdDaysLeft != null && (

            <p className="text-xs text-amber-800 dark:text-amber-300">

              {promo.earlyBirdDaysLeft} day{promo.earlyBirdDaysLeft === 1 ? "" : "s"} left

            </p>

          )}

        </div>

      )}



      {hasPackageLoadError && (

        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">

          <p className="font-semibold">Unable to load token packages right now.</p>

          <p className="mt-1 text-sm">{packageLoadError?.message || "Please try again."}</p>

          <button

            type="button"

            onClick={() => {

              refetchAdults();

              refetchKids();

            }}

            className="mt-3 inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white"

          >

            Retry

          </button>

        </div>

      )}



      {showCatalogTabs && (

        <div className="mb-5 flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">

          {(

            [

              { id: "adults" as const, label: "Adults" },

              { id: "kids" as const, label: "Kids 5–12" },

            ] as const

          ).map((tab) => (

            <button

              key={tab.id}

              type="button"

              onClick={() => setCatalogTab(tab.id)}

              className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-colors ${

                catalogTab === tab.id

                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"

                  : "text-zinc-600 dark:text-zinc-400"

              }`}

            >

              {tab.label}

            </button>

          ))}

        </div>

      )}



      {isLoading ? (

        <div className="flex items-center justify-center py-16">

          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-lime-400" />

        </div>

      ) : (

        <section className="mb-10">

          {showAdults &&

            renderPackageSection(

              "Adult packages",

              "Pick a pack that fits how often you dance",

              filteredAdultPackages,

              bestValueAdultId

            )}

          {showKids &&

            renderPackageSection(

              "Kids packages",

              "Parent or guardian must attend",

              filteredKidsPackages,

              bestValueKidsId,

              true

            )}

          {!showAdults && !showKids && !hasPackageLoadError && (

            <p className="text-center text-sm text-zinc-500">No packages to show for your account.</p>

          )}

        </section>

      )}



      <section className="pb-4">

        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Good to know</h2>

        <div className="mt-3 space-y-2">

          {GUIDELINES.map((item) => (

            <details

              key={item.title}

              className="group overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:bg-dark"

            >

              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3.5 text-sm font-semibold text-zinc-900 marker:content-none dark:text-white [&::-webkit-details-marker]:hidden">

                {item.title}

                <span className="text-zinc-400 transition-transform group-open:rotate-180">▾</span>

              </summary>

              <p className="border-t border-zinc-100 px-4 pb-3.5 pt-2 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">

                {item.body}

              </p>

            </details>

          ))}

        </div>

      </section>



      <PaymentModal

        isOpen={isPaymentModalOpen}

        onClose={handleClosePayment}

        selectedPackage={selectedPackage}

      />

    </MemberMobilePageShell>

  );

}


