import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primer-border-default bg-primer-canvas-subtle text-primer-fg-default",
        secondary:
          "border-transparent bg-primer-border-muted text-primer-fg-muted",
        outline:
          "border-primer-border-default text-primer-fg-default bg-transparent",
        success:
          "border-primer-success-muted/60 bg-primer-success-subtle text-primer-success-fg",
        attention:
          "border-primer-attention-muted/60 bg-primer-attention-subtle text-primer-attention-fg",
        danger:
          "border-primer-danger-muted/60 bg-primer-danger-subtle text-primer-danger-fg",
        done:
          "border-primer-done-muted/60 bg-primer-done-subtle text-primer-done-fg",
        accent:
          "border-primer-accent-muted/60 bg-primer-accent-subtle text-primer-accent-fg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
