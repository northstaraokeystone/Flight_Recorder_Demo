/**
 * CryptographicLedger - The Truth (Middle Pane)
 * v5.0: Every log entry has a cryptographic fingerprint
 * Hash colors: Grey (synced) -> AMBER (offline) -> GREEN (verified)
 * Ripple effect on burst sync
 */

import { useEffect, useRef, useState } from 'react';
import type { ScenarioPhase } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';
import { generateDualHash } from '../../utils/crypto';

export interface LedgerEntry {
  id: number;
  timestamp: string;
  hash: string;
  eventType: string;
  result: string;
  offline: boolean;
  synced: boolean;
  verified: boolean;
  stopRule?: boolean;
}

interface CryptographicLedgerProps {
  entries: LedgerEntry[];
  phase: ScenarioPhase;
  syncProgress: number; // 0-1 for ripple animation
  isOffline: boolean;
}

function getHashColor(entry: LedgerEntry, isOffline: boolean): string {
  if (entry.verified) return '#00aa66'; // Green - verified
  if (entry.synced) return '#00aa66'; // Green - synced
  if (entry.offline || isOffline) return '#ffaa00'; // Amber - pending
  return '#555555'; // Grey - normal
}

export function CryptographicLedger({
  entries,
  phase,
  syncProgress,
  isOffline,
}: CryptographicLedgerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rippleIndex, setRippleIndex] = useState(-1);

  // Auto-scroll to bottom when new entries added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries]);

  // Handle ripple animation during burst sync
  useEffect(() => {
    if (phase === 'BURST_SYNC') {
      const entriesCount = entries.length;
      const targetIndex = Math.floor(syncProgress * entriesCount);
      setRippleIndex(targetIndex);
    } else if (phase === 'VERIFIED' || phase === 'COMPLETE') {
      setRippleIndex(entries.length);
    } else {
      setRippleIndex(-1);
    }
  }, [phase, syncProgress, entries.length]);

  const getModeText = () => {
    if (phase === 'VERIFIED' || phase === 'COMPLETE') return 'CLOUD_SYNC';
    if (isOffline) return 'LOCAL_FIDUCIARY (OFFLINE)';
    return 'CLOUD_SYNC';
  };

  const getChainText = () => {
    if (phase === 'VERIFIED' || phase === 'COMPLETE') return 'NOMINAL';
    if (isOffline) return 'BUFFERING';
    return 'NOMINAL';
  };

  return (
    <div
      className="relative flex flex-col h-full font-mono"
      style={{
        backgroundColor: '#0d0d0d',
        border: `1px solid ${COLORS.borderBracket}`,
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 border-b"
        style={{
          borderColor: COLORS.borderBracket,
          backgroundColor: 'rgba(13, 13, 13, 0.95)',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: COLORS.textPrimary }}>
              CRYPTOGRAPHIC LEDGER
            </span>
            <span
              className="px-1.5 py-0.5"
              style={{
                fontSize: '8px',
                backgroundColor: isOffline ? 'rgba(255, 170, 0, 0.2)' : 'rgba(0, 170, 102, 0.2)',
                color: isOffline ? COLORS.alertAmber : COLORS.alertGreen,
                border: `1px solid ${isOffline ? COLORS.alertAmber : COLORS.alertGreen}`,
              }}
            >
              {isOffline ? 'OFFLINE' : 'LIVE'}
            </span>
          </div>
          <span style={{ fontSize: '9px', color: COLORS.textMuted }}>
            ENTRIES: {entries.length}
          </span>
        </div>
        <div className="flex justify-between mt-1" style={{ fontSize: '8px', color: COLORS.textMuted }}>
          <span>MODE: <span style={{ color: isOffline ? COLORS.alertAmber : COLORS.textSecondary }}>{getModeText()}</span></span>
          <span>CHAIN: <span style={{ color: phase === 'VERIFIED' ? COLORS.alertGreen : COLORS.textSecondary }}>{getChainText()}</span></span>
        </div>
      </div>

      {/* Column Headers */}
      <div
        className="flex px-3 py-1 border-b"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '10px',
          color: COLORS.textMuted,
          letterSpacing: '0.05em',
        }}
      >
        <div style={{ width: '15%' }}>TIME</div>
        <div style={{ width: '15%' }}>HASH</div>
        <div style={{ width: '40%' }}>EVENT</div>
        <div style={{ width: '30%' }}>RESULT</div>
      </div>

      {/* Log entries */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-3 py-1"
        style={{ fontSize: '11px', lineHeight: '1.8' }}
      >
        {entries.length === 0 ? (
          <div className="text-center py-4 animate-pulse" style={{ color: COLORS.textMuted }}>
            AWAITING EVENTS...
          </div>
        ) : (
          entries.map((entry, index) => {
            const isRippling = phase === 'BURST_SYNC' && index <= rippleIndex;
            const isVerified = phase === 'VERIFIED' || phase === 'COMPLETE';
            const hashColor = isVerified ? '#00aa66' : isRippling ? '#00aa66' : getHashColor(entry, isOffline);

            return (
              <div
                key={entry.id}
                className="flex items-center whitespace-nowrap"
                style={{
                  animation: 'fadeIn 0.15s ease-in',
                  borderBottom: entry.stopRule ? `1px solid ${COLORS.alertGreen}` : 'none',
                  backgroundColor: entry.stopRule ? 'rgba(0, 170, 102, 0.1)' : 'transparent',
                  padding: entry.stopRule ? '2px 0' : '0',
                }}
              >
                {/* Time */}
                <div style={{ width: '15%', color: COLORS.textTimestamp, fontSize: '10px' }}>
                  {entry.timestamp}
                </div>

                {/* Hash - with color transition */}
                <div
                  style={{
                    width: '15%',
                    color: hashColor,
                    fontSize: '10px',
                    transition: 'color 0.3s ease-in-out',
                  }}
                >
                  0x{entry.hash.slice(0, 4)}...
                </div>

                {/* Event */}
                <div style={{ width: '40%', color: COLORS.textSecondary }}>
                  {entry.eventType}
                </div>

                {/* Result */}
                <div
                  style={{
                    width: '30%',
                    color: entry.stopRule ? COLORS.alertGreen : COLORS.textPrimary,
                    fontWeight: entry.stopRule ? 'bold' : 'normal',
                  }}
                >
                  {entry.stopRule && <span style={{ marginRight: '4px' }}>🔒</span>}
                  {entry.result}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-1 border-t flex justify-between"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '8px',
          color: COLORS.textTimestamp,
        }}
      >
        <span>
          {phase === 'BURST_SYNC' ? `SYNCING: ${Math.round(syncProgress * 100)}%` : 'READY'}
        </span>
        <span>
          INTEGRITY: {phase === 'VERIFIED' || phase === 'COMPLETE' ? '100%' : isOffline ? 'PENDING' : '100%'}
        </span>
      </div>
    </div>
  );
}

// Helper to generate ledger entries from scenario state
export function createLedgerEntry(
  id: number,
  timestamp: string,
  eventType: string,
  result: string,
  offline: boolean,
  stopRule?: boolean
): LedgerEntry {
  return {
    id,
    timestamp,
    hash: generateDualHash(`entry-${id}-${Date.now()}`).sha256,
    eventType,
    result,
    offline,
    synced: !offline,
    verified: false,
    stopRule,
  };
}
