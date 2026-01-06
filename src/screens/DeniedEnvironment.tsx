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

// Governance badge for on-change display
interface GovernanceBadge {
  id: string;
  type: 'RACI_HANDOFF' | 'MODE_CHANGE' | 'CONFIDENCE_DROP' | 'CRAG_ACTIVE';
  title: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
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
  const [governanceBadges, setGovernanceBadges] = useState<GovernanceBadge[]>([]);
  const [borderPulse, setBorderPulse] = useState<BorderPulseState>('none');
  const [mapOpacity, setMapOpacity] = useState(0);
  const [showMerkleRoot, setShowMerkleRoot] = useState(false);

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

  // Add governance badge (on-change display)
  const addGovernanceBadge = useCallback((badge: Omit<GovernanceBadge, 'id' | 'timestamp'>) => {
    const newBadge: GovernanceBadge = {
      ...badge,
      id: `badge-${Date.now()}`,
      timestamp: Date.now(),
    };
    setGovernanceBadges(prev => [...prev, newBadge]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setGovernanceBadges(prev => prev.filter(b => b.id !== newBadge.id));
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

  // Boot sequence effect
  useEffect(() => {
    if (!autoplay) return;

    // Boot sequence: 3 seconds
    const bootSteps = [
      { time: 0, text: 'INITIALIZING FLIGHT RECORDER v3.0...', progress: 0 },
      { time: 500, text: 'LINKING PROVENANCE CHAIN...', progress: 30 },
      { time: 1200, text: 'VERIFYING LEDGER INTEGRITY...', progress: 60 },
      { time: 2000, text: 'CALIBRATING SENSORS...', progress: 85 },
      { time: 2700, text: 'SYSTEM LIVE', progress: 100 },
    ];

    bootSteps.forEach(step => {
      setTimeout(() => {
        setBootText(step.text);
        setBootProgress(step.progress);
      }, step.time);
    });

    // Transition to running
    setTimeout(() => {
      setDemoPhase('RUNNING');
      setMapOpacity(1);
      startTimeRef.current = Date.now();
      phaseStartRef.current = Date.now();
      setIsRunning(true);
      transitionToPhase('TAKEOFF');
    }, 3000);
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

        // Cinematic effects: callout, badge, border pulse
        setActiveCallout({
          type: 'GPS_DRIFT',
          message: 'GPS signal degradation detected',
          severity: 'critical',
        });
        addGovernanceBadge({
          type: 'CONFIDENCE_DROP',
          title: 'CONFIDENCE DROP',
          detail: '0.98 -> 0.62',
          severity: 'critical',
        });
        setBorderPulse('amber');
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
        addGovernanceBadge({
          type: 'CRAG_ACTIVE',
          title: 'CRAG ACTIVE',
          detail: 'External query in progress',
          severity: 'warning',
        });
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
        addGovernanceBadge({
          type: 'RACI_HANDOFF',
          title: 'RACI HANDOFF',
          detail: 'AI -> HUMAN (Safety Officer)',
          severity: 'critical',
        });
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

        // Cinematic effects
        setActiveCallout(null);
        addGovernanceBadge({
          type: 'MODE_CHANGE',
          title: 'HUMAN RESPONSE',
          detail: 'GPS recalibrated - PROCEED',
          severity: 'info',
        });
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

        // Cinematic effects
        addGovernanceBadge({
          type: 'RACI_HANDOFF',
          title: 'RACI HANDOFF',
          detail: 'HUMAN -> AI (Control returned)',
          severity: 'info',
        });
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
        setTimeout(() => {
          setDemoPhase('SEAL');
          setMapOpacity(0);
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
  }, [addLogEntry, addGovernanceBadge]);

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

  // Handle restart
  const handleRestart = useCallback(() => {
    setDemoPhase('BOOT');
    setBootProgress(0);
    setBootText('INITIALIZING FLIGHT RECORDER v3.0...');
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
    setGovernanceBadges([]);
    setBorderPulse('none');
    setMapOpacity(0);
    setShowMerkleRoot(false);
    setShowAffidavit(false);

    // Restart boot sequence
    const bootSteps = [
      { time: 0, text: 'INITIALIZING FLIGHT RECORDER v3.0...', progress: 0 },
      { time: 500, text: 'LINKING PROVENANCE CHAIN...', progress: 30 },
      { time: 1200, text: 'VERIFYING LEDGER INTEGRITY...', progress: 60 },
      { time: 2000, text: 'CALIBRATING SENSORS...', progress: 85 },
      { time: 2700, text: 'SYSTEM LIVE', progress: 100 },
    ];

    bootSteps.forEach(step => {
      setTimeout(() => {
        setBootText(step.text);
        setBootProgress(step.progress);
      }, step.time);
    });

    setTimeout(() => {
      setDemoPhase('RUNNING');
      setMapOpacity(1);
      startTimeRef.current = Date.now();
      phaseStartRef.current = Date.now();
      lastTickRef.current = Date.now();
      setIsRunning(true);
      transitionToPhase('TAKEOFF');
    }, 3000);
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
      {/* ===== ACT I: BOOT SEQUENCE ===== */}
      {demoPhase === 'BOOT' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
          <div
            className="text-center"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {/* Boot text with typewriter effect */}
            <div
              className="mb-6"
              style={{
                fontSize: '14px',
                color: bootProgress === 100 ? COLORS.textPrimary : COLORS.textMuted,
                letterSpacing: '0.05em',
                transition: 'color 0.3s',
              }}
            >
              {bootText}
              {bootProgress < 100 && <span className="typewriter-cursor" />}
            </div>

            {/* Progress bar */}
            {bootProgress < 100 && (
              <div
                className="w-64 h-1 mx-auto"
                style={{
                  backgroundColor: COLORS.bgCard,
                  borderRadius: '2px',
                }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${bootProgress}%`,
                    backgroundColor: COLORS.textMuted,
                    borderRadius: '2px',
                  }}
                />
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

      {/* ===== BOTTOM CENTER: Event Log Overlay - DEAL-KILLER #2 TEXT SIZES ===== */}
      {demoPhase === 'RUNNING' && (
        <div
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30"
          style={{
            width: '100%',
            maxWidth: '700px',
            padding: '0 16px',
          }}
        >
          <div
            className="rounded-t-xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(9, 9, 11, 0.85)',
              backdropFilter: 'blur(8px)',
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              borderBottom: 'none',
              maxHeight: '180px',
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-3 flex justify-between items-center"
              style={{
                borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
                backgroundColor: 'rgba(9, 9, 11, 0.95)',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#CBD5E1',
                }}
              >
                EVENT STREAM
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#94a3b8',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                BLOCKS: {governanceLog.length}
              </span>
            </div>

            {/* Log entries - READABLE FROM 10 FEET */}
            <div
              className="overflow-hidden px-4 py-2"
              style={{ maxHeight: '140px' }}
            >
              {governanceLog.length === 0 ? (
                <div
                  className="text-center py-4"
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#94a3b8',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  AWAITING EVENTS...
                </div>
              ) : (
                <div className="space-y-2">
                  {[...governanceLog].reverse().slice(0, 5).map((entry, idx) => {
                    const isNewest = idx === 0;
                    const isCritical = entry.severity === 'CRITICAL';
                    const isWarning = entry.severity === 'WARN';
                    const isSuccess = entry.severity === 'SUCCESS';

                    return (
                      <div
                        key={entry.blockId}
                        className={`flex items-center gap-4 py-2 px-4 rounded ${isNewest ? 'animate-fadeIn' : ''}`}
                        style={{
                          backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.15)' :
                                          isWarning ? 'rgba(217, 119, 6, 0.12)' :
                                          isSuccess ? 'rgba(100, 116, 139, 0.1)' :
                                          'transparent',
                          borderLeft: `4px solid ${
                            isCritical ? '#FCA5A5' :
                            isWarning ? '#fbbf24' :
                            isSuccess ? '#94a3b8' :
                            'transparent'
                          }`,
                          opacity: idx > 3 ? 0.6 : 1,
                          lineHeight: '1.8',
                        }}
                      >
                        {/* Block ID */}
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#94a3b8',
                            fontFamily: 'JetBrains Mono, monospace',
                            minWidth: '50px',
                          }}
                        >
                          [{String(entry.blockId).padStart(2, '0')}]
                        </span>

                        {/* Event type - 14px normal, 16px bold for critical */}
                        <span
                          style={{
                            fontSize: isCritical ? '16px' : '14px',
                            fontWeight: isCritical ? 700 : 600,
                            color: isCritical ? '#FCA5A5' :
                                   isWarning ? '#fbbf24' :
                                   isSuccess ? '#F1F5F9' :
                                   '#CBD5E1',
                            fontFamily: 'JetBrains Mono, monospace',
                            flex: 1,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {entry.eventType}
                        </span>

                        {/* Timestamp */}
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#64748b',
                            fontFamily: 'JetBrains Mono, monospace',
                          }}
                        >
                          {entry.timestamp}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== TOP RIGHT: Governance Badges - DEAL-KILLER #2 TEXT SIZES ===== */}
      <div className="absolute top-4 right-4 z-40 space-y-3">
        {governanceBadges.map(badge => (
          <div
            key={badge.id}
            className="animate-fadeIn"
            style={{
              backgroundColor: 'rgba(9, 9, 11, 0.95)',
              backdropFilter: 'blur(4px)',
              border: `1px solid ${
                badge.severity === 'critical' ? '#FCA5A5' :
                badge.severity === 'warning' ? '#fbbf24' :
                'rgba(255,255,255,0.1)'
              }`,
              borderLeft: `4px solid ${
                badge.severity === 'critical' ? '#FCA5A5' :
                badge.severity === 'warning' ? '#fbbf24' :
                '#94a3b8'
              }`,
              borderRadius: '4px',
              padding: '16px 20px',
              maxWidth: '280px',
            }}
          >
            <div
              style={{
                fontSize: badge.severity === 'critical' ? '16px' : '14px',
                fontWeight: 700,
                color: badge.severity === 'critical' ? '#FCA5A5' :
                       badge.severity === 'warning' ? '#fbbf24' :
                       '#F1F5F9',
                letterSpacing: '0.05em',
                marginBottom: '6px',
              }}
            >
              {badge.title}
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#CBD5E1',
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: '1.6',
              }}
            >
              {badge.detail}
            </div>
          </div>
        ))}
      </div>

      {/* ===== ACT III: THE SEAL (Merkle Root) ===== */}
      {demoPhase === 'SEAL' && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center transition-opacity duration-2000"
          style={{
            backgroundColor: COLORS.bgPrimary,
            opacity: showMerkleRoot ? 1 : 0,
          }}
        >
          {showMerkleRoot && !showAffidavit && (
            <div className="text-center animate-fadeIn">
              {/* Merkle Root Label */}
              <div
                style={{
                  fontSize: '11px',
                  color: COLORS.textTimestamp,
                  letterSpacing: '0.15em',
                  marginBottom: '16px',
                }}
              >
                MERKLE ROOT
              </div>

              {/* The Hash - The single proof */}
              <div
                className="px-6 py-4 mb-8"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '14px',
                  color: COLORS.textPrimary,
                  letterSpacing: '0.05em',
                  textShadow: '0 0 20px rgba(248, 250, 252, 0.3)',
                  animation: 'merkleGlow 4s ease-in-out infinite',
                }}
              >
                0x{merkleRoot}
              </div>

              {/* Status */}
              <div
                style={{
                  fontSize: '12px',
                  color: COLORS.textSecondary,
                  letterSpacing: '0.1em',
                  marginBottom: '8px',
                }}
              >
                SESSION SECURED
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: COLORS.textTimestamp,
                }}
              >
                INTEGRITY VERIFIED
              </div>

              {/* Block count */}
              <div
                className="mt-6"
                style={{
                  fontSize: '10px',
                  color: COLORS.textTimestamp,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                [{blockCountRef.current} BLOCKS] [{governanceLog.length} RECEIPTS]
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
