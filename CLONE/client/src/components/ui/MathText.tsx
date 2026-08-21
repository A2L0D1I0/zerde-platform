import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  children: string;
  className?: string;
  displayMode?: boolean;
}

export const MathText: React.FC<MathTextProps> = ({
  children,
  className = '',
  displayMode = false,
}) => {
  const html = useMemo(() => {
    if (!children) return '';

    // If pure LaTeX mode requested
    if (displayMode) {
      try {
        return katex.renderToString(children, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return children;
      }
    }

    // Split by block ($$...$$) and inline ($...$) formulas
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    const parts = children.split(regex);

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
  }, [children, displayMode]);

  return (
    <span
      className={`math-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
