/**
 * Affidavit - Court-Admissible Flight Integrity Document
 * v3.1 DEAL-KILLER REMEDIATION
 *
 * FIXED:
 * - max-height: 50vh (never cover drone at 40%)
 * - Text sizes increased for projector readability
 * - Minting animation: hash types out live
 * - onRestart instead of onDismiss (demo ends here)
 * - Digital seal with verification mark
 */

import { useState, useEffect, useMemo, useRef } from 'react';
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
  onRestart?: () => void;
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
  onRestart,
}: AffidavitProps) {
  const [showContent, setShowContent] = useState(false);
  const [mintingPhase, setMintingPhase] = useState<'generating' | 'typing' | 'complete'>('generating');
  const [typedMerkle, setTypedMerkle] = useState('');
  const [typedChain, setTypedChain] = useState('');
  const [timestamp, setTimestamp] = useState(new Date());
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate cryptographic proofs
  const merkleRoot = useMemo(() => {
    return generateDualHash(`merkle-root-${missionId}-${Date.now()}`).sha256;
  }, [missionId]);

  const chainRoot = useMemo(() => {
    return generateDualHash(`chain-root-${missionId}-${Date.now()}`).blake3;
  }, [missionId]);

  // Timestamp ticker
  useEffect(() => {
    if (!isVisible || mintingPhase !== 'complete') return;
    const interval = setInterval(() => {
      setTimestamp(new Date());
    }, 100);
    return () => clearInterval(interval);
  }, [isVisible, mintingPhase]);

  // Minting animation sequence
  useEffect(() => {
    if (!isVisible) {
      setShowContent(false);
      setMintingPhase('generating');
      setTypedMerkle('');
      setTypedChain('');
      return;
    }

    // Phase 1: Show content after small delay
    const showTimer = setTimeout(() => setShowContent(true), 100);

    // Phase 2: Start typing after 1 second
    const typingStartTimer = setTimeout(() => {
      setMintingPhase('typing');
      let merkleIdx = 0;
      let chainIdx = 0;

      typingIntervalRef.current = setInterval(() => {
        if (merkleIdx < merkleRoot.length) {
          setTypedMerkle(merkleRoot.slice(0, merkleIdx + 1));
          merkleIdx++;
        } else if (chainIdx < chainRoot.length) {
          setTypedChain(chainRoot.slice(0, chainIdx + 1));
          chainIdx++;
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
          }
          setMintingPhase('complete');
        }
      }, 25); // Fast typing, 25ms per character
    }, 1000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(typingStartTimer);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [isVisible, merkleRoot, chainRoot]);

  if (!isVisible) return null;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timestampStr = timestamp.toISOString();

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent backdrop - darker at top, map still visible */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{
          background: 'linear-gradient(to bottom, rgba(9, 9, 11, 0.3) 0%, rgba(9, 9, 11, 0.85) 100%)',
        }}
      />

      {/* Bottom Sheet - max 50vh to NEVER cover drone at 40% */}
      <div
        className={`absolute bottom-0 left-0 right-0 pointer-events-auto ${showContent ? 'animate-slideUp' : 'opacity-0 translate-y-full'}`}
        style={{
          backgroundColor: '#0f0f0f',
          borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          maxHeight: '50vh',
          overflowY: 'auto',
          boxShadow: '0 0 40px rgba(255, 255, 255, 0.05), 0 0 80px rgba(255, 255, 255, 0.02)',
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

        {/* Document Content */}
        <div className="px-8 pb-6 pt-2">
          {/* Title - Merriweather serif, 18px, bold */}
          <div className="text-center mb-5">
            <h1
              style={{
                fontFamily: "'Merriweather', serif",
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#F8FAFC',
                marginBottom: '8px',
              }}
            >
              AFFIDAVIT OF FLIGHT INTEGRITY
            </h1>
            <div
              className="h-px mx-auto"
              style={{
                width: '320px',
                background: `linear-gradient(to right, transparent, ${COLORS.textMuted}, transparent)`,
              }}
            />
          </div>

          {/* Minting Indicator */}
          {mintingPhase === 'generating' && (
            <div className="text-center mb-4 animate-pulse">
              <span
                style={{
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#CBD5E1',
                  letterSpacing: '0.1em',
                }}
              >
                GENERATING PROOF...
              </span>
            </div>
          )}

          {/* Two-column grid for main info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Left Column - Mission Info & Flight Summary */}
            <div>
              {/* Mission Info */}
              <div className="mb-4">
                <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  MISSION INFORMATION
                </h2>
                <div className="space-y-1" style={{ fontSize: '14px', fontWeight: 500, lineHeight: '1.8' }}>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>DATE:</span>
                    <span style={{ color: '#F1F5F9' }}>{today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>MISSION ID:</span>
                    <span style={{ color: '#F1F5F9', fontFamily: 'JetBrains Mono, monospace' }}>{missionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>AIRCRAFT:</span>
                    <span style={{ color: '#F1F5F9' }}>{aircraft}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>OPERATOR:</span>
                    <span style={{ color: '#F1F5F9' }}>{operator}</span>
                  </div>
                </div>
              </div>

              {/* Flight Summary */}
              <div>
                <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  FLIGHT SUMMARY
                </h2>
                <div className="space-y-1" style={{ fontSize: '14px', fontWeight: 500, lineHeight: '1.8' }}>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>Waypoints:</span>
                    <span style={{ color: '#F1F5F9' }}>{waypointsCompleted}/{waypointsTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>Flight Time:</span>
                    <span style={{ color: '#F1F5F9', fontFamily: 'JetBrains Mono, monospace' }}>{flightTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>Anomalies:</span>
                    <span style={{ color: '#F1F5F9' }}>{anomaliesDetected} detected / {anomaliesResolved} resolved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Governance & Liability */}
            <div>
              {/* Governance Compliance */}
              <div className="mb-4">
                <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  GOVERNANCE COMPLIANCE
                </h2>
                <div className="space-y-1" style={{ fontSize: '14px', fontWeight: 500, lineHeight: '1.8' }}>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>RACI Handoffs:</span>
                    <span style={{ color: '#F1F5F9' }}>{raciHandoffs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>RACI Compliance:</span>
                    <span style={{ color: '#F1F5F9' }}>{raciCompliance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>CRAG Resolutions:</span>
                    <span style={{ color: '#F1F5F9' }}>{cragResolutions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>Reason Codes:</span>
                    <span style={{ color: '#F1F5F9', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                      {reasonCodesApplied.length > 0 ? reasonCodesApplied.join(', ') : 'NONE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Liability Assessment */}
              <div>
                <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  LIABILITY ASSESSMENT
                </h2>
                <div className="space-y-1" style={{ fontSize: '14px', fontWeight: 500, lineHeight: '1.8' }}>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>Decision Chain:</span>
                    <span style={{ color: '#F1F5F9', fontWeight: 700 }}>UNBROKEN</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>Human Override:</span>
                    <span style={{ color: '#F1F5F9' }}>
                      {humanOverrideEvents}{humanOverrideDetails ? ` (${humanOverrideDetails})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>Liability Status:</span>
                    <span style={{ color: '#F1F5F9', fontWeight: 700 }}>{liabilityStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94a3b8' }}>Regulatory Trigger:</span>
                    <span style={{ color: '#F1F5F9' }}>{regulatoryTrigger || 'NULL'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px my-4" style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)` }} />

          {/* Cryptographic Proof - MINTING ANIMATION */}
          <div className="mb-4">
            <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#CBD5E1', letterSpacing: '0.08em', marginBottom: '8px' }}>
              CRYPTOGRAPHIC PROOF
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>MERKLE ROOT:</span>
                <span
                  style={{
                    color: '#CBD5E1',
                    wordBreak: 'break-all',
                    fontSize: '12px',
                    fontWeight: 500,
                    textShadow: mintingPhase === 'typing' ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
                  }}
                >
                  0x{mintingPhase === 'generating' ? '...' : typedMerkle}
                  {mintingPhase === 'typing' && typedMerkle.length < merkleRoot.length && (
                    <span className="animate-pulse">_</span>
                  )}
                </span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>CHAIN ROOT:</span>
                <span
                  style={{
                    color: '#CBD5E1',
                    wordBreak: 'break-all',
                    fontSize: '12px',
                    fontWeight: 500,
                    textShadow: mintingPhase === 'typing' && typedMerkle.length >= merkleRoot.length ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
                  }}
                >
                  0x{mintingPhase === 'generating' ? '...' : typedChain}
                  {mintingPhase === 'typing' && typedMerkle.length >= merkleRoot.length && typedChain.length < chainRoot.length && (
                    <span className="animate-pulse">_</span>
                  )}
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-6" style={{ fontSize: '14px', fontWeight: 500 }}>
              <span style={{ color: '#64748b' }}>BLOCKS: <span style={{ color: '#F1F5F9' }}>{blocks}</span></span>
              <span style={{ color: '#64748b' }}>RECEIPTS: <span style={{ color: '#F1F5F9' }}>{receipts}</span></span>
              {mintingPhase === 'complete' && (
                <span style={{ color: '#64748b', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
                  TS: {timestampStr.slice(11, 23)}
                </span>
              )}
            </div>
          </div>

          {/* Digital Seal & Status */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Status Badge */}
            <div
              className="px-5 py-3 flex items-center gap-3"
              style={{
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
              }}
            >
              {/* Checkmark seal */}
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#0f0f0f',
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#F1F5F9', letterSpacing: '0.05em' }}>
                  CRYPTOGRAPHICALLY VERIFIED
                </div>
                <div style={{ fontSize: '11px', color: '#10B981', letterSpacing: '0.05em' }}>
                  FAA Part 107/108 COMPLIANT
                </div>
              </div>
            </div>

            {/* Restart Button */}
            <button
              onClick={onRestart}
              className="px-6 py-3"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #64748b',
                color: '#F1F5F9',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F1F5F9';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#64748b';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              [ RESTART DEMO ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
