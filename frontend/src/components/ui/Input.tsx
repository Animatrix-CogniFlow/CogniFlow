import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-silver-700 dark:text-cobalt-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-silver-400 dark:text-cobalt-400/60">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-silver-900 outline-none transition",
              "border-silver-300 placeholder:text-silver-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20",
              "dark:bg-abyss-800/60 dark:border-abyss-600 dark:text-cobalt-100 dark:placeholder:text-cobalt-400/50 dark:focus:border-cobalt-400 dark:focus:ring-cobalt-400/20",
              icon && "pl-10",
              error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
