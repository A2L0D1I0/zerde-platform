import React from 'react';
import { MorphemeSchema, MorphemePart } from './types';

interface MorphemeRendererProps {
  schema: MorphemeSchema | any;
  className?: string;
  isThumbnail?: boolean;
}

export const MorphemeRenderer: React.FC<MorphemeRendererProps> = ({
  schema,
  className = '',
  isThumbnail = false,
}) => {
  const elements: MorphemePart[] = schema.elements || [];

  // Helper to map role to symbol type
  const getSymbolType = (role: string, part: string): 'prefix' | 'root' | 'suffix' | 'ending' | 'stem' => {
    const r = (role || '').toLowerCase();
    if (r.includes('приставк') || r.includes('префикс') || r.includes('prefix')) return 'prefix';
    if (r.includes('түбір') || r.includes('корен') || r.includes('root')) return 'root';
    if (r.includes('жұрнақ') || r.includes('суффикс') || r.includes('suffix')) return 'suffix';
    if (r.includes('жалғау') || r.includes('окончан') || r.includes('ending')) return 'ending';
    if (r.includes('негіз') || r.includes('основ') || r.includes('stem')) return 'stem';

    // fallback heuristics
    if (part.startsWith('-') && (part.endsWith('тік') || part.endsWith('гіш') || part.endsWith('лық'))) return 'suffix';
    if (part.startsWith('-')) return 'ending';
    return 'root';
  };

  // Color mapping
  const getRoleColor = (type: string) => {
    switch (type) {
      case 'prefix':
        return {
          stroke: '#a371f7',
          bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
        };
      case 'root':
        return {
          stroke: '#0969da',
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
        };
      case 'suffix':
        return {
          stroke: '#1a7f37',
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        };
      case 'ending':
        return {
          stroke: '#cf222e',
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        };
      default:
        return {
          stroke: '#6e7781',
          bg: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30',
        };
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-3 text-primer-fg-default select-none ${className}`}>
      {schema.title && !isThumbnail && (
        <div className="text-xs font-semibold text-primer-fg-muted mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>{schema.title}</span>
        </div>
      )}

      {/* Main Morpheme Visual Block */}
      <div className="flex items-end justify-center gap-1 sm:gap-2 flex-wrap py-2 px-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted">
        {elements.map((elem, idx) => {
          const cleanPart = elem.part ? elem.part.replace(/^-\s*/, '') : '';
          const symbolType = elem.symbol || getSymbolType(elem.role, elem.part);
          const colorInfo = getRoleColor(symbolType);

          return (
            <div key={idx} className="flex flex-col items-center group relative">
              {/* Top Symbol Icon (SVG) */}
              <div className="h-5 sm:h-6 flex items-end justify-center mb-0.5">
                {symbolType === 'prefix' && (
                  /* Prefix: ¬ (Top corner bar) */
                  <svg width="24" height="12" viewBox="0 0 24 12" className="overflow-visible">
                    <path
                      d="M 2 10 L 2 2 L 22 2"
                      fill="none"
                      stroke={colorInfo.stroke}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {symbolType === 'root' && (
                  /* Root: ⌢ (Curved arc over root) */
                  <svg width="32" height="14" viewBox="0 0 32 14" className="overflow-visible">
                    <path
                      d="M 2 12 C 6 2, 26 2, 30 12"
                      fill="none"
                      stroke={colorInfo.stroke}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {symbolType === 'suffix' && (
                  /* Suffix: ∧ (Peak / roof over suffix) */
                  <svg width="24" height="14" viewBox="0 0 24 14" className="overflow-visible">
                    <path
                      d="M 2 12 L 12 2 L 22 12"
                      fill="none"
                      stroke={colorInfo.stroke}
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {symbolType === 'ending' && (
                  /* Ending indicator */
                  <span className="text-[10px] font-mono text-rose-500 font-bold">□</span>
                )}
              </div>

              {/* Word Part Text (with Ending box if ending) */}
              <div
                className={`font-mono font-bold tracking-wide transition-all ${
                  isThumbnail ? 'text-xs px-1 py-0.5' : 'text-sm sm:text-base px-1.5 py-0.5'
                } ${
                  symbolType === 'ending'
                    ? 'border-2 border-rose-500 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'text-primer-fg-default'
                }`}
              >
                {cleanPart}
              </div>

              {/* Bottom Stem Bracket or role badge */}
              {!isThumbnail && elem.role && (
                <div className="mt-2 text-[10px] text-center max-w-[120px]">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium border ${colorInfo.bg}`}>
                    {elem.role}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stem Bracket Line below */}
      {!isThumbnail && (
        <div className="w-full max-w-sm mt-2 flex items-center justify-center">
          <div className="w-full flex items-center justify-between text-primer-fg-muted">
            <span className="text-xs font-mono font-bold">⌊</span>
            <div className="h-0.5 flex-1 bg-primer-fg-muted/40 mx-0.5" />
            <span className="text-[10px] font-mono px-2 text-primer-fg-subtle">сөз негізі (основа)</span>
            <div className="h-0.5 flex-1 bg-primer-fg-muted/40 mx-0.5" />
            <span className="text-xs font-mono font-bold">⌋</span>
          </div>
        </div>
      )}
    </div>
  );
};
