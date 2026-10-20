import type { ReactNode } from "react";

type MemberMobilePageShellProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** Show description under the title on small screens (default: hidden on mobile). */
  showDescriptionOnMobile?: boolean;
  action?: ReactNode;
  children: ReactNode;
  maxWidthClass?: string;
};

/** Consistent mobile-first page width and header used across member app pages. */
export default function MemberMobilePageShell({
  eyebrow,
  title,
  description,
  showDescriptionOnMobile = false,
  action,
  children,
  maxWidthClass = "md:max-w-5xl",
}: MemberMobilePageShellProps) {
  return (
    <div className={`mx-auto max-w-lg pb-6 ${maxWidthClass}`}>
      <header className="mb-4 flex items-start justify-between gap-3 md:mb-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 md:hidden">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
            {title}
          </h1>
          {description && (
            <p
              className={`mt-1 text-sm text-zinc-600 dark:text-zinc-400 ${
                showDescriptionOnMobile ? "block" : "hidden md:block"
              }`}
            >
              {description}
            </p>
          )}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </div>
  );
}
