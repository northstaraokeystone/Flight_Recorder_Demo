/**
 * DeniedEnvironment - Main Demo Screen v2.2 DIAMOND
 * Governance-first narrative with CRAG fallback and RACI handoffs
 *
 * Layout: Map (50%) | Event Log (25%) | Governance State (25%)
 *
 * Narrative Timeline:
 * T+0:   Takeoff - RACI=AI_SYSTEM, CONFIDENCE=0.99
 * T+10:  Waypoint 1 - CONFIDENCE=0.98
 * T+20:  Waypoint 2 - CONFIDENCE=0.97
 * T+25:  Unknown object detected - CONFIDENCE=0.62 (RED)
 * T+26:  CRAG Fallback triggered - MODE=SUPERVISED
 * T+28:  Ground Control queried - RACI=HUMAN_IN_LOOP (THE PAUSE)
 * T+30:  Human response - CONFIDENCE=0.94 restored
 * T+32:  RACI handoff back - RACI=AI_SYSTEM
 * T+35:  Route resumed
 * T+45:  Mission complete
 * T+47:  Affidavit slides up
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TacticalGrid,
  CryptographicLedger,
  GovernancePanel,
  Affidavit,
  TrustGap,
  createLedgerEntry,
} from '../components/denied';
import { createGovernanceLogEntry } from '../components/denied/CryptographicLedger';
import type { GovernanceState } from '../components/denied/GovernancePanel';
import type {
  ScenarioPhase,
  GovernanceLogEntry,
  DronePosition,
  UnknownObject,
} from '../constants/scenario';
import {
  TIMING,
  FLIGHT_PATH,
  UNKNOWN_OBJECT_LOCATION,
  NARRATIVE_EVENTS,
  AFFIDAVIT_DATA,
} from '../constants/scenario';
import { COLORS } from '../constants/colors';
import type { LedgerEntry } from '../components/denied/CryptographicLedger';

interface DeniedEnvironmentProps {
  onComplete?: () => void;
  autoplay?: boolean;
}

export function DeniedEnvironment({ onComplete: _onComplete, autoplay = true }: DeniedEnvironmentProps) {
  // Core state
  const [phase, setPhase] = useState<ScenarioPhase>('TAKEOFF');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(autoplay);

  // Governance state
  const [governance, setGovernance] = useState<GovernanceState>({
    raci: 'AI_SYSTEM',
    confidence: 0.99,
    mode: 'AUTONOMOUS',
    crag: 'STANDBY',
    fallback: 'NONE',
    reasonCode: null,
  });

  // Visual state
  const [dronePosition, setDronePosition] = useState<DronePosition>(
    { x: FLIGHT_PATH[0].x, y: FLIGHT_PATH[0].y, rotation: 45 }
  );
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [visitedPathIndex, setVisitedPathIndex] = useState(0);
  const [unknownObject, setUnknownObject] = useState<UnknownObject | null>(null);

  // Log state
  const [governanceLog, setGovernanceLog] = useState<GovernanceLogEntry[]>([]);
  const [legacyEntries, setLegacyEntries] = useState<LedgerEntry[]>([]);
  const [blockCount, setBlockCount] = useState(0);

  // End state
  const [showAffidavit, setShowAffidavit] = useState(false);
  const [showTrustGap, setShowTrustGap] = useState(false);

  // Timing refs
  const phaseStartRef = useRef(Date.now());
  const lastTickRef = useRef(Date.now());
  const startTimeRef = useRef(Date.now());

  // Helper to add log entry
  const addLogEntry = useCallback((
    eventType: string,
    detail: string,
    reasonCode: string | null = null,
    severity: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS' = 'INFO'
  ) => {
    const elapsed = Date.now() - startTimeRef.current;
    const seconds = Math.floor(elapsed / 1000);
    const timestamp = `00:${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    const newBlock = blockCount + 1;
    setBlockCount(newBlock);

    const entry = createGovernanceLogEntry(newBlock, timestamp, eventType, detail, reasonCode, severity);
    setGovernanceLog(prev => [...prev, entry]);

    // Also create legacy entry for compatibility
    const legacyEntry = createLedgerEntry(newBlock, timestamp, eventType, detail, false, false, reasonCode || undefined);
    setLegacyEntries(prev => [...prev, legacyEntry]);
  }, [blockCount]);

  // Phase transition logic with strategic pauses
  const transitionToPhase = useCallback((newPhase: ScenarioPhase) => {
    setPhase(newPhase);
    phaseStartRef.current = Date.now();

    // Phase-specific actions
    switch (newPhase) {
      case 'TAKEOFF':
        addLogEntry('WAYPOINT_ACHIEVED', 'TAKEOFF', null, 'SUCCESS');
        break;

      case 'WAYPOINT_1':
        setCurrentWaypoint(1);
        setVisitedPathIndex(1);
        setDronePosition({ x: FLIGHT_PATH[1].x, y: FLIGHT_PATH[1].y, rotation: 30 });
        addLogEntry('WAYPOINT_ACHIEVED', 'WPT_1', null, 'SUCCESS');
        addLogEntry('CONFIDENCE_UPDATE', '0.98', null, 'INFO');
        setGovernance(prev => ({ ...prev, confidence: 0.98 }));
        break;

      case 'WAYPOINT_2':
        setCurrentWaypoint(2);
        setVisitedPathIndex(2);
        setDronePosition({ x: FLIGHT_PATH[2].x, y: FLIGHT_PATH[2].y, rotation: 20 });
        addLogEntry('WAYPOINT_ACHIEVED', 'WPT_2', null, 'SUCCESS');
        addLogEntry('CONFIDENCE_UPDATE', '0.97', null, 'INFO');
        setGovernance(prev => ({ ...prev, confidence: 0.97 }));
        break;

      case 'UNCERTAINTY_DETECTED':
        setCurrentWaypoint(3);
        setVisitedPathIndex(3);
        setDronePosition({ x: FLIGHT_PATH[3].x, y: FLIGHT_PATH[3].y, rotation: 15 });
        setUnknownObject({
          id: UNKNOWN_OBJECT_LOCATION.id,
          label: UNKNOWN_OBJECT_LOCATION.label,
          x: UNKNOWN_OBJECT_LOCATION.x,
          y: UNKNOWN_OBJECT_LOCATION.y,
          detected: true,
          identified: false,
        });
        addLogEntry(
          'UNCERTAINTY_DETECTED',
          NARRATIVE_EVENTS.UNCERTAINTY_DETECTED.message,
          NARRATIVE_EVENTS.UNCERTAINTY_DETECTED.reasonCode,
          'CRITICAL'
        );
        setGovernance(prev => ({
          ...prev,
          confidence: 0.62,
          fallback: 'TRIGGERED',
          reasonCode: 'RC006_CONTEXT_MISSING',
        }));
        break;

      case 'CRAG_TRIGGERED':
        addLogEntry('CRAG_FALLBACK_TRIGGERED', 'External knowledge required', null, 'WARN');
        setGovernance(prev => ({
          ...prev,
          crag: 'QUERYING',
          mode: 'SUPERVISED',
        }));
        break;

      case 'HUMAN_QUERY':
        addLogEntry('EXTERNAL_QUERY', NARRATIVE_EVENTS.CRAG_QUERY.message, null, 'INFO');
        addLogEntry('RACI_HANDOFF', 'AI→HUMAN', null, 'INFO');
        setGovernance(prev => ({
          ...prev,
          raci: 'HUMAN_IN_LOOP',
          crag: 'ACTIVE',
        }));
        break;

      case 'HUMAN_RESPONSE':
        addLogEntry(
          'GROUND_CONTROL_RESPONSE',
          NARRATIVE_EVENTS.HUMAN_RESPONSE.message,
          null,
          'SUCCESS'
        );
        addLogEntry('CONFIDENCE_UPDATE', '0.94', null, 'INFO');
        setGovernance(prev => ({
          ...prev,
          confidence: 0.94,
          fallback: 'NONE',
          reasonCode: null,
        }));
        setUnknownObject(prev => prev ? {
          ...prev,
          identified: true,
          identifiedAs: NARRATIVE_EVENTS.HUMAN_RESPONSE.identifiedAs,
        } : null);
        break;

      case 'RACI_HANDOFF_BACK':
        addLogEntry('RACI_HANDOFF', 'HUMAN→AI', null, 'INFO');
        setGovernance(prev => ({
          ...prev,
          raci: 'AI_SYSTEM',
          mode: 'AUTONOMOUS',
          crag: 'STANDBY',
        }));
        break;

      case 'ROUTE_RESUMED':
        setCurrentWaypoint(5);
        setVisitedPathIndex(5);
        setDronePosition({ x: FLIGHT_PATH[5].x, y: FLIGHT_PATH[5].y, rotation: 10 });
        addLogEntry('ROUTE_RESUMED', 'Original route', null, 'SUCCESS');
        addLogEntry('CONFIDENCE_UPDATE', '0.96', null, 'INFO');
        setGovernance(prev => ({ ...prev, confidence: 0.96 }));
        break;

      case 'MISSION_COMPLETE':
        setCurrentWaypoint(6);
        setVisitedPathIndex(6);
        setDronePosition({ x: FLIGHT_PATH[6].x, y: FLIGHT_PATH[6].y, rotation: 0 });
        addLogEntry('MISSION_COMPLETE', '5/5 waypoints', null, 'SUCCESS');
        addLogEntry('CHAIN_VERIFY', 'INTEGRITY 100%', null, 'SUCCESS');
        setGovernance(prev => ({ ...prev, confidence: 0.98 }));
        break;

      case 'AFFIDAVIT':
        setShowAffidavit(true);
        setIsRunning(false);
        break;

      case 'TRUST_GAP':
        setShowAffidavit(false);
        setShowTrustGap(true);
        break;
    }
  }, [addLogEntry]);

  // Main simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const now = Date.now();
      const phaseElapsed = now - phaseStartRef.current;
      setElapsedTime(now - startTimeRef.current);
      lastTickRef.current = now;

      // Phase transitions with timing from spec
      switch (phase) {
        case 'TAKEOFF':
          if (phaseElapsed >= TIMING.PHASE_TAKEOFF_DURATION) {
            transitionToPhase('WAYPOINT_1');
          }
          break;

        case 'WAYPOINT_1':
          if (phaseElapsed >= TIMING.PHASE_WAYPOINT_DURATION) {
            transitionToPhase('WAYPOINT_2');
          }
          break;

        case 'WAYPOINT_2':
          // 1.5s pause before uncertainty event
          if (phaseElapsed >= TIMING.PHASE_WAYPOINT_DURATION + TIMING.PHASE_UNCERTAINTY_PAUSE) {
            transitionToPhase('UNCERTAINTY_DETECTED');
          }
          break;

        case 'UNCERTAINTY_DETECTED':
          if (phaseElapsed >= TIMING.PHASE_UNCERTAINTY_DURATION) {
            transitionToPhase('CRAG_TRIGGERED');
          }
          break;

        case 'CRAG_TRIGGERED':
          if (phaseElapsed >= TIMING.PHASE_CRAG_TRIGGERED_DURATION) {
            transitionToPhase('HUMAN_QUERY');
          }
          break;

        case 'HUMAN_QUERY':
          // THE KEY PAUSE - 2 seconds waiting for human
          if (phaseElapsed >= TIMING.PHASE_HUMAN_QUERY_PAUSE) {
            transitionToPhase('HUMAN_RESPONSE');
          }
          break;

        case 'HUMAN_RESPONSE':
          if (phaseElapsed >= TIMING.PHASE_HUMAN_RESPONSE_DURATION) {
            transitionToPhase('RACI_HANDOFF_BACK');
          }
          break;

        case 'RACI_HANDOFF_BACK':
          if (phaseElapsed >= TIMING.PHASE_HANDOFF_BACK_DURATION) {
            transitionToPhase('ROUTE_RESUMED');
          }
          break;

        case 'ROUTE_RESUMED':
          if (phaseElapsed >= TIMING.PHASE_ROUTE_RESUME_DURATION) {
            transitionToPhase('MISSION_COMPLETE');
          }
          break;

        case 'MISSION_COMPLETE':
          // 1.5s pause before affidavit slides up
          if (phaseElapsed >= TIMING.PHASE_COMPLETE_DURATION + TIMING.PHASE_AFFIDAVIT_PAUSE) {
            transitionToPhase('AFFIDAVIT');
          }
          break;
      }

      // Smooth drone position interpolation
      if (phase !== 'AFFIDAVIT' && phase !== 'TRUST_GAP' && phase !== 'MISSION_COMPLETE') {
        const targetIdx = Math.min(currentWaypoint + 1, FLIGHT_PATH.length - 1);
        const target = FLIGHT_PATH[targetIdx];
        setDronePosition(prev => ({
          x: prev.x + (target.x - prev.x) * 0.03,
          y: prev.y + (target.y - prev.y) * 0.03,
          rotation: prev.rotation,
        }));
      }
    };

    const interval = setInterval(tick, 50);
    return () => clearInterval(interval);
  }, [isRunning, phase, currentWaypoint, transitionToPhase]);

  // Start on mount
  useEffect(() => {
    if (autoplay) {
      startTimeRef.current = Date.now();
      phaseStartRef.current = Date.now();
      transitionToPhase('TAKEOFF');
    }
  }, [autoplay, transitionToPhase]);

  // Handle restart
  const handleRestart = useCallback(() => {
    setPhase('TAKEOFF');
    setElapsedTime(0);
    setGovernance({
      raci: 'AI_SYSTEM',
      confidence: 0.99,
      mode: 'AUTONOMOUS',
      crag: 'STANDBY',
      fallback: 'NONE',
      reasonCode: null,
    });
    setDronePosition({ x: FLIGHT_PATH[0].x, y: FLIGHT_PATH[0].y, rotation: 45 });
    setCurrentWaypoint(0);
    setVisitedPathIndex(0);
    setUnknownObject(null);
    setGovernanceLog([]);
    setLegacyEntries([]);
    setBlockCount(0);
    setShowAffidavit(false);
    setShowTrustGap(false);
    startTimeRef.current = Date.now();
    phaseStartRef.current = Date.now();
    lastTickRef.current = Date.now();
    setIsRunning(true);
    transitionToPhase('TAKEOFF');
  }, [transitionToPhase]);

  // Calculate flight time for affidavit
  const flightTimeMs = elapsedTime;
  const minutes = Math.floor(flightTimeMs / 60000);
  const seconds = Math.floor((flightTimeMs % 60000) / 1000);
  const flightTime = `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className="w-full h-screen overflow-hidden"
      style={{ backgroundColor: COLORS.bgPrimary }}
    >
      {/* 3-Panel Layout: Map 50% | Log 25% | Governance 25% */}
      <div className="three-pane-layout h-full">
        {/* Left Panel - Tactical Map (50%) */}
        <div className="h-full">
          <TacticalGrid
            dronePosition={dronePosition}
            threat={null}
            phase={phase}
            visitedPathIndex={visitedPathIndex}
            unknownObject={unknownObject}
            currentWaypoint={currentWaypoint}
            confidence={governance.confidence}
          />
        </div>

        {/* Middle Panel - Event Log (25%) */}
        <div className="h-full">
          <CryptographicLedger
            entries={legacyEntries}
            phase={phase}
            syncProgress={1}
            isOffline={false}
            governanceLog={governanceLog}
          />
        </div>

        {/* Right Panel - Governance State (25%) */}
        <div className="h-full">
          <GovernancePanel
            state={governance}
            isOffline={false}
          />
        </div>
      </div>

      {/* Affidavit Overlay - slides up from bottom */}
      <Affidavit
        isVisible={showAffidavit}
        missionId={AFFIDAVIT_DATA.missionId}
        aircraft={AFFIDAVIT_DATA.aircraft}
        operator={AFFIDAVIT_DATA.operator}
        waypointsCompleted={5}
        waypointsTotal={5}
        flightTime={flightTime}
        anomaliesDetected={1}
        anomaliesResolved={1}
        raciHandoffs={2}
        raciCompliance={100}
        cragResolutions={1}
        reasonCodesApplied={['RC006_CONTEXT_MISSING']}
        humanOverrideEvents={1}
        humanOverrideDetails="Ground Control @ T+28"
        liabilityStatus="SHARED"
        regulatoryTrigger={null}
        blocks={blockCount}
        receipts={governanceLog.length}
        onDismiss={() => transitionToPhase('TRUST_GAP')}
      />

      {/* Trust Gap Comparison - "WHY BLACK BOXES FAIL" */}
      <TrustGap
        isVisible={showTrustGap}
        onRestart={handleRestart}
      />

      {/* Phase indicator */}
      <div
        className="fixed bottom-4 left-4 px-3 py-2"
        style={{
          backgroundColor: 'rgba(9, 9, 11, 0.9)',
          border: `1px solid ${COLORS.borderBracket}`,
          fontSize: '10px',
          fontFamily: 'monospace',
          color: COLORS.textMuted,
          zIndex: 40,
        }}
      >
        PHASE: {phase} | T+{Math.floor(elapsedTime / 1000)}s
      </div>
    </div>
  );
}

export default DeniedEnvironment;
