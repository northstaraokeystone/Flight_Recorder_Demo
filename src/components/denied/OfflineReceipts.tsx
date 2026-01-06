/**
 * OfflineReceipts - Counter showing receipts built in the dark
 * The flex - we're building proofs when disconnected
 */

import type { ScenarioPhase } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface OfflineReceiptsProps {
  count: number;
  phase: ScenarioPhase;
  syncedCount: number;
}

export function OfflineReceipts({ count, phase, syncedCount }: OfflineReceiptsProps) {
  const isOffline = phase === 'OFFLINE' || phase === 'INCIDENT_DETECTED' ||
    phase === 'STOP_RULE_TRIGGERED' || phase === 'AVOIDANCE_EXECUTED';
  const isSyncing = phase === 'BURST_SYNC';
  const isVerified = phase === 'VERIFIED' || phase === 'COMPLETE';

  // Don't show if in normal ops or degraded
  if (phase === 'NORMAL_OPS' || phase === 'DEGRADED') {
    return null;
  }

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center h-full
        transition-all duration-500
        ${isOffline ? 'animate-pulse' : ''}
      `}
      style={{
        backgroundColor: 'rgba(13, 20, 36, 0.8)',
        border: `1px solid ${isVerified ? COLORS.alertGreen : COLORS.borderBracket}`,
      }}
    >
      {/* Corner brackets */}
      <div
        className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2"
        style={{ borderColor: isVerified ? COLORS.alertGreen : COLORS.borderBracket }}
      />
      <div
        className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2"
        style={{ borderColor: isVerified ? COLORS.alertGreen : COLORS.borderBracket }}
      />
      <div
        className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2"
        style={{ borderColor: isVerified ? COLORS.alertGreen : COLORS.borderBracket }}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2"
        style={{ borderColor: isVerified ? COLORS.alertGreen : COLORS.borderBracket }}
      />

      {/* Header */}
      <div
        className="text-[10px] font-mono tracking-widest mb-2"
        style={{ color: COLORS.textMuted }}
      >
        {isVerified ? 'RECEIPTS SYNCED' : 'OFFLINE RECEIPTS'}
      </div>

      {/* Separator */}
      <div
        className="w-16 h-px mb-3"
        style={{ backgroundColor: COLORS.borderBracket }}
      />

      {/* The big number */}
      <div
        className={`
          text-4xl font-mono font-bold tracking-wider
          transition-colors duration-300
        `}
        style={{
          color: isVerified
            ? COLORS.alertGreen
            : isSyncing
            ? COLORS.statusOnline
            : COLORS.textPrimary,
        }}
      >
        {isVerified ? syncedCount : count}
      </div>

      {/* Separator */}
      <div
        className="w-16 h-px mt-3 mb-2"
        style={{ backgroundColor: COLORS.borderBracket }}
      />

      {/* Status label */}
      <div
        className="text-[10px] font-mono tracking-widest"
        style={{
          color: isVerified
            ? COLORS.alertGreen
            : isSyncing
            ? COLORS.statusOnline
            : COLORS.alertAmber,
        }}
      >
        {isVerified && (
          <span className="flex items-center gap-1">
            <span style={{ color: COLORS.alertGreen }}>{'\u2713'}</span>
            VERIFIED
          </span>
        )}
        {isSyncing && 'SYNCING...'}
        {isOffline && 'AWAITING SYNC'}
        {phase === 'RECONNECTING' && 'PREPARING SYNC'}
      </div>

      {/* Glow effect when verified */}
      {isVerified && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 30px ${COLORS.alertGreen}30`,
          }}
        />
      )}
    </div>
  );
}
