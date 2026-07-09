"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, Send, X } from "lucide-react";

const WHATSAPP_NUMBER = "6584927347";

const QUICK_MESSAGES = [
  "I'd like to book my first class",
  "What classes do you have?",
  "Can I bring a friend?",
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function FloatingSideActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.pageYOffset > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!chatOpen) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setChatOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [chatOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sendToWhatsApp = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const lines = [
      "Hi One Step Fitness!",
      name.trim() ? `I'm ${name.trim()}.` : null,
      trimmed,
    ].filter(Boolean);

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setMessage("");
    setChatOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-5 left-4 z-[9999] sm:bottom-8 sm:left-6">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-lg transition-all hover:border-lime-500 hover:bg-lime-500 active:scale-95"
            >
              <ChevronUp className="h-5 w-5 stroke-[2.5]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div
        ref={panelRef}
        className="fixed bottom-5 right-4 z-[9999] flex max-h-[calc(100dvh-1.25rem)] flex-col-reverse items-end gap-3 sm:bottom-8 sm:right-6"
      >
        <div className="relative shrink-0">
          {!chatOpen && (
            <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" />
          )}
          <motion.button
            type="button"
            onClick={() => setChatOpen((open) => !open)}
            aria-label={chatOpen ? "Close WhatsApp chat" : "Open WhatsApp chat"}
            aria-expanded={chatOpen}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.45)] transition-colors ${
              chatOpen
                ? "bg-black text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
                : "bg-[#25D366] text-white hover:bg-[#20bd5a]"
            }`}
          >
            {chatOpen ? <X className="h-6 w-6" /> : <WhatsAppIcon className="h-7 w-7" />}
          </motion.button>
        </div>

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="flex max-h-[min(28rem,calc(100dvh-6.5rem))] w-[min(18rem,calc(100vw-5.5rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.35)] sm:max-h-[min(32rem,calc(100dvh-7rem))] sm:w-[22rem]"
            >
              <div className="relative shrink-0 overflow-hidden bg-black px-3 py-3 text-white sm:px-4 sm:pb-4 sm:pt-4">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-lime-500/20 blur-2xl" />
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="relative shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] shadow-lg sm:h-11 sm:w-11">
                        <WhatsAppIcon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-black bg-lime-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black uppercase italic tracking-tight sm:text-sm">
                        One Step Fitness
                      </p>
                      <p className="flex items-center gap-1 text-[10px] font-medium text-white/70 sm:text-[11px]">
                        <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-lime-500" />
                        Replies in a few minutes
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatOpen(false)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 transition-colors hover:bg-white/20"
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f6f4ee] px-3 py-3 sm:px-4 sm:py-4">
                <div className="mb-3 rounded-xl rounded-tl-sm border border-black/5 bg-white px-3 py-2.5 shadow-sm sm:mb-4 sm:px-3.5 sm:py-3">
                  <p className="text-xs font-medium leading-relaxed text-gray-700 sm:text-sm">
                    Drop us a message. We&apos;ll pick it up on WhatsApp.
                  </p>
                </div>

                <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Quick messages
                </p>
                <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
                  {QUICK_MESSAGES.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setMessage(chip)}
                      className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-left text-[10px] font-semibold text-gray-700 transition-colors hover:border-lime-500 hover:bg-lime-500/10 sm:px-3 sm:py-1.5 sm:text-[11px]"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5 rounded-xl border border-black/10 bg-white p-3 shadow-sm sm:space-y-3 sm:p-3.5">
                  <div>
                    <label
                      htmlFor="wa-name"
                      className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-500"
                    >
                      Your name{" "}
                      <span className="font-medium normal-case tracking-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      id="wa-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah"
                      className="w-full border border-black/10 bg-[#f6f4ee] px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-lime-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="wa-message"
                      className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-500"
                    >
                      Your message
                    </label>
                    <textarea
                      id="wa-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={2}
                      className="w-full resize-none border border-black/10 bg-[#f6f4ee] px-3 py-2 text-sm font-medium leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-lime-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={sendToWhatsApp}
                    disabled={!message.trim()}
                    className="group flex w-full items-center justify-center gap-2 bg-black py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition-all hover:bg-lime-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-40 sm:py-3.5 sm:text-sm"
                  >
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    Send on WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
