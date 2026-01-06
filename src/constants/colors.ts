/**
 * Color System - Anduril/Shield AI Inspired
 * Deep navy/black backgrounds with cyan/amber/red accents
 */

export const COLORS = {
  // Backgrounds (Anduril/Shield AI palette)
  bgPrimary: '#0a0f1a',        // Deep navy-black
  bgCard: '#0d1424',           // Card surfaces
  bgElevated: '#111827',       // Elevated surfaces
  bgGrid: '#1a1a2e',           // Grid lines

  // Primary Accent
  accent: '#00d4ff',           // Cyan - primary accent
  accentDim: '#0094b3',        // Dimmed cyan
  accentGlow: 'rgba(0, 212, 255, 0.3)', // Cyan glow

  // Text
  textPrimary: '#ffffff',      // Primary text
  textSecondary: '#9ca3af',    // gray-400
  textMuted: '#6b7280',        // gray-500
  textTimestamp: '#888888',    // Timestamp gray

  // Status Colors
  statusOnline: '#00d4ff',     // Cyan - optimal
  statusDegraded: '#ffaa00',   // Amber - warning
  statusOffline: '#cc3333',    // Muted red - severed
  statusSuccess: '#00aa66',    // Muted green - verified

  // Alert/Risk
  alertRed: '#cc3333',         // Muted red
  alertRedBright: '#ff4444',   // Bright red for emphasis
  alertAmber: '#ffaa00',       // Amber warning
  alertGreen: '#00aa66',       // Success green

  // Zones (tactical map)
  zoneGreen: '#00aa66',        // Flight corridor
  zoneGrey: '#4a5568',         // Comms dead zone
  zoneRed: '#cc3333',          // Liability zone

  // Legacy gate colors (for compatibility)
  gateGreen: '#00aa66',
  gateYellow: '#ffaa00',
  gateRed: '#cc3333',

  // Semantic
  good: '#00aa66',
  bad: '#cc3333',

  // Borders
  borderDefault: '#1f2937',
  borderBracket: '#374151',
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
