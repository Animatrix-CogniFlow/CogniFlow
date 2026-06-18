import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

/** Small inline spinner — used inside buttons, inputs, etc. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-5 w-5 rounded-full border-2",
        "border-silver-300 border-t-gold-500",
        "dark:border-abyss-600 dark:border-t-cobalt-400",
        "cf-spin-slow [animation-duration:0.7s]",
        className
      )}
    />
  );
}

/** Shimmer placeholder for loading content blocks. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-silver-200 dark:bg-abyss-800",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/[0.06] [animation:cf-shimmer_1.6s_infinite]" />
    </div>
  );
}

/** Full-page loading state shown during route transitions. */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        className="h-9 w-9 rounded-full border-2 border-silver-300 border-t-gold-500 dark:border-abyss-600 dark:border-t-cobalt-400"
      />
      <p className="text-sm text-silver-600 dark:text-cobalt-300">Loading intelligence…</p>
    </div>
  );
}
