"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, CalendarDays, Sparkles, Tag, X } from "lucide-react";
import { ChatMessageContent } from "./ChatMessageContent";

const QUICK_PRIMARY = "What classes are on this week?";
const QUICK_SECONDARY = "How much is the duo trial?";

const MAX_TURNS = 18;

const PANEL_TOP =
  "top-[max(5.75rem,calc(env(safe-area-inset-top)+5rem))] sm:top-auto";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 250);
      return () => window.clearTimeout(t);
    }
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
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close assistant"
            className="fixed inset-0 z-[10040] bg-zinc-900/25 backdrop-blur-[2px] sm:bg-zinc-900/15"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="One Step Fitness assistant"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className={`fixed z-[10050] flex flex-col overflow-hidden bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.28)] ${PANEL_TOP} bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 rounded-[1.75rem] sm:bottom-8 sm:left-auto sm:right-8 sm:h-[min(38rem,calc(100dvh-5rem))] sm:w-[min(26rem,calc(100vw-2rem))]`}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-1 pt-5">
              <div className="flex min-w-0 items-center gap-2.5 rounded-full border border-zinc-200/80 bg-white py-1.5 pl-1.5 pr-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900">
                  <Sparkles className="h-4 w-4 text-lime-400" strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold tracking-tight text-zinc-900">OSF Assistant</p>
                  <p className="text-[10px] font-medium text-zinc-500">Live schedule &amp; pricing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:bg-zinc-100"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-4 pb-3 pt-3">
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[1.35rem] bg-[#ececec] p-4 [scrollbar-color:rgba(0,0,0,0.12)_transparent] [scrollbar-width:thin]"
              >
                {messages.length === 0 && !streamingReply && (
                  <WelcomePanel onPrimary={() => send(QUICK_PRIMARY)} onSecondary={() => send(QUICK_SECONDARY)} />
                )}

                <div className="space-y-3">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role === "user" ? (
                        <div className="max-w-[92%] rounded-[1.25rem] rounded-br-md bg-zinc-900 px-4 py-2.5 text-sm leading-relaxed text-white">
                          {m.content}
                        </div>
                      ) : (
                        <div className="w-full max-w-none rounded-[1.25rem] bg-white px-4 py-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
                          <ChatMessageContent content={m.content} role="assistant" />
                        </div>
                      )}
                    </div>
                  ))}

                  {streamingReply !== null && (
                    <div className="w-full rounded-[1.25rem] bg-white px-4 py-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
                      {streamingReply.length > 0 ? (
                        <ChatMessageContent content={streamingReply} role="assistant" />
                      ) : (
                        <TypingIndicator />
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
                  )}

                  {limitReached && (
                    <p className="text-center text-[11px] text-zinc-500">
                      Need more help?{" "}
                      <Link href="/contact" className="font-semibold text-zinc-800 underline">
                        Contact us
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-end gap-3 px-5 pb-5 pt-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={loading || limitReached}
                placeholder={limitReached ? "Conversation limit reached" : "Type a message…"}
                rows={1}
                className="max-h-28 min-h-[2.75rem] flex-1 resize-none bg-transparent py-2 text-[15px] leading-snug text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={!input.trim() || loading || limitReached}
                aria-label="Send message"
                className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e3e3e3] text-zinc-800 transition-all hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open assistant"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[10050] flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-900 shadow-[0_8px_32px_rgba(0,0,0,0.12)] sm:bottom-8 sm:right-8"
        >
          <Sparkles className="h-6 w-6 text-lime-600" strokeWidth={2.25} />
        </motion.button>
      )}
    </>
  );
}

function WelcomePanel({
  onPrimary,
  onSecondary,
}: {
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <div className="mb-4 text-center">
      <div className="relative mx-auto mb-5 h-[7.5rem] w-[8.5rem]" aria-hidden>
        <div className="absolute left-1/2 top-6 z-[1] h-[4.5rem] w-[4.5rem] -translate-x-1/2 rounded-2xl border border-zinc-200/80 bg-white shadow-md" />
        <div className="absolute left-1/2 top-3 z-[2] flex h-[5rem] w-[5rem] -translate-x-1/2 items-center justify-center rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 shadow-lg">
          <CalendarDays className="h-8 w-8 text-zinc-700" strokeWidth={1.75} />
        </div>
        <div className="absolute left-1/2 top-0 z-[3] flex h-[5.5rem] w-[5.5rem] -translate-x-1/2 items-center justify-center rounded-2xl border border-zinc-900/10 bg-zinc-900 shadow-xl">
          <Tag className="h-9 w-9 text-lime-400" strokeWidth={1.75} />
        </div>
      </div>

      <p className="mx-auto mb-5 max-w-[16rem] text-sm leading-relaxed text-zinc-600">
        Looking for class times or trial pricing? I pull answers straight from our live studio data.
      </p>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onPrimary}
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Classes this week
        </button>
        <button
          type="button"
          onClick={onSecondary}
          className="rounded-full border border-zinc-300/80 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Duo trial price
        </button>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <span className="flex items-center gap-1.5 py-1" aria-label="Assistant is typing">
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.28s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.14s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
    </span>
  );
}
