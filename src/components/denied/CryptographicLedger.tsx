/**
 * CryptographicLedger - Terminal Style Event Log
 * v2.2 DIAMOND: Block IDs, Reason Codes, Hash references
 *
 * Format: [BLOCK 47] | 10:30:00 | EVENT_TYPE | REASON_CODE | 0x9a7f...
 */

import { useEffect, useRef, useState } from 'react';
import type { ScenarioPhase, GovernanceLogEntry } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';
import { generateDualHash } from '../../utils/crypto';

// Legacy interface for backwards compatibility
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
  reasonCode?: string;
  blockId?: number;
}

interface CryptographicLedgerProps {
  entries: LedgerEntry[];
  phase: ScenarioPhase;
  syncProgress: number;
  isOffline: boolean;
  governanceLog?: GovernanceLogEntry[];
}

function getSeverityColor(eventType: string, isAlert: boolean): string {
  if (isAlert) return COLORS.alertRed;
  if (eventType.includes('UNCERTAINTY') || eventType.includes('CRAG')) return COLORS.alertRed;
  if (eventType.includes('RACI_HANDOFF')) return COLORS.textPrimary;
  if (eventType.includes('RESPONSE') || eventType.includes('COMPLETE')) return COLORS.textSecondary;
  return COLORS.textSecondary;
}

