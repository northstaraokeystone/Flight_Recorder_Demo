/**
 * Color System - Stealth Bomber Aesthetic
 * v2.2 DIAMOND: Military radar display, not video game
 * Pure blacks, dim slates, bone white text
 */

export const COLORS = {
  // Backgrounds - Pure black stealth
  bgPrimary: '#09090b',        // zinc-950 - Pure black
  bgCard: '#0a0a0a',           // Near-black
  bgElevated: '#0d0d0d',       // Slightly elevated
  bgGrid: 'rgba(30, 41, 59, 0.2)', // Slate-800 barely visible

  // Flight Path - Radar style (NOT neon)
  flightPathInactive: '#334155',  // Slate-700: Dim radar style
  flightPathActive: '#64748b',    // Slate-500: Current segment
  waypointCurrent: '#F8FAFC',     // White: Only current waypoint bright
  waypointCompleted: '#475569',   // Slate-600: Already passed
  waypointFuture: '#1e293b',      // Slate-800: Not yet reached

  // Text - Bone white, not green
  textPrimary: '#F8FAFC',      // Slate-50 - Bone white
  textSecondary: '#E2E8F0',    // Slate-200
  textMuted: '#94a3b8',        // Slate-400
  textDim: '#64748b',          // Slate-500
  textTimestamp: '#475569',    // Slate-600
  textHash: '#64748b',         // Slate-500

  // Status Colors - Muted stealth
  statusOnline: '#64748b',     // Slate-500 - NOT cyan
  statusDegraded: '#ffaa00',   // Amber - warning
  statusOffline: '#cc3333',    // Muted red - severed
  statusSuccess: '#64748b',    // Slate-500 - NOT green

  // Alert - RED ONLY for errors
  alertRed: '#ef4444',         // Red-500 - ONLY color for alerts
  alertRedBright: '#ef4444',   // Red-500
  alertAmber: '#f59e0b',       // Amber-500 (used sparingly)
  alertGreen: '#64748b',       // NO GREEN - use slate

  // Governance Panel colors
  raciAI: '#E2E8F0',           // Slate-200
  raciHuman: '#F8FAFC',        // Slate-50 (brighter when human)
  confidenceHigh: '#E2E8F0',   // Slate-200
  confidenceLow: '#ef4444',    // Red-500 when < 0.70
  modeAutonomous: '#E2E8F0',   // Slate-200
  modeSupervised: '#F8FAFC',   // Slate-50
  cragStandby: '#64748b',      // Slate-500
  cragActive: '#94a3b8',       // Slate-400 (brightens)
  cragQuerying: '#E2E8F0',     // Slate-200

  // Zones (tactical map) - Very muted
  zoneGreen: '#334155',        // Slate-700 - Flight corridor
  zoneGrey: '#1e293b',         // Slate-800 - Dead zone
  zoneRed: '#334155',          // Slate-700 - Threat zone border
  zoneRedBright: '#ef4444',    // Red-500 - Active threat only

  // Borders - Barely visible
  borderDefault: '#1e293b',    // Slate-800
  borderBracket: '#1e293b',    // Slate-800
  borderDanger: '#ef4444',     // Red-500
  borderSuccess: '#64748b',    // Slate-500

  // Affidavit colors
  affidavitTitle: '#F8FAFC',   // Slate-50
  affidavitHeader: '#94a3b8',  // Slate-400
  affidavitLabel: '#64748b',   // Slate-500
  affidavitValue: '#E2E8F0',   // Slate-200
  affidavitHash: '#94a3b8',    // Slate-400
} as const;

/**
 * Gate color thresholds - Confidence-based
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.80,
  MEDIUM: 0.70,
} as const;

export function getConfidenceColor(confidence: number): string {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return COLORS.confidenceHigh;
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return COLORS.alertAmber;
  return COLORS.alertRed;
}

export function getConfidenceStatus(confidence: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'HIGH';
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

// Reason codes for governance logging
export const REASON_CODES = {
  RC001_FACTUAL_ERROR: 'RC001_FACTUAL_ERROR',
  RC003_SAFETY_CONCERN: 'RC003_SAFETY_CONCERN',
  RC006_CONTEXT_MISSING: 'RC006_CONTEXT_MISSING',
  RC009_TIMING_ERROR: 'RC009_TIMING_ERROR',
} as const;

export type ReasonCode = keyof typeof REASON_CODES;

// RACI states
export type RACIState = 'AI_SYSTEM' | 'OPERATOR' | 'HUMAN_IN_LOOP';
export type ModeState = 'AUTONOMOUS' | 'SUPERVISED' | 'MANUAL';
export type CRAGState = 'STANDBY' | 'ACTIVE' | 'QUERYING';

// Legacy compatibility - gate colors
export type GateColor = 'green' | 'yellow' | 'red';

export function getGateColor(confidence: number): GateColor {
  if (confidence >= 0.80) return 'green';
  if (confidence >= 0.60) return 'yellow';
  return 'red';
}

// Legacy color values for compatibility
export const LEGACY_COLORS = {
  accentGlow: '0 0 20px rgba(100, 116, 139, 0.2)',
  gateGreen: '#64748b',
  gateYellow: '#f59e0b',
  gateRed: '#ef4444',
} as const;
