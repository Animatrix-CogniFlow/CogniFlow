import { useEffect, useState } from "react";
import { usePreferencesStore } from "../stores/usePreferencesStore";

/**
 * Resolves whether rich motion should play, combining the user's
 * in-app preference with the OS-level prefers-reduced-motion setting.
 */
export function useMotionPreference(): { animate: boolean; level: string } {
  const level = usePreferencesStore((s) => s.motion);
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const animate = level === "full" && !systemReduced;
  return { animate, level: systemReduced ? "reduced" : level };
}
