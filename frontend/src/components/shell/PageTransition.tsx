import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Page transition using ONLY transform + opacity (GPU-composited).
 * Avoids animating `filter: blur()` which repaints the whole page.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
}
