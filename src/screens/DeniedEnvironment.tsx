/**
 * DeniedEnvironment - v5.0 Legal Defense Platform
 * "Not a dashboard that TELLS you it's working. A dashboard that PROVES it's working."
 *
 * 3-PANE LAYOUT:
 * ┌─────────────────┬────────────────────────────────┬──────────────────┐
 * │   THE ASSET     │        THE TRUTH               │    THE VALUE     │
 * │   (Tactical     │        (Cryptographic          │    (Financial    │
 * │    Grid)        │         Ledger)                │     Story)       │
 * │   30% width     │        40% width               │    30% width     │
 * └─────────────────┴────────────────────────────────┴──────────────────┘
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TacticalGrid,
  CryptographicLedger,
  FinancialStory,
  TerminalModal,
  createLedgerEntry,
} from '../components/denied';
import type { LedgerEntry } from '../components/denied';
import {
  TIMING,
  FLIGHT_PATH,
  THREAT_LOCATION,
  MONEY_SHOTS,
  createInitialScenarioState,
  type ScenarioState,
  type ScenarioPhase,
  type ChainBlock,
} from '../constants/scenario';
import { generateDualHash } from '../utils/crypto';

// Discrete tick interval for drone movement (100ms)
const DRONE_TICK_INTERVAL = 100;

// Faster log entries during offline (150ms = ~6-7 entries/sec)
const OFFLINE_LOG_INTERVAL = 150;

// Helper to format time
function formatTime(baseSecond: number, offset: number): string {
  const totalSeconds = baseSecond + offset;
  const minutes = 2 + Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `14:0${minutes}:${seconds.toString().padStart(2, '0')}`;
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

// Calculate rotation angle between two points
function getRotation(from: { x: number; y: number }, to: { x: number; y: number }): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.atan2(dy, dx) * (180 / Math.PI) + 90;
}

interface DeniedEnvironmentProps {
  onComplete?: () => void;
}

// Offline log event types for randomization
const OFFLINE_LOG_EVENTS = [
  { eventType: 'WAYPOINT_CHECK', result: 'WPT_03 ACQUIRED' },
  { eventType: 'SENSOR_FUSION', result: '4 SOURCES' },
  { eventType: 'TELEMETRY_LOG', result: 'CACHED' },
  { eventType: 'POSITION_FIX', result: 'GPS_LOCK' },
  { eventType: 'ALTITUDE_CHECK', result: 'NOMINAL' },
  { eventType: 'BATTERY_STATUS', result: '78%' },
  { eventType: 'HEADING_VERIFY', result: '045' },
  { eventType: 'AIRSPACE_CHECK', result: 'CLEAR' },
];

export function DeniedEnvironment({ onComplete }: DeniedEnvironmentProps) {
  const [state, setState] = useState<ScenarioState>(createInitialScenarioState);
  const [pathIndex, setPathIndex] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [interlockFreeze, setInterlockFreeze] = useState(false);
  const [stopRuleFired, setStopRuleFired] = useState(false);
  const [screenFreeze, setScreenFreeze] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const phaseTimeRef = useRef<number>(Date.now());
  const animationRef = useRef<number | null>(null);
  const droneTickRef = useRef<number | null>(null);
  const entryIdRef = useRef(0);

  const transitionToPhase = useCallback((newPhase: ScenarioPhase) => {
    phaseTimeRef.current = Date.now();
    setState(prev => ({ ...prev, phase: newPhase, phaseStartTime: Date.now() }));
  }, []);

  const addLedgerEntry = useCallback((
    eventType: string,
    result: string,
    offline: boolean,
    stopRule?: boolean
  ) => {
    entryIdRef.current += 1;
    const timeOffset = Math.floor((Date.now() - phaseTimeRef.current) / 1000);
    const entry = createLedgerEntry(
      entryIdRef.current,
      formatTime(0, timeOffset),
      eventType,
      result,
      offline,
      stopRule
    );
    setLedgerEntries(prev => [...prev, entry]);
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
    setLedgerEntries(prev => prev.map(e => ({ ...e, verified: true })));
  }, []);

  // Discrete drone tick movement (100ms intervals)
  useEffect(() => {
    const tickDrone = () => {
      const phaseElapsed = Date.now() - phaseTimeRef.current;

      setState(prev => {
        let newPos = prev.dronePosition;
        let newPathIdx = pathIndex;

        switch (prev.phase) {
          case 'NORMAL_OPS': {
            const progress = Math.min(phaseElapsed / TIMING.PHASE_NORMAL_OPS_DURATION, 1);
            const segmentProgress = progress * 2;
            const segmentIndex = Math.min(Math.floor(segmentProgress), 1);
            const segmentT = Math.min(segmentProgress - segmentIndex, 1);
            const fromWp = FLIGHT_PATH[segmentIndex];
            const toWp = FLIGHT_PATH[segmentIndex + 1];
            // Discrete step movement
            const step = Math.floor(segmentT * 10) / 10;
            const newX = fromWp.x + (toWp.x - fromWp.x) * step;
            const newY = fromWp.y + (toWp.y - fromWp.y) * step;
            newPos = { x: newX, y: newY, rotation: getRotation(fromWp, toWp) };
            newPathIdx = Math.min(Math.floor(segmentProgress) + 1, 2);
            break;
          }
          case 'DEGRADED': {
            const progress = Math.min(phaseElapsed / TIMING.PHASE_DEGRADED_DURATION, 1);
            const fromWp = FLIGHT_PATH[2];
            const toWp = FLIGHT_PATH[3];
            const step = Math.floor(progress * 10) / 10;
            const newX = fromWp.x + (toWp.x - fromWp.x) * step;
            const newY = fromWp.y + (toWp.y - fromWp.y) * step;
            newPos = { x: newX, y: newY, rotation: getRotation(fromWp, toWp) };
            if (progress > 0.5) newPathIdx = 3;
            break;
          }
          case 'OFFLINE': {
            const progress = Math.min(phaseElapsed / 8000, 1);
            const segmentProgress = progress * 2;
            const segmentIndex = Math.min(Math.floor(segmentProgress), 1);
            const segmentT = Math.min(segmentProgress - segmentIndex, 1);
            const fromWp = FLIGHT_PATH[3 + segmentIndex];
            const toWp = FLIGHT_PATH[4 + segmentIndex];
            const step = Math.floor(segmentT * 10) / 10;
            const newX = fromWp.x + (toWp.x - fromWp.x) * step;
            const newY = fromWp.y + (toWp.y - fromWp.y) * step;
            newPos = { x: newX, y: newY, rotation: getRotation(fromWp, toWp) };
            newPathIdx = 3 + Math.min(Math.floor(segmentProgress) + 1, 2);
            break;
          }
          case 'STOP_RULE_TRIGGERED': {
            const progress = Math.min(phaseElapsed / 1500, 1);
            const fromWp = FLIGHT_PATH[5];
            const toWp = FLIGHT_PATH[6];
            const step = Math.floor(progress * 10) / 10;
            const newX = fromWp.x + (toWp.x - fromWp.x) * step;
            const newY = fromWp.y + (toWp.y - fromWp.y) * step;
            // Rotate towards avoidance
            const newRotation = 70 + (180 - 70) * step;
            newPos = { x: newX, y: newY, rotation: newRotation };
            break;
          }
          case 'AVOIDANCE_EXECUTED': {
            const progress = Math.min(phaseElapsed / TIMING.PHASE_RECONNECT_DURATION, 1);
            const segmentProgress = progress * 2;
            const segmentIndex = Math.min(Math.floor(segmentProgress), 1);
            const segmentT = Math.min(segmentProgress - segmentIndex, 1);
            const fromWp = FLIGHT_PATH[6 + segmentIndex];
            const toWp = FLIGHT_PATH[7 + segmentIndex];
            const step = Math.floor(segmentT * 10) / 10;
            const newX = fromWp.x + (toWp.x - fromWp.x) * step;
            const newY = fromWp.y + (toWp.y - fromWp.y) * step;
            newPos = { x: newX, y: newY, rotation: getRotation(fromWp, toWp) };
            newPathIdx = 6 + Math.min(Math.floor(segmentProgress) + 1, 2);
            break;
          }
          case 'RECONNECTING': {
            const progress = Math.min(phaseElapsed / 2000, 1);
            const fromWp = FLIGHT_PATH[8];
            const toWp = FLIGHT_PATH[9];
            const step = Math.floor(progress * 10) / 10;
            const newX = fromWp.x + (toWp.x - fromWp.x) * step;
            const newY = fromWp.y + (toWp.y - fromWp.y) * step;
            newPos = { x: newX, y: newY, rotation: getRotation(fromWp, toWp) };
            if (progress > 0.5) newPathIdx = 9;
            break;
          }
          case 'BURST_SYNC': {
            const progress = Math.min(phaseElapsed / 3000, 1);
            const fromWp = FLIGHT_PATH[9];
            const toWp = FLIGHT_PATH[10];
            const step = Math.floor(progress * 10) / 10;
            const newX = fromWp.x + (toWp.x - fromWp.x) * step;
            const newY = fromWp.y + (toWp.y - fromWp.y) * step;
            newPos = { x: newX, y: newY, rotation: getRotation(fromWp, toWp) };
            if (progress > 0.5) newPathIdx = 10;
            break;
          }
        }

        if (newPathIdx > pathIndex) setPathIndex(newPathIdx);
        return { ...prev, dronePosition: newPos };
      });
    };

    droneTickRef.current = window.setInterval(tickDrone, DRONE_TICK_INTERVAL);
    return () => {
      if (droneTickRef.current) clearInterval(droneTickRef.current);
    };
  }, [pathIndex]);

  // Main scenario orchestration
  useEffect(() => {
    const orchestrate = () => {
      const phaseElapsed = Date.now() - phaseTimeRef.current;

      switch (state.phase) {
        case 'NORMAL_OPS':
          if (phaseElapsed > 500 && ledgerEntries.length === 0) {
            addLedgerEntry('WAYPOINT_CHECK', 'WPT_01 ACQUIRED', false);
          }
          if (phaseElapsed > 2500 && ledgerEntries.length === 1) {
            addLedgerEntry('WAYPOINT_CHECK', 'WPT_02 ACQUIRED', false);
          }
          if (phaseElapsed > 5000 && ledgerEntries.length === 2) {
            addLedgerEntry('SENSOR_FUSION', '4 SOURCES', false);
          }
          if (phaseElapsed >= TIMING.PHASE_NORMAL_OPS_DURATION) {
            transitionToPhase('DEGRADED');
            setState(prev => ({ ...prev, link: { ...prev.link, status: 'DEGRADED', latencyMs: 450 } }));
            addLedgerEntry('LINK_STATUS', 'DEGRADED', false);
          }
          break;

        case 'DEGRADED':
          if (phaseElapsed >= TIMING.PHASE_DEGRADED_DURATION) {
            transitionToPhase('OFFLINE');
            setState(prev => ({
              ...prev,
              link: { ...prev.link, status: 'SEVERED', latencyMs: null, protocol: 'AUTONOMOUS_FIDUCIARY' },
            }));
            addLedgerEntry('LINK_STATUS', 'SEVERED', true);
            addLedgerEntry('MODE_SWITCH', 'LOCAL_FIDUCIARY', true);
          }
          break;

        case 'OFFLINE':
          if (phaseElapsed >= 8000) {
            transitionToPhase('INCIDENT_DETECTED');
            setState(prev => ({
              ...prev,
              threat: { ...THREAT_LOCATION, detected: true, avoided: false },
              roi: { ...prev.roi, liabilityExposure: MONEY_SHOTS.LIABILITY_EXPOSURE, incidentActive: true },
            }));
            addLedgerEntry('OBSTACLE_DETECT', 'TGT_01', true);
            addLedgerEntry('POLICY_LOOKUP', 'SCHOOL_ZONE', true);
          }
          break;

        case 'INCIDENT_DETECTED':
          if (phaseElapsed >= 1000) {
            // INTERLOCK: Freeze for 100ms
            setInterlockFreeze(true);
            setScreenFreeze(true);
            setTimeout(() => {
              setInterlockFreeze(false);
              setScreenFreeze(false);
            }, 100);

            transitionToPhase('STOP_RULE_TRIGGERED');
            setStopRuleFired(true);
            addLedgerEntry('STOP_RULE', 'ENGAGED', true, true);
          }
          break;

        case 'STOP_RULE_TRIGGERED':
          if (phaseElapsed > 500 && !ledgerEntries.some(e => e.eventType === 'MANEUVER_EXEC')) {
            addLedgerEntry('MANEUVER_EXEC', 'AVOIDANCE', true);
          }
          if (phaseElapsed >= 1500) {
            transitionToPhase('AVOIDANCE_EXECUTED');
            setState(prev => ({
              ...prev,
              threat: prev.threat ? { ...prev.threat, avoided: true } : null,
              roi: { ...prev.roi, riskMitigated: MONEY_SHOTS.LIABILITY_EXPOSURE, incidentActive: false },
            }));
          }
          break;

        case 'AVOIDANCE_EXECUTED':
          if (phaseElapsed >= TIMING.PHASE_RECONNECT_DURATION) {
            transitionToPhase('RECONNECTING');
            setState(prev => ({ ...prev, link: { ...prev.link, status: 'RESTORED', latencyMs: 45 } }));
            addLedgerEntry('LINK_STATUS', 'RESTORED', false);
          }
          break;

        case 'RECONNECTING':
          if (phaseElapsed >= 2000) {
            transitionToPhase('BURST_SYNC');
            addLedgerEntry('BURST_SYNC', `${state.offlineReceiptCount} RECEIPTS`, false);
          }
          break;

        case 'BURST_SYNC': {
          const progress = Math.min(phaseElapsed / 3000, 1);
          setSyncProgress(progress);

          const blocksShouldBeSynced = Math.floor(progress * state.chainBlocks.length);
          const currentSynced = state.chainBlocks.filter(b => b.status !== 'PENDING').length;

          if (currentSynced < blocksShouldBeSynced) {
            syncNextBlock();
          }

          const pendingBlocks = state.chainBlocks.filter(b => b.status === 'PENDING');
          if (pendingBlocks.length === 0 && state.chainBlocks.length > 0) {
            transitionToPhase('VERIFIED');
            verifyAllBlocks();
            addLedgerEntry('CHAIN_VERIFY', 'INTEGRITY 100%', false);
            setState(prev => ({ ...prev, link: { ...prev.link, protocol: 'CLOUD_SYNC' } }));
          }
          break;
        }

        case 'VERIFIED':
          if (phaseElapsed >= 3000) {
            transitionToPhase('COMPLETE');
            setShowTerminal(true);
            if (onComplete) setTimeout(onComplete, 5000);
          }
          break;

        case 'COMPLETE':
          break;
      }

      animationRef.current = requestAnimationFrame(orchestrate);
    };

    animationRef.current = requestAnimationFrame(orchestrate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [state.phase, state.chainBlocks, state.offlineReceiptCount, ledgerEntries, addLedgerEntry, transitionToPhase, syncNextBlock, verifyAllBlocks, onComplete]);

  // Receipt and log generation during offline phases (FASTER - 150ms)
  useEffect(() => {
    const isOfflinePhase = ['OFFLINE', 'INCIDENT_DETECTED', 'STOP_RULE_TRIGGERED', 'AVOIDANCE_EXECUTED'].includes(state.phase);

    if (isOfflinePhase && state.offlineReceiptCount < MONEY_SHOTS.FINAL_RECEIPTS_SYNCED) {
      // Generate receipts
      const receiptInterval = setInterval(() => addBlock(), TIMING.RECEIPT_TICK_INTERVAL);

      // Generate log entries faster during offline
      const logInterval = setInterval(() => {
        const randomEvent = OFFLINE_LOG_EVENTS[Math.floor(Math.random() * OFFLINE_LOG_EVENTS.length)];
        addLedgerEntry(randomEvent.eventType, randomEvent.result, true);
      }, OFFLINE_LOG_INTERVAL);

      return () => {
        clearInterval(receiptInterval);
        clearInterval(logInterval);
      };
    }
  }, [state.phase, state.offlineReceiptCount, addBlock, addLedgerEntry]);

  // Computed states
  const isOffline = state.link.status === 'SEVERED';
  const showGhostPath = state.phase === 'INCIDENT_DETECTED' || state.phase === 'STOP_RULE_TRIGGERED';
  const stopRuleEngaged = state.phase === 'STOP_RULE_TRIGGERED' || state.phase === 'AVOIDANCE_EXECUTED';

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Screen freeze overlay for interlock */}
      {screenFreeze && <div className="screen-freeze" />}

      {/* 3-PANE LAYOUT */}
      <div className="three-pane-layout">
        {/* LEFT PANE: THE ASSET (Tactical Grid) - 30% */}
        <div style={{ backgroundColor: '#0a0a0a' }}>
          <TacticalGrid
            dronePosition={state.dronePosition}
            threat={state.threat}
            phase={state.phase}
            visitedPathIndex={pathIndex}
            avoidancePath={state.avoidancePath}
            showGhostPath={showGhostPath}
            stopRuleEngaged={stopRuleEngaged}
            interlockFreeze={interlockFreeze}
          />
        </div>

        {/* MIDDLE PANE: THE TRUTH (Cryptographic Ledger) - 40% */}
        <div style={{ backgroundColor: '#0d0d0d' }}>
          <CryptographicLedger
            entries={ledgerEntries}
            phase={state.phase}
            syncProgress={syncProgress}
            isOffline={isOffline}
          />
        </div>

        {/* RIGHT PANE: THE VALUE (Financial Story) - 30% */}
        <div style={{ backgroundColor: '#0d0d0d' }}>
          <FinancialStory
            roi={state.roi}
            phase={state.phase}
            chainBlocks={state.chainBlocks}
            syncedCount={state.syncedReceiptCount}
            stopRuleFired={stopRuleFired}
          />
        </div>
      </div>

      {/* Terminal Modal - overlays middle pane */}
      <TerminalModal
        isVisible={showTerminal}
        receiptsAnchored={state.syncedReceiptCount}
        missionDuration={47.2}
        offlineDuration={8.2}
        incidentsLogged={1}
        stopRulesFired={1}
        liabilityAvoided={MONEY_SHOTS.LIABILITY_EXPOSURE}
        onExport={() => {
          setShowTerminal(false);
          if (onComplete) onComplete();
        }}
      />
    </div>
  );
}
