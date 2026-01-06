/**
 * TerminalModal - Legal packet generation terminal
 * No victory screen. This is a receipt being printed.
 */

import { useState, useEffect } from 'react';
import { COLORS } from '../../constants/colors';

interface TerminalModalProps {
  isVisible: boolean;
  receiptsAnchored: number;
  onExport?: () => void;
}

const TERMINAL_LINES = [
  { text: '> UPLOADING_LOGS', status: '[100%]', delay: 0 },
  { text: '> VERIFYING_HASHES', status: '[OK]', delay: 300 },
  { text: '> CHAIN_INTEGRITY_CHECK', status: '[PASSED]', delay: 600 },
  { text: '> COMPUTING_MERKLE_ROOT', status: '[OK]', delay: 900 },
  { text: '> GENERATING_AFFIDAVIT', status: '[DONE]', delay: 1200 },
];

export function TerminalModal({ isVisible, receiptsAnchored, onExport }: TerminalModalProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setVisibleLines(0);
      setShowStats(false);
      setShowButton(false);
      return;
    }

    // Typewriter effect for each line
    const timers: number[] = [];

    TERMINAL_LINES.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setVisibleLines(index + 1);
      }, TERMINAL_LINES[index].delay + 150);
      timers.push(timer);
    });

    // Show stats after lines
    const statsTimer = window.setTimeout(() => {
      setShowStats(true);
    }, 1800);
    timers.push(statsTimer);

    // Show button after stats
    const buttonTimer = window.setTimeout(() => {
      setShowButton(true);
    }, 2200);
    timers.push(buttonTimer);

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      />

      {/* Terminal window */}
      <div
        className="relative font-mono"
        style={{
          backgroundColor: COLORS.bgCard,
          border: `1px solid ${COLORS.borderBracket}`,
          width: '420px',
          maxWidth: '90vw',
        }}
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l border-t" style={{ borderColor: COLORS.alertGreen }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-r border-t" style={{ borderColor: COLORS.alertGreen }} />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b" style={{ borderColor: COLORS.alertGreen }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b" style={{ borderColor: COLORS.alertGreen }} />

        {/* Header */}
        <div
          className="px-4 py-2 border-b"
          style={{
            borderColor: COLORS.borderBracket,
            fontSize: '10px',
            letterSpacing: '0.1em',
            color: COLORS.alertGreen,
          }}
        >
          SYSTEM: GENERATING COMPLIANCE PACKET
        </div>

        {/* Terminal content */}
        <div className="p-4 space-y-1" style={{ fontSize: '10px' }}>
          {TERMINAL_LINES.map((line, index) => (
            <div
              key={index}
              className="flex justify-between"
              style={{
                opacity: index < visibleLines ? 1 : 0,
                transition: 'opacity 0.15s ease-in',
              }}
            >
              <span style={{ color: COLORS.textSecondary }}>{line.text}</span>
              <span
                style={{
                  color: line.status === '[PASSED]' || line.status === '[OK]' || line.status === '[DONE]' || line.status === '[100%]'
                    ? COLORS.alertGreen
                    : COLORS.textMuted,
                }}
              >
                {line.status}
              </span>
            </div>
          ))}

          {/* Spacer */}
          <div className="h-3" />

          {/* Stats */}
          <div
            className="space-y-1 pt-2 border-t"
            style={{
              borderColor: COLORS.borderBracket,
              opacity: showStats ? 1 : 0,
              transition: 'opacity 0.3s ease-in',
            }}
          >
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>RECEIPTS ANCHORED:</span>
              <span style={{ color: COLORS.alertGreen }}>{receiptsAnchored}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>GAPS DETECTED:</span>
              <span style={{ color: COLORS.alertGreen }}>0</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>COMPLIANCE:</span>
              <span style={{ color: COLORS.textSecondary }}>FAA-108 | DOD-3000.09 | EU-AI</span>
            </div>
          </div>

          {/* Export button */}
          <div
            className="pt-4 text-center"
            style={{
              opacity: showButton ? 1 : 0,
              transition: 'opacity 0.3s ease-in',
            }}
          >
            <button
              onClick={onExport}
              className="px-6 py-2 font-mono transition-all hover:scale-105"
              style={{
                backgroundColor: 'rgba(0, 170, 102, 0.2)',
                border: `1px solid ${COLORS.alertGreen}`,
                color: COLORS.alertGreen,
                fontSize: '10px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              [ EXPORT LEGAL PACKET ]
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 border-t text-center"
          style={{
            borderColor: COLORS.borderBracket,
            fontSize: '8px',
            color: COLORS.textTimestamp,
          }}
        >
          MERKLE_ROOT: {generateFakeHash().slice(0, 32)}...
        </div>
      </div>
    </div>
  );
}

function generateFakeHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
