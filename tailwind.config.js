/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stealth Backgrounds - Pure black
        'bg-primary': '#09090b',    // zinc-950
        'bg-card': '#0a0a0a',
        'bg-elevated': '#0d0d0d',

        // Slate palette - the only accent colors
        'slate-950': '#09090b',
        'slate-900': '#0f172a',
        'slate-800': '#1e293b',
        'slate-700': '#334155',
        'slate-600': '#475569',
        'slate-500': '#64748b',
        'slate-400': '#94a3b8',
        'slate-300': '#cbd5e1',
        'slate-200': '#E2E8F0',
        'slate-100': '#f1f5f9',
        'slate-50': '#F8FAFC',

        // Alert - RED only
        'alert-red': '#ef4444',

        // Legacy compatibility (mapped to stealth)
        'accent': '#64748b',        // Was cyan, now slate-500
        'accent-dim': '#475569',    // Slate-600
        'status-online': '#64748b', // Was cyan, now slate
        'status-degraded': '#f59e0b',
        'status-offline': '#ef4444',
        'status-success': '#64748b', // Was green, now slate
      },
      fontFamily: {
        'mono': ['Inter', 'JetBrains Mono', 'Roboto Mono', 'SF Mono', 'monospace'],
        'serif': ['Merriweather', 'Georgia', 'serif'],
        'tactical': ['Inter', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'instrument': '10px',
        'instrument-sm': '8px',
        'instrument-lg': '12px',
      },
      boxShadow: {
        'none': 'none',
        'danger-glow': '0 0 20px rgba(239, 68, 68, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 400ms ease-out forwards',
        'fade-in': 'fadeIn 300ms ease-out forwards',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
