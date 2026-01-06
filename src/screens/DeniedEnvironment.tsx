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

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TacticalGrid, Affidavit, createLedgerEntry } from '../components/denied';
import { createGovernanceLogEntry } from '../components/denied/CryptographicLedger';
import type { GovernanceState } from '../components/denied/GovernancePanel';
import type { ScenarioPhase, GovernanceLogEntry, DronePosition, UnknownObject } from '../constants/scenario';
import { TIMING, FLIGHT_PATH, UNKNOWN_OBJECT_LOCATION, NARRATIVE_EVENTS, AFFIDAVIT_DATA } from '../constants/scenario';
import { COLORS } from '../constants/colors';
import type { LedgerEntry } from '../components/denied/CryptographicLedger';
import { generateDualHash } from '../utils/crypto';

// Callout types for leader lines
type CalloutType = 'GPS_DRIFT' | 'CRAG_FALLBACK' | 'RACI_HANDOFF' | 'CONFIDENCE_DROP';

interface ActiveCallout {
  type: CalloutType;
  message: string;
  severity: 'warning' | 'critical';
}

// v4.0: Leader Line for Action-Reaction Connectors
interface LeaderLine {
  id: string;
  eventType: string;
  hash: string;
  severity: 'warning' | 'critical';
  createdAt: number;
  targetIndex: number; // Which log entry to connect to
}


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
  const [dronePosition, setDronePosition] = useState<DronePosition>(
    { x: FLIGHT_PATH[0].x, y: FLIGHT_PATH[0].y, rotation: 45 }
  );
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [visitedPathIndex, setVisitedPathIndex] = useState(0);
  const [unknownObject, setUnknownObject] = useState<UnknownObject | null>(null);

  // Log state
  const [governanceLog, setGovernanceLog] = useState<GovernanceLogEntry[]>([]);
  const [, setLegacyEntries] = useState<LedgerEntry[]>([]);
  const blockCountRef = useRef(0);

  // Cinematic HUD state
  const [activeCallout, setActiveCallout] = useState<ActiveCallout | null>(null);
  const [borderPulse, setBorderPulse] = useState<BorderPulseState>('none');
  const [mapOpacity, setMapOpacity] = useState(0);
  const [showMerkleRoot, setShowMerkleRoot] = useState(false);
  const [leaderLines, setLeaderLines] = useState<LeaderLine[]>([]);

  // End state
  const [showAffidavit, setShowAffidavit] = useState(false);

  // Timing refs
  const phaseStartRef = useRef(Date.now());
  const lastTickRef = useRef(Date.now());
  const startTimeRef = useRef(Date.now());

  // Generate Merkle root for seal
  const merkleRoot = useMemo(() => {
    return generateDualHash(`merkle-root-${AFFIDAVIT_DATA.missionId}-final`).sha256;
  }, []);

  // v4.0: Add leader line for Action-Reaction Connectors
  const addLeaderLine = useCallback((eventType: string, hash: string, severity: 'warning' | 'critical') => {
    const newLine: LeaderLine = {
      id: `line-${Date.now()}`,
      eventType,
      hash,
      severity,
      createdAt: Date.now(),
      targetIndex: 0, // Always connects to newest entry (top of terminal)
    };
    setLeaderLines(prev => [...prev, newLine]);

    // Auto-remove after 5 seconds with fade
    setTimeout(() => {
      setLeaderLines(prev => prev.filter(l => l.id !== newLine.id));
    }, 5000);
  }, []);

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

  // Boot sequence effect - v4.0 GLASS COCKPIT enhanced cinematic
  useEffect(() => {
    if (!autoplay) return;

    // v4.0: Boot sequence as per spec - 5 second intro
    const bootSteps = [
      { time: 0, text: '', progress: 0 },                                    // T-5.0s: BLACK
      { time: 1000, text: 'INITIALIZING PROOF CHAIN...', progress: 20 },     // T-4.0s
      { time: 2500, text: 'LINKING MERKLE ANCHORS...', progress: 60 },       // T-2.5s
      { time: 3500, text: 'SYSTEM LIVE', progress: 100 },                    // T-1.5s
    ];

    bootSteps.forEach(step => {
      setTimeout(() => {
        setBootText(step.text);
        setBootProgress(step.progress);
      }, step.time);
    });

    // Grid fades in at T-1.0s
    setTimeout(() => {
      setMapOpacity(0.5); // Start fading in
    }, 4000);

    // Drone appears at T-0.5s, full opacity
    setTimeout(() => {
      setMapOpacity(1);
    }, 4500);

    // Transition to running at T+0.0s
    setTimeout(() => {
      setDemoPhase('RUNNING');
      startTimeRef.current = Date.now();
      phaseStartRef.current = Date.now();
      setIsRunning(true);
      transitionToPhase('TAKEOFF');
    }, 5000);
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

        // Cinematic effects: callout, border pulse
        setActiveCallout({
          type: 'GPS_DRIFT',
          message: 'GPS signal degradation detected',
          severity: 'critical',
        });
        setBorderPulse('amber');
        // v4.0: Leader line for GPS_DRIFT event
        addLeaderLine('GPS_DRIFT', generateDualHash('gps-drift').sha256.slice(0, 8), 'critical');
        break;

      case 'CRAG_TRIGGERED':
        addLogEntry('CRAG_FALLBACK_TRIGGERED', 'External knowledge required', null, 'WARN');
        setGovernance(prev => ({
          ...prev,
          crag: 'QUERYING',
          mode: 'SUPERVISED',
        }));

        // Cinematic effects
        setActiveCallout({
          type: 'CRAG_FALLBACK',
          message: 'Querying external knowledge',
          severity: 'warning',
        });
        // v4.0: Leader line for CRAG fallback
        addLeaderLine('CRAG_FALLBACK', generateDualHash('crag-fallback').sha256.slice(0, 8), 'warning');
        break;

      case 'HUMAN_QUERY':
        addLogEntry('EXTERNAL_QUERY', NARRATIVE_EVENTS.CRAG_QUERY.message, null, 'INFO');
        addLogEntry('RACI_HANDOFF', 'AI -> HUMAN', null, 'INFO');
        setGovernance(prev => ({
          ...prev,
          raci: 'HUMAN_IN_LOOP',
          crag: 'ACTIVE',
        }));

        // Cinematic effects: THE KEY MOMENT
        setActiveCallout({
          type: 'RACI_HANDOFF',
          message: 'Control to Safety Officer',
          severity: 'critical',
        });
        setBorderPulse('red');
        // v4.0: Leader line for RACI handoff - THE KEY MOMENT
        addLeaderLine('RACI_HANDOFF', generateDualHash('raci-handoff').sha256.slice(0, 8), 'critical');
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

        // Cinematic effects
        setActiveCallout(null);
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

        // Start the seal sequence after 2 seconds
        // Map stays visible (dimmed by affidavit backdrop) for immersion
        setTimeout(() => {
          setDemoPhase('SEAL');
          // Keep map visible - the affidavit backdrop will dim it
          setMapOpacity(0.6);
          setTimeout(() => {
            setShowMerkleRoot(true);
          }, 2000);
          setTimeout(() => {
            setShowAffidavit(true);
          }, 6000);
        }, 2000);
        break;

      case 'AFFIDAVIT':
        setShowAffidavit(true);
        setIsRunning(false);
        break;

      // TRUST_GAP REMOVED - Demo ends on Affidavit (Deal-Killer #4)
    }
  }, [addLogEntry, addLeaderLine]);

  // Main simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const now = Date.now();
      const phaseElapsed = now - phaseStartRef.current;
      setElapsedTime(now - startTimeRef.current);
      lastTickRef.current = now;

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
    setDronePosition({ x: FLIGHT_PATH[0].x, y: FLIGHT_PATH[0].y, rotation: 45 });
    setCurrentWaypoint(0);
    setVisitedPathIndex(0);
    setUnknownObject(null);
    setGovernanceLog([]);
    setLegacyEntries([]);
    blockCountRef.current = 0;
    setActiveCallout(null);
    setLeaderLines([]);
    setBorderPulse('none');
    setMapOpacity(0);
    setShowMerkleRoot(false);
    setShowAffidavit(false);

    // v4.0: Restart boot sequence - 5 second intro
    const bootSteps = [
      { time: 0, text: '', progress: 0 },
      { time: 1000, text: 'INITIALIZING PROOF CHAIN...', progress: 20 },
      { time: 2500, text: 'LINKING MERKLE ANCHORS...', progress: 60 },
      { time: 3500, text: 'SYSTEM LIVE', progress: 100 },
    ];

    bootSteps.forEach(step => {
      setTimeout(() => {
        setBootText(step.text);
        setBootProgress(step.progress);
      }, step.time);
    });

    // Grid fades in
    setTimeout(() => {
      setMapOpacity(0.5);
    }, 4000);

    setTimeout(() => {
      setMapOpacity(1);
    }, 4500);

    setTimeout(() => {
      setDemoPhase('RUNNING');
      startTimeRef.current = Date.now();
      phaseStartRef.current = Date.now();
      lastTickRef.current = Date.now();
      setIsRunning(true);
      transitionToPhase('TAKEOFF');
    }, 5000);
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
      {demoPhase === 'BOOT' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div
            className="text-center"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {/* Boot text with typewriter effect - v4.0 spec */}
            <div
              className="mb-8"
              style={{
                fontSize: '16px',
                color: bootProgress === 100 ? '#F8FAFC' : '#94A3B8',
                letterSpacing: '0.05em',
                transition: 'color 0.3s',
                minHeight: '24px',
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

            {/* SYSTEM LIVE flash effect */}
            {bootProgress === 100 && (
              <div
                className="animate-pulse"
                style={{
                  fontSize: '12px',
                  color: '#10B981',
                  letterSpacing: '0.15em',
                  marginTop: '16px',
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
          activeCallout={activeCallout}
        />
      </div>

      {/* ===== v4.0: F-35 HUD GAUGES - Top-center, fighter jet style ===== */}
      {demoPhase === 'RUNNING' && (
        <div
          className="z-40"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            padding: '12px 20px',
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          {/* CONFIDENCE Gauge */}
          <div className="flex items-center gap-3">
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#94A3B8',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              CONFIDENCE
            </span>
            <div
              style={{
                width: '100px',
                height: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${governance.confidence * 100}%`,
                  height: '100%',
                  backgroundColor: governance.confidence > 0.80 ? '#10B981' :
                                   governance.confidence > 0.60 ? '#d97706' : '#ef4444',
                  transition: 'width 300ms ease-out, background-color 300ms ease-out',
                  borderRadius: '2px',
                }}
              />
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
                color: governance.confidence > 0.80 ? '#10B981' :
                       governance.confidence > 0.60 ? '#d97706' : '#ef4444',
                minWidth: '36px',
              }}
            >
              {Math.round(governance.confidence * 100)}%
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '1px',
              height: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />

          {/* ENTROPY Gauge - calculated from phase */}
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
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#94A3B8',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  ENTROPY
                </span>
                <div
                  style={{
                    width: '100px',
                    height: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${entropy * 100}%`,
                      height: '100%',
                      // Entropy: LOW is good (green), HIGH is bad (red)
                      backgroundColor: entropy < 0.40 ? '#10B981' :
                                       entropy < 0.60 ? '#d97706' : '#ef4444',
                      transition: 'width 300ms ease-out, background-color 300ms ease-out',
                      borderRadius: '2px',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: entropy < 0.40 ? '#10B981' :
                           entropy < 0.60 ? '#d97706' : '#ef4444',
                    minWidth: '36px',
                  }}
                >
                  {Math.round(entropy * 100)}%
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {/* ===== v4.0: LEADER LINES SVG OVERLAY - Action-Reaction Connectors ===== */}
      {demoPhase === 'RUNNING' && leaderLines.length > 0 && (
        <svg
          className="fixed inset-0 z-25 pointer-events-none"
          style={{ width: '100vw', height: '100vh' }}
        >
          <defs>
            {/* Glow filter for leader lines */}
            <filter id="leader-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {leaderLines.map((line, idx) => {
            const age = Date.now() - line.createdAt;
            const opacity = age > 4500 ? 0.3 : 1; // Fade in last 500ms
            const lineColor = line.severity === 'critical' ? '#ef4444' : '#d97706';

            // Calculate positions
            // Drone is at 50%, 40% of viewport
            const droneX = window.innerWidth * 0.5;
            const droneY = window.innerHeight * 0.4;
            // Terminal is at bottom 5%, center
            const terminalY = window.innerHeight * 0.6 + (idx * 40); // Stagger endpoints
            const terminalX = window.innerWidth * 0.5 + (idx * 30 - 30); // Offset for multiple lines

            // Midpoint for label
            const midX = (droneX + terminalX) / 2;
            const midY = (droneY + terminalY) / 2;

            return (
              <g key={line.id} style={{ opacity, transition: 'opacity 0.5s' }}>
                {/* Main leader line - solid, with glow */}
                <line
                  x1={droneX}
                  y1={droneY}
                  x2={terminalX}
                  y2={terminalY}
                  stroke={lineColor}
                  strokeWidth="2"
                  filter="url(#leader-glow)"
                  className="leader-line"
                  style={{
                    strokeDasharray: 200,
                    animation: 'leaderLineDraw 0.3s ease-out forwards',
                  }}
                />

                {/* Label ON the line - v4.0 critical differentiator */}
                <g transform={`translate(${midX}, ${midY})`}>
                  {/* Label background */}
                  <rect
                    x="-70"
                    y="-12"
                    width="140"
                    height="24"
                    fill="rgba(9, 9, 11, 0.95)"
                    stroke={lineColor}
                    strokeWidth="1"
                    rx="4"
                  />
                  {/* Label text - hash + event code */}
                  <text
                    textAnchor="middle"
                    y="4"
                    style={{
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 600,
                      fill: lineColor,
                    }}
                  >
                    {line.eventType} [0x{line.hash}...]
                  </text>
                </g>

                {/* Endpoint marker at terminal */}
                <circle
                  cx={terminalX}
                  cy={terminalY}
                  r="5"
                  fill={lineColor}
                  className="animate-pulse"
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* ===== BOTTOM CENTER: Below-Fold Terminal - v4.0 GLASS COCKPIT ===== */}
      {/* "Stream of Consciousness" falling away from the drone */}
      {demoPhase === 'RUNNING' && (
        <div
          className="z-30"
          style={{
            position: 'fixed',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '300px',
            maxHeight: '40vh',
            // v4.0: Gradient fade - transparent top (near drone), opaque bottom
            background: `linear-gradient(
              to top,
              rgba(0, 0, 0, 0.9) 0%,
              rgba(0, 0, 0, 0.7) 50%,
              rgba(0, 0, 0, 0) 100%
            )`,
            // v4.0: No visible container edges - terminal floats in space
            border: 'none',
            borderRadius: 0,
            padding: '16px 24px',
            overflow: 'hidden',
          }}
        >
          {/* Log entries - Stream flows DOWN from drone */}
          {/* v4.0: New logs at TOP (closest to drone), oldest fade toward bottom */}
          <div
            className="flex flex-col h-full overflow-hidden"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {governanceLog.length === 0 ? (
              <div
                className="flex-1 flex items-start justify-center pt-8"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#94a3b8',
                  opacity: 0.6,
                }}
              >
                AWAITING EVENTS...
              </div>
            ) : (
              <div className="space-y-3">
                {[...governanceLog].reverse().slice(0, 8).map((entry, idx) => {
                  const isCritical = entry.severity === 'CRITICAL';
                  const isWarning = entry.severity === 'WARN';
                  const isSuccess = entry.severity === 'SUCCESS';

                  // v4.0: Entry fade effect based on position
                  // Entry 1 (newest, top): opacity 1.0
                  // Entry 2: 0.9, Entry 3: 0.8, Entry 4: 0.6, Entry 5+: 0.4 → 0.2
                  const opacityMap = [1.0, 0.9, 0.8, 0.6, 0.4, 0.3, 0.25, 0.2];
                  const entryOpacity = opacityMap[idx] || 0.2;

                  return (
                    <div
                      key={entry.blockId}
                      className={`flex items-center gap-4 py-2 ${idx === 0 ? 'animate-fadeIn' : ''}`}
                      style={{
                        opacity: entryOpacity,
                        lineHeight: '1.8',
                        letterSpacing: '0.02em',
                        transition: 'opacity 0.5s ease-out',
                      }}
                    >
                      {/* Block ID - 12px, hash style */}
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 400,
                          color: '#94A3B8',
                          minWidth: '55px',
                        }}
                      >
                        [{String(entry.blockId).padStart(2, '0')}]
                      </span>

                      {/* Event type - 14px base, 18px critical (readable from 5 feet) */}
                      <span
                        style={{
                          fontSize: isCritical ? '18px' : '14px',
                          fontWeight: isCritical ? 700 : 500,
                          color: isCritical ? '#FCA5A5' :
                                 isWarning ? '#fbbf24' :
                                 isSuccess ? '#F1F5F9' :
                                 '#E2E8F0',
                          flex: 1,
                          textShadow: isCritical ? '0 0 10px rgba(252, 165, 165, 0.5)' : 'none',
                        }}
                      >
                        {isCritical && '⚠ '}{entry.eventType}
                        {entry.detail && (
                          <span style={{ color: '#94A3B8', fontSize: '12px', marginLeft: '8px' }}>
                            {entry.detail}
                          </span>
                        )}
                      </span>

                      {/* Timestamp */}
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 400,
                          color: '#64748b',
                        }}
                      >
                        {entry.timestamp}
                      </span>

                      {/* Hash snippet for proof */}
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 400,
                          color: '#475569',
                        }}
                      >
                        [{entry.hash?.slice(0, 6) || '...'}]
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Block count - subtle at bottom */}
            <div
              className="mt-auto pt-4 text-center"
              style={{
                fontSize: '11px',
                color: '#64748b',
                opacity: 0.6,
              }}
            >
              {governanceLog.length} BLOCKS
            </div>
          </div>
        </div>
      )}


      {/* ===== ACT III: THE SEAL - v4.0 GLASS COCKPIT Cinematic Outro ===== */}
      {demoPhase === 'SEAL' && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center"
          style={{
            backgroundColor: 'rgba(9, 9, 11, 0.7)',
            backdropFilter: showMerkleRoot ? 'blur(4px)' : 'none',
            transition: 'backdrop-filter 1.5s ease-in-out',
          }}
        >
          {showMerkleRoot && !showAffidavit && (
            <div
              className="text-center"
              style={{
                animation: 'fadeIn 2s ease-out forwards',
              }}
            >
              {/* Merkle Root Label */}
              <div
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                  letterSpacing: '0.15em',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                }}
              >
                MERKLE ROOT
              </div>

              {/* The Hash - GROWING EFFECT per v4.0 spec */}
              <div
                className="px-8 py-6 mb-10"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '20px',
                  letterSpacing: '0.05em',
                  color: '#F8FAFC',
                  textShadow: '0 0 30px rgba(248, 250, 252, 0.5), 0 0 60px rgba(248, 250, 252, 0.2)',
                  animation: 'merkleGlow 4s ease-in-out infinite',
                  transform: 'scale(1)',
                }}
              >
                0x{merkleRoot}
              </div>

              {/* CRYPTOGRAPHICALLY VERIFIED stamp - v4.0 spec */}
              <div
                className="flex items-center justify-center gap-3 px-6 py-3 mb-6"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '4px',
                  animation: 'fadeIn 1s ease-out 0.5s forwards',
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}
              >
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
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    color: '#10B981',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  CRYPTOGRAPHICALLY VERIFIED
                </span>
              </div>

              {/* Block count - fades in after stamp */}
              <div
                style={{
                  fontSize: '12px',
                  color: '#94A3B8',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.05em',
                  animation: 'fadeIn 1s ease-out 1s forwards',
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}
              >
                {blockCountRef.current} BLOCKS | {governanceLog.length} RECEIPTS
              </div>
            </div>
          )}
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
