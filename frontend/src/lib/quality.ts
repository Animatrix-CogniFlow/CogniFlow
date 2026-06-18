import type { QualityProfile, QualityTier, ResolvedTier } from "./types";

/**
 * Adaptive quality engine.
 * Merges the cinematic visual layer with the performance layer by
 * resolving a render budget from either an explicit tier or auto
 * device detection.
 */

/** Heuristic device-capability score → tier. Runs once, cheap. */
export function detectTier(): ResolvedTier {
  if (typeof window === "undefined") return "balanced";

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4; // GB, Chrome-only
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 720;
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ?? false;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  if (reduced || saveData) return "performance";

  // Score: higher = more capable
  let score = 0;
  score += cores >= 8 ? 2 : cores >= 4 ? 1 : 0;
  score += memory >= 8 ? 2 : memory >= 4 ? 1 : 0;
  score += coarse ? -1 : 1; // touch devices tend to be weaker / battery-bound
  score += smallScreen ? -1 : 1;

  if (score >= 4) return "cinematic";
  if (score >= 1) return "balanced";
  return "performance";
}

export function resolveTier(tier: QualityTier): ResolvedTier {
  return tier === "auto" ? detectTier() : tier;
}

const PROFILES: Record<ResolvedTier, QualityProfile> = {
  cinematic: {
    tier: "cinematic",
    particles: true,
    particleCount: 30,
    fps: 45,
    connections: true,
    blobs: 3,
    blur: "90px",
    spotlight: true,
    ambientLoops: true,
  },
  balanced: {
    tier: "balanced",
    particles: true,
    particleCount: 18,
    fps: 30,
    connections: false,
    blobs: 2,
    blur: "70px",
    spotlight: true,
    ambientLoops: true,
  },
  performance: {
    tier: "performance",
    particles: false,
    particleCount: 0,
    fps: 24,
    connections: false,
    blobs: 1,
    blur: "60px",
    spotlight: false,
    ambientLoops: false,
  },
};

export function getProfile(tier: QualityTier): QualityProfile {
  return PROFILES[resolveTier(tier)];
}
