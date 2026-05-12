"use client";

import { useEffect, useState } from "react";

interface TickerItem {
  id: string;
  message: string;
  sort_order: number;
}

export default function TickerStrip() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    fetch("/api/announcements/active")
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  const renderCopy = (copyIndex: number) =>
    items.map((item) => (
      <span key={`${item.id}-c${copyIndex}`} className="inline-flex items-center gap-4 mx-12">
        <span className="w-2 h-2 bg-black shrink-0 rotate-45" aria-hidden />
        {item.message}
      </span>
    ));

  return (
    <div
      className="relative w-full overflow-hidden bg-lime-500 text-black py-3 text-[10px] font-black uppercase tracking-[0.3em] border-b border-black/10"
      aria-live="polite"
    >
      <div className="relative flex animate-ticker whitespace-nowrap items-center">
        {renderCopy(0)}
        {renderCopy(1)}
        {renderCopy(2)}
        {renderCopy(3)}
      </div>
    </div>
  );
}
