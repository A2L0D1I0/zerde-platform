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
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        github: {
          canvas: {
            default: '#0d1117',
            subtle: '#161b22',
            inset: '#010409',
            overlay: '#1f242c',
          },
          border: {
            default: '#30363d',
            muted: '#21262d',
            subtle: 'rgba(240, 246, 252, 0.1)',
          },
          fg: {
            default: '#f0f6fc',
            muted: '#8b949e',
            subtle: '#6e7681',
            onEmphasis: '#ffffff',
          },
          accent: {
            fg: '#58a6ff',
            emphasis: '#1f6feb',
            muted: 'rgba(56, 139, 253, 0.15)',
            subtle: 'rgba(56, 139, 253, 0.1)',
          },
          success: {
            fg: '#3fb950',
            emphasis: '#238636',
            hover: '#2ea043',
            muted: 'rgba(46, 160, 67, 0.15)',
            subtle: 'rgba(46, 160, 67, 0.1)',
          },
          attention: {
            fg: '#d29922',
            emphasis: '#9e6a03',
            muted: 'rgba(187, 128, 9, 0.15)',
            subtle: 'rgba(187, 128, 9, 0.1)',
          },
          danger: {
            fg: '#f85149',
            emphasis: '#da3633',
            muted: 'rgba(248, 81, 73, 0.15)',
            subtle: 'rgba(248, 81, 73, 0.1)',
          },
          done: {
            fg: '#a371f7',
            emphasis: '#8957e5',
            muted: 'rgba(163, 113, 247, 0.15)',
            subtle: 'rgba(163, 113, 247, 0.1)',
          },
          heatmap: {
            0: '#161b22',
            1: '#0e4429',
            2: '#006d32',
            3: '#26a641',
            4: '#39d353',
          }
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: [
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
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
