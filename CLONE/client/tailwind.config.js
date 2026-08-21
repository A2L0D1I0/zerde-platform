/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Shadcn UI Semantic Variables
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        // GitHub Primer Tokens (Light & Dark mapped via CSS vars & direct values)
        primer: {
          canvas: {
            default: 'var(--color-canvas-default)',
            subtle: 'var(--color-canvas-subtle)',
            inset: 'var(--color-canvas-inset)',
            overlay: 'var(--color-canvas-overlay)',
          },
          border: {
            default: 'var(--color-border-default)',
            muted: 'var(--color-border-muted)',
            subtle: 'var(--color-border-subtle)',
          },
          fg: {
            default: 'var(--color-fg-default)',
            muted: 'var(--color-fg-muted)',
            subtle: 'var(--color-fg-subtle)',
            onEmphasis: 'var(--color-fg-onEmphasis)',
          },
          accent: {
            fg: 'var(--color-accent-fg)',
            emphasis: 'var(--color-accent-emphasis)',
            muted: 'var(--color-accent-muted)',
            subtle: 'var(--color-accent-subtle)',
          },
          success: {
            fg: 'var(--color-success-fg)',
            emphasis: 'var(--color-success-emphasis)',
            hover: 'var(--color-success-hover)',
            muted: 'var(--color-success-muted)',
            subtle: 'var(--color-success-subtle)',
          },
          attention: {
            fg: 'var(--color-attention-fg)',
            emphasis: 'var(--color-attention-emphasis)',
            muted: 'var(--color-attention-muted)',
            subtle: 'var(--color-attention-subtle)',
          },
          danger: {
            fg: 'var(--color-danger-fg)',
            emphasis: 'var(--color-danger-emphasis)',
            muted: 'var(--color-danger-muted)',
            subtle: 'var(--color-danger-subtle)',
          },
          done: {
            fg: 'var(--color-done-fg)',
            emphasis: 'var(--color-done-emphasis)',
            muted: 'var(--color-done-muted)',
            subtle: 'var(--color-done-subtle)',
          },
          heatmap: {
            0: 'var(--color-heatmap-0)',
            1: 'var(--color-heatmap-1)',
            2: 'var(--color-heatmap-2)',
            3: 'var(--color-heatmap-3)',
            4: 'var(--color-heatmap-4)',
          }
        },

        // Direct GitHub tokens for fallback / explicit use
        gh: {
          canvas: {
            default: '#0d1117',
            subtle: '#161b22',
            inset: '#010409',
            overlay: '#1f242c',
          },
          border: {
            default: '#30363d',
            muted: '#21262d',
          },
          fg: {
            default: '#f0f6fc',
            muted: '#8b949e',
            subtle: '#6e7681',
          },
          accent: '#58a6ff',
          success: '#3fb950',
          attention: '#d29922',
          danger: '#f85149',
          done: '#a371f7',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Noto Sans"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
      boxShadow: {
        'primer-xs': '0 1px 0 rgba(27, 31, 36, 0.04)',
        'primer-sm': '0 1px 0 rgba(27, 31, 36, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        'primer-overlay': '0 16px 32px rgba(1, 4, 9, 0.85)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'zoom-in': 'zoomIn 0.15s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
