/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds (Anduril/Shield AI palette)
        'bg-primary': '#0a0f1a',
        'bg-card': '#0d1424',
        'bg-elevated': '#111827',
        'bg-grid': '#1a1a2e',

        // Primary Accent
        'accent': '#00d4ff',
        'accent-dim': '#0094b3',

        // Status Colors
        'status-online': '#00d4ff',
        'status-degraded': '#ffaa00',
        'status-offline': '#cc3333',
        'status-success': '#00aa66',

        // Alert/Risk
        'alert-red': '#cc3333',
        'alert-amber': '#ffaa00',
        'alert-green': '#00aa66',

        // Zones
        'zone-green': '#00aa66',
        'zone-grey': '#4a5568',
        'zone-red': '#cc3333',

        // Legacy gate colors
        'gate-green': '#00aa66',
        'gate-yellow': '#ffaa00',
        'gate-red': '#cc3333',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Roboto Mono', 'SF Mono', 'monospace'],
        'tactical': ['JetBrains Mono', 'Roboto Mono', 'SF Mono', 'monospace'],
      },
      boxShadow: {
        'danger-glow': '0 0 30px rgba(204, 51, 51, 0.3)',
        'success-glow': '0 0 30px rgba(0, 170, 102, 0.3)',
        'accent-glow': '0 0 30px rgba(0, 212, 255, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-right': 'slideRight 0.5s linear infinite',
      },
      keyframes: {
        slideRight: {
          from: { transform: 'translateX(-100%)', opacity: '0.3' },
          to: { transform: 'translateX(100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
