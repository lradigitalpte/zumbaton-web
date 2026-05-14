import { Fragment, type ReactNode } from "react";

const COACH_PATTERN = /^Coach\s+[A-Za-z]+$/;

/** Wraps "Coach Name" segments for emphasis (lime, bold). */
export function highlightCoachInText(text: string): ReactNode {
  const parts = text.split(/(Coach\s+[A-Za-z]+)/);
  return parts.map((part, i) => {
    if (!part) return null;
    if (COACH_PATTERN.test(part)) {
      return (
        <span key={i} className="font-black text-lime-600 dark:text-lime-400">
          {part}
        </span>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
