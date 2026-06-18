import type { LucideIcon } from "lucide-react";
import { SpotlightCard } from "../ui/SpotlightCard";
import { Counter } from "../ui/Counter";

export function StatWidget({
  icon: Icon,
  label,
  value,
  numeric,
  suffix = "",
  decimals = 0,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  numeric?: number;
  suffix?: string;
  decimals?: number;
  trend?: string;
}) {
  return (
    <SpotlightCard className="p-5" tilt={false}>
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 text-gold-600 dark:bg-gold-500/10 dark:text-gold-600">
          <Icon className="h-5 w-5" />
        </div>
        {trend && <span className="text-xs font-medium text-emerald-500">{trend}</span>}
      </div>
      <p className="mt-4 font-display text-2xl font-semibold tracking-tight">
        {numeric !== undefined ? (
          <Counter to={numeric} suffix={suffix} decimals={decimals} />
        ) : (
          value
        )}
      </p>
      <p className="text-sm text-silver-600 dark:text-silver-600">{label}</p>
    </SpotlightCard>
  );
}