export function CryptographicLedger({
  entries,
  phase,
  syncProgress,
  isOffline,
  governanceLog = [],
}: CryptographicLedgerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rippleIndex, setRippleIndex] = useState(-1);

  // Auto-scroll to bottom when new entries added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries, governanceLog]);

  // Handle ripple animation during verification phases
  useEffect(() => {
    if (phase === 'BURST_SYNC' || phase === 'VERIFIED') {
      const totalEntries = governanceLog.length || entries.length;
      const targetIndex = Math.floor(syncProgress * totalEntries);
      setRippleIndex(targetIndex);
    } else if (phase === 'MISSION_COMPLETE' || phase === 'COMPLETE') {
      setRippleIndex(governanceLog.length || entries.length);
    } else {
      setRippleIndex(-1);
    }
  }, [phase, syncProgress, entries.length, governanceLog.length]);

  const getModeText = () => {
    if (phase === 'AFFIDAVIT' || phase === 'TRUST_GAP' || phase === 'MISSION_COMPLETE') return 'VERIFIED';
    if (isOffline) return 'BUFFERING';
    return 'LIVE';
  };

  // Use governanceLog if available, otherwise fall back to entries
  const displayEntries = governanceLog.length > 0 ? governanceLog : entries;

  return (
    <div
      className="relative flex flex-col h-full font-mono"
      style={{
        backgroundColor: COLORS.bgElevated,
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
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: COLORS.textMuted,
            }}
          >
            EVENT LOG
          </span>
          <span
            className="px-2 py-0.5"
            style={{
              fontSize: '9px',
              color: isOffline ? COLORS.alertRed : COLORS.textDim,
              border: `1px solid ${isOffline ? COLORS.alertRed : COLORS.borderBracket}`,
              backgroundColor: isOffline ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            }}
          >
            {getModeText()}
          </span>
        </div>
      </div>

      {/* Column Headers */}
      <div
        className="flex px-3 py-1 border-b"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '9px',
          color: COLORS.textTimestamp,
          letterSpacing: '0.02em',
        }}
      >
        <div style={{ width: '12%' }}>BLOCK</div>
        <div style={{ width: '15%' }}>TIME</div>
        <div style={{ width: '35%' }}>EVENT</div>
        <div style={{ width: '20%' }}>CODE</div>
        <div style={{ width: '18%' }}>HASH</div>
      </div>

      {/* Log entries */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-3 py-1"
        style={{ fontSize: '10px', lineHeight: '1.6' }}
      >
        {displayEntries.length === 0 ? (
          <div
            className="text-center py-4"
            style={{ color: COLORS.textTimestamp, fontSize: '10px' }}
          >
            AWAITING EVENTS...
          </div>
        ) : (
          displayEntries.map((entry, index) => {
            const isGovEntry = 'blockId' in entry && 'detail' in entry;
            const blockId = isGovEntry ? (entry as GovernanceLogEntry).blockId : (entry as LedgerEntry).blockId || index + 1;
            const timestamp = isGovEntry ? (entry as GovernanceLogEntry).timestamp : (entry as LedgerEntry).timestamp;
            const eventType = isGovEntry ? (entry as GovernanceLogEntry).eventType : (entry as LedgerEntry).eventType;
            const detail = isGovEntry ? (entry as GovernanceLogEntry).detail : (entry as LedgerEntry).result;
            const reasonCode = isGovEntry ? (entry as GovernanceLogEntry).reasonCode : (entry as LedgerEntry).reasonCode;
            const hash = isGovEntry ? (entry as GovernanceLogEntry).hash : (entry as LedgerEntry).hash;

            const isRippled = index <= rippleIndex;
            const isAlert = eventType.includes('UNCERTAINTY') ||
              eventType.includes('CRAG') ||
              !!(entry as LedgerEntry).stopRule;
            const eventColor = getSeverityColor(eventType, !!isAlert);

            return (
              <div
                key={index}
                className="flex items-center whitespace-nowrap py-0.5"
                style={{
                  animation: 'fadeIn 0.15s ease-in',
                  borderLeft: isAlert ? `2px solid ${COLORS.alertRed}` : 'none',
                  paddingLeft: isAlert ? '4px' : '0',
                  marginLeft: isAlert ? '-4px' : '0',
                }}
              >
                {/* Block ID */}
                <div
                  style={{
                    width: '12%',
                    color: isRippled ? COLORS.textMuted : COLORS.textTimestamp,
                    transition: 'color 0.3s',
                  }}
                >
                  [{blockId.toString().padStart(2, '0')}]
                </div>

                {/* Timestamp */}
                <div
                  style={{
                    width: '15%',
                    color: COLORS.textTimestamp,
                  }}
                >
                  {timestamp}
                </div>

                {/* Event Type */}
                <div
                  style={{
                    width: '35%',
                    color: eventColor,
                    fontWeight: isAlert ? 500 : 400,
                  }}
                >
                  {eventType}
                  {detail && (
                    <span style={{ color: COLORS.textDim, marginLeft: '4px' }}>
                      {detail.length > 15 ? `${detail.slice(0, 15)}...` : detail}
                    </span>
                  )}
                </div>

                {/* Reason Code */}
                <div
                  style={{
                    width: '20%',
                    color: reasonCode ? COLORS.alertRed : COLORS.textTimestamp,
                    fontSize: '9px',
                  }}
                >
                  {reasonCode || '—'}
                </div>

                {/* Hash */}
                <div
                  style={{
                    width: '18%',
                    color: isRippled ? COLORS.textMuted : COLORS.textHash,
                    fontFamily: 'monospace',
                    fontSize: '9px',
                    transition: 'color 0.3s',
                  }}
                >
                  0x{hash?.slice(0, 4)}...
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-1.5 border-t flex justify-between"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '9px',
          color: COLORS.textTimestamp,
        }}
      >
        <span>BLOCKS: {displayEntries.length}</span>
        <span>
          CHAIN: {phase === 'AFFIDAVIT' || phase === 'MISSION_COMPLETE' ? 'VERIFIED' : 'ACTIVE'}
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
  stopRule?: boolean,
  reasonCode?: string
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
    reasonCode,
    blockId: id,
  };
}

// Helper to create governance log entry
export function createGovernanceLogEntry(
  blockId: number,
  timestamp: string,
  eventType: string,
  detail: string,
  reasonCode: string | null = null,
  severity: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS' = 'INFO'
): GovernanceLogEntry {
  return {
    blockId,
    timestamp,
    eventType: eventType as any,
    detail,
    reasonCode: reasonCode as any,
    hash: generateDualHash(`gov-${blockId}-${Date.now()}`).sha256,
    severity,
  };
}
