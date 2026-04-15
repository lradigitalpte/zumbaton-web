"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { ClassesHero, ClassesCTA } from "@/components/Classes";
import { ArrowRight, CalendarClock, MapPin } from "lucide-react";

type FiestaPackage = "1_session" | "2_sessions" | "4_sessions";

const FIESTA_PACKAGES: Record<FiestaPackage, { sessions: number; priceCents: number; label: string }> = {
  "1_session": { sessions: 1, priceCents: 2800, label: "1 session" },
  "2_sessions": { sessions: 2, priceCents: 5400, label: "2 sessions" },
  "4_sessions": { sessions: 4, priceCents: 10500, label: "4 sessions" },
};

export default function ZtFiestaPage() {
  const toast = useToast();
  const [selectedPackage, setSelectedPackage] = useState<FiestaPackage>("1_session");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    participantName: "",
    notes: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/zt-fiesta/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageOption: selectedPackage,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          participantName: form.participantName,
          notes: form.notes,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit your request.");
      }

      toast.success("Request submitted. Our team will confirm your sessions shortly.");
      setForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        participantName: "",
        notes: "",
      });
      setSelectedPackage("1_session");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ClassesHero
        title="ZT Fiesta"
        breadcrumbs={[
          { label: "Home", href: "/explore" },
          { label: "Classes", href: "/classes" },
          { label: "ZT Fiesta" },
        ]}
      />

      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-dark dark:to-gray-900">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">West Side Outdoor Classes</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Submit your package request and our team will manually confirm payment and attendance.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <CalendarClock className="w-4 h-4" /> Manual Tracking Flow
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">No online payment required on checkout.</p>
            </div>
            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Validity</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">All ZT Fiesta packages are valid for 1 month.</p>
            </div>
            <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4">
              <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Outdoor Program
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Designed for west side community classes.</p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 xl:grid-cols-5 gap-7">
            <div className="xl:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Choose Package</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(Object.keys(FIESTA_PACKAGES) as FiestaPackage[]).map((key) => {
                  const option = FIESTA_PACKAGES[key];
                  const selected = selectedPackage === key;
                  return (
                    <label
                      key={key}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        selected
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md"
                          : "border-gray-200 dark:border-gray-700 hover:border-green-400"
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        checked={selected}
                        onChange={() => setSelectedPackage(key)}
                      />
                      <p className="font-semibold text-gray-900 dark:text-white">{option.label}</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        ${(option.priceCents / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.sessions} session{option.sessions > 1 ? "s" : ""}</p>
                    </label>
                  );
                })}
              </div>

              <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-5">
                <h4 className="font-semibold text-gray-900 dark:text-white">Looking for other programs?</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/classes/groove-stepper" className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200">Groove Stepper</Link>
                  <Link href="/classes/zumbaton" className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200">ZUMBATON</Link>
                  <Link href="/classes/zumbuddies" className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200">ZUMBUDDIES</Link>
                  <Link href="/zumfamilia" className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm">ZumFamilia</Link>
                </div>
              </div>
            </div>

            <div className="xl:col-span-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 h-fit">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Request</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Package selected: <span className="font-semibold">{FIESTA_PACKAGES[selectedPackage].label}</span>
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Customer Email *</label>
                  <input
                    type="email"
                    required
                    value={form.customerEmail}
                    onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Customer Phone *</label>
                  <input
                    required
                    value={form.customerPhone}
                    onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Participant Name</label>
                  <input
                    value={form.participantName}
                    onChange={(e) => setForm((prev) => ({ ...prev, participantName: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2.5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3.5"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <ClassesCTA />
    </>
  );
}
