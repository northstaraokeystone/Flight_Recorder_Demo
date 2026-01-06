/**
 * ROITicker - The money display
 * Shows liability exposure, decisions secured, and risk mitigated
 * This is why CFOs pay attention
 */

import { useEffect, useState } from 'react';
import type { ROIState, ScenarioPhase } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface ROITickerProps {
  roi: ROIState;
  phase: ScenarioPhase;
  decisionsSecured: number;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function ROITicker({ roi, phase, decisionsSecured }: ROITickerProps) {
  const [displayExposure, setDisplayExposure] = useState(0);
  const [displayMitigated, setDisplayMitigated] = useState(0);

  // Animate exposure spike
  useEffect(() => {
    if (roi.liabilityExposure > displayExposure) {
      const timer = setInterval(() => {
        setDisplayExposure(prev => {
          const step = Math.max(100000, (roi.liabilityExposure - prev) / 5);
          const next = prev + step;
          if (next >= roi.liabilityExposure) {
            clearInterval(timer);
            return roi.liabilityExposure;
          }
          return next;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [roi.liabilityExposure, displayExposure]);

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
  const showBigNumber = isSavePhase && roi.riskMitigated > 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Main ticker panel */}
      <div
        className="relative px-4 py-3 font-mono"
        style={{
          backgroundColor: 'rgba(13, 20, 36, 0.8)',
          border: `1px solid ${COLORS.borderBracket}`,
        }}
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: COLORS.borderBracket }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: COLORS.borderBracket }} />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: COLORS.borderBracket }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: COLORS.borderBracket }} />

        <div className="flex flex-col gap-2">
          {/* Liability Exposure */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider" style={{ color: COLORS.textMuted }}>
              EXPOSURE
            </span>
            <span
              className={`
                text-sm font-bold tracking-wide transition-all duration-300
                ${isIncidentPhase ? 'animate-pulse scale-110' : ''}
              `}
              style={{
                color: displayExposure > 0
                  ? (isIncidentPhase ? COLORS.alertRedBright : COLORS.alertAmber)
                  : COLORS.textPrimary,
              }}
            >
              {formatCurrency(displayExposure)}
            </span>
          </div>

          {/* Decisions Secured */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider" style={{ color: COLORS.textMuted }}>
              SECURED
            </span>
            <span
              className="text-sm font-bold tracking-wide"
              style={{ color: decisionsSecured > 0 ? COLORS.statusOnline : COLORS.textPrimary }}
            >
              {decisionsSecured}
            </span>
          </div>

          {/* Risk Mitigated */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider" style={{ color: COLORS.textMuted }}>
              MITIGATED
            </span>
            <span
              className={`
                font-bold tracking-wide transition-all duration-500
                ${showBigNumber ? 'text-lg' : 'text-sm'}
              `}
              style={{ color: displayMitigated > 0 ? COLORS.alertGreen : COLORS.textPrimary }}
            >
              {formatCurrency(displayMitigated)}
            </span>
          </div>
        </div>

        {/* Pulsing red glow during incident */}
        {isIncidentPhase && (
          <div
            className="absolute inset-0 pointer-events-none animate-pulse"
            style={{
              boxShadow: `inset 0 0 30px rgba(255, 68, 68, 0.3)`,
            }}
          />
        )}
      </div>

      {/* THE BIG NUMBER - Risk Mitigated hero display */}
      {showBigNumber && (
        <div
          className="relative px-4 py-4 text-center animate-fadeInScale"
          style={{
            backgroundColor: 'rgba(0, 170, 102, 0.15)',
            border: `2px solid ${COLORS.alertGreen}`,
          }}
        >
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2" style={{ borderColor: COLORS.alertGreen }} />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2" style={{ borderColor: COLORS.alertGreen }} />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2" style={{ borderColor: COLORS.alertGreen }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2" style={{ borderColor: COLORS.alertGreen }} />

          <div className="text-[10px] tracking-widest mb-1" style={{ color: COLORS.alertGreen }}>
            RISK MITIGATED
          </div>
          <div
            className="text-3xl font-mono font-bold tracking-wider"
            style={{ color: COLORS.alertGreen }}
          >
            {formatCurrency(displayMitigated)}
          </div>

          {/* Success glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `0 0 40px ${COLORS.alertGreen}40`,
            }}
          />
        </div>
      )}
    </div>
  );
}
