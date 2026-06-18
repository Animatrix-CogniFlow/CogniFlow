import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function PageContainer({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 sm:py-8",
        wide ? "max-w-[1600px]" : "max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}
