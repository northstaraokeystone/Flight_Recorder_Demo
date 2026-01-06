/**
 * DecisionLog - Dense real-time event feed
 * Overwhelming density - make them squint
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
      return COLORS.textMuted;
    case 'WARN':
      return COLORS.alertAmber;
    case 'CRITICAL':
      return COLORS.alertRedBright;
    case 'SUCCESS':
      return COLORS.alertGreen;
  }
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
      className="relative flex flex-col h-full font-mono"
      style={{
        backgroundColor: COLORS.bgCard,
        border: `1px solid ${COLORS.borderBracket}`,
      }}
    >
      {/* Tiny corner brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b" style={{ borderColor: COLORS.borderBracket }} />

      {/* Header */}
      <div
        className="px-2 py-1 border-b"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '8px',
          letterSpacing: '0.1em',
          color: COLORS.textMuted,
        }}
      >
        DECISION LOG
      </div>

      {/* Log entries - very dense */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-2 py-1"
        style={{ fontSize: '8px', lineHeight: '1.5' }}
      >
        {entries.length === 0 ? (
          <div
            className="text-center py-2 animate-pulse"
            style={{ color: COLORS.textMuted }}
          >
            AWAITING EVENTS...
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className="flex items-baseline gap-1 whitespace-nowrap"
              style={{
                animation: 'fadeIn 0.15s ease-in',
              }}
            >
              {/* Timestamp - muted */}
              <span style={{ color: COLORS.textTimestamp, fontSize: '7px' }}>
                {entry.timestamp}
              </span>

              {/* Severity indicator */}
              <span
                className="w-1 h-1 rounded-full inline-block flex-shrink-0"
                style={{
                  backgroundColor: getSeverityColor(entry.severity),
                  marginTop: '3px',
                }}
              />

              {/* Event type */}
              <span style={{ color: getSeverityColor(entry.severity) }}>
                {entry.eventType}
              </span>

              {/* Arrow */}
              <span style={{ color: COLORS.borderBracket }}>{'\u2192'}</span>

              {/* Value */}
              <span style={{ color: COLORS.textSecondary }}>
                {entry.value}
              </span>

              {/* Offline tag */}
              {entry.offline && (
                <span
                  style={{
                    fontSize: '6px',
                    padding: '0 2px',
                    backgroundColor: 'rgba(204, 51, 51, 0.2)',
                    color: COLORS.alertRed,
                  }}
                >
                  LOCAL
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer count */}
      <div
        className="px-2 py-1 border-t text-right"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '7px',
          color: COLORS.textTimestamp,
        }}
      >
        {entries.length} EVENTS
      </div>
    </div>
  );
}
