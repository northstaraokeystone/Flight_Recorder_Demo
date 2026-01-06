/**
 * TacticalGrid - Cinematic HUD v3.0
 * PARADIGM SHIFT: Camera-locked protagonist, world moves around drone
 *
 * THE INSIGHT: The drone is the PROTAGONIST of a film.
 * The camera follows the protagonist.
 * The story unfolds beneath them.
 * The viewer never moves their eyes.
 *
 * Camera Math:
 *   screen_drone_x = viewport_width * 0.5
 *   screen_drone_y = viewport_height * 0.4
 *   grid_offset_x = drone_world_x - screen_drone_x
 *   grid_offset_y = drone_world_y - screen_drone_y
 *   All world elements draw at: (world_position - grid_offset)
 */

import { useMemo, useEffect, useState, useRef } from 'react';
import type { DronePosition, ScenarioPhase, UnknownObject } from '../../constants/scenario';
import { MAP_ZONES, FLIGHT_PATH, UNKNOWN_OBJECT_LOCATION } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface TacticalGridProps {
  dronePosition: DronePosition;
  phase: ScenarioPhase;
  visitedPathIndex: number;
  unknownObject?: UnknownObject | null;
  currentWaypoint?: number;
  confidence?: number;
  // Callout system
  activeCallout?: {
    type: 'GPS_DRIFT' | 'CRAG_FALLBACK' | 'RACI_HANDOFF' | 'CONFIDENCE_DROP';
    message: string;
    severity: 'warning' | 'critical';
  } | null;
  onCalloutDismiss?: () => void;
}

// Simulated telemetry data
interface TelemetryData {
  altitude: number;
  speed: number;
  heading: number;
  gpsStatus: 'LOCKED' | 'DRIFT' | 'ACQUIRING';
}

// Camera constants - drone locked at center
// GLASS COCKPIT v4.0: Drone is the fixed point of the universe
const CAMERA_DEFAULTS = {
  DRONE_X_PERCENT: 0.5,  // 50% from left - EXACTLY CENTER
  DRONE_Y_PERCENT: 0.4,  // 40% from top - GOLDEN RATIO
  ZOOM: 2.5,             // v4.0: Drone is quarter-sized, not pixel
  GRID_SPACING: 20,      // World space grid spacing
};

// Drone visual specifications - v4.0 CHEVRON
const DRONE_VISUAL = {
  SIZE: 45,              // 40-50px as specified
  STROKE_WIDTH: 3,
  COLOR: '#F8FAFC',      // Bright white
  PULSE_MIN: 0.8,
  PULSE_MAX: 1.0,
  PULSE_DURATION: 2000,  // 2s cycle
};

