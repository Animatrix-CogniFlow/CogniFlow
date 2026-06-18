import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-silver-300 px-6 py-14 text-center dark:border-abyss-700">
      {/* Icon container */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100 text-gold-600 dark:bg-cobalt-500/10 dark:text-cobalt-300">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="font-display text-lg font-semibold tracking-tight text-silver-900 dark:text-cobalt-100">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-silver-600 dark:text-cobalt-400">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
