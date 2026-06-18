import { createContext, useContext, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { useMotionPreference } from "../hooks/useMotionPreference";

interface MotionContextValue {
  animate: boolean;
}

const MotionContext = createContext<MotionContextValue>({ animate: true });

export function useMotionContext() {
  return useContext(MotionContext);
}

/** Wraps the app with global Framer Motion config + reduced-motion awareness. */
export function MotionProvider({ children }: { children: ReactNode }) {
  const { animate } = useMotionPreference();
  return (
    <MotionContext.Provider value={{ animate }}>
      <MotionConfig
        reducedMotion={animate ? "never" : "always"}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}
