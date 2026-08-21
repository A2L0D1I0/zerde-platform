import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded-md border border-primer-border-default bg-primer-canvas-inset px-2.5 py-1 text-xs text-primer-fg-default placeholder:text-primer-fg-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer-accent-emphasis focus-visible:border-primer-accent-emphasis disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
