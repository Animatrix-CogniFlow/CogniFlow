import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";
import { useQuality } from "../../hooks/useQuality";

/**
 * Ambient cinematic AI orb — orbiting nodes around a luminous core.
 * Interactive: tilts toward the pointer with spring physics.
 * Only transforms/opacity are animated for GPU compositing.
 *
 * Light mode: gold core + silver rings
 * Dark mode:  cobalt core + cobalt rings (visible against abyss bg)
 */
export function OrchestrationOrb({
  className,
  active = true,
}: {
  className?: string;
  active?: boolean;
}) {
  const q = useQuality();
  const spin = active && q.animate && q.ambientLoops;
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 18 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function reset() {
    px.set(0);
    py.set(0);
  }

  const nodes = Array.from({ length: 6 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={cn("relative aspect-square w-full max-w-md cursor-grab", className)}
    >
      {/* Ambient glow behind the orb */}
      <div className="absolute inset-0 rounded-full bg-gold-400/20 blur-3xl dark:bg-cobalt-400/25" />

      {/* Three concentric rotating rings */}
      {([0.55, 0.78, 1] as const).map((scale, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-gold-400/30 dark:border-cobalt-400/30"
          style={{ scale }}
          animate={spin ? { rotate: i % 2 ? -360 : 360 } : {}}
          transition={{ duration: 24 + i * 8, repeat: Infinity, ease: "linear" }}
        >
          {/* Orbiting nodes on the outermost ring only */}
          {i === 2 &&
            nodes.map((_, n) => {
              const angle = (n / nodes.length) * Math.PI * 2;
              return (
                <motion.span
                  key={n}
                  className="absolute h-2.5 w-2.5 rounded-full bg-gold-400 shadow-[0_0_12px] shadow-gold-400/60 dark:bg-cobalt-400 dark:shadow-cobalt-400/60"
                  style={{
                    left: `${50 + Math.cos(angle) * 50}%`,
                    top:  `${50 + Math.sin(angle) * 50}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={spin ? { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] } : {}}
                  transition={{ duration: 2.4, repeat: Infinity, delay: n * 0.3 }}
                />
              );
            })}
        </motion.div>
      ))}

      {/* Pulsing core sphere */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 shadow-2xl shadow-gold-500/40 dark:from-cobalt-300 dark:to-cobalt-600 dark:shadow-cobalt-500/50"
        animate={spin ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Expanding pulse ring on the core */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
        animate={spin ? { scale: [1, 1.8], opacity: [0.6, 0] } : {}}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
      />
    </motion.div>
  );
}
