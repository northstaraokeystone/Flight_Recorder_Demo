/**
 * TacticalTheater - 2D operational picture with zones
 * Anduril/Shield AI visual style - clean lines, minimal detail, data-forward
 */

import { useMemo } from 'react';
import type { DronePosition, ThreatData, ScenarioPhase } from '../../constants/scenario';
import { MAP_ZONES, FLIGHT_PATH } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface TacticalTheaterProps {
  dronePosition: DronePosition;
  threat: ThreatData | null;
  phase: ScenarioPhase;
  visitedPathIndex: number;
  avoidancePath: { x: number; y: number }[];
  showStaticEffect: boolean;
}

export function TacticalTheater({
  dronePosition,
  threat,
  phase,
  visitedPathIndex,
  avoidancePath,
  showStaticEffect,
}: TacticalTheaterProps) {
  // Generate path string for drone trail
  const pathD = useMemo(() => {
    const points = FLIGHT_PATH.slice(0, Math.min(visitedPathIndex + 1, FLIGHT_PATH.length));
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => {
      return acc + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
    }, '');
  }, [visitedPathIndex]);

  // Avoidance path string
  const avoidancePathD = useMemo(() => {
    if (avoidancePath.length === 0) return '';
    return avoidancePath.reduce((acc, pt, i) => {
      return acc + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
    }, '');
  }, [avoidancePath]);

  const isInDeadZone = phase === 'OFFLINE' || phase === 'INCIDENT_DETECTED' ||
    phase === 'STOP_RULE_TRIGGERED' || phase === 'AVOIDANCE_EXECUTED';

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundColor: COLORS.bgPrimary,
        border: `1px solid ${COLORS.borderBracket}`,
      }}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 z-10" style={{ borderColor: COLORS.statusOnline }} />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 z-10" style={{ borderColor: COLORS.statusOnline }} />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 z-10" style={{ borderColor: COLORS.statusOnline }} />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 z-10" style={{ borderColor: COLORS.statusOnline }} />

      {/* Theater label */}
      <div
        className="absolute top-2 left-4 text-[10px] font-mono tracking-widest z-10"
        style={{ color: COLORS.textMuted }}
      >
        TACTICAL THEATER
      </div>

      {/* Asset label */}
      <div
        className="absolute top-2 right-4 text-[10px] font-mono tracking-widest z-10"
        style={{ color: COLORS.statusOnline }}
      >
        UAV_ALPHA
      </div>

      {/* SVG Map */}
      <svg
        viewBox="0 0 560 320"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Definitions */}
        <defs>
          {/* Grid pattern */}
          <pattern
            id="tactical-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke={COLORS.bgGrid}
              strokeWidth="0.5"
            />
          </pattern>

          {/* Static noise pattern for dead zone */}
          <filter id="static-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="1"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Hatching pattern for dead zone */}
          <pattern
            id="dead-zone-hatch"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke={COLORS.zoneGrey}
              strokeWidth="1"
              opacity="0.3"
            />
          </pattern>

          {/* Glow filter for drone */}
          <filter id="drone-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        <rect width="100%" height="100%" fill="url(#tactical-grid)" />

        {/* Green Zone - Flight Corridor */}
        <g>
          <rect
            x={MAP_ZONES.green.x}
            y={MAP_ZONES.green.y}
            width={MAP_ZONES.green.width}
            height={MAP_ZONES.green.height}
            fill="transparent"
            stroke={COLORS.zoneGreen}
            strokeWidth="2"
            strokeDasharray="4 2"
            opacity="0.6"
          />
          <text
            x={MAP_ZONES.green.x + MAP_ZONES.green.width / 2}
            y={MAP_ZONES.green.y - 8}
            textAnchor="middle"
            className="text-[9px] font-mono"
            fill={COLORS.zoneGreen}
          >
            {MAP_ZONES.green.label}
          </text>
        </g>

        {/* Grey Zone - Comms Dead Zone */}
        <g>
          <rect
            x={MAP_ZONES.grey.x}
            y={MAP_ZONES.grey.y}
            width={MAP_ZONES.grey.width}
            height={MAP_ZONES.grey.height}
            fill="url(#dead-zone-hatch)"
            stroke={COLORS.zoneGrey}
            strokeWidth="2"
            opacity={isInDeadZone ? 1 : 0.4}
            className="transition-opacity duration-500"
          />
          <text
            x={MAP_ZONES.grey.x + MAP_ZONES.grey.width / 2}
            y={MAP_ZONES.grey.y - 8}
            textAnchor="middle"
            className="text-[9px] font-mono"
            fill={COLORS.zoneGrey}
          >
            {MAP_ZONES.grey.label}
          </text>

          {/* Static effect overlay */}
          {showStaticEffect && (
            <rect
              x={MAP_ZONES.grey.x}
              y={MAP_ZONES.grey.y}
              width={MAP_ZONES.grey.width}
              height={MAP_ZONES.grey.height}
              fill="rgba(74, 85, 104, 0.1)"
              filter="url(#static-noise)"
              className="animate-pulse"
            />
          )}
        </g>

        {/* Red Zone - Liability Zone */}
        <g>
          <rect
            x={MAP_ZONES.red.x}
            y={MAP_ZONES.red.y}
            width={MAP_ZONES.red.width}
            height={MAP_ZONES.red.height}
            fill="transparent"
            stroke={COLORS.zoneRed}
            strokeWidth="2"
            strokeDasharray="6 3"
            opacity="0.7"
          />
          <text
            x={MAP_ZONES.red.x + MAP_ZONES.red.width / 2}
            y={MAP_ZONES.red.y - 8}
            textAnchor="middle"
            className="text-[9px] font-mono"
            fill={COLORS.zoneRed}
          >
            {MAP_ZONES.red.label}
          </text>
        </g>

        {/* Flight path trail */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={COLORS.statusOnline}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        )}

        {/* Avoidance path */}
        {avoidancePathD && (
          <path
            d={avoidancePathD}
            fill="none"
            stroke={COLORS.alertGreen}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
        )}

        {/* Threat indicator */}
        {threat && threat.detected && (
          <g
            className={`${threat.avoided ? '' : 'animate-pulse'}`}
            opacity={threat.avoided ? 0.4 : 0.8}
          >
            {/* Threat zone circle */}
            <circle
              cx={threat.x}
              cy={threat.y}
              r={35}
              fill="rgba(204, 51, 51, 0.1)"
              stroke={COLORS.zoneRed}
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Threat icon (rectangle for bus) */}
            <rect
              x={threat.x - 15}
              y={threat.y - 8}
              width={30}
              height={16}
              fill="none"
              stroke={COLORS.alertRedBright}
              strokeWidth="2"
              rx="2"
            />

            {/* Threat label */}
            <text
              x={threat.x}
              y={threat.y + 30}
              textAnchor="middle"
              className="text-[8px] font-mono font-bold"
              fill={COLORS.alertRedBright}
            >
              {threat.label}
            </text>
          </g>
        )}

        {/* Drone icon - sharp chevron */}
        <g
          transform={`translate(${dronePosition.x}, ${dronePosition.y}) rotate(${dronePosition.rotation})`}
          filter="url(#drone-glow)"
        >
          {/* Chevron shape */}
          <polygon
            points="-10,8 0,-10 10,8 0,4"
            fill={COLORS.statusOnline}
            stroke={COLORS.statusOnline}
            strokeWidth="1"
          />

          {/* Center dot */}
          <circle r="2" fill={COLORS.bgPrimary} />
        </g>

        {/* "COLLISION PREVENTED" overlay */}
        {threat?.avoided && (
          <g>
            <text
              x="280"
              y="300"
              textAnchor="middle"
              className="text-sm font-mono font-bold"
              fill={COLORS.alertGreen}
            >
              COLLISION PREVENTED
            </text>
          </g>
        )}
      </svg>

      {/* Static edge effect when in dead zone */}
      {showStaticEffect && (
        <>
          <div
            className="absolute inset-y-0 left-0 w-4 pointer-events-none animate-pulse"
            style={{
              background: `linear-gradient(90deg, rgba(74, 85, 104, 0.3) 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute inset-y-0 right-0 w-4 pointer-events-none animate-pulse"
            style={{
              background: `linear-gradient(-90deg, rgba(74, 85, 104, 0.3) 0%, transparent 100%)`,
            }}
          />
        </>
      )}
    </div>
  );
}
