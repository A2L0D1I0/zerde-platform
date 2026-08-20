import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  Eye,
  Sparkles,
  HelpCircle,
  FileText,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MathText } from '@/components/ui/MathText';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface UploadedPhoto {
  id: string;
  url: string;
  name: string;
  size: number;
}

interface NotebookUploaderProps {
  solutionText: string;
  onChangeSolutionText: (text: string) => void;
  photos: UploadedPhoto[];
  onAddPhotos: (newPhotos: UploadedPhoto[]) => void;
  onRemovePhoto: (id: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  maxChars?: number;
  maxPhotos?: number;
}

export const NotebookUploader: React.FC<NotebookUploaderProps> = ({
  solutionText,
  onChangeSolutionText,
  photos,
  onAddPhotos,
  onRemovePhoto,
  onSubmit,
  disabled = false,
  maxChars = 4000,
  maxPhotos = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isDragOver, setIsDragOver] = useState(false);

  // Quick Math Symbols
  const mathSymbols = [
    { label: '±', latex: '\\pm ' },
    { label: '√x', latex: '\\sqrt{x} ' },
    { label: 'x²', latex: 'x^2 ' },
    { label: '≤', latex: '\\le ' },
    { label: '≥', latex: '\\ge ' },
    { label: '≠', latex: '\\neq ' },
    { label: '∪', latex: '\\cup ' },
    { label: '∩', latex: '\\cap ' },
    { label: '∞', latex: '\\infty ' },
    { label: '∈', latex: '\\in ' },
    { label: 'Δ', latex: '\\Delta ' },
  ];

  const handleInsertSymbol = (latex: string) => {
    if (solutionText.length + latex.length <= maxChars) {
      onChangeSolutionText(solutionText + latex);
    }
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) return;

    const newPhotos: UploadedPhoto[] = [];
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const url = URL.createObjectURL(file);
      newPhotos.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        url,
        name: file.name,
        size: file.size,
      });
    });

    onAddPhotos(newPhotos);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs">
      {/* Mode B Title Header */}
      <div className="flex items-center justify-between border-b border-primer-border-muted pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primer-accent-subtle text-primer-accent-fg">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-primer-fg-default">
              Режим Б: Развернутое решение & Фото тетради
            </h4>
            <p className="text-[11px] text-primer-fg-muted">
              Шешім қадамдарын LaTeX формулаларымен жазыңыз немесе дәптер фотосын жүктеңіз
            </p>
          </div>
        </div>

        <Badge variant="accent" className="font-mono text-[10px]">
          {photos.length} / {maxPhotos} фото
        </Badge>
      </div>

      {/* 1. Solution Text Area & KaTeX Live Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {/* Quick Math Toolbar */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-primer-fg-subtle mr-1">Формулалар:</span>
            {mathSymbols.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertSymbol(sym.latex)}
                disabled={disabled}
                className="px-1.5 py-0.5 rounded bg-primer-canvas-inset hover:bg-primer-canvas-default border border-primer-border-muted text-[11px] font-mono text-primer-accent-fg transition cursor-pointer"
              >
                {sym.label}
              </button>
            ))}
          </div>

          {/* Edit / Preview Tabs */}
          <div className="flex items-center bg-primer-canvas-inset rounded p-0.5 border border-primer-border-muted text-xs">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                activeTab === 'edit'
                  ? 'bg-primer-accent-emphasis text-white'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              Мәтін
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                activeTab === 'preview'
                  ? 'bg-primer-accent-emphasis text-white'
                  : 'text-primer-fg-muted hover:text-primer-fg-default'
              }`}
            >
              KaTeX Preview
            </button>
          </div>
        </div>

        {activeTab === 'edit' ? (
          <div className="relative">
            <textarea
              value={solutionText}
              onChange={(e) => {
                if (e.target.value.length <= maxChars) {
                  onChangeSolutionText(e.target.value);
                }
              }}
              disabled={disabled}
              placeholder="Шешімнің қадамдарын толық жазыңыз... Мысалы: 1) Алымының нөлдері: x² - 4 = 0 => x = ±2. 2) Бөлімі: x - 5 ≠ 0..."
              rows={5}
              className="w-full rounded-lg border border-primer-border-default bg-primer-canvas-default p-3 text-xs sm:text-sm text-primer-fg-default focus:outline-none focus:ring-2 focus:ring-primer-accent-emphasis font-sans leading-relaxed resize-y"
            />
            <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-primer-fg-muted">
              {solutionText.length} / {maxChars}
            </div>
          </div>
        ) : (
          <div className="min-h-[120px] p-3.5 rounded-lg border border-primer-border-muted bg-primer-canvas-default text-xs sm:text-sm leading-relaxed overflow-auto">
            {solutionText ? (
              <MathText>{solutionText}</MathText>
            ) : (
              <span className="text-primer-fg-subtle italic text-xs">
                Формулалардың алдын-ала көрінісі осында шығады...
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. Photo Upload Area (up to 10 photos) */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-primer-fg-muted uppercase tracking-wider flex items-center justify-between">
          <span>Дәптер суреттері ({photos.length}/{maxPhotos}):</span>
          <span className="text-[10px] text-primer-fg-subtle font-normal">
            JPEG, PNG • Макс. 5 МБ
          </span>
        </div>

        {/* Dropzone & Trigger Buttons */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? 'border-primer-accent-emphasis bg-primer-accent-subtle/30'
              : 'border-primer-border-default hover:border-primer-accent-emphasis/70 bg-primer-canvas-inset'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
            disabled={disabled || photos.length >= maxPhotos}
          />

          <div className="flex items-center gap-3 text-primer-accent-fg">
            <div className="p-2 rounded-full bg-primer-accent-subtle">
              <Upload className="w-5 h-5" />
            </div>
            <div className="p-2 rounded-full bg-primer-success-subtle text-primer-success-fg">
              <Camera className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-primer-fg-default">
              Суреттерді осында сүйреңіз немесе файлдарды таңдаңыз
            </div>
            <div className="text-[10px] text-primer-fg-muted mt-0.5">
              Смартфоннан түсірілген дәптер беттерінің анық фотолары
            </div>
          </div>
        </div>

        {/* Photos Grid with Previews & Delete Actions */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative group rounded-lg overflow-hidden border border-primer-border-default bg-primer-canvas-default aspect-square shadow-sm"
              >
                <img
                  src={photo.url}
                  alt={`Notebook page ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Index badge */}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold">
                  #{idx + 1}
                </div>

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewPhotoUrl(photo.url);
                    }}
                    title="Үлкейту"
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePhoto(photo.id);
                    }}
                    title="Өшіру"
                    className="p-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Photo Zoom Modal */}
      <Dialog open={Boolean(previewPhotoUrl)} onOpenChange={() => setPreviewPhotoUrl(null)}>
        <DialogContent className="max-w-3xl p-0 bg-black/95 border-none overflow-hidden flex flex-col items-center justify-center">
          {previewPhotoUrl && (
            <div className="relative w-full h-[75vh] flex items-center justify-center p-4">
              <img
                src={previewPhotoUrl}
                alt="Zoomed notebook page"
                className="max-w-full max-h-full object-contain rounded"
              />
              <button
                onClick={() => setPreviewPhotoUrl(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
