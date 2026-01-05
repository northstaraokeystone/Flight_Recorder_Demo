/**
 * MissionMap - SVG-based mission visualization
 * Shows drone path, waypoints, threat zone, and engagement vector
 */

import { useMemo } from 'react';
import type { Receipt } from '../types';

interface MissionMapProps {
  receipts: Receipt[];
  className?: string;
}

// Mission path coordinates
const WAYPOINTS = [
  { x: 50, y: 200 },   // Start
  { x: 120, y: 150 },  // Waypoint 1
  { x: 200, y: 180 },  // Waypoint 2
  { x: 280, y: 120 },  // Waypoint 3
  { x: 350, y: 160 },  // Detection point
];

const THREAT_ZONE = { x: 350, y: 160, radius: 60 };
const ENGAGEMENT_TARGET = { x: 380, y: 140 };

export function MissionMap({ receipts, className = '' }: MissionMapProps) {
  // Determine current state from receipts
  const state = useMemo(() => {
    const hasDetect = receipts.some(r => r.action === 'DETECT');
    const hasApprove = receipts.some(r => r.action === 'APPROVE');
    const hasEngage = receipts.some(r => r.action === 'ENGAGE');

    // Calculate drone position based on receipt count
    const navCount = receipts.filter(r => r.action === 'NAVIGATE').length;
    const progressIndex = Math.min(navCount, WAYPOINTS.length - 1);
    const dronePos = hasDetect
      ? WAYPOINTS[WAYPOINTS.length - 1]
      : WAYPOINTS[progressIndex];

    return {
      dronePos,
      showThreat: hasDetect,
      showEngagement: hasApprove || hasEngage,
      isEngaged: hasEngage,
      visitedWaypoints: progressIndex + 1,
    };
  }, [receipts]);

  // Generate path string for drone trail
  const pathD = useMemo(() => {
    const points = WAYPOINTS.slice(0, state.visitedWaypoints);
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => {
      return acc + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
    }, '');
  }, [state.visitedWaypoints]);

  return (
    <div
      className={`
        bg-gray-800/50 border border-gray-700 rounded-lg p-4
        min-w-[400px] min-h-[280px]
        ${className}
      `}
    >
      {/* Header */}
      <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
        Mission Map
      </div>

      {/* SVG Map */}
      <div className="w-full h-[220px]">
        <svg
          viewBox="0 0 450 250"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background grid */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#1f2937"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Threat zone (dashed circle) */}
          {state.showThreat && (
            <circle
              cx={THREAT_ZONE.x}
              cy={THREAT_ZONE.y}
              r={THREAT_ZONE.radius}
              fill="rgba(220, 38, 38, 0.1)"
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray="8 4"
              className="animate-pulse"
            />
          )}

          {/* Waypoints */}
          {WAYPOINTS.map((wp, i) => (
            <circle
              key={i}
              cx={wp.x}
              cy={wp.y}
              r={6}
              fill={i < state.visitedWaypoints ? '#6b7280' : '#374151'}
              stroke="#9ca3af"
              strokeWidth="1"
            />
          ))}

          {/* Drone trail */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Engagement vector */}
          {state.showEngagement && (
            <line
              x1={state.dronePos.x}
              y1={state.dronePos.y}
              x2={ENGAGEMENT_TARGET.x}
              y2={ENGAGEMENT_TARGET.y}
              stroke={state.isEngaged ? '#ef4444' : '#f59e0b'}
              strokeWidth="3"
              strokeDasharray={state.isEngaged ? 'none' : '6 3'}
              markerEnd="url(#arrowhead)"
            />
          )}

          {/* Arrowhead marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill={state.isEngaged ? '#ef4444' : '#f59e0b'}
              />
            </marker>
          </defs>

          {/* Drone icon */}
          <g transform={`translate(${state.dronePos.x}, ${state.dronePos.y})`}>
            <circle
              r="12"
              fill="#3b82f6"
              stroke="#60a5fa"
              strokeWidth="2"
            />
            <text
              textAnchor="middle"
              y="4"
              className="fill-white text-[10px] font-bold"
            >
              ▲
            </text>
          </g>

          {/* Target marker (if engagement) */}
          {state.showEngagement && (
            <g transform={`translate(${ENGAGEMENT_TARGET.x}, ${ENGAGEMENT_TARGET.y})`}>
              <circle r="8" fill="none" stroke="#ef4444" strokeWidth="2" />
              <circle r="3" fill="#ef4444" />
            </g>
          )}

          {/* Labels */}
          <text x="50" y="225" className="fill-gray-500 text-[10px]">START</text>
          {state.showThreat && (
            <text x="350" y="235" className="fill-red-500 text-[10px]" textAnchor="middle">
              THREAT DETECTED
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Drone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-gray-400" />
          <span>Waypoint</span>
        </div>
        {state.showThreat && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-dashed border-red-500" />
            <span>Threat Zone</span>
          </div>
        )}
      </div>
    </div>
  );
}
