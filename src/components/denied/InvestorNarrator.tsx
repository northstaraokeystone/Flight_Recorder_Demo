/**
 * InvestorNarrator v2.0 - "Insight, Not Infomercial"
 *
 * CFO-Grade Value Translation for Flight Recorder Demo
 *
 * THE CARDINAL RULE: NEVER COVER THE DRONE DURING THE CRISIS.
 * The callouts are supporting actors. The drone and the red line are the stars.
 *
 * 4 Callouts:
 * 1. "THE DIFFERENCE" - Top-left, after first waypoint (4s)
 * 2. "THE BENCHMARK" - Top-center, before anomaly (3s)
 * 3. "THE MONEY SHOT" - Bottom-center, on anomaly detection (5s)
 * 4. "THE CLOSE" - Center-screen, on mission complete (4s)
 */

import { useState, useEffect, useCallback } from 'react';

// Callout type definitions
type NarratorCalloutType = 'DIFFERENCE' | 'BENCHMARK' | 'MONEY_SHOT' | 'CLOSE';

interface NarratorCallout {
  type: NarratorCalloutType;
  duration: number;
  position: 'top-left' | 'top-center' | 'bottom-center' | 'center';
}

interface InvestorNarratorProps {
  // Triggers
  waypointCount: number;
  confidence: number;
  isAnomalyDetected: boolean;
  isMissionComplete: boolean;
  anomaliesDetected: number;
  anomaliesCorrected: number;
  onViewVerification?: () => void;
}

// Callout configurations
// SF15 POLISH: MONEY_SHOT increased to 5500ms for "distracted CFO" readability
// 300ms fade in + 4700ms hold + 500ms fade out = ~5.5 seconds total visibility
const CALLOUTS: Record<NarratorCalloutType, NarratorCallout> = {
  DIFFERENCE: { type: 'DIFFERENCE', duration: 4000, position: 'top-left' },
  BENCHMARK: { type: 'BENCHMARK', duration: 3000, position: 'top-center' },
  MONEY_SHOT: { type: 'MONEY_SHOT', duration: 5500, position: 'bottom-center' },
  CLOSE: { type: 'CLOSE', duration: 4000, position: 'center' },
};

export function InvestorNarrator({
  waypointCount,
  confidence,
  isAnomalyDetected,
  isMissionComplete,
  anomaliesDetected,
  anomaliesCorrected,
  onViewVerification,
}: InvestorNarratorProps) {
  const [activeCallout, setActiveCallout] = useState<NarratorCalloutType | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [shownCallouts, setShownCallouts] = useState<Set<NarratorCalloutType>>(new Set());

  // Show a callout with auto-dismiss
  const showCallout = useCallback((type: NarratorCalloutType) => {
    if (shownCallouts.has(type)) return; // Don't show same callout twice

    setShownCallouts(prev => new Set(prev).add(type));
    setActiveCallout(type);
    setIsExiting(false);

    const duration = CALLOUTS[type].duration;

    // Start exit animation before removing
    setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

    // Remove callout
    setTimeout(() => {
      setActiveCallout(null);
      setIsExiting(false);
    }, duration);
  }, [shownCallouts]);

  // Trigger: CALLOUT 1 - After first waypoint achieved
  useEffect(() => {
    if (waypointCount === 1 && !shownCallouts.has('DIFFERENCE')) {
      showCallout('DIFFERENCE');
    }
  }, [waypointCount, showCallout, shownCallouts]);

  // Trigger: CALLOUT 2 - When confidence drops below 85% (pre-anomaly)
  useEffect(() => {
    if (confidence < 0.85 && confidence > 0.70 && !shownCallouts.has('BENCHMARK')) {
      showCallout('BENCHMARK');
    }
  }, [confidence, showCallout, shownCallouts]);

  // Trigger: CALLOUT 3 - When anomaly is detected
  useEffect(() => {
    if (isAnomalyDetected && !shownCallouts.has('MONEY_SHOT')) {
      showCallout('MONEY_SHOT');
    }
  }, [isAnomalyDetected, showCallout, shownCallouts]);

  // Trigger: CALLOUT 4 - When mission complete
  useEffect(() => {
    if (isMissionComplete && !shownCallouts.has('CLOSE')) {
      // Small delay to let the affidavit sequence begin
      setTimeout(() => {
        showCallout('CLOSE');
      }, 500);
    }
  }, [isMissionComplete, showCallout, shownCallouts]);

  if (!activeCallout) return null;

  const calloutConfig = CALLOUTS[activeCallout];

  // COCKPIT v1.0: Position styles - callouts positioned relative to VIEWPORT CENTER
  // "The callout is positioned relative to VIEWPORT CENTER, not attached to the drone"
  const getPositionStyle = (): React.CSSProperties => {
    switch (calloutConfig.position) {
      case 'top-left':
        return {
          position: 'fixed',
          top: '80px',
          left: '320px',  // COCKPIT: Offset to right of left-edge terminal (300px width)
          transform: 'none',
        };
      case 'top-center':
        return {
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'bottom-center':
        // SF18: ANOMALY ALERT floats ABOVE the unified console, BELOW the drone
        // Console is at bottom: 30px, ~200px tall. Alert should be above it with 30px gap.
        // This is the "emergency layer" - appears under drone but above console
        return {
          position: 'fixed',
          bottom: '250px',  // SF18: Above console (30px bottom + 190px height + 30px gap)
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'center':
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <div
      className={`narrator-callout z-50 ${isExiting ? 'callout-exiting' : 'callout-entering'}`}
      style={{
        ...getPositionStyle(),
        maxWidth: activeCallout === 'MONEY_SHOT' ? '420px' : '380px',
      }}
    >
      {activeCallout === 'DIFFERENCE' && <CalloutDifference />}
      {activeCallout === 'BENCHMARK' && <CalloutBenchmark />}
      {activeCallout === 'MONEY_SHOT' && <CalloutMoneyShot />}
      {activeCallout === 'CLOSE' && (
        <CalloutClose
          anomaliesDetected={anomaliesDetected}
          anomaliesCorrected={anomaliesCorrected}
          onViewVerification={onViewVerification}
        />
      )}
    </div>
  );
}

// ==================== CALLOUT 1: THE DIFFERENCE ====================
function CalloutDifference() {
  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderLeft: '3px solid #64748B',
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#E2E8F0',
          marginBottom: '12px',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.05em',
        }}
      >
        PROOF MODE ACTIVE
      </div>

      {/* Body */}
      <div
        style={{
          fontSize: '14px',
          color: '#94A3B8',
          lineHeight: 1.6,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          Every decision → cryptographic receipt
        </div>
        <div style={{ marginBottom: '12px' }}>
          Every receipt → immutable chain
        </div>
        <div
          style={{
            fontStyle: 'italic',
            color: '#CBD5E1',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          This is not logging. This is evidence.
        </div>
      </div>
    </div>
  );
}

// ==================== CALLOUT 2: THE BENCHMARK ====================
function CalloutBenchmark() {
  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.80)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderLeft: '3px solid #F59E0B',
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Header with amber indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#F59E0B',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#FEF3C7',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.05em',
          }}
        >
          MONITORING: Signal Integrity
        </span>
      </div>

      {/* Comparison */}
      <div
        style={{
          fontSize: '14px',
          color: '#FEF3C7',
          lineHeight: 1.7,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ marginBottom: '6px' }}>
          <span style={{ color: '#94A3B8' }}>Industry standard:</span>{' '}
          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>Poll every 30 seconds</span>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ color: '#94A3B8' }}>This system:</span>{' '}
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FEF3C7' }}>
            Continuous (10ms intervals)
          </span>
        </div>
        <div
          style={{
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontStyle: 'italic',
            color: '#CBD5E1',
          }}
        >
          Watch for sub-second variance detection.
        </div>
      </div>
    </div>
  );
}

