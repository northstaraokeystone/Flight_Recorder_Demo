/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#0a0a0a',
        'bg-card': '#141414',
        'bg-elevated': '#1a1a1a',

        // Status: Decision Gates
        'gate-green': '#22c55e',
        'gate-yellow': '#eab308',
        'gate-red': '#ef4444',
      },
      boxShadow: {
        'danger-glow': '0 0 30px rgba(220, 38, 38, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
