"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal/Modal";
import { Check, Clock, Loader2 } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { getTrialBookingDisplayTitle, getTrialBookingEffectiveAgeGroup } from "@/lib/trial-booking-display";
import { isBookingWindowOpen } from "@/lib/booking-window";

type PublicClass = {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  instructor_name: string | null;
  capacity: number;
  booked_count?: number;
  age_group?: "adult" | "kid" | "all" | null;
  is_outdoor?: boolean;
};

function formatYmdLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return formatYmdLocal(dt);
}

function getSingaporeDateKey(scheduledAt: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore" }).format(new Date(scheduledAt));
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatShortWeekday(ymd: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(parseYmd(ymd));
}

type StartClassPickModalProps = {
  isOpen: boolean;
  onClose: () => void;
  venue: "studio" | "outdoor";
  onConfirm: (classId: string) => void;
  confirming?: boolean;
  confirmError?: string | null;
};

export default function StartClassPickModal({
  isOpen,
  onClose,
  venue,
  onConfirm,
  confirming = false,
  confirmError = null,
}: StartClassPickModalProps) {
  const [classes, setClasses] = useState<PublicClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selected, setSelected] = useState<PublicClass | null>(null);

  const minDate = formatYmdLocal(new Date());
  const maxDate = addDaysYmd(minDate, 21);

  useEffect(() => {
    if (!isOpen) {
      setSelected(null);
      setSelectedDate(null);
      setLoadError(null);
      return;
    }

    let active = true;
    setLoading(true);
    fetch(`/api/classes/public?from=${minDate}&to=${maxDate}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (!active) return;
        if (res?.success && Array.isArray(res.data)) {
          setClasses(res.data);
        } else {
          setLoadError("Could not load classes. Please try again.");
        }
      })
      .catch(() => {
        if (active) setLoadError("Could not load classes. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, minDate, maxDate]);

  const eligible = useMemo(() => {
    const wantsOutdoor = venue === "outdoor";
    return classes
      .filter((c) => Boolean(c.is_outdoor) === wantsOutdoor)
      .filter((c) => getTrialBookingEffectiveAgeGroup(c.title, c.age_group) !== "kid")
      .filter((c) => isBookingWindowOpen(c.scheduled_at))
      .filter((c) => (c.capacity ?? 0) - (c.booked_count ?? 0) > 0)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [classes, venue]);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    for (const c of eligible) dates.add(getSingaporeDateKey(c.scheduled_at));
    return dates;
  }, [eligible]);

  useEffect(() => {
    if (!isOpen || selectedDate || availableDates.size === 0) return;
    const first = Array.from(availableDates).sort()[0];
    if (first) setSelectedDate(first);
  }, [isOpen, availableDates, selectedDate]);

  const filtered = useMemo(() => {
    if (!selectedDate) return [];
    return eligible.filter((c) => getSingaporeDateKey(c.scheduled_at) === selectedDate);
  }, [eligible, selectedDate]);

  useEffect(() => {
    if (selected && !filtered.some((c) => c.id === selected.id)) setSelected(null);
  }, [filtered, selected]);

  const sortedDates = useMemo(() => Array.from(availableDates).sort(), [availableDates]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={confirming ? () => {} : onClose}
      title="Pick your trial class"
      description="Choose a session, then continue to secure checkout."
      size="2xl"
      showCloseButton={!confirming}
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {selected && (
            <p className="truncate text-xs font-semibold text-gray-600">
              {formatTime(selected.scheduled_at)} · {getTrialBookingDisplayTitle(selected.title)}
            </p>
          )}
          <button
            type="button"
            disabled={!selected || confirming}
            onClick={() => selected && onConfirm(selected.id)}
            className="inline-flex w-full items-center justify-center gap-2 bg-lime-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white disabled:opacity-40 sm:ml-auto sm:w-auto"
          >
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Starting checkout…
              </>
            ) : (
              "Continue to payment"
            )}
          </button>
        </div>
      }
    >
      <div className="max-h-[min(62vh,520px)] overflow-y-auto pr-1">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm font-semibold text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin text-lime-600" />
            Loading classes…
          </div>
        ) : loadError ? (
          <p className="py-8 text-center text-sm font-semibold text-red-700">{loadError}</p>
        ) : eligible.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-gray-700">
            No trial sessions are open right now. Try again later or contact us on WhatsApp.
          </p>
        ) : (
          <>
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Pick a day</p>
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sortedDates.map((ymd) => {
                const isSelected = selectedDate === ymd;
                return (
                  <button
                    key={ymd}
                    type="button"
                    onClick={() => {
                      setSelectedDate(ymd);
                      setSelected(null);
                    }}
                    className={`flex min-w-[4.25rem] shrink-0 flex-col items-center rounded-full px-3 py-2.5 transition-colors ${
                      isSelected ? "bg-black text-white" : "bg-[#f6f4ee] text-gray-900 ring-1 ring-black/10"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                      {formatShortWeekday(ymd)}
                    </span>
                    <span className="text-base font-black leading-none">{parseYmd(ymd).getDate()}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              {filtered.map((c) => {
                const isSelected = selected?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelected(isSelected ? null : c)}
                    className={`flex w-full gap-3 border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-lime-600 bg-lime-500/10 ring-2 ring-lime-600/25"
                        : "border-black/10 bg-white hover:border-black/25"
                    }`}
                  >
                    <div className="flex w-14 shrink-0 flex-col items-center justify-center">
                      <p className="text-sm font-black leading-none text-gray-900">
                        {formatTime(c.scheduled_at).split(" ")[0]}
                      </p>
                      {isSelected && <Check className="mt-1.5 h-4 w-4 text-lime-600" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black uppercase leading-snug tracking-tight text-gray-900 sm:text-base">
                        {getTrialBookingDisplayTitle(c.title)}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                        <Clock className="inline h-3.5 w-3.5 text-lime-600" />
                        {formatTime(c.scheduled_at)} · {c.duration_minutes} min · {c.location || "Studio"}
                      </p>
                      {c.instructor_name && (
                        <p className="mt-1 text-xs font-medium text-gray-600">with {c.instructor_name}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {confirmError && (
          <div className="mt-4 border border-red-300 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-800">
            {confirmError}
          </div>
        )}
      </div>
    </Modal>
  );
}
