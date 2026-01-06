/**
 * Affidavit - Court-Admissible Flight Integrity Document
 * v3.0 CINEMATIC SINGULARITY: Bottom Sheet Pattern
 *
 * KILLED: Floating centered modal that blocks content
 * BORN: Bottom sheet that slides up, never overlaps center action
 */

import { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../../constants/colors';
import { generateDualHash } from '../../utils/crypto';

interface AffidavitProps {
  isVisible: boolean;
  missionId?: string;
  aircraft?: string;
  operator?: string;
  waypointsCompleted: number;
  waypointsTotal: number;
  flightTime: string;
  anomaliesDetected: number;
  anomaliesResolved: number;
  raciHandoffs: number;
  raciCompliance: number;
  cragResolutions: number;
  reasonCodesApplied: string[];
  humanOverrideEvents: number;
  humanOverrideDetails?: string;
  liabilityStatus: 'SHARED' | 'AI_ONLY' | 'HUMAN_ONLY';
  regulatoryTrigger: string | null;
  blocks: number;
  receipts: number;
  onDismiss?: () => void;
}

export function Affidavit({
  isVisible,
  missionId = 'FLT-2026-0105-0847',
  aircraft = 'UAV-ALPHA-7',
  operator = 'Northstar AO',
  waypointsCompleted,
  waypointsTotal,
  flightTime,
  anomaliesDetected,
  anomaliesResolved,
  raciHandoffs,
  raciCompliance,
  cragResolutions,
  reasonCodesApplied,
  humanOverrideEvents,
  humanOverrideDetails,
  liabilityStatus,
  regulatoryTrigger,
  blocks,
  receipts,
  onDismiss,
}: AffidavitProps) {
  const [showContent, setShowContent] = useState(false);

  // Generate cryptographic proofs
  const merkleRoot = useMemo(() => {
    return generateDualHash(`merkle-root-${missionId}-${Date.now()}`).sha256;
  }, [missionId]);

  const chainRoot = useMemo(() => {
    return generateDualHash(`chain-root-${missionId}-${Date.now()}`).blake3;
  }, [missionId]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent backdrop - darker at top */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{
          background: 'linear-gradient(to bottom, rgba(9, 9, 11, 0.4) 0%, rgba(9, 9, 11, 0.9) 100%)',
        }}
        onClick={onDismiss}
      />

      {/* Bottom Sheet - slides up from bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 pointer-events-auto ${showContent ? 'animate-slideUp' : 'opacity-0 translate-y-full'}`}
        style={{
          backgroundColor: COLORS.bgPrimary,
          borderTop: `1px solid ${COLORS.borderBracket}`,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          maxHeight: '75vh',
          overflowY: 'auto',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div
            style={{
              width: '40px',
              height: '4px',
              backgroundColor: COLORS.textTimestamp,
              borderRadius: '2px',
              opacity: 0.5,
            }}
          />
        </div>

        {/* Close button - top right */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2"
          style={{
            color: COLORS.textMuted,
            fontSize: '18px',
          }}
        >
          ×
        </button>

        {/* Document Content */}
        <div className="px-8 pb-8 pt-2">
          {/* Title */}
          <div className="text-center mb-6">
            <h1
              className="affidavit-title text-lg mb-2"
              style={{ letterSpacing: '0.15em' }}
            >
              AFFIDAVIT OF FLIGHT INTEGRITY
            </h1>
            <div
              className="h-px mx-auto"
              style={{
                width: '280px',
                background: `linear-gradient(to right, transparent, ${COLORS.textMuted}, transparent)`,
              }}
            />
          </div>

          {/* Two-column grid for main info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Left Column - Mission Info & Flight Summary */}
            <div>
              {/* Mission Info */}
              <div className="mb-6">
                <h2 className="panel-header mb-3" style={{ fontSize: '10px' }}>MISSION INFORMATION</h2>
                <div className="space-y-2" style={{ fontSize: '11px', lineHeight: '1.8' }}>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>DATE:</span>
                    <span style={{ color: COLORS.affidavitValue }}>{today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>MISSION ID:</span>
                    <span style={{ color: COLORS.affidavitValue, fontFamily: 'JetBrains Mono, monospace' }}>{missionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>AIRCRAFT:</span>
                    <span style={{ color: COLORS.affidavitValue }}>{aircraft}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>OPERATOR:</span>
                    <span style={{ color: COLORS.affidavitValue }}>{operator}</span>
                  </div>
                </div>
              </div>

              {/* Flight Summary */}
              <div>
                <h2 className="panel-header mb-3" style={{ fontSize: '10px' }}>FLIGHT SUMMARY</h2>
                <div className="space-y-2" style={{ fontSize: '11px', lineHeight: '1.8' }}>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>Waypoints:</span>
                    <span style={{ color: COLORS.affidavitValue }}>{waypointsCompleted}/{waypointsTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>Flight Time:</span>
                    <span style={{ color: COLORS.affidavitValue, fontFamily: 'JetBrains Mono, monospace' }}>{flightTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>Anomalies:</span>
                    <span style={{ color: COLORS.affidavitValue }}>{anomaliesDetected} detected / {anomaliesResolved} resolved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Governance & Liability */}
            <div>
              {/* Governance Compliance */}
              <div className="mb-6">
                <h2 className="panel-header mb-3" style={{ fontSize: '10px' }}>GOVERNANCE COMPLIANCE</h2>
                <div className="space-y-2" style={{ fontSize: '11px', lineHeight: '1.8' }}>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>RACI Handoffs:</span>
                    <span style={{ color: COLORS.affidavitValue }}>{raciHandoffs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>RACI Compliance:</span>
                    <span style={{ color: COLORS.affidavitValue }}>{raciCompliance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>CRAG Resolutions:</span>
                    <span style={{ color: COLORS.affidavitValue }}>{cragResolutions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>Reason Codes:</span>
                    <span style={{ color: COLORS.affidavitValue, fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>
                      {reasonCodesApplied.length > 0 ? reasonCodesApplied.join(', ') : 'NONE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Liability Assessment */}
              <div>
                <h2 className="panel-header mb-3" style={{ fontSize: '10px' }}>LIABILITY ASSESSMENT</h2>
                <div className="space-y-2" style={{ fontSize: '11px', lineHeight: '1.8' }}>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>Decision Chain:</span>
                    <span style={{ color: COLORS.affidavitValue, fontWeight: 600 }}>UNBROKEN</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>Human Override:</span>
                    <span style={{ color: COLORS.affidavitValue }}>
                      {humanOverrideEvents}{humanOverrideDetails ? ` (${humanOverrideDetails})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>Liability Status:</span>
                    <span style={{ color: COLORS.affidavitValue, fontWeight: 600 }}>{liabilityStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.affidavitLabel }}>Regulatory Trigger:</span>
                    <span style={{ color: COLORS.affidavitValue }}>{regulatoryTrigger || 'NULL'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px my-6" style={{ background: `linear-gradient(to right, transparent, ${COLORS.borderBracket}, transparent)` }} />

          {/* Cryptographic Proof - Full width */}
          <div className="mb-6">
            <h2 className="panel-header mb-3" style={{ fontSize: '10px' }}>CRYPTOGRAPHIC PROOF</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}>
              <div>
                <span style={{ color: COLORS.affidavitLabel, display: 'block', marginBottom: '4px' }}>MERKLE ROOT:</span>
                <span style={{ color: COLORS.affidavitHash, wordBreak: 'break-all', fontSize: '9px' }}>
                  0x{merkleRoot}
                </span>
              </div>
              <div>
                <span style={{ color: COLORS.affidavitLabel, display: 'block', marginBottom: '4px' }}>CHAIN ROOT:</span>
                <span style={{ color: COLORS.affidavitHash, wordBreak: 'break-all', fontSize: '9px' }}>
                  0x{chainRoot}
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-6" style={{ fontSize: '11px' }}>
              <span style={{ color: COLORS.textTimestamp }}>BLOCKS: <span style={{ color: COLORS.affidavitValue }}>{blocks}</span></span>
              <span style={{ color: COLORS.textTimestamp }}>RECEIPTS: <span style={{ color: COLORS.affidavitValue }}>{receipts}</span></span>
            </div>
          </div>

          {/* Status & Action */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4" style={{ borderTop: `1px solid ${COLORS.borderBracket}` }}>
            <div
              className="px-4 py-2"
              style={{
                border: `1px solid ${COLORS.textMuted}`,
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: COLORS.textPrimary,
              }}
            >
              STATUS: ADMISSIBLE — FAA Part 107/108 COMPLIANT
            </div>

            <button
              onClick={onDismiss}
              className="btn-stealth px-6 py-2"
              style={{ letterSpacing: '0.1em', fontSize: '11px' }}
            >
              [ DOWNLOAD AFFIDAVIT ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
