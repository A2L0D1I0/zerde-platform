import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "danger" | "attention" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-16 sm:bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-4 h-4 text-primer-success-fg shrink-0" />,
            danger: <AlertCircle className="w-4 h-4 text-primer-danger-fg shrink-0" />,
            attention: <AlertTriangle className="w-4 h-4 text-primer-attention-fg shrink-0" />,
            info: <Info className="w-4 h-4 text-primer-accent-fg shrink-0" />,
          };

          const borderColors = {
            success: "border-primer-success-muted bg-primer-canvas-overlay",
            danger: "border-primer-danger-muted bg-primer-canvas-overlay",
            attention: "border-primer-attention-muted bg-primer-canvas-overlay",
            info: "border-primer-accent-muted bg-primer-canvas-overlay",
          };

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg border shadow-primer-overlay text-primer-fg-default animate-in slide-in-from-bottom-2 fade-in duration-200",
                borderColors[toast.type]
              )}
            >
              {icons[toast.type]}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold leading-tight">{toast.title}</div>
                {toast.message && (
                  <div className="text-[11px] text-primer-fg-muted mt-0.5 leading-normal">
                    {toast.message}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-primer-fg-muted hover:text-primer-fg-default p-0.5 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
