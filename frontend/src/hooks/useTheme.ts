import { useEffect } from "react";
import { usePreferencesStore } from "../stores/usePreferencesStore";

/** Syncs theme + accessibility preferences to the document root. */
export function useTheme() {
  const theme = usePreferencesStore((s) => s.theme);
  const highContrast = usePreferencesStore((s) => s.highContrast);
  const toggleTheme = usePreferencesStore((s) => s.toggleTheme);
  const setTheme = usePreferencesStore((s) => s.setTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.contrast = highContrast ? "high" : "normal";
  }, [theme, highContrast]);

  return { theme, toggleTheme, setTheme };
}
