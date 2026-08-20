import React from 'react';
import { CircuitSchema } from './types';

interface CircuitRendererProps {
  schema: CircuitSchema | any;
  className?: string;
  isThumbnail?: boolean;
}

export const CircuitRenderer: React.FC<CircuitRendererProps> = ({
  schema,
  className = '',
  isThumbnail = false,
}) => {
  const title = schema.title || 'Электр тізбегі';
  const voltage = schema.voltage || 'U = 12 В';
  const current = schema.current || 'I = 2 А';

  return (
    <div className={`flex flex-col items-center justify-center p-3 select-none ${className}`}>
      {title && !isThumbnail && (
        <div className="text-xs font-semibold text-primer-fg-muted mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>{title}</span>
        </div>
      )}

      <div className="rounded-lg bg-primer-canvas-inset border border-primer-border-muted p-2.5 flex items-center justify-center">
        <svg
          viewBox="0 0 280 160"
          className="w-full max-w-[280px] h-auto overflow-visible"
        >
          <defs>
            <marker id="current-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#bf8700" />
            </marker>
          </defs>

          {/* Circuit Loop Rectangle: (40, 30) to (240, 130) */}

          {/* Top Wire & Switch */}
          <line x1="40" y1="30" x2="100" y2="30" stroke="#58a6ff" strokeWidth="2" />
          {/* Switch Key (K) */}
          <circle cx="100" cy="30" r="3" fill="#58a6ff" />
          <line x1="100" y1="30" x2="135" y2="18" stroke="#58a6ff" strokeWidth="2.5" />
          <circle cx="140" cy="30" r="3" fill="#58a6ff" />
          <text x="115" y="12" fill="#6e7781" fontSize="10" fontFamily="ui-monospace">Ключ K</text>
          <line x1="140" y1="30" x2="240" y2="30" stroke="#58a6ff" strokeWidth="2" />

          {/* Right Wire & Resistor R */}
          <line x1="240" y1="30" x2="240" y2="60" stroke="#58a6ff" strokeWidth="2" />
          {/* Resistor R Rect */}
          <rect x="225" y="60" width="30" height="40" fill="var(--color-canvas-default, #161b22)" stroke="#1a7f37" strokeWidth="2" rx="2" />
          <text x="240" y="84" textAnchor="middle" fill="#1a7f37" fontSize="10" fontWeight="bold" fontFamily="ui-monospace">
            R = 6 Ом
          </text>
          <line x1="240" y1="100" x2="240" y2="130" stroke="#58a6ff" strokeWidth="2" />

          {/* Bottom Wire & Ammeter (A) */}
          <line x1="240" y1="130" x2="160" y2="130" stroke="#58a6ff" strokeWidth="2" />
          {/* Ammeter Circle */}
          <circle cx="140" cy="130" r="14" fill="var(--color-canvas-default, #161b22)" stroke="#cf222e" strokeWidth="2" />
          <text x="140" y="134" textAnchor="middle" fill="#cf222e" fontSize="11" fontWeight="bold" fontFamily="ui-monospace">
            A
          </text>
          <line x1="120" y1="130" x2="40" y2="130" stroke="#58a6ff" strokeWidth="2" />

          {/* Current Flow Arrow */}
          <line x1="90" y1="130" x2="70" y2="130" stroke="#bf8700" strokeWidth="2" markerEnd="url(#current-arr)" />
          <text x="80" y="145" textAnchor="middle" fill="#bf8700" fontSize="9" fontWeight="bold" fontFamily="ui-monospace">
            I
          </text>

          {/* Left Wire & DC Voltage Source (Battery) */}
          <line x1="40" y1="30" x2="40" y2="65" stroke="#58a6ff" strokeWidth="2" />
          {/* Battery Plates: Long (+) & Short Thick (-) */}
          <line x1="25" y1="65" x2="55" y2="65" stroke="#0969da" strokeWidth="3" />
          <text x="15" y="68" fill="#0969da" fontSize="11" fontWeight="bold">+</text>
          <line x1="30" y1="75" x2="50" y2="75" stroke="#6e7781" strokeWidth="4" />
          <text x="17" y="79" fill="#6e7781" fontSize="11" fontWeight="bold">−</text>
          <line x1="40" y1="75" x2="40" y2="130" stroke="#58a6ff" strokeWidth="2" />

          <text x="60" y="73" fill="#0969da" fontSize="10" fontWeight="bold" fontFamily="ui-monospace">
            {voltage}
          </text>
        </svg>
      </div>

      {!isThumbnail && (
        <div className="mt-2 text-[10px] text-primer-fg-muted font-mono text-center">
          Ом заңы: I = U / R = 12 В / 6 Ом = 2 А
        </div>
      )}
    </div>
  );
};
