import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Logo } from "../brand/Logo";
import { OrchestrationOrb } from "../visuals/OrchestrationOrb";
import { AmbientBackground } from "../visuals/AmbientBackground";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Cinematic side panel — dark navy with blue ambience */}
      <div className="relative hidden overflow-hidden bg-abyss-950 lg:block">
        <AmbientBackground variant="hero" />
        <div className="absolute inset-0 cf-grid-bg opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div className="flex flex-1 items-center justify-center">
            <OrchestrationOrb className="max-w-sm" />
          </div>
          <div className="max-w-md">
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white">
              The AI Tool that would bring your notes to life.
            </h2>
            <p className="mt-3 text-sm text-cobalt-300/70">
              Upload notes. Get the understanding through visualizations. Practice, speak,
              and master what you thought was impossible.
            </p>
          </div>
        </div>
      </div>

      {/* Form side — light silver */}
      <div className="flex items-center justify-center bg-silver-100 p-6 sm:p-10 dark:bg-abyss-900">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-silver-900 dark:text-cobalt-100">{title}</h1>
          <p className="mt-1.5 text-sm text-silver-500 dark:text-cobalt-400/70">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
