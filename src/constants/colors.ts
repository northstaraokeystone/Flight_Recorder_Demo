/**
 * Color System - §CONSTRAINT-COLORS
 * Define ONCE, use everywhere. No improvising.
 */

export const COLORS = {
  // Backgrounds
  bgPrimary: '#0a0a0a',      // Near black
  bgCard: '#141414',          // Card surfaces
  bgElevated: '#1a1a1a',      // Elevated surfaces

  // Text
  textPrimary: '#ffffff',     // Primary text
  textSecondary: '#9ca3af',   // gray-400
  textMuted: '#6b7280',       // gray-500

  // Status: Decision Gates
  gateGreen: '#22c55e',       // GREEN gate - approved (0.80+)
  gateYellow: '#eab308',      // YELLOW gate - escalation needed (0.60-0.79)
  gateRed: '#ef4444',         // RED gate - blocked (<0.60)

  // Semantic: Good vs Bad
  good: '#16a34a',            // green-600 - Immutable, success
  bad: '#dc2626',             // red-600 - Mutable, failure, danger

  // Borders
  borderDefault: '#374151',   // gray-700
  borderDanger: '#dc2626',    // red-600
  borderSuccess: '#16a34a',   // green-600
} as const;

/**
 * Gate color thresholds
 */
export const GATE_THRESHOLDS = {
  GREEN: 0.80,   // >= 0.80: Fully autonomous
  YELLOW: 0.60,  // >= 0.60 and < 0.80: Escalation recommended
  // < 0.60: RED - Human approval required
} as const;

/**
 * Get gate color based on confidence value
 */
export function getGateColor(confidence: number): 'green' | 'yellow' | 'red' {
  if (confidence >= GATE_THRESHOLDS.GREEN) return 'green';
  if (confidence >= GATE_THRESHOLDS.YELLOW) return 'yellow';
  return 'red';
}

/**
 * Tailwind class mappings for gate colors
 */
export const GATE_CLASSES = {
  green: {
    bg: 'bg-green-500',
    text: 'text-green-500',
    border: 'border-green-500',
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    border: 'border-yellow-500',
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
  },
} as const;
