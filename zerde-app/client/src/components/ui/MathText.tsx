import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  children?: string;
  text?: string;
  className?: string;
  displayMode?: boolean;
}

export const MathText: React.FC<MathTextProps> = ({
  children,
  text,
  className = '',
  displayMode = false,
}) => {
  const content = text !== undefined ? text : children || '';

  const html = useMemo(() => {
    if (!content) return '';

    // If pure LaTeX mode requested
    if (displayMode) {
      try {
        return katex.renderToString(content, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return content;
      }
    }

    // Split by block ($$...$$) and inline ($...$) formulas
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    const parts = content.split(regex);

    return parts
      .map((part) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2).trim();
          try {
            return katex.renderToString(formula, {
              displayMode: true,
              throwOnError: false,
            });
          } catch {
            return part;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1).trim();
          try {
            return katex.renderToString(formula, {
              displayMode: false,
              throwOnError: false,
            });
          } catch {
            return part;
          }
        } else {
          // Escape regular HTML to avoid injection, preserve linebreaks
          const escaped = part
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>');
          return escaped;
        }
      })
      .join('');
  }, [content, displayMode]);

  return (
    <span
      className={`math-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html || '' }}
    />
  );
};