export function TacticalGrid({
  dronePosition,
  phase,
  visitedPathIndex,
  unknownObject,
  currentWaypoint = 0,
  confidence = 0.99,
  activeCallout,
}: TacticalGridProps) {
  const [geofenceFlash, setGeofenceFlash] = useState(false);
  const lastPhaseRef = useRef(phase);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const calloutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamic viewport dimensions - fills entire screen
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // Resize handler for responsive updates
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    // Initial call to set correct dimensions
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Computed camera values based on viewport
  const CAMERA = useMemo(() => ({
    VIEWPORT_WIDTH: viewport.width,
    VIEWPORT_HEIGHT: viewport.height,
    DRONE_X_PERCENT: CAMERA_DEFAULTS.DRONE_X_PERCENT,
    DRONE_Y_PERCENT: CAMERA_DEFAULTS.DRONE_Y_PERCENT,
    ZOOM: CAMERA_DEFAULTS.ZOOM,
  }), [viewport.width, viewport.height]);

  // Calculate screen position for drone
  const DRONE_SCREEN_X = CAMERA.VIEWPORT_WIDTH * CAMERA.DRONE_X_PERCENT;
  const DRONE_SCREEN_Y = CAMERA.VIEWPORT_HEIGHT * CAMERA.DRONE_Y_PERCENT;

  // Check if in uncertainty zone
  const isUncertaintyPhase = [
    'UNCERTAINTY_DETECTED',
    'CRAG_TRIGGERED',
    'HUMAN_QUERY',
  ].includes(phase);

  // CAMERA FOLLOW SYSTEM: Calculate world offset with ZOOM
  // v4.0 GLASS COCKPIT: Drone stays at fixed screen position,
  // world translates AND scales around the drone
  // The offset is recalculated whenever drone position or viewport changes
  const worldOffset = useMemo(() => ({
    x: dronePosition.x * CAMERA.ZOOM - DRONE_SCREEN_X,
    y: dronePosition.y * CAMERA.ZOOM - DRONE_SCREEN_Y,
  }), [dronePosition.x, dronePosition.y, CAMERA.ZOOM, DRONE_SCREEN_X, DRONE_SCREEN_Y]);

  // Transform world coordinates to screen coordinates with ZOOM
  const worldToScreen = (worldX: number, worldY: number) => ({
    x: worldX * CAMERA.ZOOM - worldOffset.x,
    y: worldY * CAMERA.ZOOM - worldOffset.y,
  });

  // Simulate telemetry based on position and phase
  const telemetry: TelemetryData = useMemo(() => {
    const baseAlt = 120;
    const baseSpeed = 15;
    const heading = Math.round((dronePosition.rotation + 45) % 360);

    let gpsStatus: TelemetryData['gpsStatus'] = 'LOCKED';
    if (isUncertaintyPhase) {
      gpsStatus = 'DRIFT';
    } else if (phase === 'HUMAN_RESPONSE' || phase === 'RACI_HANDOFF_BACK') {
      gpsStatus = 'ACQUIRING';
    }

    const altVariation = isUncertaintyPhase ? -5 : 0;
    const speedVariation = isUncertaintyPhase ? -3 : 0;

    return {
      altitude: baseAlt + altVariation,
      speed: baseSpeed + speedVariation,
      heading,
      gpsStatus,
    };
  }, [dronePosition.rotation, phase, isUncertaintyPhase]);

  // Geofence flash animation when uncertainty is detected
  useEffect(() => {
    if (phase === 'UNCERTAINTY_DETECTED' && lastPhaseRef.current !== 'UNCERTAINTY_DETECTED') {
      setGeofenceFlash(true);
      const flashInterval = setInterval(() => {
        setGeofenceFlash(prev => !prev);
      }, 300);

      const timeout = setTimeout(() => {
        clearInterval(flashInterval);
        setGeofenceFlash(true);
      }, 3000);

      return () => {
        clearInterval(flashInterval);
        clearTimeout(timeout);
      };
    }
    lastPhaseRef.current = phase;
  }, [phase]);

  // Show callout when active, auto-dismiss after 4 seconds
  useEffect(() => {
    if (activeCallout) {
      setCalloutVisible(true);
      if (calloutTimerRef.current) {
        clearTimeout(calloutTimerRef.current);
      }
      calloutTimerRef.current = setTimeout(() => {
        setCalloutVisible(false);
      }, 4000);
    } else {
      setCalloutVisible(false);
    }
    return () => {
      if (calloutTimerRef.current) {
        clearTimeout(calloutTimerRef.current);
      }
    };
  }, [activeCallout]);

  // Generate path string for completed trail (in world coords, will be transformed)
  // Recalculates when drone moves (worldOffset changes) or waypoints are visited
  const completedPathD = useMemo(() => {
    const points = FLIGHT_PATH.slice(0, Math.min(visitedPathIndex + 1, FLIGHT_PATH.length));
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => {
      const screen = worldToScreen(pt.x, pt.y);
      return acc + (i === 0 ? `M ${screen.x} ${screen.y}` : ` L ${screen.x} ${screen.y}`);
    }, '');
  }, [visitedPathIndex, worldOffset.x, worldOffset.y, CAMERA.ZOOM]);

  // Future path (dimmer) - shows remaining waypoints
  const futurePathD = useMemo(() => {
    const futurePoints = FLIGHT_PATH.slice(Math.max(visitedPathIndex, 0));
    if (futurePoints.length < 2) return '';
    return futurePoints.reduce((acc, pt, i) => {
      const screen = worldToScreen(pt.x, pt.y);
      return acc + (i === 0 ? `M ${screen.x} ${screen.y}` : ` L ${screen.x} ${screen.y}`);
    }, '');
  }, [visitedPathIndex, worldOffset.x, worldOffset.y, CAMERA.ZOOM]);

  // Active segment from last waypoint to drone (drone is fixed at center)
  const activeSegmentStart = useMemo(() => {
    if (visitedPathIndex > 0 && visitedPathIndex < FLIGHT_PATH.length) {
      return worldToScreen(FLIGHT_PATH[visitedPathIndex - 1].x, FLIGHT_PATH[visitedPathIndex - 1].y);
    }
    return null;
  }, [visitedPathIndex, worldOffset.x, worldOffset.y, CAMERA.ZOOM]);

  // Determine display state
  const showUnknownObject = unknownObject?.detected || isUncertaintyPhase;
  const isLowConfidence = confidence < 0.70;

  // Transform unknown object location to screen coords
  const unknownObjScreen = worldToScreen(UNKNOWN_OBJECT_LOCATION.x, UNKNOWN_OBJECT_LOCATION.y);

  // Transform geofence to screen coords with ZOOM
  const geofenceScreen = {
    x: MAP_ZONES.grey.x * CAMERA.ZOOM - worldOffset.x,
    y: MAP_ZONES.grey.y * CAMERA.ZOOM - worldOffset.y,
    width: MAP_ZONES.grey.width * CAMERA.ZOOM,
    height: MAP_ZONES.grey.height * CAMERA.ZOOM,
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: COLORS.bgPrimary,
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    >
      {/* SVG Map - Full Bleed */}
      <svg
        viewBox={`0 0 ${CAMERA.VIEWPORT_WIDTH} ${CAMERA.VIEWPORT_HEIGHT}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
        preserveAspectRatio="none"
      >
        {/* Background */}
        <rect width="100%" height="100%" fill={COLORS.bgPrimary} />

        {/* WORLD LAYER - Everything here moves with the camera */}
        <g className="world-layer">
          {/* Barely visible grid lines - translated with world and ZOOM */}
          <g opacity="0.12">
            {/* Calculate number of grid lines needed to cover viewport + buffer */}
            {(() => {
              const gridSpacing = CAMERA_DEFAULTS.GRID_SPACING;
              const scaledSpacing = gridSpacing * CAMERA.ZOOM;
              // Add extra lines beyond viewport for smooth scrolling
              const buffer = 400;
              const numVertical = Math.ceil((CAMERA.VIEWPORT_WIDTH + buffer * 2) / scaledSpacing) + 1;
              const numHorizontal = Math.ceil((CAMERA.VIEWPORT_HEIGHT + buffer * 2) / scaledSpacing) + 1;
              // Start offset to ensure lines cover area before viewport origin
              const startOffsetX = Math.floor(worldOffset.x / scaledSpacing) * scaledSpacing;
              const startOffsetY = Math.floor(worldOffset.y / scaledSpacing) * scaledSpacing;

              return (
                <>
                  {/* Vertical lines - scaled by ZOOM */}
                  {Array.from({ length: numVertical }).map((_, i) => {
                    const screenX = startOffsetX - worldOffset.x - buffer + i * scaledSpacing;
                    return (
                      <line
                        key={`v-${i}`}
                        x1={screenX}
                        y1={-buffer}
                        x2={screenX}
                        y2={CAMERA.VIEWPORT_HEIGHT + buffer}
                        stroke={COLORS.textTimestamp}
                        strokeWidth="0.5"
                      />
                    );
                  })}
                  {/* Horizontal lines - scaled by ZOOM */}
                  {Array.from({ length: numHorizontal }).map((_, i) => {
                    const screenY = startOffsetY - worldOffset.y - buffer + i * scaledSpacing;
                    return (
                      <line
                        key={`h-${i}`}
                        x1={-buffer}
                        y1={screenY}
                        x2={CAMERA.VIEWPORT_WIDTH + buffer}
                        y2={screenY}
                        stroke={COLORS.textTimestamp}
                        strokeWidth="0.5"
                      />
                    );
                  })}
                </>
              );
            })()}
          </g>

          {/* Radar crosshairs - at center of viewport (fixed) */}
          <g opacity="0.08">
            <line
              x1={CAMERA.VIEWPORT_WIDTH / 2}
              y1="0"
              x2={CAMERA.VIEWPORT_WIDTH / 2}
              y2={CAMERA.VIEWPORT_HEIGHT}
              stroke={COLORS.textMuted}
              strokeWidth="1"
            />
            <line
              x1="0"
              y1={CAMERA.VIEWPORT_HEIGHT / 2}
              x2={CAMERA.VIEWPORT_WIDTH}
              y2={CAMERA.VIEWPORT_HEIGHT / 2}
              stroke={COLORS.textMuted}
              strokeWidth="1"
            />
            <circle
              cx={CAMERA.VIEWPORT_WIDTH / 2}
              cy={CAMERA.VIEWPORT_HEIGHT / 2}
              r="60"
              fill="none"
              stroke={COLORS.textTimestamp}
              strokeWidth="0.5"
            />
            <circle
              cx={CAMERA.VIEWPORT_WIDTH / 2}
              cy={CAMERA.VIEWPORT_HEIGHT / 2}
              r="120"
              fill="none"
              stroke={COLORS.textTimestamp}
              strokeWidth="0.5"
            />
          </g>

          {/* Geofence / GPS Bounds - moves with world, scaled by ZOOM */}
          <g>
            <rect
              x={geofenceScreen.x}
              y={geofenceScreen.y}
              width={geofenceScreen.width}
              height={geofenceScreen.height}
              fill="none"
              stroke={isUncertaintyPhase && geofenceFlash ? COLORS.alertRed : COLORS.textTimestamp}
              strokeWidth={isUncertaintyPhase ? 3 : 1.5}
              strokeDasharray="12 6"
              opacity={isUncertaintyPhase ? 0.8 : 0.25}
              style={{
                transition: 'stroke 0.15s, opacity 0.3s',
              }}
            />
            <text
              x={geofenceScreen.x + 8}
              y={geofenceScreen.y - 8}
              style={{
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                fill: isUncertaintyPhase && geofenceFlash ? COLORS.alertRed : COLORS.textTimestamp,
                opacity: isUncertaintyPhase ? 0.9 : 0.4,
              }}
            >
              GPS BOUNDS
            </text>
          </g>

          {/* Future path - very dim, scaled for zoom */}
          {futurePathD && (
            <path
              d={futurePathD}
              fill="none"
              stroke={COLORS.waypointFuture}
              strokeWidth="2"
              strokeDasharray="4 8"
              opacity="0.4"
            />
          )}

          {/* Completed path - dim slate, scaled for zoom */}
          {completedPathD && (
            <path
              d={completedPathD}
              fill="none"
              stroke={COLORS.flightPathInactive}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Active segment - from last waypoint to drone center */}
          {activeSegmentStart && (
            <line
              x1={activeSegmentStart.x}
              y1={activeSegmentStart.y}
              x2={DRONE_SCREEN_X}
              y2={DRONE_SCREEN_Y}
              stroke={COLORS.flightPathActive}
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}

          {/* Waypoints - move with world, scaled for zoom */}
          {FLIGHT_PATH.map((wp, i) => {
            const isCurrent = i === currentWaypoint;
            const isCompleted = i < visitedPathIndex;
            const screen = worldToScreen(wp.x, wp.y);

            return (
              <g key={i}>
                <circle
                  cx={screen.x}
                  cy={screen.y}
                  r={isCurrent ? 12 : 8}
                  fill={isCurrent ? COLORS.waypointCurrent : 'none'}
                  stroke={
                    isCurrent
                      ? COLORS.waypointCurrent
                      : isCompleted
                        ? COLORS.waypointCompleted
                        : COLORS.waypointFuture
                  }
                  strokeWidth={isCurrent ? 3 : 2}
                  className={isCurrent ? 'animate-subtlePulse' : ''}
                />
                <text
                  x={screen.x}
                  y={screen.y - 18}
                  textAnchor="middle"
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: 'JetBrains Mono, monospace',
                    fill: isCurrent
                      ? COLORS.textSecondary
                      : isCompleted
                        ? COLORS.textTimestamp
                        : COLORS.waypointFuture,
                  }}
                >
                  {wp.label}
                </text>
              </g>
            );
          })}

          {/* GPS Drift Zone indicator - moves with world, scaled for zoom */}
          {showUnknownObject && (
            <g className={isLowConfidence ? 'animate-pulse' : ''}>
              <circle
                cx={unknownObjScreen.x}
                cy={unknownObjScreen.y}
                r="28"
                fill="none"
                stroke={COLORS.alertRed}
                strokeWidth="3"
                strokeDasharray={unknownObject?.identified ? 'none' : '8 4'}
                opacity={0.7}
              />
              <circle
                cx={unknownObjScreen.x}
                cy={unknownObjScreen.y}
                r="8"
                fill={unknownObject?.identified ? COLORS.textMuted : COLORS.alertRed}
              />
              <text
                x={unknownObjScreen.x + 35}
                y={unknownObjScreen.y - 8}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  fill: COLORS.alertRed,
                }}
              >
                {unknownObject?.identified ? unknownObject.identifiedAs : 'GPS_DRIFT'}
              </text>
            </g>
          )}
        </g>

      </svg>

      {/* ===== DRONE LAYER - FIXED AT SCREEN CENTER ===== */}
      {/* Moved outside SVG for guaranteed screen positioning */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <svg
          width={DRONE_VISUAL.SIZE * 2}
          height={DRONE_VISUAL.SIZE * 2}
          viewBox={`${-DRONE_VISUAL.SIZE} ${-DRONE_VISUAL.SIZE} ${DRONE_VISUAL.SIZE * 2} ${DRONE_VISUAL.SIZE * 2}`}
          style={{ overflow: 'visible' }}
        >
          {/* Glow filter definition */}
          <defs>
            <filter id="drone-glow-fixed" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subtle pulse ring */}
          <circle
            r={DRONE_VISUAL.SIZE * 0.6}
            fill="none"
            stroke={isLowConfidence ? COLORS.alertRed : 'rgba(248, 250, 252, 0.15)'}
            strokeWidth="1"
            className="animate-subtlePulse"
          />

          {/* CHEVRON (Λ) - The main drone visual - QUIET SKY: heading indicator removed */}
          <g
            transform={`rotate(${dronePosition.rotation})`}
            filter="url(#drone-glow-fixed)"
          >
            {/* Main chevron shape - 40-50px, 3px stroke */}
            <path
              d={`M 0 ${-DRONE_VISUAL.SIZE / 2}
                  L ${DRONE_VISUAL.SIZE / 2.5} ${DRONE_VISUAL.SIZE / 3}
                  L 0 ${DRONE_VISUAL.SIZE / 6}
                  L ${-DRONE_VISUAL.SIZE / 2.5} ${DRONE_VISUAL.SIZE / 3}
                  Z`}
              fill={isLowConfidence ? 'rgba(252, 165, 165, 0.2)' : 'rgba(248, 250, 252, 0.1)'}
              stroke={isLowConfidence ? COLORS.alertRed : DRONE_VISUAL.COLOR}
              strokeWidth={DRONE_VISUAL.STROKE_WIDTH}
              strokeLinejoin="round"
              className="animate-subtlePulse"
              style={{
                filter: isLowConfidence
                  ? 'drop-shadow(0 0 8px rgba(252, 165, 165, 0.6))'
                  : 'drop-shadow(0 0 6px rgba(248, 250, 252, 0.4))',
              }}
            />

            {/* QUIET SKY: Heading indicator hidden - chevron shape shows direction clearly */}
          </g>
        </svg>

        {/* Drone label - below the drone */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '8px',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'JetBrains Mono, monospace',
            color: COLORS.textSecondary,
            letterSpacing: '0.08em',
          }}
        >
          UAV_01
        </div>
      </div>

      {/* LEADER LINE & CALLOUT - Rendered as fixed overlay */}
      {calloutVisible && activeCallout && (
        <div
          style={{
            position: 'absolute',
            left: 'calc(50% - 120px)',
            top: 'calc(40% - 80px)',
            transform: 'translate(-50%, -50%)',
            zIndex: 51,
            pointerEvents: 'none',
          }}
        >
          <svg width="300" height="200" style={{ overflow: 'visible' }}>
            {/* Leader line from drone position to callout */}
            {/* QUIET SKY: Consistent colors - #F87171 red for errors, #FBBF24 amber for corrections */}
            <line
              x1="220"
              y1="130"
              x2="150"
              y2="100"
              stroke={activeCallout.severity === 'critical' ? '#F87171' : '#FBBF24'}
              strokeWidth="3"
              strokeDasharray="6 3"
              style={{
                filter: `drop-shadow(0 0 6px ${activeCallout.severity === 'critical' ? '#F87171' : '#FBBF24'})`,
              }}
            />
            {/* Callout box */}
            <g transform="translate(150, 100)">
              <rect
                x="-100"
                y="-40"
                width="200"
                height="55"
                fill="rgba(9, 9, 11, 0.95)"
                stroke={activeCallout.severity === 'critical' ? '#F87171' : '#FBBF24'}
                strokeWidth="1"
                rx="4"
              />
              {/* Left accent border */}
              <rect
                x="-100"
                y="-40"
                width="4"
                height="55"
                fill={activeCallout.severity === 'critical' ? '#F87171' : '#FBBF24'}
                rx="2"
              />
              {/* Callout text */}
              <text
                x="-90"
                y="-20"
                style={{
                  fontSize: '14px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fill: activeCallout.severity === 'critical' ? '#F87171' : '#FBBF24',
                  fontWeight: 700,
                }}
              >
                ⚠ {activeCallout.type.replace('_', ' ')}
              </text>
              <text
                x="-90"
                y="0"
                style={{
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fill: '#CBD5E1',
                  fontWeight: 500,
                }}
              >
                {activeCallout.message.length > 28
                  ? activeCallout.message.slice(0, 28) + '...'
                  : activeCallout.message}
              </text>
            </g>
          </svg>
        </div>
      )}

      {/* Telemetry Overlay - Top left corner - DEAL-KILLER #2 TEXT SIZES */}
      <div
        className="absolute top-4 left-4 px-4 py-3"
        style={{
          backgroundColor: 'rgba(9, 9, 11, 0.85)',
          backdropFilter: 'blur(4px)',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex items-center gap-5">
          {/* Altitude */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>ALT</span>
            <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#F1F5F9' }}>
              {telemetry.altitude}m
            </span>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>SPD</span>
            <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#F1F5F9' }}>
              {telemetry.speed}m/s
            </span>
          </div>

          {/* Heading */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>HDG</span>
            <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#F1F5F9' }}>
              {String(telemetry.heading).padStart(3, '0')}°
            </span>
          </div>

          {/* GPS Status */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>GPS</span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
                color: telemetry.gpsStatus === 'DRIFT' ? '#FCA5A5' :
                       telemetry.gpsStatus === 'ACQUIRING' ? '#fbbf24' :
                       '#F1F5F9',
              }}
              className={telemetry.gpsStatus === 'DRIFT' ? 'animate-pulse' : ''}
            >
              {telemetry.gpsStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Low confidence indicator - Top right - DEAL-KILLER #2 */}
      {isLowConfidence && (
        <div
          className="absolute top-4 right-4 px-4 py-3"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #FCA5A5',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace',
            color: '#FCA5A5',
          }}
        >
          CONFIDENCE: {(confidence * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}
