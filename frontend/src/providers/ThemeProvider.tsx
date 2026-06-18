import type { ReactNode } from "react";
import { useTheme } from "../hooks/useTheme";

/** Applies theme + contrast classes to <html>. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useTheme();
  return <>{children}</>;
}
