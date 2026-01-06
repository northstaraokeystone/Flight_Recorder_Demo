/**
 * TacticalGrid - Stealth Radar Aesthetic
 * v2.3 BULLETPROOF: Military radar display with telemetry overlay
 *
 * - Background: Pure black
 * - Grid: Barely visible radar crosshairs
 * - Flight path: Faint slate line with ghost trail
 * - Current position: Single bright dot with direction
 * - Waypoints: Dim markers, only current highlighted
 * - Geofence: Dashed boundary, flashes RED on violation
 * - Telemetry: ALT, SPD, HDG, GPS status overlay
 */

import { useMemo, useEffect, useState, useRef } from 'react';
import type { DronePosition, ThreatData, ScenarioPhase, UnknownObject } from '../../constants/scenario';
import { MAP_ZONES, FLIGHT_PATH, UNKNOWN_OBJECT_LOCATION } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface TacticalGridProps {
  dronePosition: DronePosition;
  threat: ThreatData | null;
  phase: ScenarioPhase;
  visitedPathIndex: number;
  avoidancePath?: { x: number; y: number }[];
  showGhostPath?: boolean;
  stopRuleEngaged?: boolean;
  interlockFreeze?: boolean;
  unknownObject?: UnknownObject | null;
  currentWaypoint?: number;
  confidence?: number;
}

// Simulated telemetry data based on drone position and phase
interface TelemetryData {
  altitude: number;
  speed: number;
  heading: number;
  gpsStatus: 'LOCKED' | 'DRIFT' | 'ACQUIRING';
}

