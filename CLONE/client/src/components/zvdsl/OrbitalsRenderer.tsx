import React from 'react';
import { OrbitalsSchema, QuantumCell } from './types';

interface OrbitalsRendererProps {
  schema: OrbitalsSchema | any;
  className?: string;
  isThumbnail?: boolean;
}

export const OrbitalsRenderer: React.FC<OrbitalsRendererProps> = ({
  schema,
  className = '',
  isThumbnail = false,
}) => {
  // Default sample: Carbon (6) -> 1s^2 2s^2 2p^2 or Nitrogen (7) -> 1s^2 2s^2 2p^3
  const element_name = schema.element_name || schema.title || 'Көміртек (C)';
  const electron_config = schema.electron_config || '1s² 2s² 2p²';

  // Subshells groups: 1s (1 box), 2s (1 box), 2p (3 boxes)
  const defaultSubshells = [
    { name: '1s', boxes: [{ spins: ['up', 'down'] }] },
    { name: '2s', boxes: [{ spins: ['up', 'down'] }] },
    {
      name: '2p',
      boxes: [
        { spins: ['up'] },
        { spins: ['up'] },
        { spins: [] },
      ],
    },
  ];

  const subshells = schema.subshells || defaultSubshells;

  return (
    <div className={`flex flex-col items-center justify-center p-3 select-none ${className}`}>
      {element_name && !isThumbnail && (
        <div className="text-xs font-semibold text-primer-fg-muted mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <span>{element_name}</span>
          <span className="text-[10px] font-mono text-primer-accent-fg bg-primer-accent-subtle px-1.5 py-0.5 rounded">
            {electron_config}
          </span>
        </div>
      )}

      {/* Quantum Cells Row */}
      <div className="flex items-end justify-center gap-3 sm:gap-4 flex-wrap p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted">
        {subshells.map((sub: any, sIdx: number) => {
          return (
            <div key={sIdx} className="flex flex-col items-center">
              {/* Cells Container */}
              <div className="flex items-center">
                {sub.boxes.map((box: any, bIdx: number) => {
                  const spins: ('up' | 'down')[] = box.spins || [];
                  const hasUp = spins.includes('up');
                  const hasDown = spins.includes('down');

                  return (
                    <div
                      key={bIdx}
                      className={`relative flex items-center justify-center border-2 border-primer-border-default bg-primer-canvas-default ${
                        bIdx > 0 ? '-ml-[2px]' : ''
                      } ${
                        isThumbnail ? 'w-6 h-6' : 'w-8 h-8 sm:w-10 sm:h-10'
                      }`}
                    >
                      {/* Spin Arrows */}
                      <div className="flex items-center justify-center gap-0.5">
                        {hasUp && (
                          <span
                            className={`font-mono font-bold text-blue-500 ${
                              isThumbnail ? 'text-[10px]' : 'text-xs sm:text-sm'
                            }`}
                          >
                            ↑
                          </span>
                        )}
                        {hasDown && (
                          <span
                            className={`font-mono font-bold text-rose-500 ${
                              isThumbnail ? 'text-[10px]' : 'text-xs sm:text-sm'
                            }`}
                          >
                            ↓
                          </span>
                        )}
                        {!hasUp && !hasDown && (
                          <span className="text-[9px] text-primer-fg-subtle opacity-30">·</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subshell Label (1s, 2s, 2p) */}
              <span
                className={`font-mono font-bold text-primer-fg-muted mt-1.5 ${
                  isThumbnail ? 'text-[9px]' : 'text-xs'
                }`}
              >
                {sub.name}
              </span>
            </div>
          );
        })}
      </div>

      {!isThumbnail && (
        <div className="mt-2 text-[10px] text-primer-fg-muted text-center flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="text-blue-500 font-bold font-mono">↑</span> m_s = +1/2
          </span>
          <span className="flex items-center gap-1">
            <span className="text-rose-500 font-bold font-mono">↓</span> m_s = -1/2
          </span>
          <span>Хунд ережесі & Паули принципі</span>
        </div>
      )}
    </div>
  );
};
