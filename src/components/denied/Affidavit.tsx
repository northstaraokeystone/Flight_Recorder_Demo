/**
 * Affidavit - "Golden Ticket" Certificate Display
 * v4.0 SIMPLIFIED LAYOUT
 *
 * DESIGN PHILOSOPHY:
 * - Certificate, not CVS receipt
 * - Only 4-5 essential data items visible
 * - Celebratory "victory moment" feel
 * - NO UUIDs, NO RACI stats, NO reason codes
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
  flightTime,
  blocks,
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

  // Truncated hash for display (first 16 chars)
  const displayHash = merkleRoot.slice(0, 16);

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

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop - dims the map behind (80% opacity per spec) */}
      <div
        className={`pointer-events-auto transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
        }}
      />

      {/* Centered Modal - "Golden Ticket" */}
      <div
        className={`pointer-events-auto transition-all duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: showContent ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
          backgroundColor: '#0f0f0f',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          padding: '40px',
          textAlign: 'center',
        }}
      >
        {/* ===== HERO: MISSION INTEGRITY STATUS ===== */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#10B981',
              letterSpacing: '0.05em',
              marginBottom: '8px',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            MISSION INTEGRITY: VERIFIED
          </h1>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'rgba(255, 255, 255, 0.1)',
            width: '80%',
            margin: '0 auto 24px auto',
          }}
        />

        {/* ===== KEY METRICS ===== */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 500,
              color: '#F1F5F9',
              marginBottom: '8px',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            FLIGHT TIME: {flightTime}
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 500,
              color: '#F1F5F9',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            BLOCKS ANCHORED: {blocks}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'rgba(255, 255, 255, 0.1)',
            width: '80%',
            margin: '0 auto 24px auto',
          }}
        />

        {/* ===== CRYPTOGRAPHIC PROOF ===== */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: '#94A3B8',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            CRYPTOGRAPHIC PROOF
          </div>
          <div
            style={{
              fontSize: '14px',
              fontFamily: 'JetBrains Mono, SF Mono, Consolas, monospace',
              color: '#94A3B8',
              minHeight: '20px',
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
          </div>
        </div>

        {/* ===== INTEGRITY SEAL ===== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '32px',
          }}
        >
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#0f0f0f',
              fontWeight: 700,
            }}
          >
            ✓
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#10B981',
            }}
          >
            CHAIN INTEGRITY UNBROKEN
          </span>
        </div>

        {/* ===== RESTART BUTTON ===== */}
        <button
          onClick={onRestart}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #64748b',
            color: '#F1F5F9',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            borderRadius: '4px',
            padding: '12px 24px',
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
          RESTART DEMO
        </button>
      </div>
    </div>
  );
}
