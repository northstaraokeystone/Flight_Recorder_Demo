/**
 * GovernancePanel - Dynamic Accountability Dashboard
 * v2.3 BULLETPROOF: Visual grid, stability gauge, mode indicators
 *
 * The 1-Second Test: If you can't identify WHO is responsible
 * within 1 second of looking at the screen, the UI has failed.
 *
 * Components:
 * 1. RACI Matrix Grid - Visual grid showing R/A/C/I roles
 * 2. Stability Gauge - Visible bar that drains when confidence drops
 * 3. Mode Indicator - Dots showing AUTONOMOUS/SUPERVISED/MANUAL
 * 4. CRAG Status - STANDBY → ACTIVE → QUERYING
 */

import { useMemo } from 'react';
import { COLORS, getConfidenceColor, type RACIState, type ModeState, type CRAGState } from '../../constants/colors';

export interface GovernanceState {
  raci: RACIState;
  confidence: number;
  mode: ModeState;
  crag: CRAGState;
  fallback: 'NONE' | 'TRIGGERED';
  reasonCode: string | null;
}

interface GovernancePanelProps {
  state: GovernanceState;
  isOffline: boolean;
}

// RACI role mapping based on state
function getRACIRoles(raci: RACIState): { R: string; A: string; C: string; I: string } {
  switch (raci) {
    case 'HUMAN_IN_LOOP':
      return {
        R: 'AI_SYSTEM',
        A: 'SAFETY_OFFICER',
        C: 'GROUND_CTRL',
        I: 'FLIGHT_OPS',
      };
    case 'OPERATOR':
      return {
        R: 'OPERATOR',
        A: 'OPERATOR',
        C: 'AI_SYSTEM',
        I: 'FLIGHT_OPS',
      };
    default: // AI_SYSTEM
      return {
        R: 'AI_SYSTEM',
        A: 'AI_SYSTEM',
        C: 'SAFETY_OFF',
        I: 'FLIGHT_OPS',
      };
  }
}

