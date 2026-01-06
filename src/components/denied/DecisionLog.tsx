/**
 * DecisionLog - Real-time feed of governance decisions
 * Shows the decision chain as it happens
 */

import { useEffect, useRef } from 'react';
import type { DecisionLogEntry } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface DecisionLogProps {
  entries: DecisionLogEntry[];
}

function getSeverityColor(severity: DecisionLogEntry['severity']): string {
  switch (severity) {
    case 'INFO':
      return COLORS.textSecondary;
    case 'WARN':
      return COLORS.alertAmber;
    case 'CRITICAL':
      return COLORS.alertRedBright;
    case 'SUCCESS':
      return COLORS.alertGreen;
  }
}

function isHighlightedEvent(eventType: DecisionLogEntry['eventType']): boolean {
  return eventType === 'STOP_RULE' || eventType === 'BURST_SYNC' || eventType === 'CHAIN_INTEGRITY';
}

export function DecisionLog({ entries }: DecisionLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div
      className="relative flex flex-col h-full"
      style={{
        backgroundColor: 'rgba(13, 20, 36, 0.8)',
        border: `1px solid ${COLORS.borderBracket}`,
      }}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 z-10" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 z-10" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 z-10" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 z-10" style={{ borderColor: COLORS.borderBracket }} />

      {/* Header */}
      <div
        className="px-4 py-2 text-[10px] font-mono tracking-widest border-b"
        style={{
          color: COLORS.textMuted,
          borderColor: COLORS.borderBracket,
        }}
      >
        DECISION LOG
      </div>

      {/* Log entries */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs"
        style={{ maxHeight: '180px' }}
      >
        {entries.length === 0 ? (
          <div
            className="text-center py-4 animate-pulse"
            style={{ color: COLORS.textMuted }}
          >
            Waiting for events...
          </div>
        ) : (
          entries.map((entry, index) => {
            const isHighlighted = isHighlightedEvent(entry.eventType);
            return (
              <div
                key={index}
                className={`
                  flex items-baseline gap-2 leading-tight
                  ${isHighlighted ? 'font-bold' : ''}
                  animate-[fadeIn_0.2s_ease-in]
                `}
                style={{
                  backgroundColor: isHighlighted ? 'rgba(0, 212, 255, 0.05)' : 'transparent',
                  padding: isHighlighted ? '2px 4px' : '0',
                  marginLeft: isHighlighted ? '-4px' : '0',
                  marginRight: isHighlighted ? '-4px' : '0',
                }}
              >
                {/* Timestamp */}
                <span style={{ color: COLORS.textTimestamp }}>
                  [{entry.timestamp}]
                </span>

                {/* Event type */}
                <span style={{ color: getSeverityColor(entry.severity) }}>
                  {entry.eventType}
                </span>

                {/* Arrow */}
                <span style={{ color: COLORS.textMuted }}>
                  {'\u2192'}
                </span>

                {/* Value */}
                <span
                  style={{
                    color: isHighlighted ? COLORS.statusOnline : COLORS.textPrimary,
                  }}
                >
                  {entry.value}
                </span>

                {/* Offline indicator */}
                {entry.offline && (
                  <span
                    className="text-[8px] px-1 rounded"
                    style={{
                      backgroundColor: 'rgba(204, 51, 51, 0.2)',
                      color: COLORS.alertRed,
                    }}
                  >
                    OFFLINE
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
