import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MotionLevel, QualityTier, ThemeMode } from "../lib/types";

interface PreferencesState {
  theme: ThemeMode;
  motion: MotionLevel;
  quality: QualityTier;
  highContrast: boolean;
  notifications: { product: boolean; learning: boolean; agents: boolean };
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setMotion: (m: MotionLevel) => void;
  setQuality: (q: QualityTier) => void;
  setHighContrast: (v: boolean) => void;
  setNotification: (k: keyof PreferencesState["notifications"], v: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "dark",
      motion: "full",
      quality: "auto",
      highContrast: false,
      notifications: { product: true, learning: true, agents: false },
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setMotion: (motion) => set({ motion }),
      setQuality: (quality) => set({ quality }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setNotification: (k, v) =>
        set((s) => ({ notifications: { ...s.notifications, [k]: v } })),
    }),
    { name: "cogniflow-preferences" }
  )
);
