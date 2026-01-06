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
const CAMERA = {
  DRONE_X_PERCENT: 0.5,  // 50% from left
  DRONE_Y_PERCENT: 0.4,  // 40% from top
  VIEWPORT_WIDTH: 560,
  VIEWPORT_HEIGHT: 360,
};

// Calculate screen position for drone
const DRONE_SCREEN_X = CAMERA.VIEWPORT_WIDTH * CAMERA.DRONE_X_PERCENT;
const DRONE_SCREEN_Y = CAMERA.VIEWPORT_HEIGHT * CAMERA.DRONE_Y_PERCENT;

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

  // Check if in uncertainty zone
  const isUncertaintyPhase = [
    'UNCERTAINTY_DETECTED',
    'CRAG_TRIGGERED',
    'HUMAN_QUERY',
  ].includes(phase);

  // CAMERA FOLLOW SYSTEM: Calculate world offset
  // This is the key transformation - drone stays at fixed screen position,
  // world translates in opposite direction
  const worldOffset = useMemo(() => ({
    x: dronePosition.x - DRONE_SCREEN_X,
    y: dronePosition.y - DRONE_SCREEN_Y,
  }), [dronePosition.x, dronePosition.y]);

  // Transform world coordinates to screen coordinates
  const worldToScreen = (worldX: number, worldY: number) => ({
    x: worldX - worldOffset.x,
    y: worldY - worldOffset.y,
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
  const completedPathD = useMemo(() => {
    const points = FLIGHT_PATH.slice(0, Math.min(visitedPathIndex + 1, FLIGHT_PATH.length));
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => {
      const screen = worldToScreen(pt.x, pt.y);
      return acc + (i === 0 ? `M ${screen.x} ${screen.y}` : ` L ${screen.x} ${screen.y}`);
    }, '');
  }, [visitedPathIndex, worldOffset.x, worldOffset.y]);

  // Future path (dimmer)
  const futurePathD = useMemo(() => {
    const futurePoints = FLIGHT_PATH.slice(Math.max(visitedPathIndex, 0));
    if (futurePoints.length < 2) return '';
    return futurePoints.reduce((acc, pt, i) => {
      const screen = worldToScreen(pt.x, pt.y);
      return acc + (i === 0 ? `M ${screen.x} ${screen.y}` : ` L ${screen.x} ${screen.y}`);
    }, '');
  }, [visitedPathIndex, worldOffset.x, worldOffset.y]);

  // Active segment from last waypoint to drone (drone is fixed at center)
  const activeSegmentStart = useMemo(() => {
    if (visitedPathIndex > 0 && visitedPathIndex < FLIGHT_PATH.length) {
      return worldToScreen(FLIGHT_PATH[visitedPathIndex - 1].x, FLIGHT_PATH[visitedPathIndex - 1].y);
    }
    return null;
  }, [visitedPathIndex, worldOffset.x, worldOffset.y]);

  // Determine display state
  const showUnknownObject = unknownObject?.detected || isUncertaintyPhase;
  const isLowConfidence = confidence < 0.70;

  // Transform unknown object location to screen coords
  const unknownObjScreen = worldToScreen(UNKNOWN_OBJECT_LOCATION.x, UNKNOWN_OBJECT_LOCATION.y);

  // Transform geofence to screen coords
  const geofenceScreen = {
    x: MAP_ZONES.grey.x - worldOffset.x,
    y: MAP_ZONES.grey.y - worldOffset.y,
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundColor: COLORS.bgPrimary,
      }}
    >
      {/* SVG Map - Full Bleed */}
      <svg
        viewBox={`0 0 ${CAMERA.VIEWPORT_WIDTH} ${CAMERA.VIEWPORT_HEIGHT}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background */}
        <rect width="100%" height="100%" fill={COLORS.bgPrimary} />

        {/* WORLD LAYER - Everything here moves with the camera */}
        <g className="world-layer">
          {/* Barely visible grid lines - translated with world */}
          <g opacity="0.12">
            {/* Vertical lines */}
            {Array.from({ length: 40 }).map((_, i) => {
              const worldX = i * 20;
              const screenX = worldX - worldOffset.x;
              return (
                <line
                  key={`v-${i}`}
                  x1={screenX}
                  y1={0}
                  x2={screenX}
                  y2={CAMERA.VIEWPORT_HEIGHT}
                  stroke={COLORS.textTimestamp}
                  strokeWidth="0.5"
                />
              );
            })}
            {/* Horizontal lines */}
            {Array.from({ length: 25 }).map((_, i) => {
              const worldY = i * 20;
              const screenY = worldY - worldOffset.y;
              return (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={screenY}
                  x2={CAMERA.VIEWPORT_WIDTH}
                  y2={screenY}
                  stroke={COLORS.textTimestamp}
                  strokeWidth="0.5"
                />
              );
            })}
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

          {/* Geofence / GPS Bounds - moves with world */}
          <g>
            <rect
              x={geofenceScreen.x}
              y={geofenceScreen.y}
              width={MAP_ZONES.grey.width}
              height={MAP_ZONES.grey.height}
              fill="none"
              stroke={isUncertaintyPhase && geofenceFlash ? COLORS.alertRed : COLORS.textTimestamp}
              strokeWidth={isUncertaintyPhase ? 2 : 1}
              strokeDasharray="8 4"
              opacity={isUncertaintyPhase ? 0.8 : 0.25}
              style={{
                transition: 'stroke 0.15s, opacity 0.3s',
              }}
            />
            <text
              x={geofenceScreen.x + 5}
              y={geofenceScreen.y - 5}
              style={{
                fontSize: '8px',
                fontFamily: 'JetBrains Mono, monospace',
                fill: isUncertaintyPhase && geofenceFlash ? COLORS.alertRed : COLORS.textTimestamp,
                opacity: isUncertaintyPhase ? 0.9 : 0.4,
              }}
            >
              GPS BOUNDS
            </text>
          </g>

          {/* Future path - very dim */}
          {futurePathD && (
            <path
              d={futurePathD}
              fill="none"
              stroke={COLORS.waypointFuture}
              strokeWidth="1"
              strokeDasharray="2 4"
              opacity="0.4"
            />
          )}

          {/* Completed path - dim slate */}
          {completedPathD && (
            <path
              d={completedPathD}
              fill="none"
              stroke={COLORS.flightPathInactive}
              strokeWidth="1.5"
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
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* Waypoints - move with world */}
          {FLIGHT_PATH.map((wp, i) => {
            const isCurrent = i === currentWaypoint;
            const isCompleted = i < visitedPathIndex;
            const screen = worldToScreen(wp.x, wp.y);

            return (
              <g key={i}>
                <circle
                  cx={screen.x}
                  cy={screen.y}
                  r={isCurrent ? 6 : 4}
                  fill={isCurrent ? COLORS.waypointCurrent : 'none'}
                  stroke={
                    isCurrent
                      ? COLORS.waypointCurrent
                      : isCompleted
                        ? COLORS.waypointCompleted
                        : COLORS.waypointFuture
                  }
                  strokeWidth={isCurrent ? 2 : 1}
                  className={isCurrent ? 'animate-subtlePulse' : ''}
                />
                <text
                  x={screen.x}
                  y={screen.y - 10}
                  textAnchor="middle"
                  style={{
                    fontSize: '7px',
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

          {/* GPS Drift Zone indicator - moves with world */}
          {showUnknownObject && (
            <g className={isLowConfidence ? 'animate-pulse' : ''}>
              <circle
                cx={unknownObjScreen.x}
                cy={unknownObjScreen.y}
                r="14"
                fill="none"
                stroke={COLORS.alertRed}
                strokeWidth="1.5"
                strokeDasharray={unknownObject?.identified ? 'none' : '4 2'}
                opacity={0.6}
              />
              <circle
                cx={unknownObjScreen.x}
                cy={unknownObjScreen.y}
                r="4"
                fill={unknownObject?.identified ? COLORS.textMuted : COLORS.alertRed}
              />
              <text
                x={unknownObjScreen.x + 18}
                y={unknownObjScreen.y - 5}
                style={{
                  fontSize: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fill: COLORS.alertRed,
                }}
              >
                {unknownObject?.identified ? unknownObject.identifiedAs : 'GPS_DRIFT'}
              </text>
            </g>
          )}
        </g>

        {/* DRONE LAYER - Fixed at center, never moves */}
        <g transform={`translate(${DRONE_SCREEN_X}, ${DRONE_SCREEN_Y})`}>
          {/* Glow effect */}
          <circle
            r="12"
            fill={isLowConfidence ? 'rgba(239, 68, 68, 0.15)' : 'rgba(248, 250, 252, 0.08)'}
          />
          {/* Outer ring */}
          <circle
            r="8"
            fill="none"
            stroke={isLowConfidence ? COLORS.alertRed : COLORS.textMuted}
            strokeWidth="1"
            opacity="0.5"
          />
          {/* Main dot */}
          <circle
            r="4"
            fill={isLowConfidence ? COLORS.alertRed : COLORS.waypointCurrent}
          />
          {/* Direction indicator */}
          <g transform={`rotate(${dronePosition.rotation})`}>
            <polygon
              points="0,-10 4,-3 -4,-3"
              fill={isLowConfidence ? COLORS.alertRed : COLORS.textSecondary}
              opacity="0.9"
            />
          </g>
        </g>

        {/* Drone label - fixed below drone */}
        <text
          x={DRONE_SCREEN_X}
          y={DRONE_SCREEN_Y + 24}
          textAnchor="middle"
          style={{
            fontSize: '9px',
            fontFamily: 'JetBrains Mono, monospace',
            fill: COLORS.textMuted,
            letterSpacing: '0.05em',
          }}
        >
          UAV_01
        </text>

        {/* LEADER LINE & CALLOUT - When critical events fire */}
        {calloutVisible && activeCallout && (
          <g className="callout-layer animate-fadeIn">
            {/* Leader line from drone to callout */}
            <line
              x1={DRONE_SCREEN_X}
              y1={DRONE_SCREEN_Y}
              x2={DRONE_SCREEN_X - 100}
              y2={DRONE_SCREEN_Y - 70}
              stroke={activeCallout.severity === 'critical' ? COLORS.alertRed : '#d97706'}
              strokeWidth="2"
              strokeDasharray="4 2"
              style={{
                filter: `drop-shadow(0 0 4px ${activeCallout.severity === 'critical' ? COLORS.alertRed : '#d97706'})`,
              }}
            />
            {/* Callout box */}
            <g transform={`translate(${DRONE_SCREEN_X - 100}, ${DRONE_SCREEN_Y - 70})`}>
              <rect
                x="-85"
                y="-35"
                width="170"
                height="45"
                fill="rgba(9, 9, 11, 0.95)"
                stroke={activeCallout.severity === 'critical' ? COLORS.alertRed : '#d97706'}
                strokeWidth="1"
                rx="4"
              />
              {/* Left accent border */}
              <rect
                x="-85"
                y="-35"
                width="4"
                height="45"
                fill={activeCallout.severity === 'critical' ? COLORS.alertRed : '#d97706'}
                rx="2"
              />
              {/* Callout text */}
              <text
                x="-75"
                y="-18"
                style={{
                  fontSize: '9px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fill: activeCallout.severity === 'critical' ? COLORS.alertRed : '#d97706',
                  fontWeight: 600,
                }}
              >
                {activeCallout.type.replace('_', ' ')}
              </text>
              <text
                x="-75"
                y="-2"
                style={{
                  fontSize: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fill: COLORS.textMuted,
                }}
              >
                {activeCallout.message.length > 25
                  ? activeCallout.message.slice(0, 25) + '...'
                  : activeCallout.message}
              </text>
            </g>
          </g>
        )}
      </svg>

      {/* Telemetry Overlay - Top left corner */}
      <div
        className="absolute top-4 left-4 px-3 py-2"
        style={{
          backgroundColor: 'rgba(9, 9, 11, 0.85)',
          backdropFilter: 'blur(4px)',
          borderRadius: '4px',
          border: `1px solid ${COLORS.borderBracket}`,
        }}
      >
        <div className="flex items-center gap-4">
          {/* Altitude */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '9px', color: COLORS.textTimestamp }}>ALT</span>
            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: COLORS.textSecondary }}>
              {telemetry.altitude}m
            </span>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '9px', color: COLORS.textTimestamp }}>SPD</span>
            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: COLORS.textSecondary }}>
              {telemetry.speed}m/s
            </span>
          </div>

          {/* Heading */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '9px', color: COLORS.textTimestamp }}>HDG</span>
            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: COLORS.textSecondary }}>
              {String(telemetry.heading).padStart(3, '0')}°
            </span>
          </div>

          {/* GPS Status */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '9px', color: COLORS.textTimestamp }}>GPS</span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                color: telemetry.gpsStatus === 'DRIFT' ? COLORS.alertRed :
                       telemetry.gpsStatus === 'ACQUIRING' ? '#d97706' :
                       COLORS.textSecondary,
              }}
              className={telemetry.gpsStatus === 'DRIFT' ? 'animate-pulse' : ''}
            >
              {telemetry.gpsStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Low confidence indicator - Top right */}
      {isLowConfidence && (
        <div
          className="absolute top-4 right-4 px-3 py-2"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${COLORS.alertRed}`,
            borderRadius: '4px',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            color: COLORS.alertRed,
          }}
        >
          CONFIDENCE: {(confidence * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}
