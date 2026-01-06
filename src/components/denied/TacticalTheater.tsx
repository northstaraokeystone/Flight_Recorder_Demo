/**
 * TacticalTheater - LIDAR-style operational picture
 * Dense, professional, instrument-grade visualization
 * Small elements, thin lines, overwhelming data density
 */

import { useMemo } from 'react';
import type { DronePosition, ThreatData, ScenarioPhase } from '../../constants/scenario';
import { MAP_ZONES, FLIGHT_PATH, THREAT_LOCATION } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface TacticalTheaterProps {
  dronePosition: DronePosition;
  threat: ThreatData | null;
  phase: ScenarioPhase;
  visitedPathIndex: number;
  avoidancePath: { x: number; y: number }[];
  showStaticEffect: boolean;
  showGhostPath?: boolean;
  stopRuleEngaged?: boolean;
}

export function TacticalTheater({
  dronePosition,
  threat,
  phase,
  visitedPathIndex,
  avoidancePath,
  showStaticEffect,
  showGhostPath = false,
  stopRuleEngaged = false,
}: TacticalTheaterProps) {
  // Generate path string for drone trail
  const pathD = useMemo(() => {
    const points = FLIGHT_PATH.slice(0, Math.min(visitedPathIndex + 1, FLIGHT_PATH.length));
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => {
      return acc + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
    }, '');
  }, [visitedPathIndex]);

  // Avoidance path string (corrective vector)
  const avoidancePathD = useMemo(() => {
    if (avoidancePath.length === 0) return '';
    return avoidancePath.reduce((acc, pt, i) => {
      return acc + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
    }, '');
  }, [avoidancePath]);

  // Ghost path - projected collision course
  const ghostPathD = useMemo(() => {
    if (!showGhostPath || !threat) return '';
    // From incident detection point to threat location
    return `M 350 135 L ${THREAT_LOCATION.x} ${THREAT_LOCATION.y}`;
  }, [showGhostPath, threat]);

  const isInDeadZone = phase === 'OFFLINE' || phase === 'INCIDENT_DETECTED' ||
    phase === 'STOP_RULE_TRIGGERED' || phase === 'AVOIDANCE_EXECUTED';

  // Liability zone center for radar circles
  const liabCenter = {
    x: MAP_ZONES.red.x + MAP_ZONES.red.width / 2,
    y: MAP_ZONES.red.y + MAP_ZONES.red.height / 2,
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${showStaticEffect ? 'crt-static' : ''}`}
      style={{
        backgroundColor: COLORS.bgPrimary,
        border: `1px solid ${showStaticEffect ? COLORS.alertAmber : COLORS.borderBracket}`,
        transition: 'border-color 0.3s',
      }}
    >
      {/* Tiny corner brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t z-10" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t z-10" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b z-10" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b z-10" style={{ borderColor: COLORS.borderBracket }} />

      {/* Stop rule badge - appears when triggered */}
      {stopRuleEngaged && (
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 z-20 animate-stopRuleFlash"
          style={{
            backgroundColor: 'rgba(0, 170, 102, 0.2)',
            border: `1px solid ${COLORS.alertGreen}`,
            fontSize: '8px',
            fontFamily: 'monospace',
            color: COLORS.alertGreen,
          }}
        >
          STOP_RULE: ENGAGED
        </div>
      )}

      {/* SVG Map */}
      <svg
        viewBox="0 0 560 320"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Definitions */}
        <defs>
          {/* Dense grid pattern - 50px spacing */}
          <pattern
            id="tactical-grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.5"
            />
          </pattern>

          {/* Fine grid overlay - 10px */}
          <pattern
            id="fine-grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="0.3"
            />
          </pattern>

          {/* Noise dots pattern for terrain simulation */}
          <pattern
            id="noise-dots"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            {/* Scattered dots for terrain feel */}
            <circle cx="12" cy="34" r="0.5" fill="rgba(255,255,255,0.04)" />
            <circle cx="45" cy="12" r="0.5" fill="rgba(255,255,255,0.03)" />
            <circle cx="78" cy="56" r="0.5" fill="rgba(255,255,255,0.05)" />
            <circle cx="23" cy="89" r="0.5" fill="rgba(255,255,255,0.03)" />
            <circle cx="67" cy="23" r="0.5" fill="rgba(255,255,255,0.04)" />
            <circle cx="91" cy="78" r="0.5" fill="rgba(255,255,255,0.03)" />
            <circle cx="34" cy="67" r="0.5" fill="rgba(255,255,255,0.05)" />
            <circle cx="56" cy="91" r="0.5" fill="rgba(255,255,255,0.04)" />
            <circle cx="89" cy="45" r="0.5" fill="rgba(255,255,255,0.03)" />
            <circle cx="8" cy="8" r="0.5" fill="rgba(255,255,255,0.04)" />
          </pattern>

          {/* Diagonal hatch for dead zone */}
          <pattern
            id="dead-zone-hatch"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0" y1="0" x2="0" y2="10"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          </pattern>

          {/* Subtle glow for drone */}
          <filter id="drone-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Threat pulse filter */}
          <filter id="threat-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background layers for density */}
        <rect width="100%" height="100%" fill={COLORS.bgPrimary} />
        <rect width="100%" height="100%" fill="url(#fine-grid)" />
        <rect width="100%" height="100%" fill="url(#tactical-grid)" />
        <rect width="100%" height="100%" fill="url(#noise-dots)" />

        {/* Green Zone - Flight Corridor (subtle, 1px dashed border) */}
        <g opacity="0.5">
          <rect
            x={MAP_ZONES.green.x}
            y={MAP_ZONES.green.y}
            width={MAP_ZONES.green.width}
            height={MAP_ZONES.green.height}
            fill="rgba(42, 90, 58, 0.05)"
            stroke={COLORS.zoneGreen}
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          {/* Small corner label */}
          <text
            x={MAP_ZONES.green.x + 4}
            y={MAP_ZONES.green.y + 10}
            className="text-[7px] font-mono"
            fill={COLORS.zoneGreen}
            opacity="0.8"
          >
            CORRIDOR_01
          </text>
        </g>

        {/* Grey Zone - Comms Dead Zone (hatch pattern) */}
        <g>
          <rect
            x={MAP_ZONES.grey.x}
            y={MAP_ZONES.grey.y}
            width={MAP_ZONES.grey.width}
            height={MAP_ZONES.grey.height}
            fill="url(#dead-zone-hatch)"
            stroke={COLORS.zoneGrey}
            strokeWidth="1"
            opacity={isInDeadZone ? 0.8 : 0.4}
            className="transition-opacity duration-300"
          />
          {/* Small corner label */}
          <text
            x={MAP_ZONES.grey.x + 4}
            y={MAP_ZONES.grey.y + 10}
            className="text-[7px] font-mono"
            fill={COLORS.zoneGrey}
            opacity="0.8"
          >
            DEAD_ZONE
          </text>
        </g>

        {/* Red Zone - Liability Zone as RADAR CIRCLES */}
        <g className={threat?.detected && !threat.avoided ? 'animate-radarPulse' : ''}>
          {/* Outer ring */}
          <circle
            cx={liabCenter.x}
            cy={liabCenter.y}
            r={70}
            fill="none"
            stroke={COLORS.zoneRed}
            strokeWidth="0.5"
            opacity="0.2"
          />
          {/* Middle ring */}
          <circle
            cx={liabCenter.x}
            cy={liabCenter.y}
            r={50}
            fill="none"
            stroke={COLORS.zoneRed}
            strokeWidth="0.5"
            opacity="0.3"
          />
          {/* Inner ring */}
          <circle
            cx={liabCenter.x}
            cy={liabCenter.y}
            r={30}
            fill="rgba(90, 42, 42, 0.15)"
            stroke={COLORS.zoneRedBright}
            strokeWidth="1"
            opacity="0.5"
          />
          {/* Center crosshair */}
          <line
            x1={liabCenter.x - 8} y1={liabCenter.y}
            x2={liabCenter.x + 8} y2={liabCenter.y}
            stroke={COLORS.zoneRedBright}
            strokeWidth="0.5"
            opacity="0.5"
          />
          <line
            x1={liabCenter.x} y1={liabCenter.y - 8}
            x2={liabCenter.x} y2={liabCenter.y + 8}
            stroke={COLORS.zoneRedBright}
            strokeWidth="0.5"
            opacity="0.5"
          />
          {/* Small corner label */}
          <text
            x={liabCenter.x - 60}
            y={liabCenter.y - 75}
            className="text-[7px] font-mono"
            fill={COLORS.zoneRedBright}
            opacity="0.6"
          >
            RESTRICTED_AIRSPACE
          </text>
        </g>

        {/* Ghost path - projected collision course (red dotted) */}
        {ghostPathD && (
          <g>
            <path
              d={ghostPathD}
              fill="none"
              stroke={COLORS.alertRedBright}
              strokeWidth="1"
              strokeDasharray="4 2"
              opacity="0.7"
              className="animate-ghostPath"
            />
            {/* Label for ghost path */}
            <text
              x="385"
              y="125"
              className="text-[6px] font-mono"
              fill={COLORS.alertRedBright}
              opacity="0.8"
            >
              PROJECTED: IMPACT T-2.4s
            </text>
          </g>
        )}

        {/* Flight path trail - THIN (1px) */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={COLORS.statusOnline}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
        )}

        {/* Avoidance path - corrective vector (cyan solid, thin) */}
        {avoidancePathD && (
          <g>
            <path
              d={avoidancePathD}
              fill="none"
              stroke={COLORS.statusOnline}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            {/* Label for corrective vector */}
            {avoidancePath.length > 2 && (
              <text
                x={avoidancePath[1]?.x || 340}
                y={(avoidancePath[1]?.y || 170) + 15}
                className="text-[6px] font-mono"
                fill={COLORS.statusOnline}
                opacity="0.8"
              >
                VECTOR: RACI_OVERRIDE
              </text>
            )}
          </g>
        )}

        {/* Threat indicator - small crosshair + diamond */}
        {threat && threat.detected && (
          <g
            filter="url(#threat-glow)"
            opacity={threat.avoided ? 0.4 : 0.9}
          >
            {/* Small diamond marker */}
            <polygon
              points={`${threat.x},${threat.y - 6} ${threat.x + 6},${threat.y} ${threat.x},${threat.y + 6} ${threat.x - 6},${threat.y}`}
              fill="none"
              stroke={COLORS.alertRedBright}
              strokeWidth="1"
              className={threat.avoided ? '' : 'animate-pulse'}
            />
            {/* Crosshair lines */}
            <line
              x1={threat.x - 12} y1={threat.y}
              x2={threat.x - 8} y2={threat.y}
              stroke={COLORS.alertRedBright}
              strokeWidth="1"
            />
            <line
              x1={threat.x + 8} y1={threat.y}
              x2={threat.x + 12} y2={threat.y}
              stroke={COLORS.alertRedBright}
              strokeWidth="1"
            />
            <line
              x1={threat.x} y1={threat.y - 12}
              x2={threat.x} y2={threat.y - 8}
              stroke={COLORS.alertRedBright}
              strokeWidth="1"
            />
            <line
              x1={threat.x} y1={threat.y + 8}
              x2={threat.x} y2={threat.y + 12}
              stroke={COLORS.alertRedBright}
              strokeWidth="1"
            />
            {/* Tiny label */}
            <text
              x={threat.x + 15}
              y={threat.y - 8}
              className="text-[6px] font-mono"
              fill={COLORS.alertRedBright}
            >
              TGT_01
            </text>
          </g>
        )}

        {/* Drone icon - SMALL triangle (8px) with velocity vector */}
        <g
          transform={`translate(${dronePosition.x}, ${dronePosition.y}) rotate(${dronePosition.rotation})`}
          filter="url(#drone-glow)"
        >
          {/* Velocity vector - thin line extending from nose */}
          <line
            x1="0" y1="-5"
            x2="0" y2="-18"
            stroke={COLORS.statusOnline}
            strokeWidth="0.5"
            opacity="0.6"
          />
          {/* Small triangle (8px) */}
          <polygon
            points="-4,4 0,-5 4,4 0,2"
            fill={COLORS.statusOnline}
            stroke={COLORS.statusOnline}
            strokeWidth="0.5"
          />
        </g>

        {/* Drone label - offset slightly */}
        <text
          x={dronePosition.x + 10}
          y={dronePosition.y - 10}
          className="text-[6px] font-mono"
          fill={COLORS.statusOnline}
          opacity="0.8"
        >
          UAV_01
        </text>
      </svg>

      {/* Amber border pulse effect when in dead zone */}
      {showStaticEffect && (
        <div
          className="absolute inset-0 pointer-events-none animate-borderPulseAmber"
          style={{
            border: '2px solid rgba(255, 170, 0, 0.3)',
          }}
        />
      )}
    </div>
  );
}
