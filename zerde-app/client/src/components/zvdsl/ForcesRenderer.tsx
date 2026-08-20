import React from 'react';
import { ForcesSchema } from './types';

interface ForcesRendererProps {
  schema: ForcesSchema | any;
  className?: string;
  isThumbnail?: boolean;
}

export const ForcesRenderer: React.FC<ForcesRendererProps> = ({
  schema,
  className = '',
  isThumbnail = false,
}) => {
  const elements = schema.elements || [];
  const canvasType = schema.canvas_type || 'FREE_BODY_DIAGRAM';
  const title = schema.title || 'Күштер мен динамика векторлары';

  // 1. Kinematics Graph v(t)
  if (canvasType === 'V_T_KINEMATICS_GRAPH') {
    return (
      <div className={`flex flex-col items-center justify-center p-2 select-none ${className}`}>
        {!isThumbnail && (
          <div className="text-xs font-semibold text-primer-fg-muted mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>v(t) Кинематика графигі & Орын ауыстыру ауданы</span>
          </div>
        )}
        <svg viewBox="0 0 280 160" className="w-full max-w-[280px] h-auto overflow-visible bg-primer-canvas-inset rounded-lg p-2 border border-primer-border-muted">
          <defs>
            <marker id="arrow-v" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#6e7781" />
            </marker>
          </defs>
          {/* Axes */}
          <line x1="30" y1="130" x2="260" y2="130" stroke="#6e7781" strokeWidth="1.5" markerEnd="url(#arrow-v)" />
          <line x1="30" y1="130" x2="30" y2="15" stroke="#6e7781" strokeWidth="1.5" markerEnd="url(#arrow-v)" />
          <text x="260" y="145" fill="#6e7781" fontSize="10" fontFamily="ui-monospace">t (с)</text>
          <text x="15" y="20" fill="#6e7781" fontSize="10" fontFamily="ui-monospace">v (м/с)</text>

          {/* Shaded trapezoid */}
          <polygon points="30,130 30,80 180,30 180,130" fill="rgba(9, 105, 218, 0.2)" stroke="#0969da" strokeWidth="1" strokeDasharray="3,3" />
          <text x="95" y="95" fill="#0969da" fontSize="10" fontWeight="bold" fontFamily="ui-monospace">S = 21 м</text>

          {/* Velocity line */}
          <line x1="30" y1="80" x2="180" y2="30" stroke="#0969da" strokeWidth="2.5" />
          <circle cx="30" cy="80" r="3" fill="#0969da" />
          <circle cx="180" cy="30" r="3" fill="#0969da" />

          <text x="10" y="84" fill="#6e7781" fontSize="9" fontFamily="ui-monospace">v₀=4</text>
          <text x="10" y="34" fill="#6e7781" fontSize="9" fontFamily="ui-monospace">v=10</text>
          <text x="175" y="145" fill="#6e7781" fontSize="9" fontFamily="ui-monospace">t=3</text>
        </svg>
      </div>
    );
  }

  // 2. Circular Kinematics
  if (canvasType === 'CIRCULAR_KINEMATICS') {
    return (
      <div className={`flex flex-col items-center justify-center p-2 select-none ${className}`}>
        <svg viewBox="0 0 240 140" className="w-full max-w-[240px] h-auto overflow-visible bg-primer-canvas-inset rounded-lg p-2 border border-primer-border-muted">
          {/* Semicircle */}
          <path d="M 40 70 A 70 70 0 0 1 180 70" fill="none" stroke="#0969da" strokeWidth="2.5" />
          <text x="110" y="25" textAnchor="middle" fill="#0969da" fontSize="10" fontWeight="bold" fontFamily="ui-monospace">
            Жол l = πR = 31.4 м
          </text>

          {/* Straight Displacement Chord */}
          <line x1="40" y1="70" x2="180" y2="70" stroke="#cf222e" strokeWidth="2.5" strokeDasharray="4,3" markerEnd="url(#arrow-v)" />
          <text x="110" y="88" textAnchor="middle" fill="#cf222e" fontSize="10" fontWeight="bold" fontFamily="ui-monospace">
            Орын ауыстыру s = 2R = 20 м
          </text>

          {/* Center and endpoints */}
          <circle cx="110" cy="70" r="2.5" fill="#6e7781" />
          <circle cx="40" cy="70" r="3.5" fill="#0969da" />
          <circle cx="180" cy="70" r="3.5" fill="#cf222e" />
        </svg>
      </div>
    );
  }

  // 3. Free Fall Motion
  if (canvasType === 'FREE_FALL_MOTION') {
    return (
      <div className={`flex flex-col items-center justify-center p-2 select-none ${className}`}>
        <svg viewBox="0 0 200 160" className="w-full max-w-[200px] h-auto overflow-visible bg-primer-canvas-inset rounded-lg p-2 border border-primer-border-muted">
          <line x1="60" y1="20" x2="60" y2="135" stroke="#6e7781" strokeWidth="2" strokeDasharray="3,3" />
          <line x1="30" y1="135" x2="170" y2="135" stroke="#6e7781" strokeWidth="3" />

          {/* Body at top */}
          <circle cx="60" cy="30" r="10" fill="#0969da" />
          <text x="60" y="34" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">m</text>

          {/* Vector g */}
          <line x1="85" y1="40" x2="85" y2="80" stroke="#1a7f37" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x="95" y="65" fill="#1a7f37" fontSize="10" fontWeight="bold" fontFamily="ui-monospace">g = 10 м/с²</text>

          {/* Height label */}
          <text x="130" y="85" fill="#cf222e" fontSize="11" fontWeight="bold" fontFamily="ui-monospace">h = 45 м</text>
        </svg>
      </div>
    );
  }

  // 4. Default: Standard Free Body Diagram (Горизонталь немесе көлбеу жазықтықтағы күштер)
  const isInclined = schema.incline_angle && schema.incline_angle > 0;
  const angle = schema.incline_angle || 0;

  return (
    <div className={`flex flex-col items-center justify-center p-3 select-none ${className}`}>
      {title && !isThumbnail && (
        <div className="text-xs font-semibold text-primer-fg-muted mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>{title}</span>
        </div>
      )}

      <div className="rounded-lg bg-primer-canvas-inset border border-primer-border-muted p-2.5 flex items-center justify-center">
        <svg
          viewBox="0 0 280 180"
          className="w-full max-w-[280px] h-auto overflow-visible"
        >
          <defs>
            <marker id="force-arr-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#0969da" />
            </marker>
            <marker id="force-arr-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#cf222e" />
            </marker>
            <marker id="force-arr-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#1a7f37" />
            </marker>
            <marker id="force-arr-gray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#6e7781" />
            </marker>
          </defs>

          {/* Ground Surface */}
          <line x1="20" y1="120" x2="260" y2="120" stroke="#6e7781" strokeWidth="2.5" strokeLinecap="round" />
          {/* Surface Hatching */}
          {[40, 70, 100, 130, 160, 190, 220, 240].map((hx) => (
            <line key={hx} x1={hx} y1="120" x2={hx - 8} y2="130" stroke="#6e7781" strokeWidth="1" opacity={0.6} />
          ))}

          {/* Central Body Box (5 kg) */}
          <g transform="translate(140, 95)">
            <rect
              x="-25"
              y="-25"
              width="50"
              height="50"
              fill="var(--color-canvas-default, #161b22)"
              stroke="#58a6ff"
              strokeWidth="2"
              rx="4"
            />
            <text
              x="0"
              y="5"
              textAnchor="middle"
              fill="currentColor"
              fontSize="11"
              fontWeight="bold"
              fontFamily="ui-monospace, monospace"
              className="text-primer-fg-default"
            >
              {schema.mass || '5 kg'}
            </text>

            {/* Force Vector: N (Up) */}
            <line x1="0" y1="-25" x2="0" y2="-65" stroke="#1a7f37" strokeWidth="2.5" markerEnd="url(#force-arr-green)" />
            <text x="8" y="-55" fill="#1a7f37" fontSize="11" fontWeight="bold" fontFamily="ui-monospace">
              N = mg
            </text>

            {/* Force Vector: mg (Down) */}
            <line x1="0" y1="25" x2="0" y2="65" stroke="#6e7781" strokeWidth="2.5" markerEnd="url(#force-arr-gray)" />
            <text x="8" y="55" fill="#6e7781" fontSize="11" fontWeight="bold" fontFamily="ui-monospace">
              mg = 50 H
            </text>

            {/* Force Vector: F_тяга (Right) */}
            <line x1="25" y1="0" x2="75" y2="0" stroke="#0969da" strokeWidth="2.5" markerEnd="url(#force-arr-blue)" />
            <text x="45" y="-8" fill="#0969da" fontSize="11" fontWeight="bold" fontFamily="ui-monospace">
              F = 30 H
            </text>

            {/* Force Vector: F_үйкеліс (Left) */}
            <line x1="-25" y1="18" x2="-65" y2="18" stroke="#cf222e" strokeWidth="2.5" markerEnd="url(#force-arr-red)" />
            <text x="-70" y="10" textAnchor="end" fill="#cf222e" fontSize="10" fontWeight="bold" fontFamily="ui-monospace">
              F_үйк = 10 H
            </text>
          </g>
        </svg>
      </div>

      {!isThumbnail && (
        <div className="mt-2 text-[10px] text-primer-fg-muted font-mono text-center">
          F_тең = F - F_үйк = 20 Н &nbsp;|&nbsp; a = F_тең / m = 4 м/с²
        </div>
      )}
    </div>
  );
};
