import React, { useMemo } from 'react';
import { BaseZvdslSchema } from './types';
import { NumberLineRenderer } from './NumberLineRenderer';
import { MorphemeRenderer } from './MorphemeRenderer';
import { SyntaxRenderer } from './SyntaxRenderer';
import { ChemistryRenderer } from './ChemistryRenderer';
import { OrbitalsRenderer } from './OrbitalsRenderer';
import { ForcesRenderer } from './ForcesRenderer';
import { CircuitRenderer } from './CircuitRenderer';
import { AlertCircle, Eye } from 'lucide-react';

interface ZvdslRendererProps {
  schema: string | BaseZvdslSchema | Record<string, any> | null | undefined;
  width?: number;
  height?: number;
  className?: string;
  isThumbnail?: boolean;
  onInspect?: () => void;
}

export const ZvdslRenderer: React.FC<ZvdslRendererProps> = ({
  schema,
  width,
  height,
  className = '',
  isThumbnail = false,
  onInspect,
}) => {
  const parsedSchema = useMemo<BaseZvdslSchema | null>(() => {
    if (!schema) return null;
    if (typeof schema === 'object') return schema;
    try {
      return JSON.parse(schema);
    } catch {
      // Check if schema is in markdown codeblock format like ```zvdsl:morpheme\n...\n```
      const match = schema.match(/```(?:zvdsl:([a-z_]+)|json)?\s*([\s\S]*?)```/i);
      if (match) {
        try {
          const content = match[2].trim();
          const parsed = JSON.parse(content);
          if (match[1]) parsed.canvas_type = `zvdsl:${match[1]}`;
          return parsed;
        } catch {
          return null;
        }
      }
      return null;
    }
  }, [schema]);

  if (!parsedSchema) {
    return (
      <div className={`flex items-center justify-center p-3 text-primer-fg-subtle text-xs bg-primer-canvas-subtle rounded border border-primer-border-muted ${className}`}>
        <AlertCircle className="w-4 h-4 mr-1.5 opacity-50" />
        <span>Схема деректері жоқ (ZVDSL+ бос)</span>
      </div>
    );
  }

  const canvasType = (parsedSchema.canvas_type || '').toUpperCase();

  // Registry Dispatcher
  const renderContent = () => {
    // 1. Number Line & Intervals
    if (
      canvasType.includes('NUMBER_LINE') ||
      canvasType.includes('INTERVAL') ||
      canvasType.includes('FRACTION_SIGN') ||
      canvasType === 'ZVDSL:NUMBER_LINE'
    ) {
      return (
        <NumberLineRenderer
          schema={parsedSchema}
          width={width}
          height={height}
          isThumbnail={isThumbnail}
        />
      );
    }

    // 2. Morpheme breakdown
    if (
      canvasType.includes('MORPHEME') ||
      canvasType === 'ZVDSL:MORPHEME'
    ) {
      return (
        <MorphemeRenderer
          schema={parsedSchema}
          isThumbnail={isThumbnail}
        />
      );
    }

    // 3. Sentence Syntax & Clause trees
    if (
      canvasType.includes('SYNTAX') ||
      canvasType.includes('SENTENCE') ||
      canvasType.includes('LINGUISTIC') ||
      canvasType === 'ZVDSL:SYNTAX'
    ) {
      return (
        <SyntaxRenderer
          schema={parsedSchema}
          isThumbnail={isThumbnail}
        />
      );
    }

    // 4. Chemistry & Benzene
    if (
      canvasType.includes('CHEM') ||
      canvasType.includes('ORGANIC') ||
      canvasType === 'ZVDSL:CHEM'
    ) {
      return (
        <ChemistryRenderer
          schema={parsedSchema}
          isThumbnail={isThumbnail}
        />
      );
    }

    // 5. Orbitals & Quantum cells
    if (
      canvasType.includes('ORBITAL') ||
      canvasType.includes('QUANTUM') ||
      canvasType === 'ZVDSL:ORBITALS'
    ) {
      return (
        <OrbitalsRenderer
          schema={parsedSchema}
          isThumbnail={isThumbnail}
        />
      );
    }

    // 6. Physics Forces, Free Body & Kinematics
    if (
      canvasType.includes('FORCE') ||
      canvasType.includes('FREE_BODY') ||
      canvasType.includes('KINEMATICS') ||
      canvasType.includes('FREE_FALL') ||
      canvasType === 'ZVDSL:FORCES'
    ) {
      return (
        <ForcesRenderer
          schema={parsedSchema}
          isThumbnail={isThumbnail}
        />
      );
    }

    // 7. Electric Circuits
    if (
      canvasType.includes('CIRCUIT') ||
      canvasType.includes('ELECTRIC') ||
      canvasType === 'ZVDSL:CIRCUIT'
    ) {
      return (
        <CircuitRenderer
          schema={parsedSchema}
          isThumbnail={isThumbnail}
        />
      );
    }

    // 8. Gravitational Field
    if (canvasType.includes('GRAVITATIONAL')) {
      return (
        <div className="flex flex-col items-center justify-center p-3 select-none">
          <svg viewBox="0 0 240 100" className="w-full max-w-[240px] bg-primer-canvas-inset rounded-lg p-2 border border-primer-border-muted">
            <circle cx="50" cy="50" r="24" fill="#0969da" opacity={0.8} />
            <text x="50" y="54" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">M₁</text>
            <circle cx="190" cy="50" r="16" fill="#1a7f37" opacity={0.8} />
            <text x="190" y="54" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">M₂</text>
            <line x1="78" y1="50" x2="170" y2="50" stroke="#bf8700" strokeWidth="2" strokeDasharray="3,3" />
            <text x="124" y="42" textAnchor="middle" fill="#bf8700" fontSize="10" fontWeight="bold" fontFamily="ui-monospace">
              R ➔ 3R (F ~ 1/R²)
            </text>
          </svg>
        </div>
      );
    }

    // 9. Algebraic Identity
    if (canvasType.includes('ALGEBRAIC_IDENTITY')) {
      return (
        <div className="flex flex-col items-center justify-center p-3 font-mono">
          <div className="p-2.5 rounded bg-primer-canvas-inset border border-primer-border-muted text-center space-y-1">
            <div className="text-xs font-bold text-primer-accent-fg">
              x² - y² = (x - y)(x + y)
            </div>
            <div className="text-[11px] text-primer-success-fg">
              21 = 3 · (x + y) ➔ x + y = 7
            </div>
          </div>
        </div>
      );
    }

    // Fallback: Generic Number line / Plot
    return (
      <NumberLineRenderer
        schema={parsedSchema}
        width={width}
        height={height}
        isThumbnail={isThumbnail}
      />
    );
  };

  return (
    <div className={`relative group ${className}`}>
      {renderContent()}

      {/* Inspect button overlay if onInspect is provided */}
      {onInspect && isThumbnail && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect();
          }}
          title="Сызбаны холстта ашу"
          className="absolute top-1 right-1 p-1 rounded bg-primer-canvas-default/90 border border-primer-border-default text-primer-fg-muted hover:text-primer-accent-fg hover:border-primer-accent-emphasis shadow-sm transition opacity-80 hover:opacity-100 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
