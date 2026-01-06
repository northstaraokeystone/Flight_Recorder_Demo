/**
 * FinancialStory - The Value (Right Pane)
 * v5.0: Dynamic ROI journey - watch risk transform into asset
 * EXPOSURE drains to $0, MITIGATED fills to $15M
 */

import { useEffect, useState } from 'react';
import type { ROIState, ScenarioPhase, ChainBlock } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';
import { MONEY_SHOTS } from '../../constants/scenario';

interface FinancialStoryProps {
  roi: ROIState;
  phase: ScenarioPhase;
  chainBlocks: ChainBlock[];
  syncedCount: number;
  stopRuleFired: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    return `$${Math.floor(value / 1_000)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function FinancialStory({
  roi,
  phase,
  chainBlocks,
  syncedCount,
  stopRuleFired,
}: FinancialStoryProps) {
  const [displayExposure, setDisplayExposure] = useState(0);
  const [displayMitigated, setDisplayMitigated] = useState(0);
  const [drainFillActive, setDrainFillActive] = useState(false);

  // Drain/Fill animation when transitioning from incident to avoidance
  useEffect(() => {
    if (phase === 'AVOIDANCE_EXECUTED' && roi.riskMitigated > 0) {
      setDrainFillActive(true);
      const startTime = Date.now();
      const duration = 1000; // 1 second
      const startExposure = MONEY_SHOTS.LIABILITY_EXPOSURE;
      const targetMitigated = MONEY_SHOTS.LIABILITY_EXPOSURE;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Linear transition
        const currentExposure = Math.round(startExposure * (1 - progress));
        const currentMitigated = Math.round(targetMitigated * progress);

        setDisplayExposure(currentExposure);
        setDisplayMitigated(currentMitigated);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDrainFillActive(false);
        }
      };

      requestAnimationFrame(animate);
    } else if (phase === 'INCIDENT_DETECTED' || phase === 'STOP_RULE_TRIGGERED') {
      // Spike exposure
      setDisplayExposure(roi.liabilityExposure);
      setDisplayMitigated(0);
    } else if (phase === 'NORMAL_OPS' || phase === 'DEGRADED' || phase === 'OFFLINE') {
      setDisplayExposure(0);
      setDisplayMitigated(0);
    }
  }, [phase, roi]);

  // After avoidance, keep final values
  useEffect(() => {
    if (phase === 'RECONNECTING' || phase === 'BURST_SYNC' || phase === 'VERIFIED' || phase === 'COMPLETE') {
      setDisplayExposure(0);
      setDisplayMitigated(MONEY_SHOTS.LIABILITY_EXPOSURE);
    }
  }, [phase]);

  const isIncidentPhase = phase === 'INCIDENT_DETECTED' || phase === 'STOP_RULE_TRIGGERED';
  const isSaveComplete = phase === 'VERIFIED' || phase === 'COMPLETE';
  const pendingReceipts = chainBlocks.filter(b => b.status === 'PENDING').length;
  const gaps = 0; // Always 0 in this demo

  const getShieldStatus = () => {
    if (isSaveComplete) return { text: 'ACTIVE', color: COLORS.alertGreen };
    if (isIncidentPhase) return { text: 'ENGAGED', color: COLORS.statusOnline, pulse: true };
    if (roi.incidentActive) return { text: 'MONITORING', color: COLORS.alertAmber };
    return { text: 'ARMED', color: COLORS.alertGreen };
  };

  const getStopRuleStatus = () => {
    if (stopRuleFired) return { text: 'FIRED', color: COLORS.alertGreen, icon: true };
    if (isIncidentPhase) return { text: 'FIRING', color: COLORS.alertAmber };
    return { text: 'ARMED', color: COLORS.textSecondary };
  };

  const shield = getShieldStatus();
  const stopRule = getStopRuleStatus();

  return (
    <div
      className="flex flex-col h-full font-mono"
      style={{
        backgroundColor: '#0d0d0d',
        border: `1px solid ${COLORS.borderBracket}`,
      }}
    >
      {/* Pane Header */}
      <div
        className="px-3 py-2 border-b"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '10px',
          letterSpacing: '0.1em',
          color: COLORS.textMuted,
        }}
      >
        THE VALUE
      </div>

      {/* LIABILITY EXPOSURE */}
      <div className="px-4 py-4 border-b" style={{ borderColor: COLORS.borderBracket }}>
        <div style={{ fontSize: '10px', color: COLORS.textMuted, letterSpacing: '0.1em' }}>
          LIABILITY EXPOSURE
        </div>
        <div className="h-px my-2" style={{ backgroundColor: COLORS.borderBracket }} />
        <div
          className={isIncidentPhase ? 'animate-pulse' : ''}
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: displayExposure > 0 ? COLORS.alertRedBright : COLORS.alertGreen,
            transition: drainFillActive ? 'none' : 'color 0.3s',
          }}
        >
          {displayExposure > 0 ? formatCurrency(displayExposure) : '$0'}
        </div>
      </div>

      {/* RISK MITIGATED */}
      <div className="px-4 py-4 border-b" style={{ borderColor: COLORS.borderBracket }}>
        <div style={{ fontSize: '10px', color: COLORS.textMuted, letterSpacing: '0.1em' }}>
          RISK MITIGATED
        </div>
        <div className="h-px my-2" style={{ backgroundColor: COLORS.borderBracket }} />
        <div
          className={isSaveComplete ? 'animate-greenGlowPulse' : ''}
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: displayMitigated > 0 ? COLORS.alertGreen : COLORS.textMuted,
            transition: drainFillActive ? 'none' : 'color 0.3s',
          }}
        >
          {displayMitigated > 0 ? formatCurrency(displayMitigated) : '$0'}
        </div>
      </div>

      {/* LIABILITY SHIELD */}
      <div className="px-4 py-3 border-b" style={{ borderColor: COLORS.borderBracket }}>
        <div style={{ fontSize: '10px', color: COLORS.textMuted, letterSpacing: '0.1em', marginBottom: '4px' }}>
          LIABILITY SHIELD
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${shield.pulse ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: shield.color }}
          />
          <span style={{ fontSize: '11px', color: shield.color, fontWeight: 'bold' }}>
            {shield.text}
          </span>
        </div>
      </div>

      {/* GOVERNANCE STATE */}
      <div className="px-4 py-3 border-b" style={{ borderColor: COLORS.borderBracket }}>
        <div style={{ fontSize: '10px', color: COLORS.textMuted, letterSpacing: '0.1em', marginBottom: '8px' }}>
          GOVERNANCE STATE
        </div>
        <div className="space-y-1" style={{ fontSize: '11px' }}>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>RACI:</span>
            <span style={{ color: COLORS.textSecondary }}>LOADED</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>POLICY:</span>
            <span style={{ color: COLORS.textSecondary }}>NOMINAL</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>STOP_RULE:</span>
            <span style={{ color: stopRule.color, fontWeight: stopRule.icon ? 'bold' : 'normal' }}>
              {stopRule.icon && '🔒 '}{stopRule.text}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>OFFLINE:</span>
            <span style={{ color: COLORS.textSecondary }}>READY</span>
          </div>
        </div>
      </div>

      {/* CHAIN METRICS */}
      <div className="px-4 py-3 border-b" style={{ borderColor: COLORS.borderBracket }}>
        <div style={{ fontSize: '10px', color: COLORS.textMuted, letterSpacing: '0.1em', marginBottom: '8px' }}>
          CHAIN METRICS
        </div>
        <div className="space-y-1" style={{ fontSize: '11px' }}>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>RECEIPTS:</span>
            <span style={{ color: COLORS.textSecondary }}>{chainBlocks.length}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>INTEGRITY:</span>
            <span style={{ color: isSaveComplete ? COLORS.alertGreen : COLORS.textSecondary }}>
              {isSaveComplete ? '100%' : pendingReceipts > 0 ? `${Math.round((syncedCount / Math.max(chainBlocks.length, 1)) * 100)}%` : '100%'}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>GAPS:</span>
            <span style={{ color: COLORS.alertGreen }}>{gaps}</span>
          </div>
        </div>
      </div>

      {/* COMPLIANCE */}
      <div className="px-4 py-3 flex-1">
        <div style={{ fontSize: '10px', color: COLORS.textMuted, letterSpacing: '0.1em', marginBottom: '8px' }}>
          COMPLIANCE
        </div>
        <div className="space-y-1" style={{ fontSize: '11px' }}>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>FAA-108:</span>
            <span style={{ color: COLORS.alertGreen }}>✓</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>DOD-3000:</span>
            <span style={{ color: COLORS.alertGreen }}>✓</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>EU-AI:</span>
            <span style={{ color: COLORS.alertGreen }}>✓</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>DO-178C:</span>
            <span style={{ color: COLORS.alertGreen }}>✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
