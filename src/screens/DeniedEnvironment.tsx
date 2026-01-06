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

interface DeniedEnvironmentProps {
  onComplete?: () => void;
}

export function DeniedEnvironment({ onComplete }: DeniedEnvironmentProps) {
  const [state, setState] = useState<ScenarioState>(createInitialScenarioState);
  const [pathIndex, setPathIndex] = useState(0);
  const phaseTimeRef = useRef<number>(0);

  // Initialize timing ref on mount
  useEffect(() => {
    phaseTimeRef.current = Date.now();
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
        // Update drone position along path
        const progressRatio = phaseElapsed / TIMING.PHASE_NORMAL_OPS_DURATION;
        const targetIndex = Math.min(Math.floor(progressRatio * 3), 2);
        if (targetIndex > pathIndex) {
          setPathIndex(targetIndex);
          const wp = FLIGHT_PATH[targetIndex];
          setState(prev => ({
            ...prev,
            dronePosition: { x: wp.x, y: wp.y, rotation: 45 },
          }));
        }

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
        // Update drone position
        const progressRatio = phaseElapsed / TIMING.PHASE_DEGRADED_DURATION;
        const targetIndex = 2 + Math.min(Math.floor(progressRatio * 2), 1);
        if (targetIndex > pathIndex) {
          setPathIndex(targetIndex);
          const wp = FLIGHT_PATH[targetIndex];
          setState(prev => ({
            ...prev,
            dronePosition: { x: wp.x, y: wp.y, rotation: 60 },
          }));
        }

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
        // Generate receipts while offline
        const receiptInterval = setInterval(() => {
          if (state.offlineReceiptCount < 60) {
            addBlock();
          }
        }, TIMING.RECEIPT_TICK_INTERVAL);

        // Update drone position deeper into dead zone
        const progressRatio = phaseElapsed / 8000; // 8 seconds to reach incident point
        const targetIndex = 3 + Math.min(Math.floor(progressRatio * 2), 2);
        if (targetIndex > pathIndex && targetIndex <= 5) {
          setPathIndex(targetIndex);
          const wp = FLIGHT_PATH[targetIndex];
          setState(prev => ({
            ...prev,
            dronePosition: { x: wp.x, y: wp.y, rotation: 70 },
          }));
        }

        // Add waypoint logs
        if (phaseElapsed > 2000 && state.decisionLog.length < 6) {
          addLogEntry({ eventType: 'WAYPOINT_LOCKED', value: 'WPT_04', severity: 'INFO', offline: true, timeOffset: 14 });
        }

        // Transition to incident after 8 seconds
        if (phaseElapsed >= 8000) {
          clearInterval(receiptInterval);
          transitionToPhase('INCIDENT_DETECTED');

          // Detect threat
          setState(prev => ({
            ...prev,
            threat: { ...THREAT_LOCATION, detected: true, avoided: false },
            roi: { ...prev.roi, liabilityExposure: MONEY_SHOTS.LIABILITY_EXPOSURE, incidentActive: true },
          }));
          addLogEntry({ eventType: 'OBSTACLE_DETECTED', value: 'LIAB_TARGET_01', severity: 'CRITICAL', offline: true, timeOffset: 20 });
        }

        return () => clearInterval(receiptInterval);
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
        // Add maneuver log
        if (phaseElapsed > 500 && state.decisionLog.length < 10) {
          addLogEntry({ eventType: 'MANEUVER', value: 'EXECUTED', severity: 'SUCCESS', offline: true, timeOffset: 23 });
        }

        // Transition to avoidance
        if (phaseElapsed >= 1500) {
          transitionToPhase('AVOIDANCE_EXECUTED');

          // Update threat and position
          setState(prev => ({
            ...prev,
            threat: prev.threat ? { ...prev.threat, avoided: true } : null,
            roi: { ...prev.roi, riskMitigated: MONEY_SHOTS.LIABILITY_EXPOSURE, incidentActive: false },
            dronePosition: { x: 340, y: 170, rotation: 180 },
            avoidancePath: [
              { x: 350, y: 135 },
              { x: 340, y: 155 },
              { x: 340, y: 170 },
            ],
          }));
          setPathIndex(6);
        }
        break;
      }

      case 'AVOIDANCE_EXECUTED': {
        // Continue generating receipts
        const receiptInterval = setInterval(() => {
          if (state.offlineReceiptCount < MONEY_SHOTS.FINAL_RECEIPTS_SYNCED - 20) {
            addBlock();
          }
        }, TIMING.RECEIPT_TICK_INTERVAL);

        // Update drone position along avoidance path
        if (phaseElapsed > 2000 && pathIndex < 8) {
          const wp = FLIGHT_PATH[7];
          setState(prev => ({
            ...prev,
            dronePosition: { x: wp.x, y: wp.y, rotation: 220 },
            avoidancePath: [...prev.avoidancePath, { x: wp.x, y: wp.y }],
          }));
          setPathIndex(8);
        }

        // Transition to reconnecting
        if (phaseElapsed >= TIMING.PHASE_RECONNECT_DURATION) {
          clearInterval(receiptInterval);
          transitionToPhase('RECONNECTING');
          setState(prev => ({
            ...prev,
            link: { ...prev.link, status: 'RESTORED', latencyMs: 45 },
          }));
          addLogEntry({ eventType: 'COMMS_STATUS', value: 'RESTORED', severity: 'SUCCESS', offline: false, timeOffset: 35 });
        }

        return () => clearInterval(receiptInterval);
      }

      case 'RECONNECTING': {
        // Final receipts before sync
        if (state.offlineReceiptCount < MONEY_SHOTS.FINAL_RECEIPTS_SYNCED) {
          const remaining = MONEY_SHOTS.FINAL_RECEIPTS_SYNCED - state.offlineReceiptCount;
          for (let i = 0; i < Math.min(remaining, 10); i++) {
            addBlock();
          }
        }

        // Transition to burst sync
        if (phaseElapsed >= 2000) {
          transitionToPhase('BURST_SYNC');
          addLogEntry({ eventType: 'BURST_SYNC', value: 'INITIATED', severity: 'INFO', offline: false, timeOffset: 36 });
        }
        break;
      }

      case 'BURST_SYNC': {
        // Rapidly sync blocks
        const syncInterval = setInterval(() => {
          const pendingBlocks = state.chainBlocks.filter(b => b.status === 'PENDING');
          if (pendingBlocks.length > 0) {
            syncNextBlock();
          } else {
            clearInterval(syncInterval);
          }
        }, TIMING.BURST_SYNC_SPEED);

        // Check if all synced
        const allSynced = state.chainBlocks.every(b => b.status !== 'PENDING');
        if (allSynced && phaseElapsed >= 3000) {
          clearInterval(syncInterval);
          transitionToPhase('VERIFIED');
          verifyAllBlocks();
          addLogEntry({ eventType: 'CHAIN_INTEGRITY', value: 'VERIFIED', severity: 'SUCCESS', offline: false, timeOffset: 40 });

          setState(prev => ({
            ...prev,
            link: { ...prev.link, protocol: 'CLOUD_SYNC' },
          }));
        }

        return () => clearInterval(syncInterval);
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
  }, [
    state.phase,
    state.decisionLog.length,
    state.offlineReceiptCount,
    state.chainBlocks,
    pathIndex,
    addLogEntry,
    addBlock,
    syncNextBlock,
    verifyAllBlocks,
    transitionToPhase,
    onComplete,
  ]);

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
