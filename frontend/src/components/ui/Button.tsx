import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "size">,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gold-500 text-white hover:bg-gold-400 shadow-lg shadow-gold-500/25 dark:bg-cobalt-600 dark:hover:bg-cobalt-500 dark:shadow-cobalt-700/30",
  secondary:
    "bg-silver-200 text-silver-900 hover:bg-silver-300 dark:bg-abyss-700 dark:text-cobalt-100 dark:hover:bg-abyss-600",
  ghost:
    "text-silver-600 hover:bg-silver-200 hover:text-silver-900 dark:text-cobalt-300 dark:hover:bg-abyss-700 dark:hover:text-cobalt-100",
  outline:
    "border border-silver-300 text-silver-700 hover:bg-silver-100 dark:border-abyss-600 dark:text-cobalt-200 dark:hover:bg-abyss-700",
  danger: "bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2.5 py-3.5",
  icon: "h-10 w-10",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.015 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium tracking-tight transition-colors",
        "focus-visible:outline-gold-500 dark:focus-visible:outline-cobalt-400 disabled:opacity-50 disabled:pointer-events-none select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent cf-spin-slow [animation-duration:0.7s]" />
      )}
      {children as React.ReactNode}
    </motion.button>
  )
);
Button.displayName = "Button";
