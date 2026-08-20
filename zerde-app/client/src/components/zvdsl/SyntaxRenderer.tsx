import React from 'react';
import { SyntaxSchema, SyntaxRole } from './types';
import { ArrowRight } from 'lucide-react';

interface SyntaxRendererProps {
  schema: SyntaxSchema | any;
  className?: string;
  isThumbnail?: boolean;
}

export const SyntaxRenderer: React.FC<SyntaxRendererProps> = ({
  schema,
  className = '',
  isThumbnail = false,
}) => {
  const elements = schema.elements || [];

  // Helper for syntax underline styling
  const getUnderlineSvg = (role: SyntaxRole | string) => {
    const r = (role || '').toLowerCase();

    if (r.includes('subject') || r.includes('бастауыш') || r.includes('подлежащ')) {
      // Single straight line
      return (
        <svg width="100%" height="4" className="overflow-visible mt-1">
          <line x1="0" y1="2" x2="100%" y2="2" stroke="#0969da" strokeWidth="2.5" />
        </svg>
      );
    }

    if (r.includes('predicate') || r.includes('баяндауыш') || r.includes('сказуем')) {
      // Double straight line
      return (
        <svg width="100%" height="6" className="overflow-visible mt-0.5">
          <line x1="0" y1="1.5" x2="100%" y2="1.5" stroke="#cf222e" strokeWidth="2" />
          <line x1="0" y1="4.5" x2="100%" y2="4.5" stroke="#cf222e" strokeWidth="2" />
        </svg>
      );
    }

    if (r.includes('attribute') || r.includes('анықтауыш') || r.includes('определен')) {
      // Wavy line
      return (
        <svg width="100%" height="6" className="overflow-visible mt-0.5">
          <path
            d="M 0 3 Q 5 0, 10 3 T 20 3 T 30 3 T 40 3 T 50 3 T 60 3 T 70 3 T 80 3 T 90 3 T 100 3"
            fill="none"
            stroke="#1a7f37"
            strokeWidth="2"
          />
        </svg>
      );
    }

    if (r.includes('object') || r.includes('толықтауыш') || r.includes('дополнен')) {
      // Dashed line
      return (
        <svg width="100%" height="4" className="overflow-visible mt-1">
          <line x1="0" y1="2" x2="100%" y2="2" stroke="#bf8700" strokeWidth="2.5" strokeDasharray="4,3" />
        </svg>
      );
    }

    if (r.includes('adverbial') || r.includes('пысықтауыш') || r.includes('обстоятельств')) {
      // Dot-dash line _._._
      return (
        <svg width="100%" height="4" className="overflow-visible mt-1">
          <line x1="0" y1="2" x2="100%" y2="2" stroke="#8250df" strokeWidth="2.5" strokeDasharray="6,3,1.5,3" />
        </svg>
      );
    }

    return null;
  };

  // Check if this is a complex sentence diagram
  const isClauseDiagram = elements.some(
    (e: any) =>
      e.type === 'clause_box' ||
      e.type === 'subordinate_clause' ||
      e.type === 'main_clause' ||
      e.type === 'parallel_clause_1' ||
      e.type === 'parallel_clause_2' ||
      e.type === 'relation_arrow'
  );

  return (
    <div className={`flex flex-col items-center justify-center p-3 text-primer-fg-default select-none ${className}`}>
      {schema.title && !isThumbnail && (
        <div className="text-xs font-semibold text-primer-fg-muted mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>{schema.title}</span>
        </div>
      )}

      {/* Mode 1: Clause Diagram (Сложноподчиненные / Сложносочиненные) */}
      {isClauseDiagram && (
        <div className="w-full space-y-3">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {elements.map((elem: any, idx: number) => {
              if (elem.type === 'subordinate_clause' || elem.type === 'clause_1') {
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border-2 border-dashed border-amber-500/60 bg-amber-500/10 text-center"
                  >
                    <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold mb-0.5">
                      ( {elem.role || 'Бағыныңқы сөйлем'} )
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-primer-fg-default">
                      «{elem.text || elem.clause_1}»
                    </div>
                    {elem.marker && (
                      <div className="text-[9px] text-primer-fg-muted mt-1 font-mono">
                        Маркер: <span className="font-bold text-amber-500">{elem.marker}</span>
                      </div>
                    )}
                  </div>
                );
              }

              if (elem.type === 'main_clause' || elem.type === 'clause_2') {
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border-2 border-solid border-blue-500/60 bg-blue-500/10 text-center"
                  >
                    <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold mb-0.5">
                      [ {elem.role || 'Басыңқы сөйлем'} ]
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-primer-fg-default">
                      «{elem.text || elem.clause_2}»
                    </div>
                  </div>
                );
              }

              if (elem.type === 'clause_box') {
                return (
                  <div key={idx} className="flex items-center gap-2 flex-wrap justify-center">
                    <div className="px-3 py-1.5 rounded-md border border-primer-border-default bg-primer-canvas-inset font-mono text-xs font-bold">
                      {elem.clause_1}
                    </div>
                    {elem.conjunction && (
                      <div className="px-2 py-0.5 rounded-full bg-primer-attention-emphasis text-white font-bold text-[10px] font-mono">
                        {elem.conjunction}
                      </div>
                    )}
                    <div className="px-3 py-1.5 rounded-md border border-primer-border-default bg-primer-canvas-inset font-mono text-xs font-bold">
                      {elem.clause_2}
                    </div>
                  </div>
                );
              }

              if (elem.type === 'relation_arrow') {
                return (
                  <div key={idx} className="flex flex-col items-center justify-center px-1 text-center">
                    {elem.question && (
                      <span className="text-[9px] font-bold text-primer-accent-fg bg-primer-accent-subtle px-1.5 py-0.5 rounded mb-0.5">
                        {elem.question}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-primer-accent-fg" />
                  </div>
                );
              }

              if (elem.type?.startsWith('parallel_clause')) {
                return (
                  <div key={idx} className="p-2 rounded bg-primer-canvas-inset border border-primer-border-muted text-xs font-mono">
                    {elem.text}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Word-by-word sentence parsing with syntax underlines */}
      {(schema.tokens || (!isClauseDiagram && schema.sentence)) && (
        <div className="flex items-end justify-center gap-2 sm:gap-3 flex-wrap py-3 px-4 rounded-lg bg-primer-canvas-inset border border-primer-border-muted">
          {(schema.tokens || []).map((token: any, idx: number) => {
            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Part of speech above */}
                {token.pos && (
                  <span className="text-[9px] font-mono text-primer-fg-muted mb-0.5">
                    {token.pos}
                  </span>
                )}

                {/* Word */}
                <div className="font-semibold text-xs sm:text-sm text-primer-fg-default px-0.5">
                  {token.text}
                </div>

                {/* Underline */}
                {getUnderlineSvg(token.role)}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend for syntax lines */}
      {!isThumbnail && (
        <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-primer-fg-muted flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-500 inline-block" /> Бастауыш
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-1 border-t border-b border-rose-500 inline-block" /> Баяндауыш
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 border-t border-dashed border-amber-500 inline-block" /> Толықтауыш
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Анықтауыш
          </span>
        </div>
      )}
    </div>
  );
};
