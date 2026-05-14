import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeTogglerProps {
  showLabel?: boolean;
}

const ThemeToggler = ({ showLabel = false }: ThemeTogglerProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  const iconClass = "h-5 w-5 shrink-0 text-white";

  if (!mounted) {
    return (
      <div className={
        showLabel
          ? "flex w-full items-center justify-between rounded-none border border-white/20 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all"
          : "flex h-12 w-12 shrink-0 items-center justify-center rounded-none border border-white/35 bg-white/10 text-white"
      }>
        {showLabel && <span>Appearance</span>}
        <div className="h-5 w-5" />
      </div>
    );
  }

  return (
    <button
      aria-label="theme toggler"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={
        showLabel
          ? "flex w-full items-center justify-between rounded-none border border-white/20 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:border-lime-400 hover:bg-white/10"
          : "flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-none border border-white/35 bg-white/10 text-white transition-colors hover:border-white/55 hover:bg-white/20"
      }
    >
      {showLabel && <span>Appearance</span>}

      <div className={showLabel ? "flex items-center gap-3" : "contents"}>
        {showLabel && (
          <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">
            {isDark ? "Dark Mode" : "Light Mode"}
          </span>
        )}

        {isDark ? (
          <Sun className={iconClass} strokeWidth={2} />
        ) : (
          <Moon className={iconClass} strokeWidth={2} />
        )}
      </div>
    </button>
  );
};

export default ThemeToggler;
