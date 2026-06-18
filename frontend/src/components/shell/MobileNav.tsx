import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { NAV_ITEMS } from "../../config/navigation";
import { Logo } from "../brand/Logo";
import { cn } from "../../lib/utils";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-silver-900/50 backdrop-blur-sm dark:bg-abyss-950/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute left-0 top-0 h-full w-72 border-r border-silver-200 bg-silver-100 p-4 dark:border-abyss-700 dark:bg-abyss-900"
          >
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-silver-500 hover:bg-silver-200 dark:text-cobalt-400 dark:hover:bg-abyss-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/app"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gold-50 text-gold-700 dark:bg-cobalt-500/10 dark:text-cobalt-200"
                        : "text-silver-700 hover:bg-silver-200 hover:text-silver-900 dark:text-cobalt-300 dark:hover:bg-abyss-700 dark:hover:text-cobalt-100"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
