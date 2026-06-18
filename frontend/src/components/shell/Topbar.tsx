import { useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Search, LogOut, Menu, Gauge } from "lucide-react";
import { Button } from "../ui/Button";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../stores/useAuthStore";
import { usePreferencesStore } from "../../stores/usePreferencesStore";
import { useQuality } from "../../hooks/useQuality";
import { NAV_ITEMS } from "../../config/navigation";
import type { QualityTier } from "../../lib/types";

const QUALITY_CYCLE: QualityTier[] = ["auto", "cinematic", "balanced", "performance"];

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const quality = usePreferencesStore((s) => s.quality);
  const setQuality = usePreferencesStore((s) => s.setQuality);
  const profile = useQuality();

  function cycleQuality() {
    const i = QUALITY_CYCLE.indexOf(quality);
    setQuality(QUALITY_CYCLE[(i + 1) % QUALITY_CYCLE.length]);
  }

  const current =
    [...NAV_ITEMS].sort((a, b) => b.to.length - a.to.length).find((i) =>
      pathname.startsWith(i.to)
    ) ?? NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-silver-200/80 bg-silver-100/80 px-4 backdrop-blur-xl dark:border-abyss-700/60 dark:bg-abyss-900/70 sm:px-6">
      <button
        onClick={onOpenMobile}
        aria-label="Open menu"
        className="rounded-lg p-2 text-silver-500 hover:bg-silver-200 dark:text-cobalt-300 dark:hover:bg-abyss-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <h1 className="font-display text-base font-semibold leading-tight tracking-tight text-silver-900 dark:text-cobalt-100 sm:text-lg">
          {current.label}
        </h1>
        <p className="hidden truncate text-xs text-silver-500 dark:text-cobalt-400/70 sm:block">
          {current.description}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-silver-400 dark:text-cobalt-400/60" />
          <input
            placeholder="Search intelligence…"
            className="h-10 w-56 rounded-xl border border-silver-300 bg-white/70 pl-9 pr-3 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20 dark:border-abyss-600 dark:bg-abyss-800/60 dark:text-cobalt-100 dark:focus:border-cobalt-400 dark:focus:ring-cobalt-400/20"
          />
        </div>

        <button
          onClick={cycleQuality}
          title={`Visual quality: ${quality} (${profile.tier})`}
          aria-label={`Visual quality: ${quality}, rendering ${profile.tier}. Click to change.`}
          className="hidden items-center gap-1.5 rounded-xl border border-silver-300 bg-white/70 px-2.5 py-2 text-xs font-medium capitalize text-silver-700 transition hover:border-gold-400 hover:text-gold-700 dark:border-abyss-600 dark:bg-abyss-800/60 dark:text-cobalt-300 dark:hover:border-cobalt-400 dark:hover:text-cobalt-200 sm:flex"
        >
          <Gauge className="h-4 w-4 text-gold-500 dark:text-cobalt-400" />
          {quality === "auto" ? `Auto · ${profile.tier}` : quality}
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="flex items-center gap-2 rounded-xl border border-silver-300 bg-white/70 p-1 pr-2 dark:border-abyss-600 dark:bg-abyss-800/60">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold text-white"
            style={{ backgroundColor: user?.avatarColor ?? "#b8900f" }}
          >
            {(user?.name ?? "U").slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden max-w-[110px] truncate text-sm font-medium text-silver-800 dark:text-cobalt-100 sm:block">
            {user?.name ?? "Guest"}
          </span>
          <button
            aria-label="Sign out"
            onClick={async () => {
              await signOut();
              navigate("/signin");
            }}
            className="ml-1 rounded-md p-1 text-silver-400 hover:text-rose-500 dark:text-cobalt-400/60 dark:hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
