import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { NAV_ITEMS } from "../../config/navigation";
import { Logo } from "../brand/Logo";
import { cn } from "../../lib/utils";
import { useAgentStore } from "../../stores/useAgentStore";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const orchestrating = useAgentStore((s) => s.orchestrating);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-silver-200/80 bg-silver-100/80 backdrop-blur-xl lg:flex isolate",
        "dark:border-abyss-700/60 dark:bg-abyss-900/70",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {collapsed ? <Logo withText={false} /> : <Logo />}
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="rounded-lg p-1.5 text-silver-400 transition hover:bg-silver-200 hover:text-silver-800 dark:text-cobalt-400/60 dark:hover:bg-abyss-700 dark:hover:text-cobalt-200"
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/app"}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-gold-700 dark:text-cobalt-200"
                  : "text-silver-500 hover:text-silver-900 dark:text-cobalt-400/70 dark:hover:text-cobalt-100"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gold-50 dark:bg-cobalt-500/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon className="relative z-10 h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-silver-200/80 p-3 dark:border-abyss-700/60">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl bg-silver-200/60 px-3 py-2.5 dark:bg-abyss-800/50",
            collapsed && "justify-center"
          )}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full",
                orchestrating ? "bg-emerald-400" : "bg-gold-400 dark:bg-cobalt-400"
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                orchestrating
                  ? "bg-emerald-500 [animation:cf-pulse-ring_1.4s_ease-out_infinite]"
                  : "bg-gold-500 dark:bg-cobalt-500"
              )}
            />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-silver-800 dark:text-cobalt-200">AI Orchestration</p>
              <p className="truncate text-[11px] text-silver-500 dark:text-cobalt-400/60">
                {orchestrating ? "Processing…" : "Standing by"}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
