"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";

const QUICK_PROMPTS = [
  "What classes are on this week?",
  "How much is the duo trial?",
  "Do I need dance experience?",
];

const MAX_TURNS = 18; // keep in step with MAX_MESSAGES in /api/chat

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingReply, setStreamingReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, streamingReply]);

  const limitReached = messages.length >= MAX_TURNS;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || limitReached) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);
    setStreamingReply("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Something went wrong");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingReply(accumulated);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setStreamingReply(null);
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div
      ref={panelRef}
      className="fixed bottom-24 right-4 z-[9998] flex max-h-[calc(100dvh-1.25rem)] flex-col-reverse items-end gap-3 sm:bottom-28 sm:right-6"
    >
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Ask One Step Fitness"}
        aria-expanded={open}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-colors ${
          open ? "bg-black text-white" : "bg-lime-500 text-black hover:bg-lime-400"
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="flex max-h-[min(30rem,calc(100dvh-9rem))] w-[min(20rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.35)] sm:max-h-[min(34rem,calc(100dvh-10rem))] sm:w-[22rem]"
          >
            <div className="relative shrink-0 overflow-hidden bg-black px-4 py-3 text-white">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-lime-500/20 blur-2xl" />
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-500">
                    <Sparkles className="h-4 w-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase italic tracking-tight sm:text-sm">
                      Ask One Step Fitness
                    </p>
                    <p className="text-[10px] font-medium text-white/70 sm:text-[11px]">
                      Classes, schedule &amp; pricing
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 hover:bg-white/20"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f6f4ee] px-3 py-3 sm:px-4 sm:py-4">
              {messages.length === 0 && (
                <div className="mb-3 rounded-xl rounded-tl-sm border border-black/5 bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-xs font-medium leading-relaxed text-gray-700 sm:text-sm">
                    Hi! Ask me about class times, the duo trial price, or what to bring — I&apos;ll pull it straight from our live schedule.
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`mb-2.5 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-xs leading-relaxed sm:text-sm ${
                      m.role === "user"
                        ? "rounded-tr-sm bg-black text-white"
                        : "rounded-tl-sm border border-black/5 bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {streamingReply !== null && (
                <div className="mb-2.5 flex justify-start">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-tl-sm border border-black/5 bg-white px-3 py-2 text-xs leading-relaxed text-gray-800 shadow-sm sm:text-sm">
                    {streamingReply.length > 0 ? (
                      streamingReply
                    ) : (
                      <span className="flex gap-1 py-0.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => send(chip)}
                      className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-left text-[10px] font-semibold text-gray-700 transition-colors hover:border-lime-500 hover:bg-lime-500/10 sm:text-[11px]"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {limitReached && (
                <div className="mt-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-[11px] text-gray-500">
                  That&apos;s a long chat — for anything else, reach us on WhatsApp via the button below.
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-black/10 bg-white p-2.5 sm:p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={loading || limitReached}
                  placeholder={limitReached ? "Chat limit reached" : "Type a question..."}
                  rows={1}
                  className="max-h-24 w-full resize-none border border-black/10 bg-[#f6f4ee] px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-lime-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading || limitReached}
                  aria-label="Send"
                  className="flex h-9 w-9 shrink-0 items-center justify-center bg-black text-white transition-colors hover:bg-lime-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