export function GovernancePanel({ state, isOffline }: GovernancePanelProps) {
  const confidenceColor = getConfidenceColor(state.confidence);
  const isHumanInLoop = state.raci === 'HUMAN_IN_LOOP';
  const isCragQuerying = state.crag === 'QUERYING';
  const isFallbackTriggered = state.fallback === 'TRIGGERED';

  const raciRoles = useMemo(() => getRACIRoles(state.raci), [state.raci]);

  // Stability percentage (maps confidence to 0-100)
  const stabilityPercent = Math.round(state.confidence * 100);

  // Get stability bar color
  const getStabilityColor = () => {
    if (state.confidence >= 0.80) return COLORS.textMuted; // Slate-400 - healthy is invisible
    if (state.confidence >= 0.60) return '#d97706'; // Amber-600
    return COLORS.alertRed; // Red-500
  };

  // Get stability mode text
  const getStabilityMode = () => {
    if (state.confidence >= 0.80) return 'AUTONOMOUS';
    if (state.confidence >= 0.60) return 'SUPERVISED';
    return 'MANUAL';
  };

  return (
    <div
      className="flex flex-col h-full font-mono"
      style={{
        backgroundColor: COLORS.bgElevated,
        border: `1px solid ${COLORS.borderBracket}`,
      }}
    >
      {/* Pane Header */}
      <div
        className="px-3 py-2 border-b"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: COLORS.textMuted,
        }}
      >
        GOVERNANCE STATE
      </div>

      {/* Main Content */}
      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* ===== COMPONENT 1: RACI MATRIX GRID ===== */}
        <div>
          <div
            className="mb-2"
            style={{
              fontSize: '9px',
              color: COLORS.textTimestamp,
              letterSpacing: '0.05em',
            }}
          >
            ACCOUNTABILITY MATRIX
          </div>

          {/* RACI Grid */}
          <div
            className="grid grid-cols-4 gap-px"
            style={{
              backgroundColor: COLORS.borderBracket,
              border: `1px solid ${COLORS.borderBracket}`,
            }}
          >
            {/* Headers */}
            {['R', 'A', 'C', 'I'].map((role) => (
              <div
                key={role}
                className="py-1 text-center"
                style={{
                  backgroundColor: COLORS.bgCard,
                  fontSize: '8px',
                  color: COLORS.textTimestamp,
                }}
              >
                {role}
              </div>
            ))}

            {/* Values */}
            {(['R', 'A', 'C', 'I'] as const).map((role) => {
              const value = raciRoles[role];
              const isAccountable = role === 'A';
              const isHighlighted = isAccountable && isHumanInLoop;

              return (
                <div
                  key={`val-${role}`}
                  className={`py-2 text-center ${isHighlighted ? 'animate-pulse' : ''}`}
                  style={{
                    backgroundColor: isHighlighted ? 'rgba(239, 68, 68, 0.15)' : COLORS.bgCard,
                    fontSize: '8px',
                    color: isHighlighted ? COLORS.alertRed : COLORS.textMuted,
                    fontWeight: isHighlighted ? 600 : 400,
                    borderTop: isHighlighted ? `2px solid ${COLORS.alertRed}` : 'none',
                  }}
                >
                  {value.length > 10 ? value.slice(0, 10) : value}
                </div>
              );
            })}
          </div>

          {/* Current accountability statement */}
          <div
            className="mt-2 py-1.5 px-2"
            style={{
              fontSize: '9px',
              color: isHumanInLoop ? COLORS.alertRed : COLORS.textMuted,
              backgroundColor: isHumanInLoop ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              border: isHumanInLoop ? `1px solid ${COLORS.alertRed}` : 'none',
            }}
          >
            {isHumanInLoop ? (
              <span className="animate-pulse">
                ⚠ SAFETY_OFFICER is ACCOUNTABLE for decision chain
              </span>
            ) : (
              <span>AI_SYSTEM is ACCOUNTABLE for decision chain</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ backgroundColor: COLORS.borderBracket }} />

        {/* ===== COMPONENT 2: STABILITY GAUGE ===== */}
        <div>
          <div
            className="mb-2 flex justify-between items-center"
            style={{
              fontSize: '9px',
              color: COLORS.textTimestamp,
              letterSpacing: '0.05em',
            }}
          >
            <span>SYSTEM STABILITY</span>
            <span style={{ color: getStabilityColor() }}>{stabilityPercent}%</span>
          </div>

          {/* Progress bar */}
          <div
            className="h-2 relative overflow-hidden"
            style={{
              backgroundColor: COLORS.bgCard,
              border: `1px solid ${COLORS.borderBracket}`,
            }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${stabilityPercent}%`,
                backgroundColor: getStabilityColor(),
              }}
            />
          </div>

          {/* Stability details */}
          <div
            className="mt-2 flex justify-between"
            style={{ fontSize: '9px' }}
          >
            <span style={{ color: COLORS.textTimestamp }}>
              CONFIDENCE: <span style={{ color: confidenceColor }}>{state.confidence.toFixed(2)}</span>
            </span>
            <span style={{ color: getStabilityColor() }}>
              MODE: {getStabilityMode()}
            </span>
          </div>

          {/* CRAG Status */}
          <div
            className="mt-2 flex items-center gap-2"
            style={{ fontSize: '9px' }}
          >
            <span style={{ color: COLORS.textTimestamp }}>[CRAG:</span>
            <span
              className={isCragQuerying ? 'typewriter-cursor' : ''}
              style={{
                color: isCragQuerying
                  ? COLORS.cragQuerying
                  : state.crag === 'ACTIVE'
                    ? COLORS.cragActive
                    : COLORS.cragStandby,
              }}
            >
              {state.crag}
            </span>
            <span style={{ color: COLORS.textTimestamp }}>]</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ backgroundColor: COLORS.borderBracket }} />

        {/* ===== COMPONENT 3: MODE INDICATOR ===== */}
        <div>
          <div
            className="mb-2"
            style={{
              fontSize: '9px',
              color: COLORS.textTimestamp,
              letterSpacing: '0.05em',
            }}
          >
            DECISION MODE
          </div>

          {/* Mode dots */}
          <div className="space-y-2">
            {(['AUTONOMOUS', 'SUPERVISED', 'MANUAL'] as const).map((mode) => {
              const isActive = state.mode === mode ||
                (mode === 'SUPERVISED' && (state.crag === 'ACTIVE' || state.crag === 'QUERYING')) ||
                (mode === 'MANUAL' && isHumanInLoop);

              const dotColor = mode === 'AUTONOMOUS'
                ? COLORS.textMuted
                : mode === 'SUPERVISED'
                  ? '#d97706'
                  : COLORS.alertRed;

              return (
                <div
                  key={mode}
                  className="flex items-center gap-2"
                  style={{ opacity: isActive ? 1 : 0.3 }}
                >
                  <div
                    className={isActive ? 'animate-pulse' : ''}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? dotColor : 'transparent',
                      border: `1px solid ${dotColor}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      color: isActive ? COLORS.textSecondary : COLORS.textTimestamp,
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {mode}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ backgroundColor: COLORS.borderBracket }} />

        {/* ===== FALLBACK & REASON CODE ===== */}
        <div className="space-y-2">
          {/* FALLBACK */}
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '9px', color: COLORS.textTimestamp }}>FALLBACK</span>
            <span
              className={isFallbackTriggered ? 'animate-pulse' : ''}
              style={{
                fontSize: '10px',
                color: isFallbackTriggered ? COLORS.alertRed : COLORS.textDim,
              }}
            >
              {state.fallback}
            </span>
          </div>

          {/* REASON_CODE */}
          {state.reasonCode && (
            <div
              className="py-1.5 px-2 animate-pulse"
              style={{
                fontSize: '9px',
                color: COLORS.alertRed,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${COLORS.alertRed}`,
              }}
            >
              REASON: {state.reasonCode}
            </div>
          )}
        </div>
      </div>

      {/* Status Footer */}
      <div
        className="px-3 py-2 border-t"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '9px',
          color: COLORS.textTimestamp,
        }}
      >
        <div className="flex justify-between">
          <span>LINK: {isOffline ? 'OFFLINE' : 'ONLINE'}</span>
          <span className={isOffline ? 'status-dot-alert' : 'status-dot-active'}>
            {isOffline ? 'AUTONOMOUS' : 'CLOUD_SYNC'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Default initial governance state
export function createInitialGovernanceState(): GovernanceState {
  return {
    raci: 'AI_SYSTEM',
    confidence: 0.99,
    mode: 'AUTONOMOUS',
    crag: 'STANDBY',
    fallback: 'NONE',
    reasonCode: null,
  };
}
