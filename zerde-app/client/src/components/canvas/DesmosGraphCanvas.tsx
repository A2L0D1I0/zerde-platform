import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sliders, RotateCcw, ZoomIn, ZoomOut, Move, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface DesmosExpression {
  id: string;
  latex?: string;
  color?: string;
  lineWidth?: number;
  lineStyle?: 'SOLID' | 'DASHED' | 'DOTTED';
  pointStyle?: 'POINT' | 'OPEN';
  type?: 'function' | 'line' | 'circle' | 'point' | 'asymptote';
  fn?: (x: number) => number;
}

export interface DesmosGraphCanvasProps {
  desmosState?: any;
  initialA?: number;
  initialB?: number;
  initialC?: number;
  width?: number;
  height?: number;
  className?: string;
  showSliders?: boolean;
  isThumbnail?: boolean;
}

export const DesmosGraphCanvas: React.FC<DesmosGraphCanvasProps> = ({
  desmosState,
  initialA = 1,
  initialB = -1,
  initialC = -6,
  width = 600,
  height = 360,
  className = '',
  showSliders = true,
  isThumbnail = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parameter sliders for interactive exploration: y = ax^2 + bx + c
  const [a, setA] = useState<number>(initialA);
  const [b, setB] = useState<number>(initialB);
  const [c, setC] = useState<number>(initialC);

  // Coordinate system viewport state
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);
  const [scale, setScale] = useState<number>(30); // pixels per math unit
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // Parse desmosState if passed
  const parsedState = React.useMemo(() => {
    if (!desmosState) return null;
    if (typeof desmosState === 'object') return desmosState;
    try {
      return JSON.parse(desmosState);
    } catch {
      return null;
    }
  }, [desmosState]);

  // Extract expressions
  const expressions: DesmosExpression[] = React.useMemo(() => {
    const list: DesmosExpression[] = [];

    if (parsedState?.expressions?.list) {
      parsedState.expressions.list.forEach((item: any) => {
        list.push({
          id: item.id || Math.random().toString(),
          latex: item.latex || '',
          color: item.color || '#0969da',
          lineWidth: item.lineWidth || 2.5,
          lineStyle: item.lineStyle || 'SOLID',
          pointStyle: item.pointStyle || 'POINT',
        });
      });
    }

    return list;
  }, [parsedState]);

  // Discriminant & roots for parabola y = ax^2 + bx + c
  const D = b * b - 4 * a * c;
  const vertexX = a !== 0 ? -b / (2 * a) : 0;
  const vertexY = a !== 0 ? a * vertexX * vertexX + b * vertexX + c : 0;
  const roots: number[] = [];
  if (a !== 0) {
    if (D > 0) {
      roots.push((-b - Math.sqrt(D)) / (2 * a));
      roots.push((-b + Math.sqrt(D)) / (2 * a));
    } else if (D === 0) {
      roots.push(-b / (2 * a));
    }
  }

  // Convert canvas pixel to math coordinate
  const pxToMath = useCallback(
    (pxX: number, pxY: number, canvasWidth: number, canvasHeight: number) => {
      const mathX = (pxX - canvasWidth / 2) / scale + centerX;
      const mathY = -(pxY - canvasHeight / 2) / scale + centerY;
      return { x: mathX, y: mathY };
    },
    [centerX, centerY, scale]
  );

  // Convert math coordinate to canvas pixel
  const mathToPx = useCallback(
    (mX: number, mY: number, canvasWidth: number, canvasHeight: number) => {
      const pxX = (mX - centerX) * scale + canvasWidth / 2;
      const pxY = -(mY - centerY) * scale + canvasHeight / 2;
      return { x: pxX, y: pxY };
    },
    [centerX, centerY, scale]
  );

  // Main Canvas Render Loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || width;
    const h = rect.height || height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#0d1117'; // Primer dark canvas default
    ctx.fillRect(0, 0, w, h);

    // 1. Draw Grid Lines
    const step = scale < 20 ? 2 : scale < 40 ? 1 : 0.5;
    const { x: minMathX, y: maxMathY } = pxToMath(0, 0, w, h);
    const { x: maxMathX, y: minMathY } = pxToMath(w, h, w, h);

    ctx.lineWidth = 1;

    // Sub-grid & Main grid
    for (let mx = Math.floor(minMathX / step) * step; mx <= maxMathX; mx += step) {
      const { x: px } = mathToPx(mx, 0, w, h);
      ctx.strokeStyle = Math.abs(mx) < 0.001 ? '#58a6ff' : 'rgba(110, 118, 129, 0.15)';
      ctx.lineWidth = Math.abs(mx) < 0.001 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();

      // Tick label
      if (Math.abs(mx) > 0.001 && scale >= 22 && !isThumbnail) {
        ctx.fillStyle = '#6e7781';
        ctx.font = '10px ui-monospace, monospace';
        const { y: axisY } = mathToPx(0, 0, w, h);
        const clampedY = Math.max(15, Math.min(h - 10, axisY + 12));
        ctx.fillText(mx.toFixed(step < 1 ? 1 : 0), px - 4, clampedY);
      }
    }

    for (let my = Math.floor(minMathY / step) * step; my <= maxMathY; my += step) {
      const { y: py } = mathToPx(0, my, w, h);
      ctx.strokeStyle = Math.abs(my) < 0.001 ? '#58a6ff' : 'rgba(110, 118, 129, 0.15)';
      ctx.lineWidth = Math.abs(my) < 0.001 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
      ctx.stroke();

      // Tick label
      if (Math.abs(my) > 0.001 && scale >= 22 && !isThumbnail) {
        ctx.fillStyle = '#6e7781';
        ctx.font = '10px ui-monospace, monospace';
        const { x: axisX } = mathToPx(0, 0, w, h);
        const clampedX = Math.max(10, Math.min(w - 25, axisX + 4));
        ctx.fillText(my.toFixed(step < 1 ? 1 : 0), clampedX, py + 3);
      }
    }

    // 2. Plot Static / Explicit Expressions from Desmos State
    if (expressions.length > 0) {
      expressions.forEach((expr) => {
        const latex = expr.latex || '';

        // Check if point: (x, y)
        const ptMatch = latex.match(/\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/);
        if (ptMatch) {
          const ptX = parseFloat(ptMatch[1]);
          const ptY = parseFloat(ptMatch[2]);
          const { x: px, y: py } = mathToPx(ptX, ptY, w, h);

          ctx.beginPath();
          ctx.arc(px, py, expr.pointStyle === 'OPEN' ? 5 : 6, 0, 2 * Math.PI);
          ctx.fillStyle = expr.pointStyle === 'OPEN' ? '#0d1117' : expr.color || '#1a7f37';
          ctx.fill();
          ctx.strokeStyle = expr.color || '#1a7f37';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Coordinate label
          if (!isThumbnail) {
            ctx.fillStyle = expr.color || '#1a7f37';
            ctx.font = 'bold 10px ui-monospace, monospace';
            ctx.fillText(`(${ptX}, ${ptY})`, px + 8, py - 6);
          }
          return;
        }

        // Check if vertical asymptote line: x = c
        const xLineMatch = latex.match(/^x\s*=\s*([-\d.]+)/);
        if (xLineMatch) {
          const lineX = parseFloat(xLineMatch[1]);
          const { x: px } = mathToPx(lineX, 0, w, h);
          ctx.save();
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = expr.color || '#cf222e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, 0);
          ctx.lineTo(px, h);
          ctx.stroke();
          ctx.restore();
          return;
        }

        // Check if circle: x^2 + y^2 = r^2
        const circleMatch = latex.match(/x\^?2\s*\+\s*y\^?2\s*=\s*([-\d.]+)/);
        if (circleMatch) {
          const rSq = parseFloat(circleMatch[1]);
          const radius = Math.sqrt(rSq);
          const { x: px, y: py } = mathToPx(0, 0, w, h);
          ctx.beginPath();
          ctx.arc(px, py, radius * scale, 0, 2 * Math.PI);
          ctx.strokeStyle = expr.color || '#bf8700';
          ctx.lineWidth = expr.lineWidth || 2.5;
          ctx.stroke();
          return;
        }

        // Function plot: y = f(x)
        ctx.beginPath();
        ctx.strokeStyle = expr.color || '#0969da';
        ctx.lineWidth = expr.lineWidth || 2.5;
        if (expr.lineStyle === 'DASHED') ctx.setLineDash([6, 4]);
        else ctx.setLineDash([]);

        let isFirst = true;
        for (let px = 0; px <= w; px += 2) {
          const mx = pxToMath(px, 0, w, h).x;
          let my = 0;

          // Simple evaluator
          if (latex.includes('(x - 3)(x + 2)') || latex.includes('(x-3)(x+2)')) {
            my = (mx - 3) * (mx + 2);
          } else if (latex.includes('-x^2 + 4x - 3') || latex.includes('-x^2+4x-3')) {
            my = -mx * mx + 4 * mx - 3;
          } else if (latex.includes('x^2 - 4') && latex.includes('x - 5')) {
            if (Math.abs(mx - 5) < 0.08) {
              isFirst = true;
              continue;
            }
            my = (mx * mx - 4) / (mx - 5);
          } else if (latex.includes('x + y = 5')) {
            my = 5 - mx;
          } else if (latex.includes('v(t) = 4 + 2t')) {
            if (mx < 0 || mx > 3) continue;
            my = 4 + 2 * mx;
          } else if (latex.includes('y = 0')) {
            my = 0;
          } else {
            // Default interactive parabola
            my = a * mx * mx + b * mx + c;
          }

          const { y: py } = mathToPx(mx, my, w, h);
          if (py < -200 || py > h + 200) {
            isFirst = true;
            continue;
          }

          if (isFirst) {
            ctx.moveTo(px, py);
            isFirst = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });
    } else {
      // 3. Interactive Parabola Plot: y = ax^2 + bx + c
      ctx.beginPath();
      ctx.strokeStyle = '#58a6ff';
      ctx.lineWidth = 3;

      let isFirst = true;
      for (let px = 0; px <= w; px += 2) {
        const mx = pxToMath(px, 0, w, h).x;
        const my = a * mx * mx + b * mx + c;
        const { y: py } = mathToPx(mx, my, w, h);

        if (py < -200 || py > h + 200) {
          isFirst = true;
          continue;
        }

        if (isFirst) {
          ctx.moveTo(px, py);
          isFirst = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // Vertex Point
      if (a !== 0) {
        const { x: vPx, y: vPy } = mathToPx(vertexX, vertexY, w, h);
        ctx.beginPath();
        ctx.arc(vPx, vPy, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#3fb950';
        ctx.fill();
        ctx.strokeStyle = '#238636';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (!isThumbnail) {
          ctx.fillStyle = '#3fb950';
          ctx.font = 'bold 10px ui-monospace, monospace';
          ctx.fillText(`Төбесі (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`, vPx + 8, vPy - 8);
        }
      }

      // Root Points (Zeros)
      roots.forEach((rootVal, idx) => {
        const { x: rPx, y: rPy } = mathToPx(rootVal, 0, w, h);
        ctx.beginPath();
        ctx.arc(rPx, rPy, 5.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#f85149';
        ctx.fill();
        ctx.strokeStyle = '#da3633';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (!isThumbnail) {
          ctx.fillStyle = '#f85149';
          ctx.font = 'bold 10px ui-monospace, monospace';
          ctx.fillText(`x${idx + 1} = ${rootVal.toFixed(2)}`, rPx - 15, rPy + 18);
        }
      });
    }

    // 4. Hover Coordinates Crosshair
    if (hoverCoords && !isThumbnail) {
      const { x: hPx, y: hPy } = mathToPx(hoverCoords.x, hoverCoords.y, w, h);

      ctx.strokeStyle = 'rgba(88, 166, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(hPx, 0);
      ctx.lineTo(hPx, h);
      ctx.moveTo(0, hPy);
      ctx.lineTo(w, hPy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tooltip pill
      ctx.fillStyle = 'rgba(22, 27, 34, 0.9)';
      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(hPx + 10, hPy - 25, 90, 22, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#58a6ff';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.fillText(
        `(${hoverCoords.x.toFixed(2)}, ${hoverCoords.y.toFixed(2)})`,
        hPx + 15,
        hPy - 10
      );
    }
  }, [
    a,
    b,
    c,
    centerX,
    centerY,
    scale,
    expressions,
    hoverCoords,
    isThumbnail,
    mathToPx,
    pxToMath,
    roots,
    vertexX,
    vertexY,
    width,
    height,
  ]);

  // Request Animation Frame / Redraw on state change
  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse pan & zoom handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pxX = e.clientX - rect.left;
    const pxY = e.clientY - rect.top;

    const mathPt = pxToMath(pxX, pxY, rect.width, rect.height);
    setHoverCoords(mathPt);

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setCenterX((prev) => prev - dx / scale);
      setCenterY((prev) => prev + dy / scale);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setScale((prev) => Math.max(10, Math.min(150, prev * zoomFactor)));
  };

  const handleResetView = () => {
    setCenterX(0);
    setCenterY(0);
    setScale(30);
    setA(initialA);
    setB(initialB);
    setC(initialC);
  };

  return (
    <div className={`flex flex-col bg-primer-canvas-inset border border-primer-border-default rounded-lg overflow-hidden select-none ${className}`}>
      {/* Top Toolbar */}
      {!isThumbnail && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-primer-border-muted bg-primer-canvas-subtle text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primer-fg-default flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primer-accent-fg" />
              <span>Desmos Engine</span>
            </span>
            <Badge variant="accent" className="font-mono text-[10px] py-0">
              y = {a}x² {b >= 0 ? `+ ${b}x` : `${b}x`} {c >= 0 ? `+ ${c}` : `${c}`}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setScale((s) => Math.min(150, s * 1.2))}
              className="h-7 w-7 p-0"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setScale((s) => Math.max(10, s * 0.8))}
              className="h-7 w-7 p-0"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetView}
              className="h-7 w-7 p-0"
              title="Бастапқы күйге қайтару"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Coordinate Canvas */}
      <div className="relative w-full overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setHoverCoords(null);
          }}
          onWheel={handleWheel}
          style={{ width: '100%', height: isThumbnail ? '120px' : '260px' }}
          className="block"
        />

        {/* Live Coordinate Pill in bottom right */}
        {!isThumbnail && hoverCoords && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-primer-canvas-overlay/90 border border-primer-border-default text-[10px] font-mono text-primer-accent-fg shadow-sm pointer-events-none">
            X: {hoverCoords.x.toFixed(2)} | Y: {hoverCoords.y.toFixed(2)}
          </div>
        )}
      </div>

      {/* Interactive Parameter Sliders (a, b, c) */}
      {showSliders && !isThumbnail && (
        <div className="p-3 border-t border-primer-border-muted bg-primer-canvas-subtle/70 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-primer-fg-muted">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Параметрлік ползуноктар (a, b, c):</span>
            </span>
            <span className="font-mono text-primer-success-fg">
              D = {D.toFixed(1)} {D > 0 ? '(2 түбір)' : D === 0 ? '(1 түбір)' : '(түбір жоқ)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Slider A */}
            <div className="flex items-center gap-2 bg-primer-canvas-inset px-2.5 py-1.5 rounded border border-primer-border-muted">
              <span className="font-mono font-bold text-primer-accent-fg w-4">a:</span>
              <input
                type="range"
                min="-4"
                max="4"
                step="0.2"
                value={a}
                onChange={(e) => setA(parseFloat(e.target.value) || 0.1)}
                className="flex-1 accent-primer-accent-emphasis cursor-pointer h-1.5"
              />
              <span className="font-mono font-bold text-primer-fg-default w-8 text-right">
                {a}
              </span>
            </div>

            {/* Slider B */}
            <div className="flex items-center gap-2 bg-primer-canvas-inset px-2.5 py-1.5 rounded border border-primer-border-muted">
              <span className="font-mono font-bold text-primer-success-fg w-4">b:</span>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value) || 0)}
                className="flex-1 accent-primer-success-emphasis cursor-pointer h-1.5"
              />
              <span className="font-mono font-bold text-primer-fg-default w-8 text-right">
                {b}
              </span>
            </div>

            {/* Slider C */}
            <div className="flex items-center gap-2 bg-primer-canvas-inset px-2.5 py-1.5 rounded border border-primer-border-muted">
              <span className="font-mono font-bold text-primer-attention-fg w-4">c:</span>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={c}
                onChange={(e) => setC(parseFloat(e.target.value) || 0)}
                className="flex-1 accent-primer-attention-emphasis cursor-pointer h-1.5"
              />
              <span className="font-mono font-bold text-primer-fg-default w-8 text-right">
                {c}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
