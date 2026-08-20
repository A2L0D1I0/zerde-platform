import React, { useState } from 'react';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Sliders,
  Layers,
  Sparkles,
  Terminal,
  Download,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ZvdslRenderer } from '@/components/zvdsl/ZvdslRenderer';
import { DesmosGraphCanvas } from './DesmosGraphCanvas';

interface ActiveCanvasInspectorProps {
  zvdslSchema?: any;
  desmosState?: any;
  title?: string;
  topicTitle?: string;
  className?: string;
  defaultMode?: 'zvdsl' | 'desmos';
}

export const ActiveCanvasInspector: React.FC<ActiveCanvasInspectorProps> = ({
  zvdslSchema,
  desmosState,
  title = 'Active Canvas / Visual Inspector',
  topicTitle,
  className = '',
  defaultMode = 'zvdsl',
}) => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'zvdsl' | 'desmos'>(
    zvdslSchema ? 'zvdsl' : desmosState ? 'desmos' : defaultMode
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showSliders, setShowSliders] = useState<boolean>(true);

  const hasBoth = Boolean(zvdslSchema && desmosState);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(2.5, prev + 0.2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.6, prev - 0.2));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className={`rounded-lg border border-primer-border-default bg-primer-canvas-inset overflow-hidden shadow-primer-xs ${className}`}>
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-primer-border-muted bg-primer-canvas-subtle">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-primer-accent-subtle text-primer-accent-fg">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primer-fg-default">{title}</span>
              <Badge variant="accent" className="text-[9px] py-0 font-mono">
                ZVDSL+ Engine
              </Badge>
            </div>
            {topicTitle && (
              <span className="text-[10px] text-primer-fg-muted block truncate max-w-xs">
                {topicTitle}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Mode Switcher if both available */}
          {hasBoth && (
            <div className="flex items-center bg-primer-canvas-default rounded border border-primer-border-muted p-0.5 mr-1">
              <button
                onClick={() => setActiveMode('zvdsl')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                  activeMode === 'zvdsl'
                    ? 'bg-primer-accent-emphasis text-white'
                    : 'text-primer-fg-muted hover:text-primer-fg-default'
                }`}
              >
                ZVDSL+ Схема
              </button>
              <button
                onClick={() => setActiveMode('desmos')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                  activeMode === 'desmos'
                    ? 'bg-primer-accent-emphasis text-white'
                    : 'text-primer-fg-muted hover:text-primer-fg-default'
                }`}
              >
                Desmos График
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            className="h-7 w-7 p-0"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            className="h-7 w-7 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>

          {/* Expand / Fullscreen Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsFullscreenOpen(true)}
            className="h-7 px-2 text-[11px] gap-1 font-bold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">👁️ Развернуть холст</span>
          </Button>
        </div>
      </div>

      {/* Main Canvas Viewport (Inline) */}
      <div className="p-3 flex items-center justify-center min-h-[160px] max-h-[320px] overflow-auto bg-primer-canvas-default">
        <div
          className="transition-transform duration-200 w-full flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {activeMode === 'desmos' && desmosState ? (
            <DesmosGraphCanvas
              desmosState={desmosState}
              showSliders={showSliders}
              isThumbnail={false}
            />
          ) : (
            <ZvdslRenderer
              schema={zvdslSchema}
              isThumbnail={false}
            />
          )}
        </div>
      </div>

      {/* Fullscreen Inspector Modal */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[88vh] p-0 flex flex-col bg-primer-canvas-overlay border border-primer-border-default shadow-primer-overlay">
          {/* Modal Header */}
          <DialogHeader className="px-5 py-3.5 border-b border-primer-border-default bg-primer-canvas-subtle flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-primer-accent-emphasis text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-primer-fg-default">
                  Active Canvas Inspector (Толық экранды қарау)
                </DialogTitle>
                <DialogDescription className="text-xs text-primer-fg-muted">
                  {topicTitle || 'ZVDSL+ Векторлық микро-схемалар және Desmos интерактивті координаталық жазықтығы'}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 pr-6">
              {hasBoth && (
                <div className="flex items-center bg-primer-canvas-default rounded border border-primer-border-muted p-0.5">
                  <button
                    onClick={() => setActiveMode('zvdsl')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      activeMode === 'zvdsl'
                        ? 'bg-primer-accent-emphasis text-white'
                        : 'text-primer-fg-muted hover:text-primer-fg-default'
                    }`}
                  >
                    ZVDSL+ Схема
                  </button>
                  <button
                    onClick={() => setActiveMode('desmos')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      activeMode === 'desmos'
                        ? 'bg-primer-accent-emphasis text-white'
                        : 'text-primer-fg-muted hover:text-primer-fg-default'
                    }`}
                  >
                    Desmos График
                  </button>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Modal Body */}
          <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center bg-primer-canvas-default">
            <div className="w-full max-w-3xl">
              {activeMode === 'desmos' || (!zvdslSchema && desmosState) ? (
                <DesmosGraphCanvas
                  desmosState={desmosState}
                  showSliders={true}
                  isThumbnail={false}
                  height={420}
                />
              ) : (
                <div className="p-6 rounded-xl bg-primer-canvas-inset border border-primer-border-default shadow-sm">
                  <ZvdslRenderer
                    schema={zvdslSchema}
                    isThumbnail={false}
                    width={720}
                    height={320}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3 border-t border-primer-border-default bg-primer-canvas-subtle flex items-center justify-between text-xs text-primer-fg-muted">
            <div className="flex items-center gap-2">
              <Badge variant="accent" className="font-mono text-[10px]">
                {activeMode === 'desmos' ? 'Desmos 2D Simulation' : 'ZVDSL+ Vector Engine'}
              </Badge>
              <span>Тінтуірмен жылжыту және дөңгелекпен масштабтау қолжетімді</span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFullscreenOpen(false)}
            >
              Жабу
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
