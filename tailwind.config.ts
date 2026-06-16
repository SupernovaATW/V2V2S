import type { Config } from 'tailwindcss';

export default {
  content: ['./src/renderer/**/*.{html,tsx,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme colors are set via CSS variables, but define fallbacks
        bg: {
          primary: 'var(--bg-primary)',
          sidebar: 'var(--bg-sidebar)',
          card: 'var(--bg-card)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        accent: 'var(--accent)',
        border: 'var(--border)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
      fontFamily: {
        ui: ['Georgia', '"SimSun"', '"宋体"', 'serif'],
        mono: ['"JetBrains Mono"', '"Consolas"', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config;
