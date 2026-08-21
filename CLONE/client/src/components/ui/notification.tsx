import * as React from "react";
import { Info, Lightbulb, AlertTriangle, AlertCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalloutType = "note" | "tip" | "important" | "warning" | "caution";

interface NotificationCalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutConfig: Record<
  CalloutType,
  {
    icon: React.ElementType;
    border: string;
    bg: string;
    text: string;
    defaultTitle: string;
  }
> = {
  note: {
    icon: Info,
    border: "border-l-4 border-l-primer-accent-fg border-primer-border-default",
    bg: "bg-primer-canvas-subtle",
    text: "text-primer-accent-fg",
    defaultTitle: "Ескертпе",
  },
  tip: {
    icon: Lightbulb,
    border: "border-l-4 border-l-primer-success-fg border-primer-border-default",
    bg: "bg-primer-canvas-subtle",
    text: "text-primer-success-fg",
    defaultTitle: "Кеңес",
  },
  important: {
    icon: AlertCircle,
    border: "border-l-4 border-l-primer-done-fg border-primer-border-default",
    bg: "bg-primer-canvas-subtle",
    text: "text-primer-done-fg",
    defaultTitle: "Маңызды",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-l-4 border-l-primer-attention-fg border-primer-border-default",
    bg: "bg-primer-canvas-subtle",
    text: "text-primer-attention-fg",
    defaultTitle: "Назар аударыңыз",
  },
  caution: {
    icon: ShieldAlert,
    border: "border-l-4 border-l-primer-danger-fg border-primer-border-default",
    bg: "bg-primer-canvas-subtle",
    text: "text-primer-danger-fg",
    defaultTitle: "Абайлаңыз",
  },
};

export const NotificationCallout: React.FC<NotificationCalloutProps> = ({
  type = "note",
  title,
  children,
  className,
  ...props
}) => {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-r-md border p-3 text-xs leading-relaxed",
        config.border,
        config.bg,
        className
      )}
      {...props}
    >
      <div className={cn("flex items-center gap-1.5 font-bold mb-1", config.text)}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{title || config.defaultTitle}</span>
      </div>
      <div className="text-primer-fg-muted">{children}</div>
    </div>
  );
};
