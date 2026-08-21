import React from 'react';
import { ChemistrySchema } from './types';

interface ChemistryRendererProps {
  schema: ChemistrySchema | any;
  className?: string;
  isThumbnail?: boolean;
}

export const ChemistryRenderer: React.FC<ChemistryRendererProps> = ({
  schema,
  className = '',
  isThumbnail = false,
}) => {
  // If formula or reactions specified
  const formula = schema.formula || 'C6H6';
  const name = schema.name || schema.title || '';
  const rings = schema.rings || [];
  const atoms = schema.atoms || [];
  const bonds = schema.bonds || [];
  const reactions = schema.reactions || [];

  return (
    <div className={`flex flex-col items-center justify-center p-3 select-none ${className}`}>
      {name && !isThumbnail && (
        <div className="text-xs font-semibold text-primer-fg-muted mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{name}</span>
        </div>
      )}

      {/* SVG Chemical Canvas */}
      <div className="rounded-lg bg-primer-canvas-inset border border-primer-border-muted p-3 flex items-center justify-center">
        <svg
          viewBox="0 0 300 160"
          className="w-full max-w-[280px] h-auto overflow-visible"
        >
          {/* 1. If Benzene Ring is requested or default */}
          {(rings.length > 0 || (!atoms.length && !reactions.length)) && (
            <g transform="translate(150, 80)">
              {/* Hexagon vertices: 60 deg each */}
              {(() => {
                const r = isThumbnail ? 30 : 42;
                const points = [];
                for (let i = 0; i < 6; i++) {
                  const angle = (i * 60 - 30) * (Math.PI / 180);
                  points.push(`${r * Math.cos(angle)},${r * Math.sin(angle)}`);
                }
                const ptsStr = points.join(' ');

                return (
                  <>
                    {/* Outer hexagon */}
                    <polygon
                      points={ptsStr}
                      fill="none"
                      stroke="#1a7f37"
                      strokeWidth={isThumbnail ? 2 : 2.5}
                      strokeLinejoin="round"
                    />
                    {/* Inner aromatic circle */}
                    <circle
                      cx="0"
                      cy="0"
                      r={r * 0.6}
                      fill="rgba(26, 127, 55, 0.08)"
                      stroke="#1a7f37"
                      strokeWidth="1.5"
                      strokeDasharray="4,3"
                    />
                    {/* Substituents like -OH or -CH3 */}
                    {rings[0]?.substituents?.map((sub: any, sIdx: number) => {
                      const angle = (sub.angle || 90) * (Math.PI / 180);
                      const subX = (r + 20) * Math.cos(angle);
                      const subY = (r + 20) * Math.sin(angle);
                      return (
                        <g key={sIdx}>
                          <line
                            x1={r * Math.cos(angle)}
                            y1={r * Math.sin(angle)}
                            x2={(r + 12) * Math.cos(angle)}
                            y2={(r + 12) * Math.sin(angle)}
                            stroke="#1a7f37"
                            strokeWidth="2"
                          />
                          <text
                            x={subX}
                            y={subY + 4}
                            textAnchor="middle"
                            fill="currentColor"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="ui-monospace, monospace"
                            className="text-primer-fg-default"
                          >
                            {sub.label || 'OH'}
                          </text>
                        </g>
                      );
                    }) || (
                      /* Default -OH or -CH3 branch if no substituent specified */
                      <g>
                        <line x1="0" y1={-r} x2="0" y2={-(r + 14)} stroke="#1a7f37" strokeWidth="2" />
                        <text
                          x="0"
                          y={-(r + 18)}
                          textAnchor="middle"
                          fill="currentColor"
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="ui-monospace, monospace"
                          className="text-primer-fg-default"
                        >
                          CH₃
                        </text>
                      </g>
                    )}
                  </>
                );
              })()}
            </g>
          )}

          {/* 2. Linear / Branched structural formula */}
          {atoms.length > 0 && (
            <g>
              {/* Draw Bonds */}
              {bonds.map((bond: any, bIdx: number) => {
                const a1 = atoms.find((a: any) => a.id === bond.from);
                const a2 = atoms.find((a: any) => a.id === bond.to);
                if (!a1 || !a2) return null;

                if (bond.type === 'double') {
                  return (
                    <g key={bIdx}>
                      <line x1={a1.x} y1={a1.y - 2} x2={a2.x} y2={a2.y - 2} stroke="#0969da" strokeWidth="2" />
                      <line x1={a1.x} y1={a1.y + 2} x2={a2.x} y2={a2.y + 2} stroke="#0969da" strokeWidth="2" />
                    </g>
                  );
                } else if (bond.type === 'triple') {
                  return (
                    <g key={bIdx}>
                      <line x1={a1.x} y1={a1.y - 3} x2={a2.x} y2={a2.y - 3} stroke="#0969da" strokeWidth="1.5" />
                      <line x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y} stroke="#0969da" strokeWidth="1.5" />
                      <line x1={a1.x} y1={a1.y + 3} x2={a2.x} y2={a2.y + 3} stroke="#0969da" strokeWidth="1.5" />
                    </g>
                  );
                } else {
                  return (
                    <line
                      key={bIdx}
                      x1={a1.x}
                      y1={a1.y}
                      x2={a2.x}
                      y2={a2.y}
                      stroke="#0969da"
                      strokeWidth="2"
                    />
                  );
                }
              })}

              {/* Draw Atoms */}
              {atoms.map((atom: any, aIdx: number) => (
                <g key={aIdx} transform={`translate(${atom.x}, ${atom.y})`}>
                  <circle cx="0" cy="0" r="12" fill="var(--color-canvas-default, #0d1117)" />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="ui-monospace, monospace"
                    className="text-primer-fg-default"
                  >
                    {atom.element}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* 3. Chemical Reaction Equation Mode */}
          {reactions.length > 0 && (
            <g transform="translate(20, 80)">
              <text
                x="0"
                y="0"
                fill="currentColor"
                fontSize="12"
                fontWeight="bold"
                fontFamily="ui-monospace, monospace"
                className="text-primer-fg-default"
              >
                {reactions[0].reactants}
              </text>
              <line x1="110" y1="-4" x2="160" y2="-4" stroke="#1a7f37" strokeWidth="2" markerEnd="url(#chem-arrow)" />
              <text x="135" y="-10" textAnchor="middle" fill="#1a7f37" fontSize="9" fontFamily="ui-monospace">
                {reactions[0].conditions || 't°, Kat'}
              </text>
              <text
                x="170"
                y="0"
                fill="currentColor"
                fontSize="12"
                fontWeight="bold"
                fontFamily="ui-monospace, monospace"
                className="text-primer-fg-default"
              >
                {reactions[0].products}
              </text>
            </g>
          )}
        </svg>
      </div>

      {!isThumbnail && (
        <div className="mt-2 text-[11px] font-mono text-primer-success-fg font-semibold">
          Формула: {formula} {schema.iupac_name ? `(${schema.iupac_name})` : ''}
        </div>
      )}
    </div>
  );
};
