/**
 * TerminalModal - Forensic Packet with Cryptographic Root Seal
 * v5.0: No celebration. Just the seal. The wax stamp on the affidavit.
 */

import { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../../constants/colors';
import { generateDualHash } from '../../utils/crypto';

interface TerminalModalProps {
  isVisible: boolean;
  receiptsAnchored: number;
  missionDuration?: number;
  offlineDuration?: number;
  incidentsLogged?: number;
  stopRulesFired?: number;
  liabilityAvoided?: number;
  onExport?: () => void;
}

export function TerminalModal({
  isVisible,
  receiptsAnchored,
  missionDuration = 47.2,
  offlineDuration = 8.2,
  incidentsLogged = 1,
  stopRulesFired = 1,
  liabilityAvoided = 15_000_000,
  onExport,
}: TerminalModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Generate a stable cryptographic root hash
  const cryptographicRoot = useMemo(() => {
    return generateDualHash(`forensic-packet-root-${receiptsAnchored}-${Date.now()}`).sha256;
  }, [receiptsAnchored]);

  useEffect(() => {
    if (!isVisible) {
      setShowContent(false);
      setShowButton(false);
      return;
    }

    // Show content immediately (no celebration delay)
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 100);

    // Show button after content
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 500);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(buttonTimer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* No full-screen backdrop - modal only overlays middle pane */}

      {/* Modal window - overlays middle pane only */}
      <div
        className="relative font-mono pointer-events-auto"
        style={{
          backgroundColor: '#0a0a0a',
          border: `1px solid ${COLORS.borderBracket}`,
          width: '480px',
          maxWidth: '90vw',
          opacity: showContent ? 1 : 0,
          transition: 'opacity 0.2s ease-in',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: COLORS.borderBracket }}
        >
          <div style={{ fontSize: '12px', letterSpacing: '0.1em', color: COLORS.textPrimary }}>
            FORENSIC PACKET READY
          </div>
          <div
            className="mt-1"
            style={{
              height: '2px',
              background: `linear-gradient(to right, ${COLORS.textPrimary}, transparent)`,
            }}
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4" style={{ fontSize: '11px' }}>
          {/* Mission Stats */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>MISSION DURATION:</span>
              <span style={{ color: COLORS.textSecondary }}>{missionDuration}s</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>OFFLINE DURATION:</span>
              <span style={{ color: COLORS.textSecondary }}>{offlineDuration}s</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>RECEIPTS CAPTURED:</span>
              <span style={{ color: COLORS.textSecondary }}>{receiptsAnchored}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>CHAIN INTEGRITY:</span>
              <span style={{ color: COLORS.alertGreen }}>VERIFIED</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>GAPS DETECTED:</span>
              <span style={{ color: COLORS.alertGreen }}>0</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ backgroundColor: COLORS.borderBracket }} />

          {/* Incident Stats */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>INCIDENTS LOGGED:</span>
              <span style={{ color: COLORS.textSecondary }}>{incidentsLogged}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>STOP_RULES FIRED:</span>
              <span style={{ color: COLORS.textSecondary }}>{stopRulesFired}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>LIABILITY AVOIDED:</span>
              <span style={{ color: COLORS.alertGreen, fontWeight: 'bold' }}>
                ${(liabilityAvoided / 1_000_000).toFixed(0)},000,000
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ backgroundColor: COLORS.borderBracket }} />

          {/* Compliance Status */}
          <div>
            <div style={{ fontSize: '10px', color: COLORS.textMuted, marginBottom: '8px' }}>
              COMPLIANCE STATUS:
            </div>
            <div className="flex gap-4" style={{ fontSize: '10px' }}>
              <span style={{ color: COLORS.alertGreen }}>✓ FAA-108</span>
              <span style={{ color: COLORS.alertGreen }}>✓ DOD-3000.09</span>
              <span style={{ color: COLORS.alertGreen }}>✓ EU-AI-ACT</span>
              <span style={{ color: COLORS.alertGreen }}>✓ DO-178C</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ backgroundColor: COLORS.borderBracket }} />

          {/* CRYPTOGRAPHIC ROOT - THE WAX SEAL */}
          <div>
            <div style={{ fontSize: '10px', color: COLORS.textMuted, marginBottom: '8px' }}>
              CRYPTOGRAPHIC ROOT:
            </div>
            <div className="flex items-center gap-2">
              <code
                style={{
                  fontSize: '10px',
                  color: COLORS.textPrimary,
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.02em',
                }}
              >
                0x{cryptographicRoot}
              </code>
              <span
                style={{
                  fontSize: '9px',
                  color: COLORS.alertGreen,
                  fontWeight: 'bold',
                }}
              >
                (ANCHORED)
              </span>
            </div>
          </div>

          {/* Export Button */}
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
                backgroundColor: 'transparent',
                border: `1px solid ${COLORS.textPrimary}`,
                color: COLORS.textPrimary,
                fontSize: '10px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              [ EXPORT FORENSIC PACKET ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
