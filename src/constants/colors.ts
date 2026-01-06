/**
 * Color System - Stealth Bomber Aesthetic
 * v3.1 DEAL-KILLER REMEDIATION: HIGH CONTRAST for projector/boardroom
 *
 * KEY CHANGES:
 * - Primary text: #F1F5F9 (Slate-100, brighter)
 * - Secondary text: #CBD5E1 (Slate-300)
 * - Critical text: #FCA5A5 (Red-300, brighter than Red-500)
 * - Warning text: #fbbf24 (Amber-400, brighter)
 */

export const COLORS = {
  // Backgrounds - Pure black stealth
  bgPrimary: '#09090b',        // zinc-950 - Pure black
  bgCard: '#0a0a0a',           // Near-black
  bgElevated: '#0f0f0f',       // Slightly elevated (for Affidavit)
  bgGrid: 'rgba(30, 41, 59, 0.2)', // Slate-800 barely visible

  // Flight Path - Radar style (NOT neon)
  flightPathInactive: '#334155',  // Slate-700: Dim radar style
  flightPathActive: '#64748b',    // Slate-500: Current segment
  waypointCurrent: '#F8FAFC',     // White: Only current waypoint bright
  waypointCompleted: '#475569',   // Slate-600: Already passed
  waypointFuture: '#1e293b',      // Slate-800: Not yet reached

  // Text - HIGH CONTRAST for projector readability
  textPrimary: '#F1F5F9',      // Slate-100 - BRIGHTER than before
  textSecondary: '#CBD5E1',    // Slate-300 - BRIGHTER
  textMuted: '#94a3b8',        // Slate-400
  textDim: '#64748b',          // Slate-500
  textTimestamp: '#64748b',    // Slate-500 (was 600, now brighter)
  textHash: '#CBD5E1',         // Slate-300 - BRIGHTER for hash readability

  // Status Colors - Muted stealth
  statusOnline: '#64748b',     // Slate-500 - NOT cyan
  statusDegraded: '#fbbf24',   // Amber-400 - BRIGHTER warning
  statusOffline: '#FCA5A5',    // Red-300 - BRIGHTER red
  statusSuccess: '#64748b',    // Slate-500 - NOT green

  // Alert - HIGH CONTRAST CRITICAL COLORS
  alertRed: '#FCA5A5',         // Red-300 - BRIGHTER for projector
  alertRedBright: '#FCA5A5',   // Red-300 - BRIGHTER
  alertAmber: '#fbbf24',       // Amber-400 - BRIGHTER (was 500)
  alertGreen: '#64748b',       // NO GREEN - use slate

  // Governance Panel colors
  raciAI: '#CBD5E1',           // Slate-300 - BRIGHTER
  raciHuman: '#F1F5F9',        // Slate-100 (brighter when human)
  confidenceHigh: '#CBD5E1',   // Slate-300 - BRIGHTER
  confidenceLow: '#FCA5A5',    // Red-300 when < 0.70 - BRIGHTER
  modeAutonomous: '#CBD5E1',   // Slate-300
  modeSupervised: '#F1F5F9',   // Slate-100
  cragStandby: '#64748b',      // Slate-500
  cragActive: '#94a3b8',       // Slate-400 (brightens)
  cragQuerying: '#CBD5E1',     // Slate-300

  // Zones (tactical map) - Very muted
  zoneGreen: '#334155',        // Slate-700 - Flight corridor
  zoneGrey: '#1e293b',         // Slate-800 - Dead zone
  zoneRed: '#334155',          // Slate-700 - Threat zone border
  zoneRedBright: '#FCA5A5',    // Red-300 - Active threat - BRIGHTER

  // Borders - Barely visible
  borderDefault: '#1e293b',    // Slate-800
  borderBracket: '#1e293b',    // Slate-800
  borderDanger: '#FCA5A5',     // Red-300 - BRIGHTER
  borderSuccess: '#64748b',    // Slate-500

  // Affidavit colors - HIGH CONTRAST
  affidavitTitle: '#F1F5F9',   // Slate-100 - BRIGHTER
  affidavitHeader: '#CBD5E1',  // Slate-300 - BRIGHTER
  affidavitLabel: '#94a3b8',   // Slate-400 - BRIGHTER than before
  affidavitValue: '#F1F5F9',   // Slate-100 - BRIGHTER
  affidavitHash: '#CBD5E1',    // Slate-300 - BRIGHTER for readability
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
