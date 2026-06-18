import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuality } from "../../hooks/useQuality";
import { cn } from "../../lib/utils";
import type { QualityProfile } from "../../lib/types";

export function AmbientBackground({
  variant = "app",
  className,
  particles = true,
}: {
  variant?: "app" | "hero" | "stage";
  className?: string;
  particles?: boolean;
}) {
  const q = useQuality();
  const showParticles = particles && q.particles && variant !== "stage";
  const blobCount = variant === "stage" ? Math.min(q.blobs, 1) : q.blobs;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      {/* Light mode: warm silver/gold blobs; Dark mode: blue blobs */}
      <Blob
        index={0}
        animate={q.animate}
        blur={q.blur}
        className="-left-32 top-[-10%] h-[380px] w-[380px] bg-gold-200/30 dark:bg-cobalt-500/20"
        path={{ x: [0, 50, 0], y: [0, 36, 0] }}
        duration={22}
        visible={blobCount >= 1}
      />
      <Blob
        index={1}
        animate={q.animate}
        blur={q.blur}
        className="right-[-10%] top-1/3 h-[320px] w-[320px] bg-silver-300/40 dark:bg-cobalt-700/25"
        path={{ x: [0, -42, 0], y: [0, -26, 0] }}
        duration={26}
        delay={2}
        visible={blobCount >= 2}
      />
      <Blob
        index={2}
        animate={q.animate}
        blur={q.blur}
        className="bottom-[-15%] left-1/3 h-[340px] w-[340px] bg-gold-100/25 dark:bg-cobalt-900/30"
        path={{ x: [0, 34, 0], y: [0, -32, 0] }}
        duration={24}
        delay={4}
        visible={blobCount >= 3 && variant === "hero"}
      />

      {showParticles && <ParticleField profile={q} dense={variant === "hero"} />}
    </div>
  );
}

function Blob({
  animate,
  blur,
  className,
  path,
  duration,
  delay = 0,
  visible,
}: {
  index: number;
  animate: boolean;
  blur: string;
  className: string;
  path: { x: number[]; y: number[] };
  duration: number;
  delay?: number;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <motion.div
      className={cn("absolute rounded-full will-change-transform", className)}
      style={{ filter: `blur(${blur})` }}
      animate={animate ? path : undefined}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function ParticleField({ profile, dense }: { profile: QualityProfile; dense?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let last = 0;
    let running = true;
    const FRAME_MS = 1000 / profile.fps;
    const dpr = Math.min(window.devicePixelRatio || 1, profile.tier === "cinematic" ? 2 : 1.5);

    const baseCount = profile.particleCount;
    const count = dense ? baseCount : Math.round(baseCount * 0.6);
    const LINK_DIST = 130;
    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    function resize() {
      w = canvas!.offsetWidth;
      h = canvas!.offsetHeight;
      canvas!.width = Math.max(1, Math.floor(w * dpr));
      canvas!.height = Math.max(1, Math.floor(h * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.4 + 0.5,
        });
      }
    }

    const isDark = () => document.documentElement.classList.contains("dark");

    function frame(t: number) {
      raf = requestAnimationFrame(frame);
      if (!running) return;
      if (t - last < FRAME_MS) return;
      last = t;

      ctx!.clearRect(0, 0, w, h);
      const dark = isDark();
      // Light: warm gold-tinted dots; Dark: cool blue dots
      const dot = dark ? "rgba(100,160,255,0.45)" : "rgba(180,144,15,0.40)";
      ctx!.fillStyle = dot;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (profile.connections) {
        const linkBase = dark ? "100,160,255" : "180,144,15";
        ctx!.lineWidth = 0.6;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j];
            const dx = p.x - q.x;
            const dy = p.y - q.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < LINK_DIST * LINK_DIST) {
              const a = (1 - Math.sqrt(d2) / LINK_DIST) * 0.16;
              ctx!.strokeStyle = `rgba(${linkBase},${a})`;
              ctx!.beginPath();
              ctx!.moveTo(p.x, p.y);
              ctx!.lineTo(q.x, q.y);
              ctx!.stroke();
            }
          }
        }
      }
    }

    const onResize = () => { resize(); seed(); };
    const onVisibility = () => { running = document.visibilityState === "visible"; };

    resize();
    seed();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [profile.fps, profile.particleCount, profile.connections, profile.tier, dense]);

  return (
    <canvas ref={ref} className="absolute inset-0 h-full w-full opacity-60" aria-hidden />
  );
}
