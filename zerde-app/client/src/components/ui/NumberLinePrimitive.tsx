import React from 'react';

interface NumberLinePrimitiveProps {
  points?: Array<{ x: number; label: string; isHollow?: boolean }>;
  intervals?: Array<{ from: number; to: number; sign: '+' | '-'; isIncluded?: boolean }>;
  className?: string;
}

export const NumberLinePrimitive: React.FC<NumberLinePrimitiveProps> = ({
  points = [
    { x: 2, label: 'x₁ = 2', isHollow: false },
    { x: 3, label: 'x₂ = 3', isHollow: false }
  ],
  intervals = [
    { from: -Infinity, to: 2, sign: '+' },
    { from: 2, to: 3, sign: '-' },
    { from: 3, to: Infinity, sign: '+' }
  ],
  className = ''
}) => {
  return (
    <div className={`p-4 bg-primer-canvas-inset rounded-xl border border-primer-border-default select-none ${className}`}>
      <div className="flex items-center justify-between text-xs text-primer-fg-muted mb-2">
        <span className="font-semibold flex items-center gap-1.5">
          <span>📐</span>
          <span>Сан түзуі (Числовая прямая):</span>
        </span>
        <span className="font-mono text-[11px] bg-primer-canvas-subtle px-2 py-0.5 rounded border border-primer-border-muted">
          ZVDSL+ Native Primitive
        </span>
      </div>

      <div className="w-full h-24 relative flex items-center justify-center">
        <svg viewBox="0 0 500 100" className="w-full h-full">
          {/* Main Axis Line with Arrow */}
          <line x1="30" y1="50" x2="470" y2="50" stroke="#8b949e" strokeWidth="2.5" />
          <polygon points="475,50 465,45 465,55" fill="#8b949e" />

          {/* Arcs & Signs */}
          {/* Left interval: (+ sign) */}
          <path d="M 50 50 Q 115 15 180 50" fill="none" stroke="#238636" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="110" y="28" fill="#238636" fontSize="14" fontWeight="bold" textAnchor="middle">+</text>

          {/* Middle interval: (- sign) */}
          <path d="M 180 50 Q 250 20 320 50" fill="rgba(31, 111, 235, 0.15)" stroke="#1f6feb" strokeWidth="2" />
          <text x="250" y="32" fill="#1f6feb" fontSize="16" fontWeight="bold" textAnchor="middle">−</text>

          {/* Right interval: (+ sign) */}
          <path d="M 320 50 Q 385 15 450 50" fill="none" stroke="#238636" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="385" y="28" fill="#238636" fontSize="14" fontWeight="bold" textAnchor="middle">+</text>

          {/* Point 1 (x = 2) */}
          <line x1="180" y1="42" x2="180" y2="58" stroke="#1f6feb" strokeWidth="2" />
          <circle cx="180" cy="50" r="5" fill="#1f6feb" stroke="#ffffff" strokeWidth="2" />
          <text x="180" y="75" fill="#e6edf3" fontSize="12" fontWeight="bold" textAnchor="middle">2</text>
          <text x="180" y="90" fill="#8b949e" fontSize="10" textAnchor="middle">x₁</text>

          {/* Point 2 (x = 3) */}
          <line x1="320" y1="42" x2="320" y2="58" stroke="#1f6feb" strokeWidth="2" />
          <circle cx="320" cy="50" r="5" fill="#1f6feb" stroke="#ffffff" strokeWidth="2" />
          <text x="320" y="75" fill="#e6edf3" fontSize="12" fontWeight="bold" textAnchor="middle">3</text>
          <text x="320" y="90" fill="#8b949e" fontSize="10" textAnchor="middle">x₂</text>

          {/* Shaded interval [2; 3] */}
          <rect x="180" y="47" width="140" height="6" fill="#1f6feb" opacity="0.6" rx="2" />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-primer-fg-muted mt-1 px-1">
        <span>−∞ (теріс шексіздік)</span>
        <span className="font-semibold text-primer-accent-fg bg-primer-accent-subtle/30 px-2 py-0.5 rounded">
          Шешім аралығы: [2; 3]
        </span>
        <span>+∞ (оң шексіздік)</span>
      </div>
    </div>
  );
};
