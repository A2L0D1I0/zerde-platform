import React from 'react';
import { Eye, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { MathText } from '@/components/ui/MathText';
import { ZvdslRenderer } from '@/components/zvdsl/ZvdslRenderer';
import { Badge } from '@/components/ui/badge';

export interface AnswerOption {
  id: string; // 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
  text_kz?: string;
  text_ru?: string;
  text_en?: string;
  text?: string;
  zvdsl_preview_json?: string | object;
  is_distractor?: boolean;
  misconception?: string;
  isCorrect?: boolean;
}

interface OptionGridProps {
  options: AnswerOption[];
  selectedOptionId: string | null;
  correctOptionId?: string | null;
  hasSubmitted?: boolean;
  onSelectOption: (id: string) => void;
  onInspectOptionSchema?: (schema: any, optionId: string) => void;
  disabled?: boolean;
  language?: 'KZ' | 'RU' | 'EN';
}

export const OptionGrid: React.FC<OptionGridProps> = ({
  options,
  selectedOptionId,
  correctOptionId,
  hasSubmitted = false,
  onSelectOption,
  onInspectOptionSchema,
  disabled = false,
  language = 'KZ',
}) => {
  // Helper to get localized text
  const getOptionText = (opt: AnswerOption) => {
    if (language === 'KZ' && opt.text_kz) return opt.text_kz;
    if (language === 'RU' && opt.text_ru) return opt.text_ru;
    if (language === 'EN' && opt.text_en) return opt.text_en;
    return opt.text || opt.text_kz || opt.text_ru || opt.text_en || '';
  };

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between text-[11px] font-bold text-primer-fg-muted uppercase tracking-wider">
        <span>Жауап нұсқалары (Option Grid):</span>
        <span className="text-[10px] text-primer-fg-subtle font-normal">
          {options.length} нұсқа • Пернетақта: A-H
        </span>
      </div>

      {/* Grid: 2 per row on sm+, 1 on mobile (up to 8 options) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect =
            option.isCorrect ??
            (correctOptionId ? option.id === correctOptionId : !option.is_distractor);

          let containerClass =
            'border-primer-border-default hover:border-primer-accent-emphasis bg-primer-canvas-subtle/80 hover:bg-primer-canvas-subtle';
          let badgeVariant: 'secondary' | 'accent' | 'done' | 'danger' = 'secondary';

          if (hasSubmitted) {
            if (isCorrect) {
              containerClass =
                'border-primer-success-emphasis bg-primer-success-subtle text-primer-success-fg ring-1 ring-primer-success-emphasis';
              badgeVariant = 'done';
            } else if (isSelected && !isCorrect) {
              containerClass =
                'border-primer-danger-emphasis bg-primer-danger-subtle text-primer-danger-fg ring-1 ring-primer-danger-emphasis';
              badgeVariant = 'danger';
            } else {
              containerClass = 'opacity-50 border-primer-border-muted bg-primer-canvas-inset';
            }
          } else if (isSelected) {
            containerClass =
              'border-primer-accent-emphasis bg-primer-accent-subtle/40 ring-1 ring-primer-accent-emphasis shadow-sm';
            badgeVariant = 'accent';
          }

          const optText = getOptionText(option);

          return (
            <div
              key={option.id}
              onClick={() => {
                if (!hasSubmitted && !disabled) {
                  onSelectOption(option.id);
                }
              }}
              className={`p-3 rounded-lg border text-xs transition-all flex flex-col justify-between cursor-pointer relative group ${containerClass}`}
            >
              {/* Top Row: Option ID Badge & Text */}
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 transition ${
                    isSelected
                      ? 'bg-primer-accent-emphasis text-white shadow-sm'
                      : 'bg-primer-canvas-default border border-primer-border-default text-primer-fg-muted group-hover:text-primer-fg-default'
                  }`}
                >
                  {option.id}
                </div>

                <div className="flex-1 font-medium text-primer-fg-default text-xs leading-relaxed pt-0.5">
                  <MathText>{optText}</MathText>
                </div>

                {/* Status Indicator */}
                {hasSubmitted && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-primer-success-fg" />
                    ) : isSelected ? (
                      <AlertTriangle className="w-4 h-4 text-primer-danger-fg" />
                    ) : null}
                  </div>
                )}
              </div>

              {/* Optional Mini ZVDSL+ Preview within Option */}
              {option.zvdsl_preview_json && (
                <div className="mt-2.5 pt-2 border-t border-primer-border-muted/50 relative">
                  <div className="max-h-24 overflow-hidden rounded bg-primer-canvas-inset border border-primer-border-muted p-1">
                    <ZvdslRenderer
                      schema={option.zvdsl_preview_json}
                      isThumbnail={true}
                    />
                  </div>

                  {/* Send to Main Active Canvas Button */}
                  {onInspectOptionSchema && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectOptionSchema(option.zvdsl_preview_json, option.id);
                      }}
                      title="Басты Active Canvas холстына шығару"
                      className="absolute top-3 right-1 px-1.5 py-0.5 rounded bg-primer-canvas-default border border-primer-border-default text-[10px] text-primer-fg-muted hover:text-primer-accent-fg hover:border-primer-accent-emphasis flex items-center gap-1 shadow-sm transition cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>[ 👁️ ]</span>
                    </button>
                  )}
                </div>
              )}

              {/* Misconception diagnostics when submitted and wrong */}
              {hasSubmitted && isSelected && !isCorrect && option.misconception && (
                <div className="mt-2 pt-2 border-t border-primer-danger-muted/40 text-[11px] text-primer-danger-fg leading-relaxed">
                  <strong className="font-semibold">Когнитивтік қате: </strong>
                  {option.misconception}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
