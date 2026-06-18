import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-gold-500" : "bg-silver-200 dark:bg-white/15"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow",
          checked ? "ml-6" : "ml-1"
        )}
      />
    </button>
  );
}
