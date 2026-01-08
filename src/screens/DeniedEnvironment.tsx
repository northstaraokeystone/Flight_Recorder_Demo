/**
 * DeniedEnvironment - CINEMATIC SINGULARITY v3.0
 *
 * THE PARADIGM SHIFT: From Cognitive Tennis to Cinematic HUD
 *
 * KILLED:
 * - Left/Right 3-pane split layout
 * - Permanent governance panel
 * - Floating popups
 *
 * BORN:
 * - Full-bleed map with camera-locked drone
 * - Bottom-center terminal overlay for events
 * - On-change governance badges
 * - Leader line callouts
 * - Screen border pulse effects
 * - Three-Act Narrative Structure
 *
 * THE 1-SECOND TEST:
 * Can you follow the entire story without moving your eyes horizontally?
 * Eye path: Center -> Down -> Center
 * Never: Left -> Right -> Left -> Right
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { TacticalGrid, Affidavit, createLedgerEntry, InvestorNarrator } from '../components/denied';
import { createGovernanceLogEntry } from '../components/denied/CryptographicLedger';
import type { GovernanceState } from '../components/denied/GovernancePanel';
import type { ScenarioPhase, GovernanceLogEntry, DronePosition, UnknownObject } from '../constants/scenario';
import { TIMING, FLIGHT_PATH, UNKNOWN_OBJECT_LOCATION, NARRATIVE_EVENTS, AFFIDAVIT_DATA } from '../constants/scenario';
import { COLORS } from '../constants/colors';
import type { LedgerEntry } from '../components/denied/CryptographicLedger';
// SF16: generateDualHash import removed - merkleRoot moved to Affidavit only

// COCKPIT v1.0: System callout types REMOVED - only investor narrator callouts remain
// Yellow tooltips (GPS_DRIFT, CRAG_FALLBACK, RACI_HANDOFF) eliminated per "Kill the System Jargon"


// Screen border pulse state
type BorderPulseState = 'none' | 'amber' | 'red';

// Demo phases for narrative wrapper
type DemoPhase = 'BOOT' | 'RUNNING' | 'SEAL';

interface DeniedEnvironmentProps {
  onComplete?: () => void;
  autoplay?: boolean;
}

export function DeniedEnvironment({ onComplete: _onComplete, autoplay = true }: DeniedEnvironmentProps) {
  // Demo phase (for boot sequence and end seal)
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('BOOT');
  const [bootProgress, setBootProgress] = useState(0);
  const [bootText, setBootText] = useState('INITIALIZING FLIGHT RECORDER v3.0...');

  // Core state
  const [phase, setPhase] = useState<ScenarioPhase>('TAKEOFF');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

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
  // Calculate initial rotation toward first waypoint
  const initialRotation = Math.atan2(
    FLIGHT_PATH[1].y - FLIGHT_PATH[0].y,
    FLIGHT_PATH[1].x - FLIGHT_PATH[0].x
  ) * (180 / Math.PI) + 90;
  const [dronePosition, setDronePosition] = useState<DronePosition>(
    { x: FLIGHT_PATH[0].x, y: FLIGHT_PATH[0].y, rotation: initialRotation }
  );
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [visitedPathIndex, setVisitedPathIndex] = useState(0);
  const [unknownObject, setUnknownObject] = useState<UnknownObject | null>(null);

  // Log state
  const [governanceLog, setGovernanceLog] = useState<GovernanceLogEntry[]>([]);
  const [, setLegacyEntries] = useState<LedgerEntry[]>([]);
  const blockCountRef = useRef(0);

  // Cinematic HUD state - COCKPIT v1.0: System callouts removed, border pulse remains
  const [borderPulse, setBorderPulse] = useState<BorderPulseState>('none');
  const [mapOpacity, setMapOpacity] = useState(0);
  // SF16: showMerkleRoot removed - Merkle Root transition eliminated

  // End state
  const [showAffidavit, setShowAffidavit] = useState(false);

  // Investor Narrator state
  const [isAnomalyDetected, setIsAnomalyDetected] = useState(false);
  const [isMissionComplete, setIsMissionComplete] = useState(false);

  // BULLET TIME: Crisis pause state for dramatic effect
  // When anomaly fires, simulation FREEZES so viewer can read callout
  // SF15 POLISH: Increased to 4.5 seconds for "distracted CFO" readability
  const [isCrisisPaused, setIsCrisisPaused] = useState(false);
  const crisisPauseStartRef = useRef<number | null>(null);
  const CRISIS_PAUSE_DURATION = 4500; // 4.5 seconds - "distracted CFO" test passed

  // Timing refs
  const phaseStartRef = useRef(Date.now());
  const lastTickRef = useRef(Date.now());
  const startTimeRef = useRef(Date.now());

  // Helper function to calculate rotation toward a target waypoint
  // SVG chevron points UP, so add 90° offset to atan2 result
  const calculateRotationToWaypoint = (fromIdx: number, toIdx: number): number => {
    const from = FLIGHT_PATH[fromIdx];
    const to = FLIGHT_PATH[Math.min(toIdx, FLIGHT_PATH.length - 1)];
    return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI) + 90;
  };

  // SF16: merkleRoot generation moved to Affidavit component only

  // COCKPIT v1.0: Leader lines REMOVED per "Kill the System Jargon"
  // Only investor narrator callouts remain for CFO-grade presentation

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
    blockCountRef.current += 1;
    const newBlock = blockCountRef.current;

    const entry = createGovernanceLogEntry(newBlock, timestamp, eventType, detail, reasonCode, severity);
    setGovernanceLog(prev => [...prev, entry]);

    const legacyEntry = createLedgerEntry(newBlock, timestamp, eventType, detail, false, false, reasonCode || undefined);
    setLegacyEntries(prev => [...prev, legacyEntry]);
  }, []);

  // Boot sequence effect - COCKPIT v1.0: 6-7 second intro with 2s phases
  useEffect(() => {
    if (!autoplay) return;

    // SF15 POLISH: Boot sequence with +20% pacing (2.4s per phase, ~8.4s total)
    // Phase 1: "INITIALIZING PROOF SYSTEM..." - 2400ms (was 2000ms)
    // Phase 2: "ESTABLISHING SECURE LINK..." - 2400ms (was 2000ms)
    // Phase 3: "SYSTEM LIVE" + "● ONLINE" - 2400ms (was 2000ms)
    const bootSteps = [
      { time: 0, text: '', progress: 0 },                                    // T-8.4s: BLACK
      { time: 600, text: 'INITIALIZING PROOF SYSTEM...', progress: 25 },     // T-7.8s: Phase 1 (+20%)
      { time: 3000, text: 'ESTABLISHING SECURE LINK...', progress: 50 },     // T-5.4s: Phase 2 (+20%)
      { time: 5400, text: 'SYSTEM LIVE', progress: 100 },                    // T-3.0s: Phase 3 (+20%)
    ];

    bootSteps.forEach(step => {
      setTimeout(() => {
        setBootText(step.text);
        setBootProgress(step.progress);
      }, step.time);
    });

    // Grid fades in at T-1.8s (+20%)
    setTimeout(() => {
      setMapOpacity(0.5); // Start fading in
    }, 6600);

    // Drone appears at T-0.6s, full opacity (+20%)
    setTimeout(() => {
      setMapOpacity(1);
    }, 7800);

    // Transition to running at T+0.0s (8.4 second intro total, +20%)
    setTimeout(() => {
      setDemoPhase('RUNNING');
      startTimeRef.current = Date.now();
      phaseStartRef.current = Date.now();
      setIsRunning(true);
      transitionToPhase('TAKEOFF');
    }, 8400);
  }, [autoplay]);

  // Phase transition logic
  const transitionToPhase = useCallback((newPhase: ScenarioPhase) => {
    setPhase(newPhase);
    phaseStartRef.current = Date.now();

    switch (newPhase) {
      case 'TAKEOFF':
        addLogEntry('WAYPOINT_ACHIEVED', 'TAKEOFF', null, 'SUCCESS');
        break;

      case 'WAYPOINT_1':
        setCurrentWaypoint(1);
        setVisitedPathIndex(1);
        setDronePosition({ x: FLIGHT_PATH[1].x, y: FLIGHT_PATH[1].y, rotation: calculateRotationToWaypoint(1, 2) });
        addLogEntry('WAYPOINT_ACHIEVED', 'WPT_1', null, 'SUCCESS');
        addLogEntry('CONFIDENCE_UPDATE', '0.98', null, 'INFO');
        setGovernance(prev => ({ ...prev, confidence: 0.98 }));
        break;

      case 'WAYPOINT_2':
        setCurrentWaypoint(2);
        setVisitedPathIndex(2);
        setDronePosition({ x: FLIGHT_PATH[2].x, y: FLIGHT_PATH[2].y, rotation: calculateRotationToWaypoint(2, 3) });
        addLogEntry('WAYPOINT_ACHIEVED', 'WPT_2', null, 'SUCCESS');
        addLogEntry('CONFIDENCE_UPDATE', '0.97', null, 'INFO');
        setGovernance(prev => ({ ...prev, confidence: 0.97 }));
        break;

      case 'UNCERTAINTY_DETECTED':
        setCurrentWaypoint(3);
        setVisitedPathIndex(3);
        setDronePosition({ x: FLIGHT_PATH[3].x, y: FLIGHT_PATH[3].y, rotation: calculateRotationToWaypoint(3, 4) });
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

        // COCKPIT v1.0: System tooltips REMOVED - only investor narrator callouts remain
        // Yellow GPS_DRIFT callout eliminated per "Kill the System Jargon"
        setBorderPulse('amber');
        // Investor Narrator: Mark anomaly detected (THE MONEY SHOT callout handles CFO messaging)
        setIsAnomalyDetected(true);

        // BULLET TIME: FREEZE simulation for 3 seconds
        // This is the dramatic pause - let the danger breathe
        // Drone stops, red vector visible, callout readable for full 3 seconds
        setIsCrisisPaused(true);
        crisisPauseStartRef.current = Date.now();
        break;

      case 'CRAG_TRIGGERED':
        addLogEntry('CRAG_FALLBACK_TRIGGERED', 'External knowledge required', null, 'WARN');
        setGovernance(prev => ({
          ...prev,
          crag: 'QUERYING',
          mode: 'SUPERVISED',
        }));
        // COCKPIT v1.0: CRAG_FALLBACK callout REMOVED per "Kill the System Jargon"
        // Investor narrator provides all CFO-grade messaging
        break;

      case 'HUMAN_QUERY':
        addLogEntry('EXTERNAL_QUERY', NARRATIVE_EVENTS.CRAG_QUERY.message, null, 'INFO');
        addLogEntry('RACI_HANDOFF', 'AI -> HUMAN', null, 'INFO');
        setGovernance(prev => ({
          ...prev,
          raci: 'HUMAN_IN_LOOP',
          crag: 'ACTIVE',
        }));
        // COCKPIT v1.0: RACI_HANDOFF callout REMOVED per "Kill the System Jargon"
        // Border pulse remains for visual feedback
        setBorderPulse('red');
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
        // COCKPIT v1.0: Reset border pulse (no system callouts to clear)
        setBorderPulse('none');
        break;

      case 'RACI_HANDOFF_BACK':
        addLogEntry('RACI_HANDOFF', 'HUMAN -> AI', null, 'INFO');
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
        setDronePosition({ x: FLIGHT_PATH[5].x, y: FLIGHT_PATH[5].y, rotation: calculateRotationToWaypoint(5, 6) });
        addLogEntry('ROUTE_RESUMED', 'Original route', null, 'SUCCESS');
        addLogEntry('CONFIDENCE_UPDATE', '0.96', null, 'INFO');
        setGovernance(prev => ({ ...prev, confidence: 0.96 }));
        break;

      case 'MISSION_COMPLETE':
        setCurrentWaypoint(6);
        setVisitedPathIndex(6);
        // At final destination: keep last calculated rotation (no next waypoint)
        setDronePosition(prev => ({ x: FLIGHT_PATH[6].x, y: FLIGHT_PATH[6].y, rotation: prev.rotation }));
        addLogEntry('MISSION_COMPLETE', '5/5 waypoints', null, 'SUCCESS');
        addLogEntry('CHAIN_VERIFY', 'INTEGRITY 100%', null, 'SUCCESS');
        setGovernance(prev => ({ ...prev, confidence: 0.98 }));
        // Investor Narrator: Mark mission complete
        setIsMissionComplete(true);

        // Start the seal sequence after 2 seconds
        // SF16 POLISH: Removed Merkle Root transition - go straight to Affidavit
        // Map stays visible (dimmed by affidavit backdrop) for immersion
        setTimeout(() => {
          setDemoPhase('SEAL');
          // Keep map visible - the affidavit backdrop will dim it
          setMapOpacity(0.6);
          // Brief "VERIFYING..." then show Affidavit
          setTimeout(() => {
            setShowAffidavit(true);
          }, 2500);
        }, 2000);
        break;

      case 'AFFIDAVIT':
        setShowAffidavit(true);
        setIsRunning(false);
        break;

      // TRUST_GAP REMOVED - Demo ends on Affidavit (Deal-Killer #4)
    }
  }, [addLogEntry]);

  // Main simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const now = Date.now();
      setElapsedTime(now - startTimeRef.current);
      lastTickRef.current = now;

      // BULLET TIME: Check if crisis pause should end
      if (isCrisisPaused && crisisPauseStartRef.current) {
        const pauseElapsed = now - crisisPauseStartRef.current;
        if (pauseElapsed >= CRISIS_PAUSE_DURATION) {
          // Resume simulation after 3 seconds
          setIsCrisisPaused(false);
          crisisPauseStartRef.current = null;
          // Reset phase start time so UNCERTAINTY_DETECTED duration counts from resume
          phaseStartRef.current = now;
        }
        // While paused: no phase transitions, no drone movement
        // Scene is frozen - viewer can read the callout
        return;
      }

      const phaseElapsed = now - phaseStartRef.current;

      // Phase transitions
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
          if (phaseElapsed >= TIMING.PHASE_WAYPOINT_DURATION + TIMING.PHASE_UNCERTAINTY_PAUSE) {
            transitionToPhase('UNCERTAINTY_DETECTED');
          }
          break;

        case 'UNCERTAINTY_DETECTED':
          // BULLET TIME: Phase duration starts AFTER the 3-second pause ends
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
      }

      // Smooth drone position interpolation with dynamic rotation
      // BULLET TIME: Also skip drone movement during crisis pause
      if (phase !== 'AFFIDAVIT' && phase !== 'TRUST_GAP' && phase !== 'MISSION_COMPLETE' && !isCrisisPaused) {
        const targetIdx = Math.min(currentWaypoint + 1, FLIGHT_PATH.length - 1);
        const target = FLIGHT_PATH[targetIdx];
        setDronePosition(prev => {
          // Calculate direction vector to target
          const dx = target.x - prev.x;
          const dy = target.y - prev.y;

          // Calculate rotation from direction of travel
          // atan2 returns angle from positive X-axis (East = 0°)
          // SVG chevron points UP by default, so add 90° offset
          const rotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

          return {
            x: prev.x + dx * 0.03,
            y: prev.y + dy * 0.03,
            rotation: rotation,
          };
        });
      }
    };

    const interval = setInterval(tick, 50);
    return () => clearInterval(interval);
  }, [isRunning, phase, currentWaypoint, transitionToPhase, isCrisisPaused, CRISIS_PAUSE_DURATION]);

  // Handle restart - v4.0 GLASS COCKPIT enhanced
  const handleRestart = useCallback(() => {
    setDemoPhase('BOOT');
    setBootProgress(0);
    setBootText('');
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
    setDronePosition({ x: FLIGHT_PATH[0].x, y: FLIGHT_PATH[0].y, rotation: calculateRotationToWaypoint(0, 1) });
    setCurrentWaypoint(0);
    setVisitedPathIndex(0);
    setUnknownObject(null);
    setGovernanceLog([]);
    setLegacyEntries([]);
    blockCountRef.current = 0;
    // COCKPIT v1.0: System callouts removed, only reset border pulse
    setBorderPulse('none');
    setMapOpacity(0);
    // SF16: setShowMerkleRoot removed - Merkle Root transition eliminated
    setShowAffidavit(false);
    // Reset Investor Narrator state
    setIsAnomalyDetected(false);
    setIsMissionComplete(false);

    // Reset BULLET TIME state
    setIsCrisisPaused(false);
    crisisPauseStartRef.current = null;

    // SF15 POLISH: Restart boot sequence - 8.4 second intro (+20% pacing)
    const bootSteps = [
      { time: 0, text: '', progress: 0 },
      { time: 600, text: 'INITIALIZING PROOF SYSTEM...', progress: 25 },
      { time: 3000, text: 'ESTABLISHING SECURE LINK...', progress: 50 },
      { time: 5400, text: 'SYSTEM LIVE', progress: 100 },
    ];

    bootSteps.forEach(step => {
      setTimeout(() => {
        setBootText(step.text);
        setBootProgress(step.progress);
      }, step.time);
    });

    // Grid fades in (+20%)
    setTimeout(() => {
      setMapOpacity(0.5);
    }, 6600);

    setTimeout(() => {
      setMapOpacity(1);
    }, 7800);

    setTimeout(() => {
      setDemoPhase('RUNNING');
      startTimeRef.current = Date.now();
      phaseStartRef.current = Date.now();
      lastTickRef.current = Date.now();
      setIsRunning(true);
      transitionToPhase('TAKEOFF');
    }, 8400);
  }, [transitionToPhase]);

  // Calculate flight time for affidavit
  const flightTimeMs = elapsedTime;
  const minutes = Math.floor(flightTimeMs / 60000);
  const seconds = Math.floor((flightTimeMs % 60000) / 1000);
  const flightTime = `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Get border pulse style
  const getBorderPulseStyle = () => {
    if (borderPulse === 'none') return {};
    const color = borderPulse === 'red' ? COLORS.alertRed : '#d97706';
    return {
      boxShadow: `inset 0 0 60px ${color}40, inset 0 0 120px ${color}20`,
      animation: 'borderPulseGlow 1.5s ease-in-out infinite',
    };
  };

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{
        backgroundColor: COLORS.bgPrimary,
        ...getBorderPulseStyle(),
      }}
    >
      {/* ===== ACT I: BOOT SEQUENCE - v4.0 GLASS COCKPIT ===== */}
      {/* FIX: Full viewport flexbox centering with explicit inline styles for dead-center text */}
      {demoPhase === 'BOOT' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100vw',
            height: '100vh',
          }}
        >
          <div
            className="text-center"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              textAlign: 'center',
            }}
          >
            {/* Boot text with typewriter effect - v4.0 spec - CENTERED + HUGE for investors */}
            <div
              className="mb-8"
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#F1F5F9',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'color 0.3s',
                minHeight: '48px',
                textShadow: '0 0 30px rgba(241, 245, 249, 0.3)',
              }}
            >
              {bootText && (
                <span
                  className={bootProgress < 100 ? 'typewriter-cursor' : ''}
                  style={{
                    animation: bootProgress < 100 ? 'none' : 'none',
                  }}
                >
                  {bootText}
                </span>
              )}
              {bootProgress < 100 && bootText && (
                <span style={{ animation: 'cursorBlink 1s step-end infinite' }}>_</span>
              )}
            </div>

            {/* SYSTEM LIVE flash effect - sized for investor visibility */}
            {bootProgress === 100 && (
              <div
                className="animate-pulse"
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#10B981',
                  letterSpacing: '0.2em',
                  marginTop: '24px',
                  textShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                }}
              >
                ● ONLINE
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ACT II: THE MISSION (Full-bleed map) ===== */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: mapOpacity }}
      >
        <TacticalGrid
          dronePosition={dronePosition}
          phase={phase}
          visitedPathIndex={visitedPathIndex}
          unknownObject={unknownObject}
          currentWaypoint={currentWaypoint}
          confidence={governance.confidence}
        />
      </div>

      {/* ===== INVESTOR NARRATOR v2.0 - CFO-Grade Value Translation ===== */}
      {demoPhase === 'RUNNING' && (
        <InvestorNarrator
          waypointCount={currentWaypoint}
          confidence={governance.confidence}
          isAnomalyDetected={isAnomalyDetected}
          isMissionComplete={isMissionComplete}
          anomaliesDetected={1}
          anomaliesCorrected={1}
          onViewVerification={() => setShowAffidavit(true)}
        />
      )}

      {/* ===== SF16 POLISH: STYLED HUD GAUGES - Bottom-center, glass cockpit style ===== */}
      {/* LAYOUT FIX: Meters styled with glass container, gradients, threshold markers */}
      {/* SF15 POLISH: FOCUS MODE - dims to 50% during crisis */}
      {demoPhase === 'RUNNING' && (
        <div
          className="z-40"
          style={{
            position: 'fixed',
            bottom: '70px',  // COCKPIT: 60-80px from bottom, above browser chrome
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',  // SF16: Slightly more opaque
            backdropFilter: 'blur(12px)',      // SF16: Stronger blur
            border: '1px solid rgba(255, 255, 255, 0.15)',  // SF16: More visible border
            borderRadius: '8px',               // SF16: Rounder corners
            padding: '16px 24px',              // SF16: More padding
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',  // SF16: Depth
            // SF15 FOCUS MODE: Dim to 50% during crisis, 90% normal (brighter)
            opacity: isCrisisPaused ? 0.5 : 0.9,
            transition: 'opacity 0.5s ease-out',
          }}
        >
          {/* CONFIDENCE Gauge - SF16: Enhanced with threshold marker */}
          <div className="flex items-center gap-3">
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#CBD5E1',  // SF16: Brighter label
                fontFamily: 'Inter, sans-serif',
              }}
            >
              CONFIDENCE
            </span>
            <div
              style={{
                position: 'relative',
                width: '120px',
                height: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '5px',
                overflow: 'visible',  // SF16: Allow threshold marker to show
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Progress bar with gradient */}
              <div
                style={{
                  width: `${governance.confidence * 100}%`,
                  height: '100%',
                  background: governance.confidence > 0.80
                    ? 'linear-gradient(90deg, #059669, #10B981)'
                    : governance.confidence > 0.60
                    ? 'linear-gradient(90deg, #b45309, #d97706)'
                    : 'linear-gradient(90deg, #dc2626, #ef4444)',
                  transition: 'width 300ms ease-out, background 300ms ease-out',
                  borderRadius: '4px',
                  boxShadow: governance.confidence > 0.80
                    ? '0 0 8px rgba(16, 185, 129, 0.4)'
                    : governance.confidence > 0.60
                    ? '0 0 8px rgba(217, 119, 6, 0.4)'
                    : '0 0 8px rgba(239, 68, 68, 0.4)',
                }}
              />
              {/* Threshold marker at 80% */}
              <div
                style={{
                  position: 'absolute',
                  left: '80%',
                  top: '-3px',
                  bottom: '-3px',
                  width: '2px',
                  backgroundColor: '#F1F5F9',
                  opacity: 0.6,
                  borderRadius: '1px',
                }}
                title="80% threshold"
              />
            </div>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                color: governance.confidence > 0.80 ? '#34D399' :
                       governance.confidence > 0.60 ? '#FCD34D' : '#FCA5A5',
                minWidth: '40px',
                textShadow: '0 0 10px currentColor',  // SF16: Glow effect
              }}
            >
              {Math.round(governance.confidence * 100)}%
            </span>
          </div>

          {/* Divider - SF16: More visible */}
          <div
            style={{
              width: '1px',
              height: '28px',
              background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            }}
          />

          {/* ENTROPY Gauge - SF16: Enhanced with threshold marker */}
          {(() => {
            // Calculate entropy based on phase (higher during uncertainty)
            const entropy = ['UNCERTAINTY_DETECTED', 'CRAG_TRIGGERED', 'HUMAN_QUERY'].includes(phase)
              ? 0.72
              : ['HUMAN_RESPONSE', 'RACI_HANDOFF_BACK'].includes(phase)
                ? 0.45
                : 0.18;

            return (
              <div className="flex items-center gap-3">
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#CBD5E1',  // SF16: Brighter label
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  ENTROPY
                </span>
                <div
                  style={{
                    position: 'relative',
                    width: '120px',
                    height: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '5px',
                    overflow: 'visible',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Progress bar with gradient */}
                  <div
                    style={{
                      width: `${entropy * 100}%`,
                      height: '100%',
                      // Entropy: LOW is good (green), HIGH is bad (red)
                      background: entropy < 0.40
                        ? 'linear-gradient(90deg, #059669, #10B981)'
                        : entropy < 0.60
                        ? 'linear-gradient(90deg, #b45309, #d97706)'
                        : 'linear-gradient(90deg, #dc2626, #ef4444)',
                      transition: 'width 300ms ease-out, background 300ms ease-out',
                      borderRadius: '4px',
                      boxShadow: entropy < 0.40
                        ? '0 0 8px rgba(16, 185, 129, 0.4)'
                        : entropy < 0.60
                        ? '0 0 8px rgba(217, 119, 6, 0.4)'
                        : '0 0 8px rgba(239, 68, 68, 0.4)',
                    }}
                  />
                  {/* Threshold marker at 50% */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '-3px',
                      bottom: '-3px',
                      width: '2px',
                      backgroundColor: '#F1F5F9',
                      opacity: 0.6,
                      borderRadius: '1px',
                    }}
                    title="50% threshold"
                  />
                </div>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: entropy < 0.40 ? '#34D399' :
                           entropy < 0.60 ? '#FCD34D' : '#FCA5A5',
                    minWidth: '40px',
                    textShadow: '0 0 10px currentColor',  // SF16: Glow effect
                  }}
                >
                  {Math.round(entropy * 100)}%
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {/* COCKPIT v1.0: Leader Lines REMOVED - "Kill the System Jargon" */}
      {/* Yellow tooltips with CRAG_FALLBACK, RACI_HANDOFF, hex addresses are eliminated */}
      {/* Only investor narrator callouts remain for clean, CFO-grade presentation */}

      {/* ===== SF16 POLISH: CENTER CONSOLE Event Stream ===== */}
      {/* LAYOUT FIX: Terminal moved from LEFT EDGE to CENTER-LEFT under drone */}
      {/* Part of the "center console" zone - feels like cockpit instrument cluster */}
      {/* SF15 POLISH: FOCUS MODE - dims to 40% during crisis for "one focus point" */}
      {demoPhase === 'RUNNING' && (
        <div
          className="z-30"
          style={{
            position: 'fixed',
            top: '55%',            // SF16: Below drone (drone is at 40%)
            left: '5%',            // SF16: Left of center, part of console zone
            width: '300px',        // SF16: 280-320px, compact
            maxHeight: '240px',    // SF16: 200-250px max, scrollable
            background: 'rgba(0, 0, 0, 0.6)',  // SF16: Slightly more opaque for readability
            backdropFilter: 'blur(8px)',       // SF16: Glass effect
            border: '1px solid rgba(255, 255, 255, 0.1)',  // SF16: Subtle border
            borderRadius: '8px',   // SF16: Rounded corners
            padding: '16px',
            overflow: 'hidden',
            // SF15 FOCUS MODE: Dim to 40% during crisis, 85% normal (brighter for Zoom)
            opacity: isCrisisPaused ? 0.4 : 0.85,
            transition: 'opacity 0.5s ease-out',
          }}
        >
          {/* COCKPIT v1.0: Event stream - left-aligned, compact */}
          {/* SF15 POLISH: Human-readable event names per "Clean Event Stream" directive */}
          <div
            className="flex flex-col h-full overflow-hidden"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {/* Stream header - SF16: Brighter for Zoom compression */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#94A3B8',  // SF16: Brighter (#64748B -> #94A3B8)
                letterSpacing: '0.1em',
                marginBottom: '12px',
                textTransform: 'uppercase',
              }}
            >
              EVENT STREAM
            </div>

            {governanceLog.length === 0 ? (
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#94A3B8',  // SF16: Brighter
                  opacity: 0.8,     // SF16: Higher opacity
                }}
              >
                AWAITING EVENTS...
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto" style={{ flex: 1 }}>
                {/* COCKPIT: Newest at top, show event type + timestamp only */}
                {[...governanceLog].reverse().slice(0, 15).map((entry, idx) => {
                  const isCritical = entry.severity === 'CRITICAL';
                  const isWarning = entry.severity === 'WARN';
                  const isSuccess = entry.severity === 'SUCCESS';

                  // SF15 POLISH: Human-readable event name mapping
                  // "If a CFO wouldn't understand it, rename it or remove it"
                  const getDisplayName = (eventType: string): string => {
                    const nameMap: Record<string, string> = {
                      'WAYPOINT_ACHIEVED': '✓ WAYPOINT',
                      'CONFIDENCE_UPDATE': 'CONFIDENCE',
                      'UNCERTAINTY_DETECTED': '⚠ ANOMALY',
                      'CRAG_FALLBACK_TRIGGERED': 'FALLBACK',
                      'EXTERNAL_QUERY': 'GROUND_QUERY',
                      'GROUND_CONTROL_RESPONSE': 'CTRL_RESPONSE',
                      'RACI_HANDOFF': 'CONTROL_XFER',
                      'ROUTE_RESUMED': '✓ ROUTE_OK',
                      'MISSION_COMPLETE': '✓ COMPLETE',
                      'CHAIN_VERIFY': '✓ VERIFIED',
                    };
                    return nameMap[eventType] || eventType;
                  };

                  // SF16 POLISH: Entry fade effect - brighter for Zoom compression
                  // Increased minimum opacity from 0.3 to 0.5 for readability
                  const opacityMap = [1.0, 0.95, 0.9, 0.88, 0.85, 0.82, 0.78, 0.75, 0.70, 0.65, 0.60, 0.58, 0.55, 0.52, 0.50];
                  const entryOpacity = opacityMap[idx] || 0.5;

                  return (
                    <div
                      key={entry.blockId}
                      className={`py-1 ${idx === 0 ? 'animate-fadeIn' : ''}`}
                      style={{
                        opacity: entryOpacity,
                        lineHeight: '1.4',
                        transition: 'opacity 0.5s ease-out',
                        textAlign: 'left',  // COCKPIT: Left-aligned
                      }}
                    >
                      {/* SF16: Compact format - [##] EVENT_TYPE  timestamp */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,  // SF16: Bolder
                            color: '#94A3B8', // SF16: Brighter (#64748B -> #94A3B8)
                          }}
                        >
                          [{String(entry.blockId).padStart(2, '0')}]
                        </span>

                        <span
                          style={{
                            fontSize: isCritical ? '13px' : '12px',
                            fontWeight: isCritical ? 700 : isSuccess ? 600 : 500,
                            color: isCritical ? '#FCA5A5' :  // SF16: Brighter red
                                   isWarning ? '#FCD34D' :   // SF16: Brighter amber
                                   isSuccess ? '#34D399' :   // SF16: Brighter green
                                   '#E2E8F0',                // SF16: Brighter default
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getDisplayName(entry.eventType)}
                          {entry.detail && (
                            <span style={{ color: '#B0B8C4', marginLeft: '6px', fontSize: '11px' }}>
                              {entry.detail}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Timestamp on second line - SF16: Brighter */}
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#64748B',  // SF16: Brighter (#475569 -> #64748B)
                          marginLeft: '32px',
                          marginTop: '2px',
                        }}
                      >
                        {entry.timestamp}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Block count - SF16: Brighter for readability */}
            <div
              className="mt-auto pt-4"
              style={{
                fontSize: '10px',
                color: '#94A3B8',  // SF16: Brighter
                opacity: 0.8,     // SF16: Higher opacity
                textAlign: 'left',
              }}
            >
              {governanceLog.length} BLOCKS LOGGED
            </div>
          </div>
        </div>
      )}


      {/* ===== ACT III: THE SEAL - v4.0 GLASS COCKPIT ===== */}
      {/* SF16 POLISH: Merkle Root transition REMOVED per "Kill Merkle Root" directive */}
      {/* The hash is technical proof detail - belongs in final verification, not as floating element */}
      {/* Transition goes straight from mission complete to Affidavit */}
      {demoPhase === 'SEAL' && !showAffidavit && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center"
          style={{
            backgroundColor: 'rgba(9, 9, 11, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {/* Brief "VERIFYING..." transition */}
          <div
            className="text-center animate-pulse"
            style={{
              animation: 'fadeIn 1s ease-out forwards',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#10B981',
                letterSpacing: '0.15em',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              VERIFYING CHAIN INTEGRITY...
            </div>
          </div>
        </div>
      )}

      {/* ===== Phase indicator (small, bottom left) ===== */}
      {demoPhase === 'RUNNING' && (
        <div
          className="fixed bottom-4 left-4 px-3 py-2 z-30"
          style={{
            backgroundColor: 'rgba(9, 9, 11, 0.85)',
            backdropFilter: 'blur(4px)',
            border: `1px solid ${COLORS.borderBracket}`,
            borderRadius: '4px',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            color: COLORS.textTimestamp,
          }}
        >
          T+{Math.floor(elapsedTime / 1000)}s
        </div>
      )}

      {/* ===== Affidavit Overlay - THE MIC DROP. NOTHING AFTER. ===== */}
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
        blocks={blockCountRef.current}
        receipts={governanceLog.length}
        onRestart={handleRestart}
      />

      {/* TrustGap REMOVED from demo flow per Deal-Killer #4
       * The comparison slide is for pitch deck, not the software demo.
       * Demo ends on Affidavit. That is the mic drop.
       */}
    </div>
  );
}

export default DeniedEnvironment;
