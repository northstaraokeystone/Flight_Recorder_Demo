/**
 * DeniedEnvironment - Defense-Grade Flight Recorder Demo
 * "Make it look like a $100M instrument, not a game"
 *
 * NEW LAYOUT:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SYS: ONLINE   │ CHAIN: NOMINAL    │ RISK MITIGATED: $15,000,000        │
 * ├──────────┬──────────────────────────────────────────────────────────────┤
 * │ TELEMETRY│                    THE MAP                                   │
 * │ STREAM   │                  (LIDAR view)                                │
 * ├──────────┼──────────────────────────────────────────────────────────────┤
 * │ DECISION │              CHAIN INTEGRITY              │  LOCAL BUFFER   │
 * │ LOG      │         [merkle visualization]            │  [receipt count]│
 * └──────────┴──────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ConnectionStatus,
  ROITicker,
  TacticalTheater,
  DecisionLog,
  ChainIntegrity,
  TelemetrySidebar,
  TerminalModal,
} from '../components/denied';
import {
  TIMING,
  FLIGHT_PATH,
  THREAT_LOCATION,
  MONEY_SHOTS,
  createInitialScenarioState,
  type ScenarioState,
  type ScenarioPhase,
  type DecisionLogEntry,
  type ChainBlock,
} from '../constants/scenario';
import { COLORS } from '../constants/colors';
import { generateDualHash } from '../utils/crypto';

// Helper to format time
function formatTime(baseSecond: number, offset: number): string {
  const totalSeconds = baseSecond + offset;
  const minutes = 32 + Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `14:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Generate a chain block
function generateBlock(id: number, status: 'PENDING' | 'SYNCED' | 'VERIFIED'): ChainBlock {
  return {
    id,
    decisionId: `DEC-${id}-${Date.now()}`,
    hash: generateDualHash(`block-${id}-${Date.now()}`).sha256,
    status,
    timestamp: Date.now(),
  };
}

// Smooth interpolation between two points
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

// Ease out cubic for smoother deceleration
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Calculate rotation angle between two points
function getRotation(from: { x: number; y: number }, to: { x: number; y: number }): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.atan2(dy, dx) * (180 / Math.PI) + 90;
}

interface DeniedEnvironmentProps {
  onComplete?: () => void;
}

export function DeniedEnvironment({ onComplete }: DeniedEnvironmentProps) {
  const [state, setState] = useState<ScenarioState>(createInitialScenarioState);
  const [pathIndex, setPathIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const phaseTimeRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  // Animation loop
  useEffect(() => {
    phaseTimeRef.current = Date.now();
    const animate = () => {
      setTick(t => t + 1);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const transitionToPhase = useCallback((newPhase: ScenarioPhase) => {
    phaseTimeRef.current = Date.now();
    setState(prev => ({ ...prev, phase: newPhase, phaseStartTime: Date.now() }));
  }, []);

  const addLogEntry = useCallback((entry: Omit<DecisionLogEntry, 'timestamp'> & { timeOffset: number }) => {
    setState(prev => ({
      ...prev,
      decisionLog: [...prev.decisionLog, {
        timestamp: formatTime(7, entry.timeOffset),
        eventType: entry.eventType,
        value: entry.value,
        severity: entry.severity,
        offline: entry.offline,
      }],
    }));
  }, []);

  const addBlock = useCallback(() => {
    setState(prev => ({
      ...prev,
      chainBlocks: [...prev.chainBlocks, generateBlock(prev.chainBlocks.length + 1, 'PENDING')],
      offlineReceiptCount: prev.offlineReceiptCount + 1,
    }));
  }, []);

  const syncNextBlock = useCallback(() => {
    setState(prev => {
      const blocks = [...prev.chainBlocks];
      const pendingIndex = blocks.findIndex(b => b.status === 'PENDING');
      if (pendingIndex >= 0) {
        blocks[pendingIndex] = { ...blocks[pendingIndex], status: 'SYNCED' };
      }
      return { ...prev, chainBlocks: blocks, syncedReceiptCount: prev.syncedReceiptCount + 1 };
    });
  }, []);

  const verifyAllBlocks = useCallback(() => {
    setState(prev => ({
      ...prev,
      chainBlocks: prev.chainBlocks.map(b => ({ ...b, status: 'VERIFIED' as const })),
    }));
  }, []);

  // Main scenario orchestration
  useEffect(() => {
    const phaseElapsed = Date.now() - phaseTimeRef.current;

    switch (state.phase) {
      case 'NORMAL_OPS': {
        const progressRatio = Math.min(phaseElapsed / TIMING.PHASE_NORMAL_OPS_DURATION, 1);
        const easedProgress = easeOutCubic(progressRatio);
        const segmentProgress = easedProgress * 2;
        const segmentIndex = Math.min(Math.floor(segmentProgress), 1);
        const segmentT = segmentProgress - segmentIndex;
        const fromWp = FLIGHT_PATH[segmentIndex];
        const toWp = FLIGHT_PATH[segmentIndex + 1];
        const newX = lerp(fromWp.x, toWp.x, segmentT);
        const newY = lerp(fromWp.y, toWp.y, segmentT);
        const newRotation = getRotation(fromWp, toWp);
        const newPathIndex = Math.min(Math.floor(segmentProgress) + 1, 2);
        if (newPathIndex > pathIndex) setPathIndex(newPathIndex);
        setState(prev => ({ ...prev, dronePosition: { x: newX, y: newY, rotation: newRotation } }));

        if (phaseElapsed > 500 && state.decisionLog.length === 0)
          addLogEntry({ eventType: 'WAYPOINT_LOCKED', value: 'WPT_01', severity: 'INFO', offline: false, timeOffset: 0 });
        if (phaseElapsed > 2000 && state.decisionLog.length === 1)
          addLogEntry({ eventType: 'WAYPOINT_LOCKED', value: 'WPT_02', severity: 'INFO', offline: false, timeOffset: 2 });
        if (phaseElapsed > 4000 && state.decisionLog.length === 2)
          addLogEntry({ eventType: 'WAYPOINT_LOCKED', value: 'WPT_03', severity: 'INFO', offline: false, timeOffset: 4 });

        if (phaseElapsed >= TIMING.PHASE_NORMAL_OPS_DURATION) {
          transitionToPhase('DEGRADED');
          setState(prev => ({ ...prev, link: { ...prev.link, status: 'DEGRADED', latencyMs: 450 } }));
          addLogEntry({ eventType: 'COMMS_STATUS', value: 'DEGRADED', severity: 'WARN', offline: false, timeOffset: 9 });
        }
        break;
      }

      case 'DEGRADED': {
        const progressRatio = Math.min(phaseElapsed / TIMING.PHASE_DEGRADED_DURATION, 1);
        const easedProgress = easeOutCubic(progressRatio);
        const fromWp = FLIGHT_PATH[2];
        const toWp = FLIGHT_PATH[3];
        const newX = lerp(fromWp.x, toWp.x, easedProgress);
        const newY = lerp(fromWp.y, toWp.y, easedProgress);
        const newRotation = getRotation(fromWp, toWp);
        if (progressRatio > 0.5 && pathIndex < 3) setPathIndex(3);
        setState(prev => ({ ...prev, dronePosition: { x: newX, y: newY, rotation: newRotation } }));

        if (phaseElapsed >= TIMING.PHASE_DEGRADED_DURATION) {
          transitionToPhase('OFFLINE');
          setState(prev => ({ ...prev, link: { ...prev.link, status: 'SEVERED', latencyMs: null, protocol: 'AUTONOMOUS_FIDUCIARY' } }));
          addLogEntry({ eventType: 'COMMS_STATUS', value: 'SEVERED', severity: 'CRITICAL', offline: true, timeOffset: 11 });
          addLogEntry({ eventType: 'PROTOCOL', value: 'AUTONOMOUS_FIDUCIARY', severity: 'WARN', offline: true, timeOffset: 11 });
        }
        break;
      }

      case 'OFFLINE': {
        const progressRatio = Math.min(phaseElapsed / 8000, 1);
        const easedProgress = easeOutCubic(progressRatio);
        const segmentProgress = easedProgress * 2;
        const segmentIndex = Math.min(Math.floor(segmentProgress), 1);
        const segmentT = segmentProgress - segmentIndex;
        const fromWp = FLIGHT_PATH[3 + segmentIndex];
        const toWp = FLIGHT_PATH[4 + segmentIndex];
        const newX = lerp(fromWp.x, toWp.x, segmentT);
        const newY = lerp(fromWp.y, toWp.y, segmentT);
        const newRotation = getRotation(fromWp, toWp);
        const newPathIndex = 3 + Math.min(Math.floor(segmentProgress) + 1, 2);
        if (newPathIndex > pathIndex && newPathIndex <= 5) setPathIndex(newPathIndex);
        setState(prev => ({ ...prev, dronePosition: { x: newX, y: newY, rotation: newRotation } }));

        if (phaseElapsed > 2000 && state.decisionLog.length < 6)
          addLogEntry({ eventType: 'WAYPOINT_LOCKED', value: 'WPT_04', severity: 'INFO', offline: true, timeOffset: 14 });

        if (phaseElapsed >= 8000) {
          transitionToPhase('INCIDENT_DETECTED');
          setState(prev => ({
            ...prev,
            threat: { ...THREAT_LOCATION, detected: true, avoided: false },
            roi: { ...prev.roi, liabilityExposure: MONEY_SHOTS.LIABILITY_EXPOSURE, incidentActive: true },
          }));
          addLogEntry({ eventType: 'OBSTACLE_DETECTED', value: 'LIAB_TARGET_01', severity: 'CRITICAL', offline: true, timeOffset: 20 });
        }
        break;
      }

      case 'INCIDENT_DETECTED': {
        if (phaseElapsed > 500 && state.decisionLog.length < 8)
          addLogEntry({ eventType: 'RACI_CHECK', value: 'LOCAL_GOVERNANCE', severity: 'WARN', offline: true, timeOffset: 21 });

        if (phaseElapsed >= 1500) {
          transitionToPhase('STOP_RULE_TRIGGERED');
          addLogEntry({ eventType: 'STOP_RULE', value: 'AVOIDANCE_TRIGGERED', severity: 'SUCCESS', offline: true, timeOffset: 22 });
        }
        break;
      }

      case 'STOP_RULE_TRIGGERED': {
        const progressRatio = Math.min(phaseElapsed / 1500, 1);
        const easedProgress = easeOutCubic(progressRatio);
        const fromWp = FLIGHT_PATH[5];
        const toWp = FLIGHT_PATH[6];
        const newX = lerp(fromWp.x, toWp.x, easedProgress);
        const newY = lerp(fromWp.y, toWp.y, easedProgress);
        const newRotation = lerp(70, 180, easedProgress);

        setState(prev => ({
          ...prev,
          dronePosition: { x: newX, y: newY, rotation: newRotation },
          avoidancePath: [{ x: fromWp.x, y: fromWp.y }, { x: newX, y: newY }],
        }));

        if (phaseElapsed > 500 && state.decisionLog.length < 10)
          addLogEntry({ eventType: 'MANEUVER', value: 'EXECUTED', severity: 'SUCCESS', offline: true, timeOffset: 23 });

        if (phaseElapsed >= 1500) {
          transitionToPhase('AVOIDANCE_EXECUTED');
          setState(prev => ({
            ...prev,
            threat: prev.threat ? { ...prev.threat, avoided: true } : null,
            roi: { ...prev.roi, riskMitigated: MONEY_SHOTS.LIABILITY_EXPOSURE, incidentActive: false },
          }));
          setPathIndex(6);
        }
        break;
      }

      case 'AVOIDANCE_EXECUTED': {
        const progressRatio = Math.min(phaseElapsed / TIMING.PHASE_RECONNECT_DURATION, 1);
        const easedProgress = easeOutCubic(progressRatio);
        const segmentProgress = easedProgress * 2;
        const segmentIndex = Math.min(Math.floor(segmentProgress), 1);
        const segmentT = segmentProgress - segmentIndex;
        const fromWp = FLIGHT_PATH[6 + segmentIndex];
        const toWp = FLIGHT_PATH[7 + segmentIndex];
        const newX = lerp(fromWp.x, toWp.x, segmentT);
        const newY = lerp(fromWp.y, toWp.y, segmentT);
        const newRotation = getRotation(fromWp, toWp);
        const newPathIndex = 6 + Math.min(Math.floor(segmentProgress) + 1, 2);
        if (newPathIndex > pathIndex) setPathIndex(newPathIndex);

        const avoidancePoints = [{ x: 350, y: 135 }];
        if (segmentProgress > 0.5) avoidancePoints.push({ x: FLIGHT_PATH[6].x, y: FLIGHT_PATH[6].y });
        if (segmentProgress > 1) avoidancePoints.push({ x: FLIGHT_PATH[7].x, y: FLIGHT_PATH[7].y });
        avoidancePoints.push({ x: newX, y: newY });

        setState(prev => ({ ...prev, dronePosition: { x: newX, y: newY, rotation: newRotation }, avoidancePath: avoidancePoints }));

        if (phaseElapsed >= TIMING.PHASE_RECONNECT_DURATION) {
          transitionToPhase('RECONNECTING');
          setState(prev => ({ ...prev, link: { ...prev.link, status: 'RESTORED', latencyMs: 45 } }));
          addLogEntry({ eventType: 'COMMS_STATUS', value: 'RESTORED', severity: 'SUCCESS', offline: false, timeOffset: 35 });
        }
        break;
      }

      case 'RECONNECTING': {
        const progressRatio = Math.min(phaseElapsed / 2000, 1);
        const easedProgress = easeOutCubic(progressRatio);
        const fromWp = FLIGHT_PATH[8];
        const toWp = FLIGHT_PATH[9];
        const newX = lerp(fromWp.x, toWp.x, easedProgress);
        const newY = lerp(fromWp.y, toWp.y, easedProgress);
        const newRotation = getRotation(fromWp, toWp);
        if (progressRatio > 0.5 && pathIndex < 9) setPathIndex(9);
        setState(prev => ({ ...prev, dronePosition: { x: newX, y: newY, rotation: newRotation } }));

        if (phaseElapsed >= 2000) {
          transitionToPhase('BURST_SYNC');
          addLogEntry({ eventType: 'BURST_SYNC', value: 'INITIATED', severity: 'INFO', offline: false, timeOffset: 36 });
        }
        break;
      }

      case 'BURST_SYNC': {
        const progressRatio = Math.min(phaseElapsed / 3000, 1);
        const easedProgress = easeOutCubic(progressRatio);
        const fromWp = FLIGHT_PATH[9];
        const toWp = FLIGHT_PATH[10];
        const newX = lerp(fromWp.x, toWp.x, easedProgress);
        const newY = lerp(fromWp.y, toWp.y, easedProgress);
        const newRotation = getRotation(fromWp, toWp);
        if (progressRatio > 0.5 && pathIndex < 10) setPathIndex(10);
        setState(prev => ({ ...prev, dronePosition: { x: newX, y: newY, rotation: newRotation } }));

        const blocksShouldBeSynced = Math.floor(phaseElapsed / TIMING.BURST_SYNC_SPEED);
        const pendingBlocks = state.chainBlocks.filter(b => b.status === 'PENDING');
        const syncedBlocks = state.chainBlocks.filter(b => b.status !== 'PENDING');

        if (syncedBlocks.length < blocksShouldBeSynced && pendingBlocks.length > 0) syncNextBlock();

        if (pendingBlocks.length === 0 && state.chainBlocks.length > 0) {
          transitionToPhase('VERIFIED');
          verifyAllBlocks();
          addLogEntry({ eventType: 'CHAIN_INTEGRITY', value: 'VERIFIED', severity: 'SUCCESS', offline: false, timeOffset: 40 });
          setState(prev => ({ ...prev, link: { ...prev.link, protocol: 'CLOUD_SYNC' } }));
        }
        break;
      }

      case 'VERIFIED': {
        if (phaseElapsed >= TIMING.PHASE_FINAL_HOLD_DURATION) {
          transitionToPhase('COMPLETE');
          setShowTerminal(true);
          if (onComplete) setTimeout(onComplete, 5000);
        }
        break;
      }

      case 'COMPLETE':
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  // Receipt generation during offline phases
  useEffect(() => {
    const isOfflinePhase = ['OFFLINE', 'INCIDENT_DETECTED', 'STOP_RULE_TRIGGERED', 'AVOIDANCE_EXECUTED'].includes(state.phase);
    if (isOfflinePhase && state.offlineReceiptCount < MONEY_SHOTS.FINAL_RECEIPTS_SYNCED) {
      const interval = setInterval(() => addBlock(), TIMING.RECEIPT_TICK_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [state.phase, state.offlineReceiptCount, addBlock]);

  // Computed states
  const isOffline = state.link.status === 'SEVERED';
  const isVerified = state.phase === 'VERIFIED' || state.phase === 'COMPLETE';
  const showStaticEffect = isOffline || state.phase === 'RECONNECTING';
  const showGhostPath = state.phase === 'INCIDENT_DETECTED' || state.phase === 'STOP_RULE_TRIGGERED';
  const stopRuleEngaged = state.phase === 'STOP_RULE_TRIGGERED' || state.phase === 'AVOIDANCE_EXECUTED';
  const bufferSize = state.offlineReceiptCount * 0.3; // Simulated MB
  const pendingReceipts = state.chainBlocks.filter(b => b.status === 'PENDING').length;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: COLORS.bgPrimary }}
    >
      {/* ═══ TOP HEADER BAR ═══ */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: COLORS.borderBracket, minHeight: '48px' }}
      >
        {/* Left: System Status */}
        <ConnectionStatus link={state.link} />

        {/* Center: Chain Status */}
        <div className="flex items-center gap-3 font-mono">
          <span style={{ color: COLORS.textMuted, fontSize: '8px' }}>CHAIN:</span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: isVerified ? COLORS.alertGreen : isOffline ? COLORS.alertAmber : COLORS.statusOnline,
            }}
          >
            {isVerified ? 'VERIFIED' : isOffline ? 'LOCAL_BUFFER' : 'NOMINAL'}
          </span>
          <span style={{ color: COLORS.textMuted, fontSize: '8px' }}>|</span>
          <span style={{ color: COLORS.textMuted, fontSize: '8px' }}>INTEGRITY:</span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: isVerified ? COLORS.alertGreen : COLORS.textSecondary,
            }}
          >
            {isVerified ? '100%' : `${Math.round((state.syncedReceiptCount / Math.max(state.offlineReceiptCount, 1)) * 100)}%`}
          </span>
        </div>

        {/* Right: ROI Ticker */}
        <ROITicker roi={state.roi} phase={state.phase} />
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Telemetry */}
        <TelemetrySidebar
          dronePosition={state.dronePosition}
          phase={state.phase}
          isOffline={isOffline}
          bufferSize={bufferSize}
          receiptsPending={pendingReceipts}
        />

        {/* Main: Tactical Theater */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-2">
            <TacticalTheater
              dronePosition={state.dronePosition}
              threat={state.threat}
              phase={state.phase}
              visitedPathIndex={pathIndex}
              avoidancePath={state.avoidancePath}
              showStaticEffect={showStaticEffect}
              showGhostPath={showGhostPath}
              stopRuleEngaged={stopRuleEngaged}
            />
          </div>

          {/* Bottom Bar: Log | Chain | Buffer */}
          <div
            className="flex gap-2 p-2 border-t"
            style={{ borderColor: COLORS.borderBracket, height: '140px' }}
          >
            {/* Decision Log */}
            <div className="flex-1">
              <DecisionLog entries={state.decisionLog} />
            </div>

            {/* Chain Integrity */}
            <div className="flex-1">
              <ChainIntegrity
                blocks={state.chainBlocks}
                syncedCount={state.syncedReceiptCount}
                phase={state.phase}
              />
            </div>

            {/* Local Buffer Display */}
            <div
              className="w-32 flex flex-col items-center justify-center font-mono"
              style={{
                backgroundColor: COLORS.bgCard,
                border: `1px solid ${isOffline ? COLORS.alertAmber : COLORS.borderBracket}`,
              }}
            >
              <span style={{ fontSize: '7px', color: COLORS.textMuted, letterSpacing: '0.1em' }}>
                LOCAL BUFFER
              </span>
              <span
                className={isOffline ? 'animate-dataFlicker' : ''}
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: isOffline ? COLORS.alertAmber : COLORS.alertGreen,
                  marginTop: '4px',
                }}
              >
                {bufferSize.toFixed(1)}mb
              </span>
              <span style={{ fontSize: '7px', color: COLORS.textMuted, marginTop: '4px' }}>
                RECEIPTS: {state.offlineReceiptCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div
        className="px-3 py-1 text-center border-t font-mono"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '7px',
          letterSpacing: '0.05em',
          color: isVerified ? COLORS.alertGreen : isOffline ? COLORS.alertAmber : COLORS.textMuted,
        }}
      >
        {isVerified ? (
          'FAA-108: COMPLIANT | DOD-3000.09: VERIFIED | EU-AI-ACT: CHAIN_INTACT | GAPS: 0'
        ) : isOffline ? (
          'FAA-108: LOST_LINK | DOD-3000.09: DENIED_ENV | EU-AI-ACT: LOCAL_CAPTURE'
        ) : (
          'FAA-108: READY | DOD-3000.09: COMPLIANT | EU-AI-ACT: LOGGING | DO-178C: LEVEL_B'
        )}
      </div>

      {/* Terminal Modal */}
      <TerminalModal
        isVisible={showTerminal}
        receiptsAnchored={state.syncedReceiptCount}
        onExport={() => {
          setShowTerminal(false);
          if (onComplete) onComplete();
        }}
      />
    </div>
  );
}
