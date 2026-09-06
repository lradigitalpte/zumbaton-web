"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronRight, Clock, ShieldAlert } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { getTrialBookingDisplayTitle, getTrialBookingEffectiveAgeGroup } from "@/lib/trial-booking-display";
import { isBookingWindowOpen } from "@/lib/booking-window";

type PublicClass = {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  room_name: string | null;
  capacity: number;
  booked_count?: number;
  instructor_id?: string | null;
  instructor_name: string | null;
  age_group?: "adult" | "kid" | "all" | null;
  is_outdoor?: boolean;
};

type InstructorProfile = {
  id: string;
  name: string;
  avatar_url: string | null;
};

function getInitials(name: string | null): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatYmdLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getSingaporeDateKey(scheduledAt: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
  }).format(new Date(scheduledAt));
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDaysYmd(ymd: string, days: number): string {
  const d = parseYmd(ymd);
  d.setDate(d.getDate() + days);
  return formatYmdLocal(d);
}

function formatCalendarLabel(ymd: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Singapore",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(parseYmd(ymd));
}

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ ymd: string; day: number } | null> = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const ymd = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ ymd, day });
  }
  return cells;
}

function formatShortWeekday(ymd: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(parseYmd(ymd));
}

function PickClassDateStrip({
  selectedDate,
  onSelectDate,
  availableDates,
}: {
  selectedDate: string | null;
  onSelectDate: (ymd: string) => void;
  availableDates: Set<string>;
}) {
  const dates = useMemo(() => Array.from(availableDates).sort(), [availableDates]);

  if (dates.length === 0) return null;

  return (
    <div className="snap-x snap-mandatory flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {dates.map((ymd) => {
        const isSelected = selectedDate === ymd;
        return (
          <button
            key={ymd}
            type="button"
            onClick={() => onSelectDate(ymd)}
            className={`snap-start relative flex min-w-[4.25rem] shrink-0 flex-col items-center rounded-full px-3 py-2.5 transition-colors ${
              isSelected
                ? "bg-black text-white"
                : "bg-white text-gray-900 ring-1 ring-black/10"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
              {formatShortWeekday(ymd)}
            </span>
            <span className="text-base font-black leading-none">
              {parseYmd(ymd).getDate()}
            </span>
            {!isSelected && (
              <span
                className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-lime-600"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function PickClassCalendar({
  selectedDate,
  onSelectDate,
  availableDates,
  minDate,
  maxDate,
}: {
  selectedDate: string | null;
  onSelectDate: (ymd: string) => void;
  availableDates: Set<string>;
  minDate: string;
  maxDate: string;
}) {
  const initial = selectedDate ? parseYmd(selectedDate) : parseYmd(minDate);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const canGoPrev = useMemo(() => {
    const prevMonthEnd = new Date(viewYear, viewMonth, 0);
    return formatYmdLocal(prevMonthEnd) >= minDate;
  }, [viewYear, viewMonth, minDate]);

  const canGoNext = useMemo(() => {
    const nextMonthStart = new Date(viewYear, viewMonth + 1, 1);
    return formatYmdLocal(nextMonthStart) <= maxDate;
  }, [viewYear, viewMonth, maxDate]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-black uppercase tracking-widest text-gray-900">
          {formatMonthYear(viewYear, viewMonth)}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const d = new Date(viewYear, viewMonth - 1, 1);
              setViewYear(d.getFullYear());
              setViewMonth(d.getMonth());
            }}
            disabled={!canGoPrev}
            className="border border-black/15 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-gray-700 hover:border-black disabled:opacity-30"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => {
              const d = new Date(viewYear, viewMonth + 1, 1);
              setViewYear(d.getFullYear());
              setViewMonth(d.getMonth());
            }}
            disabled={!canGoNext}
            className="border border-black/15 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-gray-700 hover:border-black disabled:opacity-30"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 text-[10px] font-black uppercase tracking-widest text-gray-400"
          >
            {label}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          const hasClasses = availableDates.has(cell.ymd);
          const inRange = cell.ymd >= minDate && cell.ymd <= maxDate;
          const isSelected = selectedDate === cell.ymd;
          const isClickable = hasClasses && inRange;

          return (
            <button
              key={cell.ymd}
              type="button"
              disabled={!isClickable}
              onClick={() => onSelectDate(cell.ymd)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-sm text-sm font-bold transition-colors ${
                isSelected
                  ? "bg-black text-white"
                  : isClickable
                    ? "bg-[#f6f4ee] text-gray-900 hover:bg-lime-500/30"
                    : "text-gray-300"
              }`}
            >
              {cell.day}
              {hasClasses && inRange && !isSelected && (
                <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-lime-600" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] font-medium text-gray-500">
        Dots show days with available classes. Tap a day to see sessions.
      </p>
    </div>
  );
}

export default function PickClassClient() {
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get("payment_id") || "";

  const [status, setStatus] = useState<{
    loading: boolean;
    ok: boolean;
    isPaid: boolean;
    isQuickTrial: boolean;
    selectedClassId: string | null;
    error?: string;
  }>({ loading: true, ok: false, isPaid: false, isQuickTrial: false, selectedClassId: null });

  const [classes, setClasses] = useState<PublicClass[]>([]);
  const [instructorProfiles, setInstructorProfiles] = useState<Record<string, InstructorProfile>>({});
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selected, setSelected] = useState<PublicClass | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const minDate = formatYmdLocal(new Date());
  const maxDate = addDaysYmd(minDate, 21);

  useEffect(() => {
    let active = true;
    if (!paymentId) {
      setStatus({
        loading: false,
        ok: false,
        isPaid: false,
        isQuickTrial: false,
        selectedClassId: null,
        error: "Missing payment id",
      });
      return;
    }
    fetch(`/api/start/payment-status?payment_id=${encodeURIComponent(paymentId)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (!active) return;
        if (!res?.success) {
          setStatus({
            loading: false,
            ok: false,
            isPaid: false,
            isQuickTrial: false,
            selectedClassId: null,
            error: res?.error || "Unable to verify payment",
          });
          return;
        }
        setStatus({
          loading: false,
          ok: true,
          isPaid: res.data?.isPaid === true,
          isQuickTrial: res.data?.isQuickTrial === true,
          selectedClassId: res.data?.selectedClassId ?? null,
        });
      })
      .catch(() => {
        if (!active) return;
        setStatus({
          loading: false,
          ok: false,
          isPaid: false,
          isQuickTrial: false,
          selectedClassId: null,
          error: "Unable to verify payment",
        });
      });
    return () => {
      active = false;
    };
  }, [paymentId]);

  useEffect(() => {
    let active = true;
    if (!status.ok || !status.isPaid || !status.isQuickTrial || status.selectedClassId) return;

    const from = formatYmdLocal(new Date());
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 21);
    const to = formatYmdLocal(toDate);

    setLoadingClasses(true);
    fetch(`/api/classes/public?from=${from}&to=${to}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (!active) return;
        if (res?.success && Array.isArray(res.data)) {
          setClasses(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!active) return;
        setLoadingClasses(false);
      });

    return () => {
      active = false;
    };
  }, [status.ok, status.isPaid, status.isQuickTrial, status.selectedClassId]);

  useEffect(() => {
    let active = true;
    if (classes.length === 0) {
      setInstructorProfiles({});
      return;
    }

    const instructorIds = new Set<string>();
    const instructorNames = new Set<string>();
    for (const cls of classes) {
      if (cls.instructor_id) instructorIds.add(cls.instructor_id);
      if (cls.instructor_name) {
        cls.instructor_name.split(",").forEach((name) => {
          const trimmed = name.trim();
          if (trimmed) instructorNames.add(trimmed);
        });
      }
    }

    if (instructorIds.size === 0 && instructorNames.size === 0) return;

    const params = new URLSearchParams();
    if (instructorIds.size > 0) params.append("ids", Array.from(instructorIds).join(","));
    if (instructorNames.size > 0) params.append("names", Array.from(instructorNames).join(","));

    fetch(`/api/instructors/profiles?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((result) => {
        if (!active || !result?.success || !Array.isArray(result.data)) return;
        const profiles: Record<string, InstructorProfile> = {};
        const requestedNames = Array.from(instructorNames);
        for (const profile of result.data) {
          const profileData: InstructorProfile = {
            id: profile.id,
            name: profile.name,
            avatar_url: profile.avatar_url ?? null,
          };
          profiles[profile.id] = profileData;
          profiles[profile.name] = profileData;
          const profileNameNorm = (profile.name || "").toLowerCase().trim().replace(/\s+/g, " ");
          for (const name of requestedNames) {
            const nameNorm = name.toLowerCase().trim().replace(/\s+/g, " ");
            if (!nameNorm) continue;
            if (
              profileNameNorm === nameNorm ||
              profileNameNorm.startsWith(`${nameNorm} `) ||
              nameNorm.startsWith(`${profileNameNorm} `)
            ) {
              profiles[name] = profileData;
            }
          }
        }
        setInstructorProfiles(profiles);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [classes]);

  const eligible = useMemo(() => {
    return classes
      .filter((c) => c.is_outdoor !== true)
      .filter((c) => getTrialBookingEffectiveAgeGroup(c.title, c.age_group) !== "kid")
      .filter((c) => isBookingWindowOpen(c.scheduled_at))
      .filter((c) => (c.capacity ?? 0) - (c.booked_count ?? 0) > 0)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [classes]);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    for (const c of eligible) {
      dates.add(getSingaporeDateKey(c.scheduled_at));
    }
    return dates;
  }, [eligible]);

  const filtered = useMemo(() => {
    if (!selectedDate) return [];
    return eligible.filter((c) => getSingaporeDateKey(c.scheduled_at) === selectedDate);
  }, [eligible, selectedDate]);

  useEffect(() => {
    if (selectedDate || availableDates.size === 0) return;
    const first = Array.from(availableDates).sort()[0];
    if (first) setSelectedDate(first);
  }, [availableDates, selectedDate]);

  useEffect(() => {
    if (selected && !filtered.some((c) => c.id === selected.id)) {
      setSelected(null);
    }
  }, [filtered, selected]);

  const confirm = async () => {
    if (!selected) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/start/select-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, classId: selected.id }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setSubmitError(json?.error || "Failed to confirm class. Please try again.");
        return;
      }
      router.replace(`/start/success?payment_id=${encodeURIComponent(paymentId)}`);
    } catch {
      setSubmitError("Failed to confirm class. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f4ee] pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-gray-900 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f6f4ee]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
          <Link
            href="/explore"
            className="relative block h-8 w-20 shrink-0 sm:h-11 sm:w-32"
            aria-label="One Step Fitness home"
          >
            <Image
              src="/logo/One step fitness logo.png"
              alt="One Step Fitness"
              fill
              className="object-contain object-left"
              sizes="96px"
              priority
            />
          </Link>
          <Link
            href={paymentId ? `/start/success?payment_id=${encodeURIComponent(paymentId)}` : "/start"}
            className="text-[10px] font-bold text-gray-500 underline sm:text-[11px] sm:font-black sm:uppercase sm:tracking-widest sm:no-underline sm:hover:text-black"
          >
            Skip for now
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6 md:py-10 lg:py-12">
        <div className="mb-4 md:mb-8 md:border md:border-black/10 md:bg-white md:p-8">
          <h1 className="text-xl font-black uppercase italic tracking-tighter sm:text-3xl">
            Pick your trial class
          </h1>
          <p className="mt-1.5 text-sm text-gray-600 md:mt-2 md:font-medium">
            Choose a day, then tap a session. Or we&apos;ll message you to schedule.
          </p>
        </div>

        {status.loading ? (
          <div className="border border-black/10 bg-white p-6 text-sm font-semibold text-gray-600">
            Checking payment…
          </div>
        ) : !status.ok ? (
          <div className="border border-red-300 bg-red-50 p-6 text-sm font-semibold text-red-800">
            <div className="mb-2 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> {status.error || "Unable to verify payment"}
            </div>
            <Link href="/start" className="underline">
              Back to start
            </Link>
          </div>
        ) : !status.isQuickTrial ? (
          <div className="border border-black/10 bg-white p-6 text-sm font-semibold text-gray-700">
            This payment is not eligible for trial class selection.
          </div>
        ) : !status.isPaid ? (
          <div className="border border-black/10 bg-white p-6 text-sm font-semibold text-gray-700">
            Payment is still processing. Please refresh in a moment.
          </div>
        ) : status.selectedClassId ? (
          <div className="border border-lime-600/30 bg-white p-6">
            <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-lime-700">
              <Check className="h-4 w-4" /> Class selected
            </div>
            <p className="text-sm font-medium text-gray-600">
              You&apos;re done. We&apos;ll message you to confirm.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/start/success?payment_id=${encodeURIComponent(paymentId)}`}
                className="bg-black px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-lime-500 hover:text-black"
              >
                View confirmation <ChevronRight className="ml-2 inline h-4 w-4" />
              </Link>
              <Link
                href="/explore"
                className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-700 hover:text-black underline"
              >
                Visit site
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
              {/* Mobile: sticky date strip */}
              <div className="sticky top-[49px] z-20 -mx-4 border-b border-black/10 bg-[#f6f4ee]/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 md:top-[57px] lg:static lg:mx-0 lg:border lg:border-black/10 lg:bg-white lg:p-6 lg:backdrop-blur-none">
                <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-gray-500 lg:mb-3 lg:text-xs lg:text-gray-600">
                  Pick a day
                </p>
                <div className="lg:hidden">
                  <PickClassDateStrip
                    selectedDate={selectedDate}
                    onSelectDate={(ymd) => {
                      setSelectedDate(ymd);
                      setSelected(null);
                    }}
                    availableDates={availableDates}
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-gray-500">
                    <span>Swipe to see more dates →</span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-lime-600" aria-hidden="true" />
                      Days with classes
                    </span>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <PickClassCalendar
                    selectedDate={selectedDate}
                    onSelectDate={(ymd) => {
                      setSelectedDate(ymd);
                      setSelected(null);
                    }}
                    availableDates={availableDates}
                    minDate={minDate}
                    maxDate={maxDate}
                  />
                </div>
              </div>

              <div className="mt-4 min-w-0 lg:mt-0">
                <div className="mb-3 flex items-baseline justify-between gap-3 lg:mb-5">
                  <div className="min-w-0">
                    {selectedDate ? (
                      <p className="truncate text-base font-bold text-gray-900 lg:text-sm lg:font-semibold lg:text-gray-700">
                        {formatCalendarLabel(selectedDate)}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-gray-600">Select a day</p>
                    )}
                  </div>
                  <p className="shrink-0 text-xs font-bold text-gray-500">
                    {loadingClasses
                      ? "Loading…"
                      : selectedDate
                        ? `${filtered.length} class${filtered.length === 1 ? "" : "es"}`
                        : ""}
                  </p>
                </div>

            {eligible.length === 0 && !loadingClasses ? (
              <div className="rounded-lg border border-black/10 bg-white p-5 text-sm font-semibold text-gray-700 lg:p-6">
                No trial sessions available right now. No worries, we&apos;ll message you to schedule.
              </div>
            ) : !selectedDate ? (
              <div className="rounded-lg border border-black/10 bg-white p-6 text-center text-sm text-gray-600">
                Choose a day above to see classes.
              </div>
            ) : filtered.length === 0 && !loadingClasses ? (
              <div className="rounded-lg border border-black/10 bg-white p-5 text-sm font-semibold text-gray-700 lg:p-6">
                No classes this day. Try another date.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-black/10 bg-white lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent">
                {filtered.map((c) => {
                  const isSelected = selected?.id === c.id;
                  const instructorProfile =
                    (c.instructor_id && instructorProfiles[c.instructor_id]) ||
                    (c.instructor_name && instructorProfiles[c.instructor_name]) ||
                    null;
                  const instructorAvatar = instructorProfile?.avatar_url ?? null;
                  const instructorInitials = getInitials(c.instructor_name);
                  const timeLabel = formatTime(c.scheduled_at);
                  const timeParts = timeLabel.split(" ");
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelected(isSelected ? null : c)}
                      className={`flex w-full gap-3 border-b border-black/8 p-4 text-left transition-colors last:border-b-0 lg:flex-col lg:gap-0 lg:border lg:p-5 lg:last:border-b ${
                        isSelected
                          ? "bg-lime-500/10 lg:border-lime-600 lg:ring-2 lg:ring-lime-600/30"
                          : "hover:bg-black/[0.02] lg:border-black/10 lg:bg-white lg:hover:border-black/30 lg:hover:shadow-sm"
                      }`}
                    >
                      {/* Mobile: time column */}
                      <div className="flex w-14 shrink-0 flex-col items-center justify-center lg:hidden">
                        <p className="text-sm font-black leading-none text-gray-900">{timeParts[0]}</p>
                        {timeParts[1] && (
                          <p className="mt-0.5 text-[10px] font-bold text-gray-500">{timeParts[1]}</p>
                        )}
                        {isSelected && <Check className="mt-1.5 h-4 w-4 text-lime-600" />}
                      </div>

                      <div className="min-w-0 flex-1 lg:w-full">
                        {/* Desktop: time row */}
                        <div className="mb-0 hidden items-center justify-between gap-3 lg:mb-3 lg:flex">
                          <p className="text-xs font-black uppercase tracking-widest text-gray-700">
                            <Clock className="mr-1.5 inline h-4 w-4 text-lime-600" />
                            {formatTime(c.scheduled_at)}
                          </p>
                          {isSelected && (
                            <span className="shrink-0 bg-lime-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black">
                              Selected
                            </span>
                          )}
                        </div>

                        <p className="text-[15px] font-black uppercase leading-snug tracking-tight text-gray-900 sm:text-lg lg:text-xl lg:italic lg:leading-tight lg:tracking-tighter">
                          {getTrialBookingDisplayTitle(c.title)}
                        </p>

                        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 lg:mt-2 lg:gap-x-3 lg:text-[11px] lg:font-bold lg:uppercase lg:tracking-widest">
                          <span>{c.duration_minutes} min</span>
                          <span className="text-gray-300">·</span>
                          <span>{c.location || "Studio"}</span>
                        </p>

                        {c.instructor_name && (
                          <div className="mt-2 flex items-center gap-2 lg:mt-3 lg:border-t lg:border-black/5 lg:pt-3">
                            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-200 lg:h-9 lg:w-9">
                              {instructorAvatar ? (
                                <Image
                                  src={instructorAvatar}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="36px"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-[8px] font-black text-gray-600 lg:text-[9px]">
                                  {instructorInitials}
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs font-medium text-gray-700 lg:text-sm lg:font-semibold lg:text-gray-800">
                              {c.instructor_name}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Mobile: check on right if not in time column */}
                      {!isSelected && (
                        <div className="flex w-5 shrink-0 items-center justify-center lg:hidden">
                          <div className="h-5 w-5 rounded-full border-2 border-black/15" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
              </div>
            </div>

            {submitError && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {submitError}
              </div>
            )}

            {/* Mobile sticky footer */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:static lg:mt-8 lg:flex lg:items-center lg:justify-between lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              {selected && (
                <p className="mb-2 truncate text-center text-xs text-gray-600 lg:hidden">
                  <span className="font-bold text-gray-900">
                    {formatTime(selected.scheduled_at)}
                  </span>
                  {" · "}
                  {getTrialBookingDisplayTitle(selected.title)}
                </p>
              )}
              <button
                type="button"
                onClick={confirm}
                disabled={!selected || submitting}
                className="w-full bg-black py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-lime-500 hover:text-black disabled:opacity-40 lg:w-auto lg:px-10"
              >
                {submitting ? "Confirming…" : selected ? "Confirm this class" : "Tap a class above"}
              </button>
              <Link
                href={`/start/success?payment_id=${encodeURIComponent(paymentId)}`}
                className="mt-2 hidden text-center text-xs font-bold text-gray-500 underline lg:inline-block"
              >
                Skip, we&apos;ll message you
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

