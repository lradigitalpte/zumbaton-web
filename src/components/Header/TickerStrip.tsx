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
      <span key={`${item.id}-c${copyIndex}`} className="inline-flex items-center gap-2 mx-8">
        <span className="w-1 h-1 rounded-full bg-white/80 shrink-0" aria-hidden />
        {item.message}
      </span>
    ));

  return (
    <div
      className="relative w-full overflow-hidden bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white py-2 text-xs font-medium shadow-sm dark:from-green-700 dark:via-green-600 dark:to-green-700"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" aria-hidden />
      <div className="relative flex animate-ticker whitespace-nowrap items-center">
        {renderCopy(0)}
        {renderCopy(1)}
        {renderCopy(2)}
        {renderCopy(3)}
        {renderCopy(4)}
        {renderCopy(5)}
      </div>
    </div>
  );
}
