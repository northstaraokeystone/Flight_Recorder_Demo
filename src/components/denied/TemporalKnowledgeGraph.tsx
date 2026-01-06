/**
 * TemporalKnowledgeGraph - AI Reasoning Visualization
 * v2.3 BULLETPROOF: Visualizes AI citing precedent, not hallucinating
 *
 * Node Types:
 * - Current Decision: Circle (pulsing) in Slate-200
 * - Memory Episode: Square in Slate-400
 * - External Source (CRAG): Diamond in Amber-500
 *
 * Edge Animation:
 * - Lines draw from Current Decision to Historical Pattern
 * - Lines draw from Current Decision to External Source
 * - Proves: "AI is citing precedent, not hallucinating"
 */

import { useMemo, useEffect, useState, useRef } from 'react';
import type { ScenarioPhase } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface TemporalKnowledgeGraphProps {
  phase: ScenarioPhase;
  isVisible?: boolean;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'decision' | 'memory' | 'external';
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
  animated: boolean;
}

export function TemporalKnowledgeGraph({ phase, isVisible = true }: TemporalKnowledgeGraphProps) {
  const [activeEdges, setActiveEdges] = useState<string[]>([]);
  const [showExternalNode, setShowExternalNode] = useState(false);
  const [showMemoryNode, setShowMemoryNode] = useState(false);
  const lastPhaseRef = useRef(phase);

  // Define nodes based on GPS drift scenario - v2.3 BULLETPROOF
  const nodes: GraphNode[] = useMemo(() => {
    const baseNodes: GraphNode[] = [
      { id: 'current', label: 'GPS_DRIFT_DETECTED', type: 'decision', x: 100, y: 30 },
    ];

    if (showMemoryNode) {
      baseNodes.push({
        id: 'memory',
        label: 'GPS_DRIFT_2024-03',
        type: 'memory',
        x: 100,
        y: 90,
      });
    }

    if (showExternalNode) {
      baseNodes.push({
        id: 'external',
        label: 'FAA_Advisory_2024-07',
        type: 'external',
        x: 100,
        y: 150,
      });
    }

    return baseNodes;
  }, [showMemoryNode, showExternalNode]);

  // Define edges
  const edges: GraphEdge[] = useMemo(() => {
    const result: GraphEdge[] = [];

    if (showMemoryNode) {
      result.push({
        from: 'current',
        to: 'memory',
        label: 'temporal.py',
        animated: activeEdges.includes('current-memory'),
      });
    }

    if (showExternalNode) {
      result.push({
        from: 'memory',
        to: 'external',
        label: 'crag.py',
        animated: activeEdges.includes('memory-external'),
      });
    }

    return result;
  }, [showMemoryNode, showExternalNode, activeEdges]);

  // Handle phase transitions to animate graph
  useEffect(() => {
    // When entering CRAG_TRIGGERED, show memory node with animation
    if (phase === 'CRAG_TRIGGERED' && lastPhaseRef.current !== 'CRAG_TRIGGERED') {
      setShowMemoryNode(true);
      setTimeout(() => {
        setActiveEdges(['current-memory']);
      }, 300);
    }

    // When entering HUMAN_QUERY, show external node with animation
    if (phase === 'HUMAN_QUERY' && lastPhaseRef.current !== 'HUMAN_QUERY') {
      setShowExternalNode(true);
      setTimeout(() => {
        setActiveEdges(['current-memory', 'memory-external']);
      }, 300);
    }

    // Reset when mission completes or restarts
    if (phase === 'TAKEOFF' && lastPhaseRef.current !== 'TAKEOFF') {
      setShowMemoryNode(false);
      setShowExternalNode(false);
      setActiveEdges([]);
    }

    lastPhaseRef.current = phase;
  }, [phase]);

  // Check if we should show the graph
  const isGraphActive = phase !== 'TAKEOFF' && phase !== 'WAYPOINT_1' && phase !== 'WAYPOINT_2' && phase !== 'NORMAL_OPS';

  if (!isVisible || !isGraphActive) {
    return null;
  }

  // Get node position
  const getNodePosition = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  // Render node based on type
  const renderNode = (node: GraphNode) => {
    const isDecision = node.type === 'decision';
    const isMemory = node.type === 'memory';
    const isExternal = node.type === 'external';

    const nodeColor = isDecision
      ? COLORS.textSecondary
      : isMemory
        ? COLORS.textMuted
        : '#d97706'; // Amber-600

    const size = 10;

    return (
      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
        {/* Node shape */}
        {isDecision && (
          <circle
            r={size}
            fill="none"
            stroke={nodeColor}
            strokeWidth="1.5"
            className="animate-pulse"
          />
        )}
        {isDecision && (
          <circle r={4} fill={nodeColor} />
        )}

        {isMemory && (
          <rect
            x={-size}
            y={-size}
            width={size * 2}
            height={size * 2}
            fill="none"
            stroke={nodeColor}
            strokeWidth="1.5"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          />
        )}

        {isExternal && (
          <polygon
            points={`0,${-size} ${size},0 0,${size} ${-size},0`}
            fill="none"
            stroke={nodeColor}
            strokeWidth="1.5"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          />
        )}

        {/* Label */}
        <text
          x={size + 8}
          y={4}
          style={{
            fontSize: '8px',
            fontFamily: 'JetBrains Mono, monospace',
            fill: nodeColor,
          }}
        >
          {node.label}
        </text>
      </g>
    );
  };

  // Render edge with animation
  const renderEdge = (edge: GraphEdge, _index: number) => {
    const from = getNodePosition(edge.from);
    const to = getNodePosition(edge.to);

    const edgeId = `${edge.from}-${edge.to}`;
    const isAnimated = activeEdges.includes(edgeId);

    return (
      <g key={edgeId}>
        {/* Edge line */}
        <line
          x1={from.x}
          y1={from.y + 12}
          x2={to.x}
          y2={to.y - 12}
          stroke={COLORS.textTimestamp}
          strokeWidth="1"
          strokeDasharray={isAnimated ? 'none' : '4 2'}
          style={{
            opacity: isAnimated ? 0.8 : 0.3,
            transition: 'opacity 0.3s',
          }}
        />

        {/* Edge label */}
        <text
          x={from.x + 15}
          y={(from.y + to.y) / 2}
          style={{
            fontSize: '7px',
            fontFamily: 'JetBrains Mono, monospace',
            fill: COLORS.textTimestamp,
            opacity: isAnimated ? 0.8 : 0.3,
          }}
        >
          {edge.label}
        </text>

        {/* Arrow */}
        <polygon
          points={`${to.x},${to.y - 12} ${to.x - 3},${to.y - 18} ${to.x + 3},${to.y - 18}`}
          fill={COLORS.textTimestamp}
          style={{ opacity: isAnimated ? 0.8 : 0.3 }}
        />
      </g>
    );
  };

  return (
    <div
      className="absolute bottom-16 right-4 z-30"
      style={{
        width: '200px',
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        border: `1px solid ${COLORS.borderBracket}`,
        padding: '8px',
      }}
    >
      {/* Header */}
      <div
        className="mb-2"
        style={{
          fontSize: '9px',
          color: COLORS.textTimestamp,
          letterSpacing: '0.05em',
        }}
      >
        DECISION PROVENANCE
      </div>

      {/* Graph SVG */}
      <svg
        viewBox="0 0 200 180"
        width="100%"
        height="160"
      >
        {/* Render edges first (behind nodes) */}
        {edges.map((edge, i) => renderEdge(edge, i))}

        {/* Render nodes */}
        {nodes.map(renderNode)}
      </svg>

      {/* Status */}
      <div
        className="mt-1 flex items-center gap-2"
        style={{ fontSize: '8px', color: COLORS.textTimestamp }}
      >
        <span>PROVENANCE:</span>
        <span style={{ color: showExternalNode ? COLORS.textSecondary : COLORS.textMuted }}>
          {showExternalNode ? 'VERIFIED' : showMemoryNode ? 'RETRIEVING...' : 'IDLE'}
        </span>
      </div>
    </div>
  );
}
