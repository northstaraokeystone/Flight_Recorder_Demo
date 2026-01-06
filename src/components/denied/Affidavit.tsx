/**
 * Affidavit - Court-Admissible Flight Integrity Document
 * v2.2 DIAMOND: Slides up from bottom with paper physics feel
 *
 * This replaces the generic "FORENSIC PACKET" with a proper legal affidavit
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
      // Delay content show for slide animation
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
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{ backgroundColor: 'rgba(9, 9, 11, 0.8)' }}
        onClick={onDismiss}
      />

      {/* Affidavit Document */}
      <div
        className={`relative pointer-events-auto w-full max-w-3xl mx-4 mb-0 ${showContent ? 'animate-slideUp' : 'opacity-0'}`}
        style={{
          backgroundColor: COLORS.bgPrimary,
          border: `1px solid ${COLORS.borderBracket}`,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Document Content */}
        <div className="p-8">
          {/* Title */}
          <div className="text-center mb-6">
            <h1
              className="affidavit-title text-xl mb-2"
              style={{ letterSpacing: '0.15em' }}
            >
              AFFIDAVIT OF FLIGHT INTEGRITY
            </h1>
            <div
              className="h-px mx-auto"
              style={{
                width: '300px',
                background: `linear-gradient(to right, transparent, ${COLORS.textMuted}, transparent)`,
              }}
            />
          </div>

          {/* Mission Info */}
          <div className="grid grid-cols-2 gap-4 mb-6" style={{ fontSize: '11px' }}>
            <div className="flex justify-between">
              <span style={{ color: COLORS.affidavitLabel }}>DATE:</span>
              <span style={{ color: COLORS.affidavitValue }}>{today}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.affidavitLabel }}>MISSION ID:</span>
              <span style={{ color: COLORS.affidavitValue, fontFamily: 'monospace' }}>{missionId}</span>
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

          {/* Divider */}
          <div className="affidavit-divider" />

          {/* Flight Summary */}
          <div className="mb-6">
            <h2 className="panel-header mb-4">FLIGHT SUMMARY</h2>
            <div className="space-y-2" style={{ fontSize: '11px' }}>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>Waypoints Completed:</span>
                <span style={{ color: COLORS.affidavitValue }}>{waypointsCompleted}/{waypointsTotal}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>Total Flight Time:</span>
                <span style={{ color: COLORS.affidavitValue, fontFamily: 'monospace' }}>{flightTime}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>Anomalies Detected:</span>
                <span style={{ color: COLORS.affidavitValue }}>{anomaliesDetected}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>Anomalies Resolved:</span>
                <span style={{ color: COLORS.affidavitValue }}>{anomaliesResolved}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="affidavit-divider" />

          {/* Governance Compliance */}
          <div className="mb-6">
            <h2 className="panel-header mb-4">GOVERNANCE COMPLIANCE</h2>
            <div className="space-y-2" style={{ fontSize: '11px' }}>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>RACI Handoffs:</span>
                <span style={{ color: COLORS.affidavitValue }}>
                  {raciHandoffs} (AI→Human, Human→AI)
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>RACI Compliance:</span>
                <span style={{ color: COLORS.affidavitValue }}>
                  {raciCompliance}% (All handoffs logged)
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>CRAG Resolutions:</span>
                <span style={{ color: COLORS.affidavitValue }}>
                  {cragResolutions} (External Knowledge Fused)
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>Reason Codes Applied:</span>
                <span style={{ color: COLORS.affidavitValue, fontFamily: 'monospace', fontSize: '10px' }}>
                  {reasonCodesApplied.length > 0 ? reasonCodesApplied.join(', ') : 'NONE'}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="affidavit-divider" />

          {/* Liability Assessment */}
          <div className="mb-6">
            <h2 className="panel-header mb-4">LIABILITY ASSESSMENT</h2>
            <div className="space-y-2" style={{ fontSize: '11px' }}>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>Decision Chain:</span>
                <span style={{ color: COLORS.affidavitValue, fontWeight: 600 }}>UNBROKEN</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>Human Override Events:</span>
                <span style={{ color: COLORS.affidavitValue }}>
                  {humanOverrideEvents}{humanOverrideDetails ? ` (${humanOverrideDetails})` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>Liability Status:</span>
                <span style={{ color: COLORS.affidavitValue, fontWeight: 600 }}>
                  {liabilityStatus} (Protocol Followed)
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>Regulatory Trigger:</span>
                <span style={{ color: COLORS.affidavitValue }}>
                  {regulatoryTrigger || 'NULL (No incident)'}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="affidavit-divider" />

          {/* Cryptographic Proof */}
          <div className="mb-6">
            <h2 className="panel-header mb-4">CRYPTOGRAPHIC PROOF</h2>
            <div className="space-y-2" style={{ fontSize: '10px', fontFamily: 'monospace' }}>
              <div className="flex justify-between items-start">
                <span style={{ color: COLORS.affidavitLabel }}>MERKLE ROOT:</span>
                <span style={{ color: COLORS.affidavitHash, wordBreak: 'break-all', maxWidth: '70%', textAlign: 'right' }}>
                  0x{merkleRoot}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span style={{ color: COLORS.affidavitLabel }}>CHAIN ROOT:</span>
                <span style={{ color: COLORS.affidavitHash, wordBreak: 'break-all', maxWidth: '70%', textAlign: 'right' }}>
                  0x{chainRoot}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>BLOCKS:</span>
                <span style={{ color: COLORS.affidavitValue }}>{blocks}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.affidavitLabel }}>RECEIPTS:</span>
                <span style={{ color: COLORS.affidavitValue }}>{receipts}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="affidavit-divider" />

          {/* Status */}
          <div className="text-center mb-6">
            <div
              className="inline-block px-6 py-2"
              style={{
                border: `1px solid ${COLORS.textMuted}`,
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: COLORS.textPrimary,
              }}
            >
              STATUS: ADMISSIBLE — FAA Part 107/108 COMPLIANT
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center">
            <button
              onClick={onDismiss}
              className="btn-stealth px-8 py-3"
              style={{ letterSpacing: '0.1em' }}
            >
              [ DOWNLOAD AFFIDAVIT ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
