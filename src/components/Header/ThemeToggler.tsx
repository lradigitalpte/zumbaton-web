import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

interface ThemeTogglerProps {
  showLabel?: boolean;
}

const ThemeToggler = ({ showLabel = false }: ThemeTogglerProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button aria-label='theme toggler'
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={showLabel
        ? "flex w-full items-center justify-between rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white transition-all hover:border-lime-500"
        : "flex items-center justify-center text-black dark:text-white rounded-none cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 h-12 w-12 transition-all"
      }
    >
      {showLabel && <span>Appearance</span>}

      <div className={showLabel ? "flex items-center gap-3" : "contents"}>
        {showLabel && (
          <span className="text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">
            {isDark ? "Dark Mode" : "Light Mode"}
          </span>
        )}

        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggler;
