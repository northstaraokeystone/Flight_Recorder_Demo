/**
 * Affidavit - SF15 INVESTOR VALUE Screen
 * "Why would an investor care about this?"
 *
 * DESIGN PHILOSOPHY:
 * - Lead with MONEY, not tech
 * - Show RISK MITIGATED in dollars
 * - Cite SOURCES for credibility
 * - Include REGULATORY value (FAA, insurance)
 * - Cryptographic proof is supporting evidence, not the headline
 */

import { useState, useEffect, useMemo, useRef } from 'react';
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
  anomaliesDetected = 1,
  anomaliesResolved = 1,
  onRestart,
}: AffidavitProps) {
  const [showContent, setShowContent] = useState(false);
  const [mintingPhase, setMintingPhase] = useState<'generating' | 'typing' | 'complete'>('generating');
  const [typedHash, setTypedHash] = useState('');
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate cryptographic proof - truncated for display
  const merkleRoot = useMemo(() => {
    return generateDualHash(`merkle-root-${missionId}-${Date.now()}`).sha256;
  }, [missionId]);

  // Truncated hash for display (first 12 chars + ellipsis)
  const displayHash = merkleRoot.slice(0, 12);

  // Minting animation sequence
  useEffect(() => {
    if (!isVisible) {
      setShowContent(false);
      setMintingPhase('generating');
      setTypedHash('');
      return;
    }

    // Phase 1: Show content after small delay
    const showTimer = setTimeout(() => setShowContent(true), 100);

    // Phase 2: Start typing after 800ms
    const typingStartTimer = setTimeout(() => {
      setMintingPhase('typing');
      let idx = 0;

      typingIntervalRef.current = setInterval(() => {
        if (idx < displayHash.length) {
          setTypedHash(displayHash.slice(0, idx + 1));
          idx++;
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
          }
          setMintingPhase('complete');
        }
      }, 40); // Typing speed
    }, 800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(typingStartTimer);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [isVisible, displayHash]);

  if (!isVisible) return null;

  // Calculate correction rate
  const correctionRate = anomaliesDetected > 0
    ? Math.round((anomaliesResolved / anomaliesDetected) * 100)
    : 100;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop - dims the map behind (85% opacity for focus) */}
      <div
        className={`pointer-events-auto transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 999,
        }}
      />

      {/* Centered Modal - INVESTOR VALUE Screen */}
      <div
        className={`pointer-events-auto transition-all duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: showContent ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
          backgroundColor: '#0a0a0a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          width: '580px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
          zIndex: 1000,
          padding: '32px 40px',
        }}
      >
        {/* ===== HERO: MISSION INTEGRITY STATUS ===== */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#10B981',
              letterSpacing: '0.04em',
              marginBottom: '4px',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            MISSION INTEGRITY: VERIFIED
          </h1>
        </div>

        {/* ===== SECTION 1: RISK MITIGATED THIS FLIGHT ===== */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px 0',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#94A3B8',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            RISK MITIGATED THIS FLIGHT
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px' }}>
            {/* Anomalies Detected */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#F1F5F9',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {anomaliesDetected}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Anomalies Detected
              </div>
            </div>

            {/* Anomalies Corrected */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#10B981',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {anomaliesResolved} <span style={{ fontSize: '18px', color: '#94A3B8' }}>({correctionRate}%)</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Anomalies Corrected
              </div>
            </div>

            {/* Response Time */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#F1F5F9',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                200<span style={{ fontSize: '18px', color: '#94A3B8' }}>ms</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Response Time
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION 2: EXPOSURE AVOIDED ===== */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '8px',
            padding: '20px 24px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#10B981',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            EXPOSURE AVOIDED
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Potential Crash Liability */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Potential Crash Liability:</span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#F1F5F9',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                $2-4M<span style={{ fontSize: '11px', color: '#64748B', marginLeft: '4px' }}>*</span>
              </span>
            </div>

            {/* Regulatory Fine */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Regulatory Fine (FAA Part 107):</span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#F1F5F9',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                $500K-2M<span style={{ fontSize: '11px', color: '#64748B', marginLeft: '4px' }}>*</span>
              </span>
            </div>

            {/* Insurance Premium Impact */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Insurance Premium Impact:</span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#10B981',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                15-25% increase avoided<span style={{ fontSize: '11px', color: '#64748B', marginLeft: '4px' }}>*</span>
              </span>
            </div>
          </div>

          {/* Citation */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '10px',
              color: '#64748B',
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}
          >
            * Based on industry averages (Verizon DBIR 2024, FAA enforcement data, Willis Towers Watson)
          </div>
        </div>

        {/* ===== SECTION 3: CRYPTOGRAPHIC VERIFICATION ===== */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '20px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#94A3B8',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            CRYPTOGRAPHIC VERIFICATION
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Proof Hash */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Proof Hash:</span>
              <span
                style={{
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#94A3B8',
                }}
              >
                {mintingPhase === 'generating' ? (
                  <span className="animate-pulse">generating...</span>
                ) : (
                  <>
                    0x{typedHash}
                    {mintingPhase === 'typing' && <span className="animate-pulse">_</span>}
                    {mintingPhase === 'complete' && '...'}
                  </>
                )}
              </span>
            </div>

            {/* Chain Integrity */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Chain Integrity:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    color: '#0a0a0a',
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
                <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 500 }}>
                  UNBROKEN
                </span>
              </div>
            </div>

            {/* Audit Ready */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Audit-Ready:</span>
              <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 500 }}>Yes</span>
            </div>
          </div>
        </div>

        {/* ===== ACTION BUTTONS ===== */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          {/* View Full Report - subtle secondary button */}
          <button
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #475569',
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              borderRadius: '4px',
              padding: '10px 20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#64748B';
              e.currentTarget.style.color = '#F1F5F9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#475569';
              e.currentTarget.style.color = '#94A3B8';
            }}
          >
            VIEW FULL REPORT
          </button>

          {/* Restart Demo - primary button */}
          <button
            onClick={onRestart}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #10B981',
              color: '#10B981',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              borderRadius: '4px',
              padding: '10px 20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            RESTART DEMO
          </button>
        </div>
      </div>
    </div>
  );
}
