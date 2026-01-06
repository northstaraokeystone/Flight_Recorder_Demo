/**
 * CryptographicLedger - Card-based Event Log
 * v2.3 BULLETPROOF: Cards/blocks instead of scrolling Matrix text
 *
 * Visual Hierarchy:
 * - Standard events: Dark card, minimal
 * - Warning/CRAG: Amber-600 left border
 * - Critical/Intervention: Red-500 left border
 * - RACI Handoff: Blue-500 left border
 *
 * Features:
 * - Maximum 7 visible cards
 * - New events at top
 * - Hover for full receipt modal
 * - Older events fade (opacity 0.7)
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

type CardSeverity = 'standard' | 'warning' | 'critical' | 'handoff' | 'success';

function getCardSeverity(eventType: string, reasonCode: string | null): CardSeverity {
  if (eventType.includes('UNCERTAINTY') || eventType.includes('CRAG')) return 'critical';
  if (eventType.includes('RACI_HANDOFF')) return 'handoff';
  if (eventType.includes('RESPONSE') || eventType.includes('COMPLETE') || eventType.includes('RESUMED') || eventType.includes('ACHIEVED')) return 'success';
  if (reasonCode) return 'warning';
  return 'standard';
}

function getCardBorderColor(severity: CardSeverity): string {
  switch (severity) {
    case 'critical': return '#ef4444'; // Red-500
    case 'warning': return '#d97706';  // Amber-600
    case 'handoff': return '#3b82f6';  // Blue-500
    case 'success': return '#64748b';  // Slate-500
    default: return 'transparent';
  }
}

function getCardTextColor(severity: CardSeverity): string {
  switch (severity) {
    case 'critical': return COLORS.textPrimary;
    case 'warning': return COLORS.textSecondary;
    case 'handoff': return COLORS.textSecondary;
    default: return COLORS.textMuted;
  }
}

interface ReceiptModalProps {
  entry: GovernanceLogEntry | LedgerEntry;
  isGov: boolean;
  onClose: () => void;
}

function ReceiptModal({ entry, isGov, onClose }: ReceiptModalProps) {
  const blockId = isGov ? (entry as GovernanceLogEntry).blockId : (entry as LedgerEntry).blockId || (entry as LedgerEntry).id;
  const timestamp = isGov ? (entry as GovernanceLogEntry).timestamp : (entry as LedgerEntry).timestamp;
  const eventType = isGov ? (entry as GovernanceLogEntry).eventType : (entry as LedgerEntry).eventType;
  const detail = isGov ? (entry as GovernanceLogEntry).detail : (entry as LedgerEntry).result;
  const reasonCode = isGov ? (entry as GovernanceLogEntry).reasonCode : (entry as LedgerEntry).reasonCode;
  const hash = isGov ? (entry as GovernanceLogEntry).hash : (entry as LedgerEntry).hash;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      <div
        className="p-6 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: COLORS.bgCard,
          border: `1px solid ${COLORS.borderBracket}`,
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 style={{ color: COLORS.textPrimary, fontSize: '14px', fontWeight: 500 }}>
            RECEIPT DETAILS
          </h3>
          <button
            onClick={onClose}
            style={{ color: COLORS.textMuted, fontSize: '16px' }}
          >
            ×
          </button>
        </div>

        <div className="space-y-3" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textTimestamp }}>BLOCK</span>
            <span style={{ color: COLORS.textSecondary }}>[{String(blockId).padStart(2, '0')}]</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textTimestamp }}>TIMESTAMP</span>
            <span style={{ color: COLORS.textSecondary }}>{timestamp}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textTimestamp }}>EVENT</span>
            <span style={{ color: COLORS.textPrimary }}>{eventType}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textTimestamp }}>DETAIL</span>
            <span style={{ color: COLORS.textSecondary }}>{detail}</span>
          </div>
          {reasonCode && (
            <div className="flex justify-between">
              <span style={{ color: COLORS.textTimestamp }}>REASON_CODE</span>
              <span style={{ color: COLORS.alertRed }}>{reasonCode}</span>
            </div>
          )}

          <div className="h-px my-3" style={{ backgroundColor: COLORS.borderBracket }} />

          <div>
            <span style={{ color: COLORS.textTimestamp, display: 'block', marginBottom: '4px' }}>SHA256</span>
            <span style={{ color: COLORS.textHash, fontSize: '10px', wordBreak: 'break-all' }}>
              {hash}
            </span>
          </div>

          <div>
            <span style={{ color: COLORS.textTimestamp, display: 'block', marginBottom: '4px' }}>MERKLE_ROOT</span>
            <span style={{ color: COLORS.textHash, fontSize: '10px', wordBreak: 'break-all' }}>
              0x{generateDualHash(`merkle-${blockId}`).sha256.slice(0, 32)}...
            </span>
          </div>

          <div>
            <span style={{ color: COLORS.textTimestamp, display: 'block', marginBottom: '4px' }}>PROOF_CHAIN</span>
            <span style={{ color: COLORS.textMuted, fontSize: '10px' }}>
              DEPTH: 4 | VERIFIED: ✓ | TAMPER: NONE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CryptographicLedger({
  entries,
  phase,
  syncProgress: _syncProgress,
  isOffline,
  governanceLog = [],
}: CryptographicLedgerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEntry, setSelectedEntry] = useState<GovernanceLogEntry | LedgerEntry | null>(null);

  // Auto-scroll to top when new entries added (reversed order)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [entries, governanceLog]);

  const getModeText = () => {
    if (phase === 'AFFIDAVIT' || phase === 'TRUST_GAP' || phase === 'MISSION_COMPLETE') return 'VERIFIED';
    if (isOffline) return 'BUFFERING';
    return 'LIVE';
  };

  // Use governanceLog if available, otherwise fall back to entries
  const displayEntries = governanceLog.length > 0 ? governanceLog : entries;

  // Reverse to show newest first, limit to 7 visible
  const reversedEntries = [...displayEntries].reverse();
  const maxVisible = 7;

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

      {/* Cards container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-2"
      >
        {displayEntries.length === 0 ? (
          <div
            className="text-center py-8"
            style={{ color: COLORS.textTimestamp, fontSize: '10px' }}
          >
            AWAITING EVENTS...
          </div>
        ) : (
          reversedEntries.slice(0, maxVisible).map((entry, displayIndex) => {
            const isGovEntry = 'blockId' in entry && 'detail' in entry;
            const blockId = isGovEntry ? (entry as GovernanceLogEntry).blockId : (entry as LedgerEntry).blockId || (entry as LedgerEntry).id;
            const timestamp = isGovEntry ? (entry as GovernanceLogEntry).timestamp : (entry as LedgerEntry).timestamp;
            const eventType = isGovEntry ? (entry as GovernanceLogEntry).eventType : (entry as LedgerEntry).eventType;
            const detail = isGovEntry ? (entry as GovernanceLogEntry).detail : (entry as LedgerEntry).result;
            const reasonCode = isGovEntry ? (entry as GovernanceLogEntry).reasonCode : (entry as LedgerEntry).reasonCode || null;
            const hash = isGovEntry ? (entry as GovernanceLogEntry).hash : (entry as LedgerEntry).hash;

            const severity = getCardSeverity(eventType, reasonCode);
            const borderColor = getCardBorderColor(severity);
            const textColor = getCardTextColor(severity);
            const isNewest = displayIndex === 0;
            const isFaded = displayIndex > 4; // Fade older entries

            return (
              <div
                key={blockId}
                className="p-3 cursor-pointer transition-opacity hover:opacity-100"
                onClick={() => setSelectedEntry(entry)}
                style={{
                  backgroundColor: COLORS.bgCard,
                  borderLeft: severity !== 'standard' ? `3px solid ${borderColor}` : 'none',
                  paddingLeft: severity !== 'standard' ? '12px' : '12px',
                  opacity: isFaded ? 0.7 : 1,
                  animation: isNewest ? 'fadeIn 0.2s ease-out' : 'none',
                }}
              >
                {/* Event type header */}
                <div className="flex justify-between items-center mb-2">
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 500,
                      color: textColor,
                      letterSpacing: '0.02em',
                    }}
                  >
                    ● {eventType}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      color: COLORS.textTimestamp,
                    }}
                  >
                    [BLOCK {String(blockId).padStart(2, '0')}]
                  </span>
                </div>

                {/* Content row */}
                <div className="flex justify-between items-start">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '9px', color: COLORS.textTimestamp, marginBottom: '2px' }}>
                      TIME: {timestamp}
                    </div>
                    {detail && (
                      <div style={{ fontSize: '10px', color: COLORS.textMuted }}>
                        {detail.length > 35 ? `${detail.slice(0, 35)}...` : detail}
                      </div>
                    )}
                    {reasonCode && (
                      <div style={{ fontSize: '9px', color: COLORS.alertRed, marginTop: '4px' }}>
                        REASON: {reasonCode}
                      </div>
                    )}
                  </div>

                  {/* Hash */}
                  <div
                    style={{
                      fontSize: '8px',
                      color: COLORS.textHash,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    0x{hash?.slice(0, 6)}...
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* "More entries" indicator */}
        {reversedEntries.length > maxVisible && (
          <div
            className="text-center py-2"
            style={{
              fontSize: '9px',
              color: COLORS.textTimestamp,
              fontStyle: 'italic',
            }}
          >
            +{reversedEntries.length - maxVisible} more entries...
          </div>
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

      {/* Receipt Modal */}
      {selectedEntry && (
        <ReceiptModal
          entry={selectedEntry}
          isGov={'blockId' in selectedEntry && 'detail' in selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
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
