import { useMemo } from "react";
import { usePreferencesStore } from "../stores/usePreferencesStore";
import { useMotionPreference } from "./useMotionPreference";
import { getProfile, resolveTier } from "../lib/quality";
import type { QualityProfile } from "../lib/types";

/**
 * The single source of truth for adaptive visuals.
 * Merges the chosen quality tier with the motion preference so that:
 *  - motion "off" forces a static, no-loop profile (best performance)
 *  - motion "reduced" disables particles & ambient loops but keeps layout
 *  - otherwise the resolved quality tier's full budget applies
 */
export function useQuality(): QualityProfile & { animate: boolean } {
  const tier = usePreferencesStore((s) => s.quality);
  const { animate, level } = useMotionPreference();

  return useMemo(() => {
    const base = getProfile(tier);

    if (level === "off") {
      return {
        ...base,
        animate: false,
        particles: false,
        connections: false,
        ambientLoops: false,
        spotlight: false,
        blobs: Math.min(base.blobs, 1),
      };
    }

    if (level === "reduced" || !animate) {
      return {
        ...base,
        animate: false,
        particles: false,
        connections: false,
        ambientLoops: false,
        spotlight: base.spotlight, // hover spotlight ok without continuous motion
      };
    }

    return { ...base, animate: true };
    // resolveTier is cheap & deterministic for a given tier
  }, [tier, animate, level]);
}

export { resolveTier };
