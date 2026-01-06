/**
 * DeniedEnvironment - Offline Fiduciary Continuity Demo
 * "Tamper-Evident Assurance for Autonomy in Denied Environments"
 *
 * Auto-play scenario demonstrating:
 * 1. The Disconnect - "Boardroom rules live on the metal"
 * 2. The Save - "$15M liability avoided"
 * 3. The Burst Sync - "Zero gaps. Chain unbroken."
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ConnectionStatus,
  ComplianceBar,
  ROITicker,
  TacticalTheater,
  DecisionLog,
  ChainIntegrity,
  OfflineReceipts,
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
  return Math.atan2(dy, dx) * (180 / Math.PI) + 90; // +90 because drone points up by default
}

interface DeniedEnvironmentProps {
  onComplete?: () => void;
}

export function DeniedEnvironment({ onComplete }: DeniedEnvironmentProps) {
  const [state, setState] = useState<ScenarioState>(createInitialScenarioState);
  const [pathIndex, setPathIndex] = useState(0);
  const [tick, setTick] = useState(0); // Animation driver
  const phaseTimeRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  // Animation loop - drives the entire scenario
  useEffect(() => {
    phaseTimeRef.current = Date.now();

    const animate = () => {
      setTick(t => t + 1);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Phase transition logic
  const transitionToPhase = useCallback((newPhase: ScenarioPhase) => {
    phaseTimeRef.current = Date.now();
    setState(prev => ({
      ...prev,
      phase: newPhase,
      phaseStartTime: Date.now(),
    }));
  }, []);

  // Add decision log entry
  const addLogEntry = useCallback((entry: Omit<DecisionLogEntry, 'timestamp'> & { timeOffset: number }) => {
    setState(prev => ({
      ...prev,
      decisionLog: [
        ...prev.decisionLog,
        {
          timestamp: formatTime(7, entry.timeOffset),
          eventType: entry.eventType,
          value: entry.value,
          severity: entry.severity,
          offline: entry.offline,
        },
      ],
    }));
  }, []);

  // Add chain block
  const addBlock = useCallback(() => {
    setState(prev => ({
      ...prev,
      chainBlocks: [...prev.chainBlocks, generateBlock(prev.chainBlocks.length + 1, 'PENDING')],
      offlineReceiptCount: prev.offlineReceiptCount + 1,
    }));
  }, []);

  // Sync blocks during burst sync
  const syncNextBlock = useCallback(() => {
    setState(prev => {
      const blocks = [...prev.chainBlocks];
      const pendingIndex = blocks.findIndex(b => b.status === 'PENDING');
      if (pendingIndex >= 0) {
        blocks[pendingIndex] = { ...blocks[pendingIndex], status: 'SYNCED' };
      }
      return {
        ...prev,
        chainBlocks: blocks,
        syncedReceiptCount: prev.syncedReceiptCount + 1,
      };
    });
  }, []);

  // Verify all blocks
  const verifyAllBlocks = useCallback(() => {
    setState(prev => ({
      ...prev,
      chainBlocks: prev.chainBlocks.map(b => ({ ...b, status: 'VERIFIED' as const })),
    }));
  }, []);

  // Main scenario orchestration
  useEffect(() => {
    // Phase-based state machine
    const phaseElapsed = Date.now() - phaseTimeRef.current;

    switch (state.phase) {
      case 'NORMAL_OPS': {
        // Smooth drone movement through first 3 waypoints
        const progressRatio = Math.min(phaseElapsed / TIMING.PHASE_NORMAL_OPS_DURATION, 1);
        const easedProgress = easeOutCubic(progressRatio);

        // Interpolate between waypoints 0-2
        const segmentProgress = easedProgress * 2; // 0-2 for 3 waypoints
        const segmentIndex = Math.min(Math.floor(segmentProgress), 1);
        const segmentT = segmentProgress - segmentIndex;

        const fromWp = FLIGHT_PATH[segmentIndex];
        const toWp = FLIGHT_PATH[segmentIndex + 1];

        const newX = lerp(fromWp.x, toWp.x, segmentT);
        const newY = lerp(fromWp.y, toWp.y, segmentT);
        const newRotation = getRotation(fromWp, toWp);

        // Update path index for trail visualization
        const newPathIndex = Math.min(Math.floor(segmentProgress) + 1, 2);
        if (newPathIndex > pathIndex) {
          setPathIndex(newPathIndex);
        }

        setState(prev => ({
          ...prev,
          dronePosition: { x: newX, y: newY, rotation: newRotation },
        }));

        // Add initial log entries
        if (phaseElapsed > 500 && state.decisionLog.length === 0) {
          addLogEntry({ eventType: 'WAYPOINT_LOCKED', value: 'WPT_01', severity: 'INFO', offline: false, timeOffset: 0 });
        }
        if (phaseElapsed > 2000 && state.decisionLog.length === 1) {
          addLogEntry({ eventType: 'WAYPOINT_LOCKED', value: 'WPT_02', severity: 'INFO', offline: false, timeOffset: 2 });
        }
        if (phaseElapsed > 4000 && state.decisionLog.length === 2) {
          addLogEntry({ eventType: 'WAYPOINT_LOCKED', value: 'WPT_03', severity: 'INFO', offline: false, timeOffset: 4 });
        }

        // Transition to degraded
        if (phaseElapsed >= TIMING.PHASE_NORMAL_OPS_DURATION) {
          transitionToPhase('DEGRADED');
          setState(prev => ({
            ...prev,
            link: { ...prev.link, status: 'DEGRADED', latencyMs: 450 },
          }));
          addLogEntry({ eventType: 'COMMS_STATUS', value: 'DEGRADED', severity: 'WARN', offline: false, timeOffset: 9 });
        }
        break;
      }

      case 'DEGRADED': {
        // Smooth drone movement from waypoint 2 to 3
        const progressRatio = Math.min(phaseElapsed / TIMING.PHASE_DEGRADED_DURATION, 1);
        const easedProgress = easeOutCubic(progressRatio);

        const fromWp = FLIGHT_PATH[2];
        const toWp = FLIGHT_PATH[3];

        const newX = lerp(fromWp.x, toWp.x, easedProgress);
        const newY = lerp(fromWp.y, toWp.y, easedProgress);
        const newRotation = getRotation(fromWp, toWp);

        if (progressRatio > 0.5 && pathIndex < 3) {
          setPathIndex(3);
        }

        setState(prev => ({
          ...prev,
          dronePosition: { x: newX, y: newY, rotation: newRotation },
        }));

        // Transition to offline
        if (phaseElapsed >= TIMING.PHASE_DEGRADED_DURATION) {
          transitionToPhase('OFFLINE');
          setState(prev => ({
            ...prev,
            link: { ...prev.link, status: 'SEVERED', latencyMs: null, protocol: 'AUTONOMOUS_FIDUCIARY' },
          }));
          addLogEntry({ eventType: 'COMMS_STATUS', value: 'SEVERED', severity: 'CRITICAL', offline: true, timeOffset: 11 });
          addLogEntry({ eventType: 'PROTOCOL', value: 'AUTONOMOUS_FIDUCIARY', severity: 'WARN', offline: true, timeOffset: 11 });
        }
        break;
      }

      case 'OFFLINE': {
        // Smooth drone movement from waypoint 3 to 5 (toward incident point)
        const progressRatio = Math.min(phaseElapsed / 8000, 1); // 8 seconds to reach incident
        const easedProgress = easeOutCubic(progressRatio);

        // Interpolate between waypoints 3-5
        const segmentProgress = easedProgress * 2; // 0-2 for waypoints 3,4,5
        const segmentIndex = Math.min(Math.floor(segmentProgress), 1);
        const segmentT = segmentProgress - segmentIndex;

        const fromWp = FLIGHT_PATH[3 + segmentIndex];
        const toWp = FLIGHT_PATH[4 + segmentIndex];

        const newX = lerp(fromWp.x, toWp.x, segmentT);
        const newY = lerp(fromWp.y, toWp.y, segmentT);
        const newRotation = getRotation(fromWp, toWp);

        // Update path index for trail visualization
        const newPathIndex = 3 + Math.min(Math.floor(segmentProgress) + 1, 2);
        if (newPathIndex > pathIndex && newPathIndex <= 5) {
          setPathIndex(newPathIndex);
        }

        setState(prev => ({
          ...prev,
          dronePosition: { x: newX, y: newY, rotation: newRotation },
        }));

        // Add waypoint logs
        if (phaseElapsed > 2000 && state.decisionLog.length < 6) {
          addLogEntry({ eventType: 'WAYPOINT_LOCKED', value: 'WPT_04', severity: 'INFO', offline: true, timeOffset: 14 });
        }

        // Transition to incident after 8 seconds
        if (phaseElapsed >= 8000) {
          transitionToPhase('INCIDENT_DETECTED');

          // Detect threat
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
        // Continue generating receipts
        if (phaseElapsed > 500 && state.decisionLog.length < 8) {
          addLogEntry({ eventType: 'RACI_CHECK', value: 'LOCAL_GOVERNANCE', severity: 'WARN', offline: true, timeOffset: 21 });
        }

        // Transition to stop rule
        if (phaseElapsed >= 1500) {
          transitionToPhase('STOP_RULE_TRIGGERED');
          addLogEntry({ eventType: 'STOP_RULE', value: 'AVOIDANCE_TRIGGERED', severity: 'SUCCESS', offline: true, timeOffset: 22 });
        }
        break;
      }

      case 'STOP_RULE_TRIGGERED': {
        // Smooth start of avoidance curve
        const progressRatio = Math.min(phaseElapsed / 1500, 1);
        const easedProgress = easeOutCubic(progressRatio);

        // Start turning away - interpolate from incident point toward first avoidance point
        const fromWp = FLIGHT_PATH[5]; // Incident detection point
        const toWp = FLIGHT_PATH[6];   // First avoidance point

        const newX = lerp(fromWp.x, toWp.x, easedProgress);
        const newY = lerp(fromWp.y, toWp.y, easedProgress);

        // Rotate toward turn direction
        const newRotation = lerp(70, 180, easedProgress);

        setState(prev => ({
          ...prev,
          dronePosition: { x: newX, y: newY, rotation: newRotation },
          avoidancePath: [
            { x: fromWp.x, y: fromWp.y },
            { x: newX, y: newY },
          ],
        }));

        // Add maneuver log
        if (phaseElapsed > 500 && state.decisionLog.length < 10) {
          addLogEntry({ eventType: 'MANEUVER', value: 'EXECUTED', severity: 'SUCCESS', offline: true, timeOffset: 23 });
        }

        // Transition to avoidance
        if (phaseElapsed >= 1500) {
          transitionToPhase('AVOIDANCE_EXECUTED');

          // Update threat and ROI - the save!
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
        // Smooth drone movement along avoidance path (waypoints 6-8)
        const progressRatio = Math.min(phaseElapsed / TIMING.PHASE_RECONNECT_DURATION, 1);
        const easedProgress = easeOutCubic(progressRatio);

        // Interpolate between waypoints 6-8 (3 points = 2 segments)
        const segmentProgress = easedProgress * 2;
        const segmentIndex = Math.min(Math.floor(segmentProgress), 1);
        const segmentT = segmentProgress - segmentIndex;

        const fromWp = FLIGHT_PATH[6 + segmentIndex];
        const toWp = FLIGHT_PATH[7 + segmentIndex];

        const newX = lerp(fromWp.x, toWp.x, segmentT);
        const newY = lerp(fromWp.y, toWp.y, segmentT);
        const newRotation = getRotation(fromWp, toWp);

        // Update path index for trail visualization
        const newPathIndex = 6 + Math.min(Math.floor(segmentProgress) + 1, 2);
        if (newPathIndex > pathIndex) {
          setPathIndex(newPathIndex);
        }

        // Build avoidance path for visualization
        const avoidancePoints = [{ x: 350, y: 135 }]; // Start point
        if (segmentProgress > 0.5) avoidancePoints.push({ x: FLIGHT_PATH[6].x, y: FLIGHT_PATH[6].y });
        if (segmentProgress > 1) avoidancePoints.push({ x: FLIGHT_PATH[7].x, y: FLIGHT_PATH[7].y });
        avoidancePoints.push({ x: newX, y: newY });

        setState(prev => ({
          ...prev,
          dronePosition: { x: newX, y: newY, rotation: newRotation },
          avoidancePath: avoidancePoints,
        }));

        // Transition to reconnecting
        if (phaseElapsed >= TIMING.PHASE_RECONNECT_DURATION) {
          transitionToPhase('RECONNECTING');
          setState(prev => ({
            ...prev,
            link: { ...prev.link, status: 'RESTORED', latencyMs: 45 },
          }));
          addLogEntry({ eventType: 'COMMS_STATUS', value: 'RESTORED', severity: 'SUCCESS', offline: false, timeOffset: 35 });
        }
        break;
      }

      case 'RECONNECTING': {
        // Smooth drone movement from waypoint 8 to 9 (exiting dead zone)
        const progressRatio = Math.min(phaseElapsed / 2000, 1);
        const easedProgress = easeOutCubic(progressRatio);

        const fromWp = FLIGHT_PATH[8];
        const toWp = FLIGHT_PATH[9];

        const newX = lerp(fromWp.x, toWp.x, easedProgress);
        const newY = lerp(fromWp.y, toWp.y, easedProgress);
        const newRotation = getRotation(fromWp, toWp);

        if (progressRatio > 0.5 && pathIndex < 9) {
          setPathIndex(9);
        }

        setState(prev => ({
          ...prev,
          dronePosition: { x: newX, y: newY, rotation: newRotation },
        }));

        // Transition to burst sync
        if (phaseElapsed >= 2000) {
          transitionToPhase('BURST_SYNC');
          addLogEntry({ eventType: 'BURST_SYNC', value: 'INITIATED', severity: 'INFO', offline: false, timeOffset: 36 });
        }
        break;
      }

      case 'BURST_SYNC': {
        // Smooth drone movement to final position (waypoint 9 to 10)
        const progressRatio = Math.min(phaseElapsed / 3000, 1);
        const easedProgress = easeOutCubic(progressRatio);

        const fromWp = FLIGHT_PATH[9];
        const toWp = FLIGHT_PATH[10];

        const newX = lerp(fromWp.x, toWp.x, easedProgress);
        const newY = lerp(fromWp.y, toWp.y, easedProgress);
        const newRotation = getRotation(fromWp, toWp);

        if (progressRatio > 0.5 && pathIndex < 10) {
          setPathIndex(10);
        }

        setState(prev => ({
          ...prev,
          dronePosition: { x: newX, y: newY, rotation: newRotation },
        }));

        // Calculate how many blocks should be synced by now based on elapsed time
        const blocksShouldBeSynced = Math.floor(phaseElapsed / TIMING.BURST_SYNC_SPEED);
        const pendingBlocks = state.chainBlocks.filter(b => b.status === 'PENDING');
        const syncedBlocks = state.chainBlocks.filter(b => b.status !== 'PENDING');

        // Sync next block if we're behind
        if (syncedBlocks.length < blocksShouldBeSynced && pendingBlocks.length > 0) {
          syncNextBlock();
        }

        // Check if all synced
        const allSynced = pendingBlocks.length === 0;
        if (allSynced && state.chainBlocks.length > 0) {
          transitionToPhase('VERIFIED');
          verifyAllBlocks();
          addLogEntry({ eventType: 'CHAIN_INTEGRITY', value: 'VERIFIED', severity: 'SUCCESS', offline: false, timeOffset: 40 });

          setState(prev => ({
            ...prev,
            link: { ...prev.link, protocol: 'CLOUD_SYNC' },
          }));
        }
        break;
      }

      case 'VERIFIED': {
        // Hold on success state
        if (phaseElapsed >= TIMING.PHASE_FINAL_HOLD_DURATION) {
          transitionToPhase('COMPLETE');
          if (onComplete) {
            setTimeout(onComplete, 2000);
          }
        }
        break;
      }

      case 'COMPLETE':
        // Final state - do nothing
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]); // Tick drives the animation loop - other deps are stable refs

  // Continuous receipt generation during offline phases
  useEffect(() => {
    const isOfflinePhase = ['OFFLINE', 'INCIDENT_DETECTED', 'STOP_RULE_TRIGGERED', 'AVOIDANCE_EXECUTED'].includes(state.phase);

    if (isOfflinePhase && state.offlineReceiptCount < MONEY_SHOTS.FINAL_RECEIPTS_SYNCED) {
      const interval = setInterval(() => {
        addBlock();
      }, TIMING.RECEIPT_TICK_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [state.phase, state.offlineReceiptCount, addBlock]);

  // Determine display states
  const isOffline = state.link.status === 'SEVERED';
  const isVerified = state.phase === 'VERIFIED' || state.phase === 'COMPLETE';
  const showStaticEffect = isOffline || state.phase === 'RECONNECTING';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: COLORS.bgPrimary }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          TOP BAR - Connection Status | Compliance | ROI Ticker
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="flex items-start justify-between gap-4 p-4 border-b"
        style={{ borderColor: COLORS.borderBracket }}
      >
        {/* Connection Status (Left) */}
        <div className="flex-shrink-0 w-72">
          <ConnectionStatus link={state.link} />
        </div>

        {/* Compliance Bar (Center) */}
        <div className="flex-1 flex justify-center">
          <ComplianceBar
            compliance={state.compliance}
            isOffline={isOffline}
            isVerified={isVerified}
          />
        </div>

        {/* ROI Ticker (Right) */}
        <div className="flex-shrink-0 w-56">
          <ROITicker
            roi={state.roi}
            phase={state.phase}
            decisionsSecured={state.offlineReceiptCount}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN THEATER - The Map
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 p-4 min-h-[320px]">
        <TacticalTheater
          dronePosition={state.dronePosition}
          threat={state.threat}
          phase={state.phase}
          visitedPathIndex={pathIndex}
          avoidancePath={state.avoidancePath}
          showStaticEffect={showStaticEffect}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          BOTTOM BAR - Decision Log | Chain Integrity | Offline Receipts
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="flex items-stretch gap-4 p-4 border-t"
        style={{ borderColor: COLORS.borderBracket, minHeight: '200px' }}
      >
        {/* Decision Log (Left) */}
        <div className="flex-1 min-w-[300px]">
          <DecisionLog entries={state.decisionLog} />
        </div>

        {/* Chain Integrity (Center) */}
        <div className="flex-1 min-w-[300px]">
          <ChainIntegrity
            blocks={state.chainBlocks}
            syncedCount={state.syncedReceiptCount}
            phase={state.phase}
          />
        </div>

        {/* Offline Receipts (Right) */}
        <div className="w-40 flex-shrink-0">
          <OfflineReceipts
            count={state.offlineReceiptCount}
            phase={state.phase}
            syncedCount={state.syncedReceiptCount}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          COMPLIANCE FOOTER
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="px-4 py-2 text-center text-[10px] font-mono tracking-wider border-t"
        style={{
          backgroundColor: 'rgba(13, 20, 36, 0.9)',
          borderColor: COLORS.borderBracket,
          color: isVerified ? COLORS.alertGreen : COLORS.textMuted,
        }}
      >
        {isVerified ? (
          <>
            <span style={{ color: COLORS.alertGreen }}>FAA PART 108: COMPLIANT</span>
            <span className="mx-3" style={{ color: COLORS.borderBracket }}>{'\u00B7'}</span>
            <span style={{ color: COLORS.alertGreen }}>DOD 3000.09: VERIFIED</span>
            <span className="mx-3" style={{ color: COLORS.borderBracket }}>{'\u00B7'}</span>
            <span style={{ color: COLORS.alertGreen }}>EU AI ACT: CHAIN INTACT</span>
            <span className="mx-3" style={{ color: COLORS.borderBracket }}>{'\u00B7'}</span>
            <span style={{ color: COLORS.alertGreen }}>ASSURE A55: EXCEEDED</span>
          </>
        ) : isOffline ? (
          <>
            <span style={{ color: COLORS.alertAmber }}>FAA PART 108: LOST LINK PROTOCOL</span>
            <span className="mx-3" style={{ color: COLORS.borderBracket }}>{'\u00B7'}</span>
            <span style={{ color: COLORS.alertAmber }}>DOD 3000.09: DENIED ENV</span>
            <span className="mx-3" style={{ color: COLORS.borderBracket }}>{'\u00B7'}</span>
            <span style={{ color: COLORS.alertAmber }}>EU AI ACT: LOCAL CAPTURE</span>
          </>
        ) : (
          <>
            <span>FAA PART 108: READY</span>
            <span className="mx-3" style={{ color: COLORS.borderBracket }}>{'\u00B7'}</span>
            <span>DOD 3000.09: COMPLIANT</span>
            <span className="mx-3" style={{ color: COLORS.borderBracket }}>{'\u00B7'}</span>
            <span>EU AI ACT ART.12: LOGGING</span>
            <span className="mx-3" style={{ color: COLORS.borderBracket }}>{'\u00B7'}</span>
            <span>DO-178C: LEVEL B</span>
          </>
        )}
      </div>
    </div>
  );
}
