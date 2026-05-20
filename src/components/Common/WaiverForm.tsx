"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, FileText, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WaiverFormProps {
  participantName: string;
  onAgreementChange: (agreed: boolean, details: { nricLast4: string; signature: string; guardianName?: string; guardianSignature?: string }) => void;
  isMinor?: boolean;
  /** Wider layout for duo checkout and full-width sections */
  wide?: boolean;
  /** Hide the built-in title (when the parent section already has a heading) */
  hideTitle?: boolean;
  /** When true, NRIC last 4 is not required (signature + agreement still required) */
  nricOptional?: boolean;
}

export default function WaiverForm({
  participantName,
  onAgreementChange,
  isMinor = false,
  wide = false,
  hideTitle = false,
  nricOptional = false,
}: WaiverFormProps) {
  const [agreed, setAgreed] = useState(false);
  const [nricLast4, setNricLast4] = useState("");
  const [signature, setSignature] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianSignature, setGuardianSignature] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Pre-fill signature with participantName if it changes and signature is empty
  useEffect(() => {
    if (participantName && !signature) {
      setSignature(participantName);
      onAgreementChange(agreed, {
        nricLast4,
        signature: participantName,
        guardianName: isMinor ? guardianName : undefined,
        guardianSignature: isMinor ? guardianSignature : undefined,
      });
    }
  }, [participantName]);

  const handleAgreedChange = (val: boolean) => {
    setAgreed(val);
    onAgreementChange(val, {
      nricLast4,
      signature,
      guardianName: isMinor ? guardianName : undefined,
      guardianSignature: isMinor ? guardianSignature : undefined,
    });
  };

  const handleDetailChange = (field: string, value: string) => {
    let updatedDetails = {
      nricLast4,
      signature,
      guardianName: isMinor ? guardianName : undefined,
      guardianSignature: isMinor ? guardianSignature : undefined,
    };

    if (field === "nric") {
      setNricLast4(value);
      updatedDetails.nricLast4 = value;
    } else if (field === "signature") {
      setSignature(value);
      updatedDetails.signature = value;
    } else if (field === "guardianName") {
      setGuardianName(value);
      updatedDetails.guardianName = value;
    } else if (field === "guardianSignature") {
      setGuardianSignature(value);
      updatedDetails.guardianSignature = value;
    }

    onAgreementChange(agreed, updatedDetails);
  };

  const today = new Date().toLocaleDateString('en-SG', { day: '2-digit', month: 'long', year: 'numeric' });

  const waiverText = (
    <div className="space-y-4 font-medium uppercase tracking-wider text-xs leading-relaxed">
      <p className="font-black text-gray-900 dark:text-white">
        This is an important document which affects your legal rights and obligations. You must read it carefully prior to booking your trial classes. Please acknowledge this form prior to the booking to make yourself aware of the risks of participating. I agree to this release of claims, waiver of liability and assumption of risk.
      </p>
      <p>
        1) I understand the physical nature of the class. I declare, I DO NOT have any illness, injury or any other physical disability which may cause me injury or death whilst participating in the class.
      </p>
      <p>
        2) I accept the risk and responsibility for any injury, death or property damage resulting from my participation in the class.
      </p>
      <p>
        3) I acknowledge that I am responsible for my own medical and ambulance insurance cover.
      </p>
      <p>
        4) I acknowledge that in the event I am injured or my property is damaged, I will bring no claim, legal or otherwise, against ZUMBATON & the trainers.
      </p>
      <p>
        5) I acknowledge that my image and video will be taken by a photographer and videographer and I consent for the images and videos to be used for social media and other promotional materials.
      </p>
    </div>
  );

  return (
    <div
      className={`bg-white dark:bg-zinc-900 border-2 border-black/5 dark:border-white/5 space-y-8 w-full min-w-0 max-w-full overflow-x-hidden box-border ${
        wide ? "p-5 sm:p-8 md:p-10 xl:p-12 max-w-full" : "p-5 sm:p-6 md:p-8 max-w-full"
      }`}
    >
      <div className="flex flex-col gap-4 mb-2 min-w-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 bg-lime-500/10 text-lime-600 dark:text-lime-400 flex items-center justify-center rounded-full shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {!hideTitle && (
            <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white min-w-0 break-words">
              Liability Waiver
            </h3>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex w-full max-w-full min-w-0 items-center justify-center gap-2 px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-[0.18em] transition-all shadow-lg shadow-red-600/20 text-center leading-snug whitespace-normal break-words"
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="min-w-0">Click to Read Disclaimer</span>
        </button>
      </div>

      <div
        className={
          wide
            ? "grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8"
            : "grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3"
        }
      >
        <div className={`min-w-0 space-y-2 ${wide ? "xl:col-span-3" : ""}`}>
          <label className="block text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 break-words">
            Last 4 characters of NRIC{nricOptional ? " (optional)" : " *"}
          </label>
          <input
            type="text"
            maxLength={4}
            value={nricLast4}
            onChange={(e) => handleDetailChange("nric", e.target.value.toUpperCase())}
            placeholder="E.G. 123A"
            className={`w-full min-w-0 max-w-full box-border bg-white dark:bg-black border border-black/10 dark:border-white/10 px-3 sm:px-4 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors ${
              wide ? "xl:py-4" : ""
            }`}
          />
        </div>
        <div className={`min-w-0 space-y-2 ${wide ? "xl:col-span-6" : ""}`}>
          <label className="block text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 break-words">
            Signature (Type Full Name) *
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => handleDetailChange("signature", e.target.value)}
            placeholder={participantName || "YOUR FULL NAME"}
            style={{ fontFamily: "'Dancing Script', cursive" }}
            className={`w-full min-w-0 max-w-full box-border bg-white dark:bg-black border border-black/10 dark:border-white/10 px-3 sm:px-4 py-3 font-bold text-lime-600 dark:text-lime-400 focus:border-lime-500 outline-none transition-colors ${
              wide
                ? "text-xl sm:text-2xl md:text-3xl xl:text-3xl 2xl:text-4xl xl:py-4"
                : "text-xl sm:text-2xl"
            }`}
          />
        </div>
        <div className={`min-w-0 space-y-2 ${wide ? "xl:col-span-3" : ""}`}>
          <label className="block text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500">
            Date
          </label>
          <input
            type="text"
            readOnly
            value={today}
            className={`w-full min-w-0 max-w-full box-border bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wide text-zinc-400 cursor-not-allowed break-all ${
              wide ? "xl:py-4" : ""
            }`}
          />
        </div>
      </div>

      {isMinor && (
        <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">
            Parent or Legal Guardian completing form on behalf of child or minor:
          </p>
          <div
            className={
              wide ? "grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8" : "grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3"
            }
          >
            <div className={`min-w-0 space-y-2 ${wide ? "xl:col-span-4" : ""}`}>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Guardian Name *
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => handleDetailChange("guardianName", e.target.value)}
                placeholder="GUARDIAN FULL NAME"
                className="w-full min-w-0 max-w-full box-border bg-white dark:bg-black border border-black/10 dark:border-white/10 px-3 sm:px-4 py-3 text-sm font-bold uppercase tracking-widest focus:border-lime-500 outline-none transition-colors"
              />
            </div>
            <div className={`min-w-0 space-y-2 ${wide ? "xl:col-span-4" : ""}`}>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Guardian Signature *
              </label>
              <input
                type="text"
                value={guardianSignature}
                onChange={(e) => handleDetailChange("guardianSignature", e.target.value)}
                placeholder="GUARDIAN SIGNATURE"
                style={{ fontFamily: "'Dancing Script', cursive" }}
                className={`w-full min-w-0 max-w-full box-border bg-white dark:bg-black border border-black/10 dark:border-white/10 px-3 sm:px-4 py-3 font-bold text-lime-600 dark:text-lime-400 focus:border-lime-500 outline-none transition-colors ${
                  wide ? "text-xl sm:text-2xl md:text-3xl xl:py-4" : "text-xl sm:text-2xl"
                }`}
              />
            </div>
            <div className={`min-w-0 space-y-2 ${wide ? "xl:col-span-4" : ""}`}>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Date
              </label>
              <input
                type="text"
                readOnly
                value={today}
                className="w-full min-w-0 max-w-full box-border bg-zinc-50 dark:bg-black/30 border border-black/10 dark:border-white/10 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wide text-zinc-400 cursor-not-allowed break-all"
              />
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex min-w-0 items-start gap-3 sm:gap-4 transition-all duration-300 cursor-pointer border-2 ${
          wide ? "p-5 sm:p-8 xl:p-10" : "p-4 sm:p-6"
        } ${
          agreed
            ? "bg-lime-500/10 border-lime-500"
            : "bg-zinc-50 dark:bg-black/20 border-black/5 dark:border-white/5 hover:border-lime-500/30"
        }`}
        onClick={() => handleAgreedChange(!agreed)}
      >
        <div
          className={`mt-0.5 shrink-0 w-6 h-6 flex items-center justify-center border-2 transition-colors ${
            agreed ? "bg-lime-500 border-lime-500 text-black" : "border-zinc-300 dark:border-zinc-700"
          }`}
        >
          {agreed && <Check className="w-4 h-4 stroke-[4]" />}
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.12em] sm:tracking-widest leading-snug sm:leading-relaxed text-gray-900 dark:text-white break-words hyphens-auto">
            I have read and understood the Liability Waiver & Release of Claims. I agree to all terms and conditions stated above.
          </p>
        </div>
      </div>

      {/* Waiver Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden ${
                wide ? "max-w-4xl" : "max-w-2xl"
              }`}
            >
              <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
                <h4 className="text-xl font-black uppercase italic tracking-tight">Liability Waiver & Release</h4>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                {waiverText}
              </div>
              <div className="p-6 border-t border-black/5 dark:border-white/5 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs hover:bg-lime-500 hover:text-black transition-all"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
