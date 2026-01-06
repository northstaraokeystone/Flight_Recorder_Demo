/**
 * Color System - Defense Platform Aesthetic
 * Deep blacks, muted colors, Bloomberg terminal density
 */

export const COLORS = {
  // Backgrounds - Near black for density
  bgPrimary: '#0a0a0a',        // Near-black
  bgCard: '#0d1117',           // GitHub dark
  bgElevated: '#111111',       // Slightly elevated
  bgGrid: 'rgba(255,255,255,0.06)', // Grid lines - very subtle

  // Primary Accent
  accent: '#00d4ff',           // Cyan - primary accent
  accentDim: '#0094b3',        // Dimmed cyan
  accentGlow: 'rgba(0, 212, 255, 0.2)', // Cyan glow

  // Text - Instrument grade
  textPrimary: '#ffffff',      // Primary text
  textSecondary: '#888888',    // Secondary
  textMuted: '#666666',        // Muted/labels
  textTimestamp: '#555555',    // Timestamp gray

  // Status Colors - Muted for professional look
  statusOnline: '#00d4ff',     // Cyan - optimal
  statusDegraded: '#ffaa00',   // Amber - warning
  statusOffline: '#cc3333',    // Muted red - severed
  statusSuccess: '#00aa66',    // Muted green - verified

  // Alert/Risk
  alertRed: '#cc3333',         // Muted red
  alertRedBright: '#ff4444',   // Bright red for emphasis
  alertAmber: '#ffaa00',       // Amber warning
  alertGreen: '#00aa66',       // Success green

  // Zones (tactical map) - Much more muted
  zoneGreen: '#2a5a3a',        // Flight corridor - muted green
  zoneGrey: '#444444',         // Comms dead zone - grey
  zoneRed: '#5a2a2a',          // Liability zone - muted red
  zoneRedBright: '#cc3333',    // Liability zone border

  // Legacy gate colors (for compatibility)
  gateGreen: '#00aa66',
  gateYellow: '#ffaa00',
  gateRed: '#cc3333',

  // Semantic
  good: '#00aa66',
  bad: '#cc3333',

  // Borders - Very subtle
  borderDefault: '#1a1a1a',
  borderBracket: '#333333',
  borderDanger: '#cc3333',
  borderSuccess: '#00aa66',
} as const;

/**
 * Gate color thresholds (legacy)
 */
export const GATE_THRESHOLDS = {
  GREEN: 0.80,
  YELLOW: 0.60,
} as const;

export function getGateColor(confidence: number): 'green' | 'yellow' | 'red' {
  if (confidence >= GATE_THRESHOLDS.GREEN) return 'green';
  if (confidence >= GATE_THRESHOLDS.YELLOW) return 'yellow';
  return 'red';
}

export const GATE_CLASSES = {
  green: {
    bg: 'bg-emerald-600',
    text: 'text-emerald-500',
    border: 'border-emerald-500',
  },
  yellow: {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
  },
} as const;