// ==================== CALLOUT 3: THE MONEY SHOT ====================
function CalloutMoneyShot() {
  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderLeft: '4px solid #EF4444',
        borderRadius: '8px',
        padding: '20px 24px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '4px',
        }}
      >
        <span style={{ fontSize: '16px' }}>🔴</span>
        <span
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#EF4444',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          ANOMALY DETECTED
        </span>
      </div>

      {/* Response time - THE KEY NUMBER */}
      <div
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#F1F5F9',
          marginBottom: '16px',
          fontFamily: 'JetBrains Mono, monospace',
          marginLeft: '26px',
        }}
      >
        Response time: 200ms
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          marginBottom: '16px',
        }}
      />

      {/* Value comparison - SF16: Fixed text contrast for readability */}
      <div
        style={{
          fontSize: '15px',
          color: '#E2E8F0',  // SF16: Brighter base color
          lineHeight: 1.8,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#CBD5E1' }}>Standard systems:</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F1F5F9' }}>
            30+ second lag <span style={{ color: '#FCA5A5', fontWeight: 500 }}>(too late)</span>
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#CBD5E1' }}>Exposure avoided:</span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
              color: '#F1F5F9',
            }}
          >
            $4M+ <span style={{ color: '#94A3B8', fontSize: '13px' }}>(crash/litigation)</span>
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#CBD5E1' }}>Status:</span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
              color: '#34D399',  // SF16: Brighter green
            }}
          >
            Corrected. Receipted.
          </span>
        </div>
      </div>
    </div>
  );
}

// ==================== CALLOUT 4: THE CLOSE ====================
interface CalloutCloseProps {
  anomaliesDetected: number;
  anomaliesCorrected: number;
  onViewVerification?: () => void;
}

function CalloutClose({ anomaliesDetected, anomaliesCorrected, onViewVerification }: CalloutCloseProps) {
  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '8px',
        padding: '24px 32px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.1)',
        textAlign: 'center',
        minWidth: '380px',
      }}
    >
      {/* Header with checkmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            fontSize: '24px',
            color: '#10B981',
          }}
        >
          ✓
        </span>
        <span
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#10B981',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.05em',
          }}
        >
          MISSION VERIFIED
        </span>
      </div>

      {/* Stats */}
      <div
        style={{
          fontSize: '15px',
          color: '#D1D5DB',
          lineHeight: 2,
          fontFamily: 'Inter, sans-serif',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94A3B8' }}>Anomalies detected:</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            {anomaliesDetected}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94A3B8' }}>Anomalies corrected:</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            {anomaliesCorrected}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94A3B8' }}>Proof artifacts:</span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
              color: '#10B981',
            }}
          >
            Ready
          </span>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: '14px',
          fontStyle: 'italic',
          color: '#CBD5E1',
          marginBottom: '20px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        Every decision logged. Every correction proved.
      </div>

      {/* CTA Button */}
      {onViewVerification && (
        <button
          onClick={onViewVerification}
          style={{
            background: 'transparent',
            border: '1px solid #10B981',
            borderRadius: '4px',
            padding: '10px 24px',
            color: '#10B981',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          VIEW VERIFICATION
        </button>
      )}
    </div>
  );
}

export default InvestorNarrator;
