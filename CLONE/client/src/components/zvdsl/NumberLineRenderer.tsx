import React from 'react';
import { NumberLineSchema } from './types';

interface NumberLineRendererProps {
  schema: NumberLineSchema | any;
  width?: number;
  height?: number;
  className?: string;
  isThumbnail?: boolean;
}

export const NumberLineRenderer: React.FC<NumberLineRendererProps> = ({
  schema,
  width = 600,
  height = 200,
  className = '',
  isThumbnail = false,
}) => {
  // Extract elements or defaults
  const elements = schema.elements || [];

  // Determine axis range
  const axisElement = elements.find((e: any) => e.type === 'axis');
  let min = axisElement?.min ?? -6;
  let max = axisElement?.max ?? 6;
  const step = axisElement?.step ?? 1;

  // Check if there are points extending beyond default
  elements.forEach((e: any) => {
    if (typeof e.x === 'number') {
      if (e.x < min) min = Math.floor(e.x) - 1;
      if (e.x > max) max = Math.ceil(e.x) + 1;
    }
    if (typeof e.from === 'number' && e.from !== -Infinity && e.from < min) {
      min = Math.floor(e.from) - 1;
    }
    if (typeof e.to === 'number' && e.to !== Infinity && e.to > max) {
      max = Math.ceil(e.to) + 1;
    }
    if (Array.isArray(e.interval)) {
      if (e.interval[0] !== -Infinity && e.interval[0] < min) min = Math.floor(e.interval[0]) - 1;
      if (e.interval[1] !== Infinity && e.interval[1] > max) max = Math.ceil(e.interval[1]) + 1;
    }
  });

  const paddingX = isThumbnail ? 20 : 45;
  const paddingY = isThumbnail ? 25 : 40;
  const renderWidth = width;
  const renderHeight = height;

  const scaleX = (val: number) => {
    const clamped = Math.max(min, Math.min(max, val));
    return paddingX + ((clamped - min) / (max - min)) * (renderWidth - 2 * paddingX);
  };

  const axisY = isThumbnail ? renderHeight * 0.6 : renderHeight * 0.55;

  // Extract points, signs, shaded regions, layers
  const points = elements.filter(
    (e: any) =>
      e.type === 'root_point' ||
      e.type === 'root' ||
      e.type === 'pole' ||
      e.type === 'double_root' ||
      typeof e.x === 'number'
  );

  const signs = elements.filter((e: any) => e.type === 'interval_sign' || e.sign);
  const shaded = elements.filter((e: any) => e.type === 'shaded_region');
  const layers = elements.filter((e: any) => e.type === 'number_line_layer');
  const intersection = elements.find((e: any) => e.type === 'intersection_highlight');

  // Generate tick marks
  const ticks: number[] = [];
  for (let i = Math.ceil(min); i <= Math.floor(max); i += step) {
    ticks.push(i);
  }

  const hatchPatternId = `hatch-pattern-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {schema.title && !isThumbnail && (
        <div className="text-xs font-semibold text-primer-fg-muted mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primer-accent-emphasis" />
          <span>{schema.title}</span>
        </div>
      )}

      <svg
        viewBox={`0 0 ${renderWidth} ${renderHeight}`}
        className="w-full h-full max-h-full overflow-visible"
        style={{ minHeight: isThumbnail ? '80px' : '150px' }}
      >
        <defs>
          {/* Diagonal Hatch Pattern for Shading */}
          <pattern
            id={hatchPatternId}
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="2.5" className="text-primer-success-fg opacity-40" />
          </pattern>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="6"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" className="fill-primer-fg-muted" />
          </marker>
        </defs>

        {/* 1. Shaded Regions */}
        {shaded.map((sh: any, idx: number) => {
          const intervals: [number, number][] = sh.intervals || [];
          return intervals.map(([fromVal, toVal], iIdx) => {
            const startX = fromVal === -Infinity || fromVal <= min ? paddingX - 10 : scaleX(fromVal);
            const endX = toVal === Infinity || toVal >= max ? renderWidth - paddingX + 10 : scaleX(toVal);
            const rWidth = Math.max(0, endX - startX);
            const rHeight = isThumbnail ? 22 : 36;
            const rY = axisY - rHeight;

            return (
              <g key={`sh-${idx}-${iIdx}`}>
                <rect
                  x={startX}
                  y={rY}
                  width={rWidth}
                  height={rHeight}
                  fill={`url(#${hatchPatternId})`}
                  rx={3}
                />
                <rect
                  x={startX}
                  y={rY}
                  width={rWidth}
                  height={rHeight}
                  fill={sh.fill || 'rgba(35, 134, 54, 0.15)'}
                  rx={3}
                />
              </g>
            );
          });
        })}

        {/* 2. System Layers (if system overlap) */}
        {layers.map((layer: any, lIdx: number) => {
          const [fromVal, toVal] = layer.interval || [0, 0];
          const startX = fromVal === -Infinity || fromVal <= min ? paddingX - 10 : scaleX(fromVal);
          const endX = toVal === Infinity || toVal >= max ? renderWidth - paddingX + 10 : scaleX(toVal);
          const layerY = axisY - (lIdx + 1) * (isThumbnail ? 16 : 24);
          const color = layer.color || (lIdx === 0 ? '#0969da' : '#1a7f37');

          return (
            <g key={`layer-${lIdx}`}>
              {/* Layer Interval Bracket/Line */}
              <line
                x1={startX}
                y1={layerY}
                x2={endX}
                y2={layerY}
                stroke={color}
                strokeWidth={isThumbnail ? 2 : 3}
                strokeLinecap="round"
              />
              {/* Downward drop lines */}
              {fromVal !== -Infinity && fromVal > min && (
                <line
                  x1={startX}
                  y1={layerY}
                  x2={startX}
                  y2={axisY}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
              )}
              {toVal !== Infinity && toVal < max && (
                <line
                  x1={endX}
                  y1={layerY}
                  x2={endX}
                  y2={axisY}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
              )}
              {/* Layer Name */}
              {layer.name && !isThumbnail && (
                <text
                  x={Math.max(paddingX, startX + 6)}
                  y={layerY - 4}
                  fill={color}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="ui-monospace, monospace"
                >
                  {layer.name}
                </text>
              )}
            </g>
          );
        })}

        {/* 3. Intersection Highlight */}
        {intersection && (
          <g>
            {(() => {
              const [fromVal, toVal] = intersection.interval || [0, 0];
              const startX = scaleX(fromVal);
              const endX = scaleX(toVal);
              return (
                <rect
                  x={startX}
                  y={axisY - (isThumbnail ? 20 : 32)}
                  width={endX - startX}
                  height={isThumbnail ? 20 : 32}
                  fill="rgba(88, 166, 255, 0.25)"
                  stroke="#58a6ff"
                  strokeWidth={1.5}
                  strokeDasharray="3,3"
                  rx={2}
                />
              );
            })()}
          </g>
        )}

        {/* 4. Main Number Line Axis */}
        <line
          x1={paddingX - 10}
          y1={axisY}
          x2={renderWidth - paddingX + 15}
          y2={axisY}
          stroke="currentColor"
          strokeWidth={isThumbnail ? 1.5 : 2}
          className="text-primer-fg-muted"
          markerEnd="url(#arrowhead)"
        />
        <text
          x={renderWidth - paddingX + 22}
          y={axisY + 4}
          fill="currentColor"
          fontSize={isThumbnail ? '9' : '11'}
          fontFamily="ui-monospace, monospace"
          fontWeight="bold"
          className="text-primer-fg-muted"
        >
          x
        </text>

        {/* 5. Axis Ticks & Numbers */}
        {ticks.map((tVal) => {
          const tX = scaleX(tVal);
          return (
            <g key={`tick-${tVal}`}>
              <line
                x1={tX}
                y1={axisY - (isThumbnail ? 3 : 5)}
                x2={tX}
                y2={axisY + (isThumbnail ? 3 : 5)}
                stroke="currentColor"
                strokeWidth={1}
                className="text-primer-border-muted"
              />
              {!isThumbnail && (
                <text
                  x={tX}
                  y={axisY + 18}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  className="text-primer-fg-subtle"
                >
                  {tVal}
                </text>
              )}
            </g>
          );
        })}

        {/* 6. Interval Arc Signs (+ / − / +) */}
        {signs.map((signElem: any, sIdx: number) => {
          const fromX = signElem.from === -Infinity || signElem.from <= min ? paddingX - 5 : scaleX(signElem.from);
          const toX = signElem.to === Infinity || signElem.to >= max ? renderWidth - paddingX + 5 : scaleX(signElem.to);
          const midX = (fromX + toX) / 2;
          const arcHeight = isThumbnail ? 14 : 22;
          const signY = axisY - arcHeight;
          const isPlus = signElem.sign === '+' || signElem.sign === 'pos';
          const signColor = signElem.color || (isPlus ? '#238636' : '#cf222e');

          return (
            <g key={`sign-${sIdx}`}>
              {/* Arc curve over interval */}
              <path
                d={`M ${fromX} ${axisY} Q ${midX} ${axisY - arcHeight * 1.5} ${toX} ${axisY}`}
                fill="none"
                stroke={signColor}
                strokeWidth={isThumbnail ? 1 : 1.5}
                strokeDasharray="3,3"
                opacity={0.7}
              />
              {/* Sign Badge */}
              <circle
                cx={midX}
                cy={signY - 2}
                r={isThumbnail ? 6 : 9}
                fill={isPlus ? 'rgba(35, 134, 54, 0.15)' : 'rgba(207, 34, 46, 0.15)'}
                stroke={signColor}
                strokeWidth={1.5}
              />
              <text
                x={midX}
                y={signY + (isThumbnail ? 1.5 : 2)}
                textAnchor="middle"
                dominantBaseline="central"
                fill={signColor}
                fontSize={isThumbnail ? '9' : '12'}
                fontWeight="bold"
                fontFamily="ui-monospace, monospace"
              >
                {signElem.sign === '−' || signElem.sign === '-' ? '−' : '+'}
              </text>
            </g>
          );
        })}

        {/* 7. Root Points & Poles (Hollow vs Solid) */}
        {points.map((pt: any, pIdx: number) => {
          const pX = scaleX(pt.x);
          const isHollow =
            pt.style === 'hollow' ||
            pt.style === 'open' ||
            pt.type === 'pole' ||
            pt.bracket === 'open' ||
            pt.bracket === '(' ||
            pt.bracket === ')';
          const isDouble = pt.type === 'double_root';
          const ptColor = pt.color || (isHollow ? '#cf222e' : '#1a7f37');
          const radius = isThumbnail ? 3.5 : 5.5;

          return (
            <g key={`pt-${pIdx}`}>
              {/* Double root loop/marker */}
              {isDouble && (
                <path
                  d={`M ${pX - 6} ${axisY} C ${pX - 8} ${axisY - 16}, ${pX + 8} ${axisY - 16}, ${pX + 6} ${axisY}`}
                  fill="none"
                  stroke="#bf8700"
                  strokeWidth={2}
                />
              )}

              {/* Point Circle */}
              <circle
                cx={pX}
                cy={axisY}
                r={radius}
                fill={isHollow ? 'var(--color-canvas-default, #0d1117)' : ptColor}
                stroke={ptColor}
                strokeWidth={isThumbnail ? 1.5 : 2.5}
              />

              {/* Point Label / Value */}
              <text
                x={pX}
                y={axisY + (isThumbnail ? 12 : 20)}
                textAnchor="middle"
                fill={ptColor}
                fontSize={isThumbnail ? '9' : '11'}
                fontWeight="bold"
                fontFamily="ui-monospace, monospace"
              >
                {pt.label !== undefined ? pt.label : pt.x}
              </text>

              {/* Note / Annotation */}
              {pt.note && !isThumbnail && (
                <text
                  x={pX}
                  y={axisY - 14}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="9"
                  fontWeight="medium"
                  className="text-primer-fg-muted"
                >
                  {pt.note}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
