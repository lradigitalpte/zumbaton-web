"use client";

type ParsedItem = {
  meta: string | null;
  title: string;
  availability: string | null;
};

function parseListItem(raw: string): ParsedItem {
  const cleaned = raw.replace(/^[-•*]\s*/, "").trim();
  const parts = cleaned.split(/\s+[—–-]\s+/);
  if (parts.length >= 2) {
    const meta = parts[0].trim();
    let rest = parts.slice(1).join(" — ");
    const availMatch = rest.match(/\(([^)]+)\)\s*$/);
    const availability = availMatch ? availMatch[1].trim() : null;
    const title = availMatch ? rest.slice(0, availMatch.index).trim() : rest;
    return { meta, title, availability };
  }
  return { meta: null, title: cleaned, availability: null };
}

function availabilityStyle(note: string): string {
  const lower = note.toLowerCase();
  if (lower.includes("full") || lower.includes("sold")) {
    return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300";
  }
  if (lower.includes("spot") || lower.includes("left") || lower.includes("available")) {
    return "bg-lime-100 text-lime-900 dark:bg-lime-950/40 dark:text-lime-300";
  }
  return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
}

function ScheduleCard({ item }: { item: ParsedItem }) {
  return (
    <li className="overflow-hidden rounded-2xl bg-zinc-50 ring-1 ring-zinc-200/80">
      {item.meta ? (
        <div className="border-b border-zinc-200/80 px-3 py-2">
          <p className="text-[11px] font-semibold tracking-wide text-zinc-500">{item.meta}</p>
        </div>
      ) : null}
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold leading-snug text-zinc-900">{item.title}</p>
        {item.availability ? (
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${availabilityStyle(item.availability)}`}
          >
            {item.availability}
          </span>
        ) : null}
      </div>
    </li>
  );
}

export function ChatMessageContent({ content, role }: { content: string; role: "user" | "assistant" }) {
  if (role === "user") {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  const lines = content.split("\n");
  const trimmedLines = lines.map((l) => l.trimEnd());
  const listLines = trimmedLines.filter((l) => /^[-•*]\s/.test(l.trim()));
  const proseLines = trimmedLines.filter((l) => l.trim() && !/^[-•*]\s/.test(l.trim()));

  const useCards = listLines.length >= 2;

  if (useCards) {
    return (
      <div className="space-y-3">
        {proseLines.map((line, i) => (
          <p key={`p-${i}`} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {line}
          </p>
        ))}
        <ul className="max-h-[min(14rem,40vh)] space-y-2 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
          {listLines.map((line, i) => (
            <ScheduleCard key={`c-${i}`} item={parseListItem(line)} />
          ))}
        </ul>
      </div>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{content}</p>;
}