export function TacticalGrid({
  dronePosition,
  threat,
  phase,
  visitedPathIndex,
  showGhostPath: _showGhostPath = false,
  stopRuleEngaged: _stopRuleEngaged = false,
  interlockFreeze = false,
  unknownObject,
  currentWaypoint = 0,
  confidence = 0.99,
}: TacticalGridProps) {
  const [geofenceFlash, setGeofenceFlash] = useState(false);
  const lastPhaseRef = useRef(phase);

  // Check if in uncertainty zone
  const isUncertaintyPhase = [
    'UNCERTAINTY_DETECTED',
    'CRAG_TRIGGERED',
    'HUMAN_QUERY',
  ].includes(phase);

  // Simulate telemetry based on position and phase
  const telemetry: TelemetryData = useMemo(() => {
    const baseAlt = 120;
    const baseSpeed = 15;
    // Calculate heading from rotation
    const heading = Math.round((dronePosition.rotation + 45) % 360);

    // GPS status based on phase
    let gpsStatus: TelemetryData['gpsStatus'] = 'LOCKED';
    if (isUncertaintyPhase) {
      gpsStatus = 'DRIFT';
    } else if (phase === 'HUMAN_RESPONSE' || phase === 'RACI_HANDOFF_BACK') {
      gpsStatus = 'ACQUIRING';
    }

    // Slight variations based on phase
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

      // Stop flashing after 3 seconds
      const timeout = setTimeout(() => {
        clearInterval(flashInterval);
        setGeofenceFlash(true); // Keep it highlighted
      }, 3000);

      return () => {
        clearInterval(flashInterval);
        clearTimeout(timeout);
      };
    }
    lastPhaseRef.current = phase;
  }, [phase]);

  // Generate path string for completed trail
  const completedPathD = useMemo(() => {
    const points = FLIGHT_PATH.slice(0, Math.min(visitedPathIndex + 1, FLIGHT_PATH.length));
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => {
      return acc + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
    }, '');
  }, [visitedPathIndex]);

  // Future path (dimmer)
  const futurePathD = useMemo(() => {
    const futurePoints = FLIGHT_PATH.slice(Math.max(visitedPathIndex, 0));
    if (futurePoints.length < 2) return '';
    return futurePoints.reduce((acc, pt, i) => {
      return acc + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
    }, '');
  }, [visitedPathIndex]);

  // Determine display state
  const showUnknownObject = unknownObject?.detected || isUncertaintyPhase;
  const isLowConfidence = confidence < 0.70;

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${interlockFreeze ? 'interlock-freeze' : ''}`}
      style={{
        backgroundColor: COLORS.bgPrimary,
        border: `1px solid ${isUncertaintyPhase ? COLORS.alertRed : COLORS.borderBracket}`,
        transition: interlockFreeze ? 'none' : 'border-color 0.5s',
      }}
    >
      {/* Pane Header */}
      <div
        className="absolute top-0 left-0 right-0 px-3 py-2 z-20"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: COLORS.textMuted,
          backgroundColor: 'rgba(9, 9, 11, 0.95)',
          borderBottom: `1px solid ${COLORS.borderBracket}`,
        }}
      >
        TACTICAL MAP
      </div>

      {/* Current Mode Badge */}
      <div
        className="absolute top-10 right-3 px-2 py-1 z-20"
        style={{
          fontSize: '9px',
          fontFamily: 'monospace',
          color: isUncertaintyPhase ? COLORS.alertRed : COLORS.textDim,
          border: `1px solid ${isUncertaintyPhase ? COLORS.alertRed : COLORS.borderBracket}`,
          backgroundColor: isUncertaintyPhase ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
        }}
      >
        {isUncertaintyPhase ? 'UNCERTAINTY' : 'TRACKING'}
      </div>

      {/* SVG Map */}
      <svg
        viewBox="0 0 560 360"
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        style={{
          marginTop: '40px',
          height: 'calc(100% - 80px)',
        }}
      >
        {/* Background */}
        <rect width="100%" height="100%" fill={COLORS.bgPrimary} />

        {/* Barely visible grid lines */}
        <g opacity="0.15">
          {/* Vertical lines */}
          {Array.from({ length: 29 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 20}
              y1={0}
              x2={i * 20}
              y2={320}
              stroke={COLORS.textTimestamp}
              strokeWidth="0.5"
            />
          ))}
          {/* Horizontal lines */}
          {Array.from({ length: 17 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * 20}
              x2={560}
              y2={i * 20}
              stroke={COLORS.textTimestamp}
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* Radar crosshairs - center of map */}
        <g opacity="0.1">
          <line x1="280" y1="0" x2="280" y2="320" stroke={COLORS.textMuted} strokeWidth="1" />
          <line x1="0" y1="160" x2="560" y2="160" stroke={COLORS.textMuted} strokeWidth="1" />
          <circle cx="280" cy="160" r="80" fill="none" stroke={COLORS.textTimestamp} strokeWidth="0.5" />
          <circle cx="280" cy="160" r="160" fill="none" stroke={COLORS.textTimestamp} strokeWidth="0.5" />
        </g>

        {/* Geofence / GPS Bounds - THE KEY CONSTRAINT VISUALIZATION */}
        <g>
          <rect
            x={MAP_ZONES.grey.x}
            y={MAP_ZONES.grey.y}
            width={MAP_ZONES.grey.width}
            height={MAP_ZONES.grey.height}
            fill="none"
            stroke={isUncertaintyPhase && geofenceFlash ? COLORS.alertRed : COLORS.textTimestamp}
            strokeWidth={isUncertaintyPhase ? 2 : 1}
            strokeDasharray="8 4"
            opacity={isUncertaintyPhase ? 0.8 : 0.3}
            style={{
              transition: 'stroke 0.15s, opacity 0.3s',
            }}
          />
          {/* Geofence label */}
          <text
            x={MAP_ZONES.grey.x + 5}
            y={MAP_ZONES.grey.y - 5}
            style={{
              fontSize: '8px',
              fontFamily: 'monospace',
              fill: isUncertaintyPhase && geofenceFlash ? COLORS.alertRed : COLORS.textTimestamp,
              opacity: isUncertaintyPhase ? 0.9 : 0.5,
            }}
          >
            GEOFENCE / GPS BOUNDS
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
            opacity="0.5"
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

        {/* Active segment - slightly brighter */}
        {visitedPathIndex > 0 && visitedPathIndex < FLIGHT_PATH.length && (
          <line
            x1={FLIGHT_PATH[visitedPathIndex - 1].x}
            y1={FLIGHT_PATH[visitedPathIndex - 1].y}
            x2={dronePosition.x}
            y2={dronePosition.y}
            stroke={COLORS.flightPathActive}
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}

        {/* Waypoints */}
        {FLIGHT_PATH.map((wp, i) => {
          const isCurrent = i === currentWaypoint;
          const isCompleted = i < visitedPathIndex;
          const isFuture = i > visitedPathIndex;
          void isFuture; // Used for styling logic below

          return (
            <g key={i}>
              {/* Waypoint marker */}
              <circle
                cx={wp.x}
                cy={wp.y}
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
              {/* Label */}
              <text
                x={wp.x}
                y={wp.y - 10}
                textAnchor="middle"
                style={{
                  fontSize: '8px',
                  fontFamily: 'monospace',
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

        {/* GPS Drift Zone indicator - v2.3 BULLETPROOF */}
        {showUnknownObject && (
          <g className={isLowConfidence ? 'animate-pulse' : ''}>
            {/* Drift zone circle */}
            <circle
              cx={UNKNOWN_OBJECT_LOCATION.x}
              cy={UNKNOWN_OBJECT_LOCATION.y}
              r="12"
              fill="none"
              stroke={COLORS.alertRed}
              strokeWidth="1.5"
              strokeDasharray={unknownObject?.identified ? 'none' : '4 2'}
              opacity={0.6}
            />
            {/* Inner indicator */}
            <circle
              cx={UNKNOWN_OBJECT_LOCATION.x}
              cy={UNKNOWN_OBJECT_LOCATION.y}
              r="4"
              fill={unknownObject?.identified ? COLORS.textMuted : COLORS.alertRed}
            />
            <text
              x={UNKNOWN_OBJECT_LOCATION.x + 16}
              y={UNKNOWN_OBJECT_LOCATION.y - 5}
              style={{
                fontSize: '8px',
                fontFamily: 'monospace',
                fill: COLORS.alertRed,
              }}
            >
              {unknownObject?.identified ? unknownObject.identifiedAs : 'GPS_DRIFT'}
            </text>
          </g>
        )}

        {/* Threat indicator (legacy support) */}
        {threat?.detected && !showUnknownObject && (
          <g className={threat.avoided ? '' : 'animate-pulse'}>
            <circle
              cx={threat.x}
              cy={threat.y}
              r="8"
              fill="none"
              stroke={COLORS.alertRed}
              strokeWidth="1.5"
              opacity={threat.avoided ? 0.3 : 1}
            />
          </g>
        )}

        {/* Drone position - single bright dot */}
        <g transform={`translate(${dronePosition.x}, ${dronePosition.y})`}>
          {/* Glow effect */}
          <circle
            r="8"
            fill={isLowConfidence ? 'rgba(239, 68, 68, 0.2)' : 'rgba(248, 250, 252, 0.1)'}
          />
          {/* Main dot */}
          <circle
            r="4"
            fill={isLowConfidence ? COLORS.alertRed : COLORS.waypointCurrent}
          />
          {/* Direction indicator */}
          <g transform={`rotate(${dronePosition.rotation})`}>
            <polygon
              points="0,-8 3,-2 -3,-2"
              fill={isLowConfidence ? COLORS.alertRed : COLORS.textSecondary}
              opacity="0.8"
            />
          </g>
        </g>

        {/* Drone label */}
        <text
          x={dronePosition.x + 12}
          y={dronePosition.y + 4}
          style={{
            fontSize: '8px',
            fontFamily: 'monospace',
            fill: COLORS.textMuted,
          }}
        >
          UAV_01
        </text>
      </svg>

      {/* Telemetry Overlay - Bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-2 flex items-center justify-between z-20"
        style={{
          backgroundColor: 'rgba(9, 9, 11, 0.95)',
          borderTop: `1px solid ${COLORS.borderBracket}`,
        }}
      >
        <div className="flex items-center gap-6">
          {/* Altitude */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '9px', color: COLORS.textTimestamp }}>ALT</span>
            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: COLORS.textSecondary }}>
              {telemetry.altitude}m
            </span>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '9px', color: COLORS.textTimestamp }}>SPD</span>
            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: COLORS.textSecondary }}>
              {telemetry.speed}m/s
            </span>
          </div>

          {/* Heading */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '9px', color: COLORS.textTimestamp }}>HDG</span>
            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: COLORS.textSecondary }}>
              {String(telemetry.heading).padStart(3, '0')}°
            </span>
          </div>

          {/* GPS Status */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '9px', color: COLORS.textTimestamp }}>GPS</span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                color: telemetry.gpsStatus === 'DRIFT' ? COLORS.alertRed :
                       telemetry.gpsStatus === 'ACQUIRING' ? COLORS.alertAmber :
                       COLORS.textSecondary,
              }}
              className={telemetry.gpsStatus === 'DRIFT' ? 'animate-pulse' : ''}
            >
              {telemetry.gpsStatus}
            </span>
          </div>
        </div>

        {/* Confidence indicator - moved to telemetry bar */}
        {isLowConfidence && (
          <div
            className="px-2 py-1"
            style={{
              fontSize: '9px',
              fontFamily: 'monospace',
              color: COLORS.alertRed,
              border: `1px solid ${COLORS.alertRed}`,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            CONFIDENCE: {(confidence * 100).toFixed(0)}%
          </div>
        )}
      </div>

      {/* Interlock freeze overlay */}
      {interlockFreeze && (
        <div
          className="absolute inset-0 pointer-events-none z-30"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: `2px solid ${COLORS.alertRed}`,
          }}
        />
      )}
    </div>
  );
}
