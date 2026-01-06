/**
 * GovernancePanel - Real-time Governance State Display
 * v2.2 DIAMOND: Shows RACI, CONFIDENCE, MODE, CRAG in real-time
 *
 * This is where v2.2 comes alive - the spec features visible in real-time
 */

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

export function GovernancePanel({ state, isOffline }: GovernancePanelProps) {
  const confidenceColor = getConfidenceColor(state.confidence);
  const isLowConfidence = state.confidence < 0.70;
  const isHumanInLoop = state.raci === 'HUMAN_IN_LOOP';
  const isCragQuerying = state.crag === 'QUERYING';
  const isFallbackTriggered = state.fallback === 'TRIGGERED';
  const hasReasonCode = state.reasonCode !== null;

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

      {/* Governance Fields */}
      <div className="flex-1 px-4 py-3 space-y-4">
        {/* RACI */}
        <div className="flex justify-between items-center">
          <span className="field-label">RACI</span>
          <span
            className={`field-value ${isHumanInLoop ? 'animate-pulse' : ''}`}
            style={{
              color: isHumanInLoop ? COLORS.raciHuman : COLORS.raciAI,
              fontWeight: isHumanInLoop ? 600 : 400,
            }}
          >
            {state.raci}
          </span>
        </div>

        {/* CONFIDENCE */}
        <div className="flex justify-between items-center">
          <span className="field-label">CONFIDENCE</span>
          <span
            className={`field-value ${isLowConfidence ? 'animate-pulse' : ''}`}
            style={{ color: confidenceColor }}
          >
            {state.confidence.toFixed(2)}
          </span>
        </div>

        {/* MODE */}
        <div className="flex justify-between items-center">
          <span className="field-label">MODE</span>
          <span
            className="field-value"
            style={{
              color: state.mode === 'AUTONOMOUS' ? COLORS.modeAutonomous : COLORS.modeSupervised,
            }}
          >
            {state.mode}
          </span>
        </div>

        {/* CRAG */}
        <div className="flex justify-between items-center">
          <span className="field-label">CRAG</span>
          <span
            className={`field-value ${isCragQuerying ? 'typewriter-cursor' : ''}`}
            style={{
              color: isCragQuerying
                ? COLORS.cragQuerying
                : state.crag === 'ACTIVE'
                  ? COLORS.cragActive
                  : COLORS.cragStandby,
            }}
          >
            {state.crag}{isCragQuerying ? '' : ''}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ backgroundColor: COLORS.borderBracket }} />

        {/* FALLBACK */}
        <div className="flex justify-between items-center">
          <span className="field-label">FALLBACK</span>
          <span
            className={`field-value ${isFallbackTriggered ? 'animate-pulse' : ''}`}
            style={{
              color: isFallbackTriggered ? COLORS.alertRed : COLORS.textDim,
            }}
          >
            {state.fallback}
          </span>
        </div>

        {/* REASON_CODE */}
        <div className="flex justify-between items-center">
          <span className="field-label">REASON_CODE</span>
          <span
            className={`field-value ${hasReasonCode ? 'animate-pulse' : ''}`}
            style={{
              color: hasReasonCode ? COLORS.alertRed : COLORS.textDim,
              fontSize: hasReasonCode ? '10px' : '11px',
            }}
          >
            {state.reasonCode || '—'}
          </span>
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
