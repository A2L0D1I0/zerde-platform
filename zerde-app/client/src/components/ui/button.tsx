import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer shadow-xs",
  {
    variants: {
      variant: {
        default:
          "bg-primer-success-emphasis text-white hover:bg-primer-success-hover border border-black/10 active:opacity-90",
        primary:
          "bg-primer-success-emphasis text-white hover:bg-primer-success-hover border border-black/10 active:opacity-90",
        secondary:
          "bg-primer-canvas-subtle text-primer-fg-default hover:bg-primer-border-default/40 border border-primer-border-default",
        outline:
          "border border-primer-border-default bg-transparent text-primer-fg-default hover:bg-primer-canvas-subtle",
        ghost:
          "text-primer-fg-default hover:bg-primer-canvas-subtle shadow-none",
        destructive:
          "bg-primer-danger-emphasis text-white hover:bg-primer-danger-emphasis/90 border border-black/10",
        attention:
          "bg-primer-attention-emphasis text-white hover:bg-primer-attention-emphasis/90 border border-black/10",
        accent:
          "bg-primer-accent-emphasis text-white hover:bg-primer-accent-emphasis/90 border border-black/10",
        link:
          "text-primer-accent-fg underline-offset-4 hover:underline shadow-none p-0 h-auto",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        xs: "h-6 px-2 text-[11px] rounded",
        sm: "h-7 px-2.5 text-xs rounded",
        lg: "h-9 px-4 text-sm rounded-md",
        icon: "h-8 w-8 p-0",
        "icon-sm": "h-7 w-7 p-0",
        "icon-xs": "h-6 w-6 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
