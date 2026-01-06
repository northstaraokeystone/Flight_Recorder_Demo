/**
 * ROITicker - The money display (header style)
 * $15M always visible - this is why we're here
 * Compact, dense, always present
 */

import { useEffect, useState } from 'react';
import type { ROIState, ScenarioPhase } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface ROITickerProps {
  roi: ROIState;
  phase: ScenarioPhase;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function ROITicker({ roi, phase }: ROITickerProps) {
  const [displayMitigated, setDisplayMitigated] = useState(0);

  // Animate mitigated reveal
  useEffect(() => {
    if (roi.riskMitigated > displayMitigated) {
      const timer = setInterval(() => {
        setDisplayMitigated(prev => {
          const step = Math.max(500000, (roi.riskMitigated - prev) / 3);
          const next = prev + step;
          if (next >= roi.riskMitigated) {
            clearInterval(timer);
            return roi.riskMitigated;
          }
          return next;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [roi.riskMitigated, displayMitigated]);

  const isIncidentPhase = phase === 'INCIDENT_DETECTED' || phase === 'STOP_RULE_TRIGGERED';
  const isSavePhase = phase === 'AVOIDANCE_EXECUTED' || phase === 'RECONNECTING' || phase === 'BURST_SYNC' || phase === 'VERIFIED' || phase === 'COMPLETE';
  const showMitigated = isSavePhase && displayMitigated > 0;

  return (
    <div className="flex items-center gap-4 font-mono">
      {/* Risk Mitigated - THE BIG NUMBER (always visible area) */}
      <div className="flex flex-col items-end">
        <span
          className="text-[8px] tracking-wider"
          style={{ color: COLORS.textMuted }}
        >
          RISK MITIGATED
        </span>
        <span
          className={`
            font-bold tracking-wide transition-all duration-300
            ${showMitigated ? 'animate-riskPulse' : ''}
          `}
          style={{
            fontSize: showMitigated ? '18px' : '14px',
            color: showMitigated ? COLORS.alertGreen : COLORS.textMuted,
          }}
        >
          {showMitigated ? formatCurrency(displayMitigated) : '---'}
        </span>
      </div>

      {/* Divider */}
      <div
        className="w-px h-8"
        style={{ backgroundColor: COLORS.borderBracket }}
      />

      {/* Insurance status */}
      <div className="flex flex-col items-end">
        <span
          className="text-[8px] tracking-wider"
          style={{ color: COLORS.textMuted }}
        >
          INSURANCE
        </span>
        <span
          className="text-[12px] font-bold"
          style={{
            color: isIncidentPhase ? COLORS.alertAmber : COLORS.alertGreen,
          }}
        >
          {isIncidentPhase ? 'AT RISK' : 'ACTIVE'}
        </span>
      </div>

      {/* Pulsing border during incident */}
      {isIncidentPhase && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse rounded"
          style={{
            border: `1px solid ${COLORS.alertRed}`,
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
}
