/**
 * TacticalGrid - Rectangular Cartesian Grid
 * v5.0: Kill the circle. Precision over searching.
 * Grid FRAGMENTS in dead zone (lines break/jitter)
 */

import React, { useMemo, useEffect, useState } from 'react';
import type { DronePosition, ThreatData, ScenarioPhase } from '../../constants/scenario';
import { MAP_ZONES, FLIGHT_PATH, THREAT_LOCATION } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface TacticalGridProps {
  dronePosition: DronePosition;
  threat: ThreatData | null;
  phase: ScenarioPhase;
  visitedPathIndex: number;
  avoidancePath: { x: number; y: number }[];
  showGhostPath?: boolean;
  stopRuleEngaged?: boolean;
  interlockFreeze?: boolean;
}

// Generate grid fragmentation offsets for dead zone
function generateFragmentationOffsets(seed: number): number[] {
  const offsets: number[] = [];
  for (let i = 0; i < 30; i++) {
    offsets.push(Math.sin(seed * 0.1 + i * 0.5) * 2 + Math.cos(seed * 0.15 + i * 0.3) * 1.5);
  }
  return offsets;
}

export function TacticalGrid({
  dronePosition,
  threat,
  phase,
  visitedPathIndex,
  avoidancePath,
  showGhostPath = false,
  stopRuleEngaged = false,
  interlockFreeze = false,
}: TacticalGridProps) {
  const [fragmentSeed, setFragmentSeed] = useState(0);

  // Animate fragmentation when in dead zone
  const isInDeadZone = phase === 'OFFLINE' || phase === 'INCIDENT_DETECTED' ||
    phase === 'STOP_RULE_TRIGGERED' || phase === 'AVOIDANCE_EXECUTED';

  useEffect(() => {
    if (isInDeadZone && !interlockFreeze) {
      const interval = setInterval(() => {
        setFragmentSeed(s => s + 1);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isInDeadZone, interlockFreeze]);

  const fragmentOffsets = useMemo(() => generateFragmentationOffsets(fragmentSeed), [fragmentSeed]);

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
    return `M 350 135 L ${THREAT_LOCATION.x} ${THREAT_LOCATION.y}`;
  }, [showGhostPath, threat]);

  // Generate Cartesian grid lines
  const gridLines = useMemo(() => {
    const lines: React.ReactElement[] = [];
    const spacing = 20;

    // Vertical lines
    for (let x = 0; x <= 560; x += spacing) {
      const isInDeadZoneX = x >= MAP_ZONES.grey.x && x <= MAP_ZONES.grey.x + MAP_ZONES.grey.width;
      const fragIndex = Math.floor(x / spacing) % fragmentOffsets.length;
      const fragOffset = isInDeadZone && isInDeadZoneX ? fragmentOffsets[fragIndex] : 0;

      if (isInDeadZone && isInDeadZoneX) {
        // Fragmented line - broken into segments with gaps
        const segments = [];
        let y = 0;
        while (y < 320) {
          const segmentLength = 15 + Math.random() * 10;
          const gapLength = 3 + Math.random() * 5;
          const jitter = fragmentOffsets[(fragIndex + Math.floor(y / 20)) % fragmentOffsets.length];
          segments.push(
            <line
              key={`v-${x}-${y}`}
              x1={x + jitter}
              y1={y}
              x2={x + jitter + fragOffset * 0.5}
              y2={Math.min(y + segmentLength, 320)}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.5"
            />
          );
          y += segmentLength + gapLength;
        }
        lines.push(...segments);
      } else {
        lines.push(
          <line
            key={`v-${x}`}
            x1={x}
            y1={0}
            x2={x}
            y2={320}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />
        );
      }
    }

    // Horizontal lines
    for (let y = 0; y <= 320; y += spacing) {
      const isInDeadZoneY = y >= MAP_ZONES.grey.y && y <= MAP_ZONES.grey.y + MAP_ZONES.grey.height;
      const fragIndex = Math.floor(y / spacing) % fragmentOffsets.length;
      const fragOffset = isInDeadZone && isInDeadZoneY ? fragmentOffsets[fragIndex] : 0;

      if (isInDeadZone && isInDeadZoneY) {
        // Fragmented line
        const segments = [];
        let x = MAP_ZONES.grey.x;
        while (x < MAP_ZONES.grey.x + MAP_ZONES.grey.width) {
          const segmentLength = 15 + Math.random() * 10;
          const gapLength = 3 + Math.random() * 5;
          const jitter = fragmentOffsets[(fragIndex + Math.floor(x / 20)) % fragmentOffsets.length];
          segments.push(
            <line
              key={`h-${y}-${x}`}
              x1={x}
              y1={y + jitter}
              x2={Math.min(x + segmentLength, MAP_ZONES.grey.x + MAP_ZONES.grey.width)}
              y2={y + jitter + fragOffset * 0.5}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.5"
            />
          );
          x += segmentLength + gapLength;
        }
        // Non-dead zone portions
        lines.push(
          <line
            key={`h-${y}-left`}
            x1={0}
            y1={y}
            x2={MAP_ZONES.grey.x}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />,
          <line
            key={`h-${y}-right`}
            x1={MAP_ZONES.grey.x + MAP_ZONES.grey.width}
            y1={y}
            x2={560}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />,
          ...segments
        );
      } else {
        lines.push(
          <line
            key={`h-${y}`}
            x1={0}
            y1={y}
            x2={560}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />
        );
      }
    }

    return lines;
  }, [isInDeadZone, fragmentOffsets]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${interlockFreeze ? 'interlock-freeze' : ''}`}
      style={{
        backgroundColor: '#0a0a0a',
        border: `1px solid ${isInDeadZone ? COLORS.alertAmber : COLORS.borderBracket}`,
        transition: interlockFreeze ? 'none' : 'border-color 0.3s',
      }}
    >
      {/* Pane Header */}
      <div
        className="absolute top-0 left-0 right-0 px-2 py-1 font-mono z-20"
        style={{
          fontSize: '8px',
          letterSpacing: '0.1em',
          color: COLORS.textMuted,
          backgroundColor: 'rgba(10, 10, 10, 0.9)',
          borderBottom: `1px solid ${COLORS.borderBracket}`,
        }}
      >
        TACTICAL GRID | ASSET: UAV_01 | MODE: {isInDeadZone ? 'OFFLINE' : 'TRACKING'}
      </div>

      {/* Stop rule badge - appears when triggered */}
      {stopRuleEngaged && (
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 z-20"
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
        style={{ marginTop: '24px' }}
      >
        {/* Definitions */}
        <defs>
          <filter id="drone-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="threat-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="100%" height="100%" fill="#0a0a0a" />

        {/* Cartesian grid lines */}
        <g className="grid-lines">{gridLines}</g>

        {/* Dead Zone - Rectangular with darker tint */}
        <g>
          <rect
            x={MAP_ZONES.grey.x}
            y={MAP_ZONES.grey.y}
            width={MAP_ZONES.grey.width}
            height={MAP_ZONES.grey.height}
            fill={isInDeadZone ? 'rgba(30, 30, 30, 0.5)' : 'rgba(20, 20, 20, 0.3)'}
            stroke={COLORS.zoneGrey}
            strokeWidth="1"
          />
          <text
            x={MAP_ZONES.grey.x + 4}
            y={MAP_ZONES.grey.y + 10}
            className="text-[8px] font-mono"
            fill={COLORS.zoneGrey}
            opacity="0.8"
          >
            DENIED_SECTOR
          </text>
        </g>

        {/* Flight Corridor - Rectangular */}
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
          <text
            x={MAP_ZONES.green.x + 4}
            y={MAP_ZONES.green.y + 10}
            className="text-[8px] font-mono"
            fill={COLORS.zoneGreen}
            opacity="0.8"
          >
            CORRIDOR
          </text>
        </g>

        {/* Threat Zone - Rectangular with crosshair */}
        <g className={threat?.detected && !threat.avoided ? 'animate-pulse' : ''}>
          <rect
            x={MAP_ZONES.red.x}
            y={MAP_ZONES.red.y}
            width={MAP_ZONES.red.width}
            height={MAP_ZONES.red.height}
            fill="none"
            stroke={COLORS.zoneRed}
            strokeWidth="1"
            opacity="0.3"
          />
          {/* Red crosshatch interior */}
          <g opacity="0.1">
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`crosshatch-${i}`}
                x1={MAP_ZONES.red.x}
                y1={MAP_ZONES.red.y + i * 14}
                x2={MAP_ZONES.red.x + MAP_ZONES.red.width}
                y2={MAP_ZONES.red.y + i * 14}
                stroke={COLORS.zoneRedBright}
                strokeWidth="0.5"
              />
            ))}
          </g>
          {/* Center crosshair */}
          <line
            x1={MAP_ZONES.red.x + MAP_ZONES.red.width / 2 - 10}
            y1={MAP_ZONES.red.y + MAP_ZONES.red.height / 2}
            x2={MAP_ZONES.red.x + MAP_ZONES.red.width / 2 + 10}
            y2={MAP_ZONES.red.y + MAP_ZONES.red.height / 2}
            stroke={COLORS.zoneRedBright}
            strokeWidth="0.5"
            opacity="0.5"
          />
          <line
            x1={MAP_ZONES.red.x + MAP_ZONES.red.width / 2}
            y1={MAP_ZONES.red.y + MAP_ZONES.red.height / 2 - 10}
            x2={MAP_ZONES.red.x + MAP_ZONES.red.width / 2}
            y2={MAP_ZONES.red.y + MAP_ZONES.red.height / 2 + 10}
            stroke={COLORS.zoneRedBright}
            strokeWidth="0.5"
            opacity="0.5"
          />
          <text
            x={MAP_ZONES.red.x + 4}
            y={MAP_ZONES.red.y + 10}
            className="text-[8px] font-mono"
            fill={COLORS.zoneRedBright}
            opacity="0.6"
          >
            THREAT_ZONE
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
            <text
              x={THREAT_LOCATION.x - 30}
              y={THREAT_LOCATION.y - 15}
              className="text-[6px] font-mono"
              fill={COLORS.alertRedBright}
              opacity="0.8"
            >
              PROJECTED
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

        {/* Avoidance path */}
        {avoidancePathD && (
          <path
            d={avoidancePathD}
            fill="none"
            stroke={COLORS.statusOnline}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
        )}

        {/* Threat indicator - small crosshair + diamond */}
        {threat && threat.detected && (
          <g filter="url(#threat-glow)" opacity={threat.avoided ? 0.4 : 0.9}>
            <polygon
              points={`${threat.x},${threat.y - 6} ${threat.x + 6},${threat.y} ${threat.x},${threat.y + 6} ${threat.x - 6},${threat.y}`}
              fill="none"
              stroke={COLORS.alertRedBright}
              strokeWidth="1"
              className={threat.avoided ? '' : 'animate-pulse'}
            />
            <line x1={threat.x - 12} y1={threat.y} x2={threat.x - 8} y2={threat.y} stroke={COLORS.alertRedBright} strokeWidth="1" />
            <line x1={threat.x + 8} y1={threat.y} x2={threat.x + 12} y2={threat.y} stroke={COLORS.alertRedBright} strokeWidth="1" />
            <line x1={threat.x} y1={threat.y - 12} x2={threat.x} y2={threat.y - 8} stroke={COLORS.alertRedBright} strokeWidth="1" />
            <line x1={threat.x} y1={threat.y + 8} x2={threat.x} y2={threat.y + 12} stroke={COLORS.alertRedBright} strokeWidth="1" />
            <text x={threat.x + 15} y={threat.y - 8} className="text-[6px] font-mono" fill={COLORS.alertRedBright}>
              TGT_01
            </text>
          </g>
        )}

        {/* Drone icon - SMALL chevron (6-8px), DISCRETE ticks */}
        <g
          transform={`translate(${dronePosition.x}, ${dronePosition.y}) rotate(${dronePosition.rotation})`}
          filter="url(#drone-glow)"
        >
          {/* Small chevron (6px) */}
          <polygon
            points="-3,3 0,-4 3,3 0,1"
            fill={COLORS.statusOnline}
            stroke={COLORS.statusOnline}
            strokeWidth="0.5"
          />
        </g>

        {/* Drone label */}
        <text
          x={dronePosition.x + 8}
          y={dronePosition.y - 8}
          className="text-[6px] font-mono"
          fill={COLORS.statusOnline}
          opacity="0.8"
        >
          UAV_01
        </text>

        {/* Axis labels */}
        <text x="5" y="315" className="text-[6px] font-mono" fill={COLORS.textMuted} opacity="0.5">X:0</text>
        <text x="545" y="315" className="text-[6px] font-mono" fill={COLORS.textMuted} opacity="0.5">X:100</text>
        <text x="5" y="15" className="text-[6px] font-mono" fill={COLORS.textMuted} opacity="0.5">Y:100</text>
      </svg>

      {/* Interlock freeze overlay */}
      {interlockFreeze && (
        <div
          className="absolute inset-0 pointer-events-none z-30"
          style={{
            backgroundColor: 'rgba(255, 170, 0, 0.1)',
            border: '2px solid rgba(255, 170, 0, 0.6)',
          }}
        />
      )}
    </div>
  );
}
