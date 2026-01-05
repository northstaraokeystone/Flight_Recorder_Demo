/**
 * MerkleTree - Visual Merkle tree component
 * Per §CONSTRAINT-TREE - scales to fit, no clipping, proper padding
 */

import type { ReactNode } from 'react';
import type { MerkleNode } from '../types';

interface MerkleTreeProps {
  root: MerkleNode;
  className?: string;
}

// Calculate tree depth
function getTreeDepth(node: MerkleNode | undefined): number {
  if (!node) return 0;
  if (node.isLeaf) return 1;
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
}

// Tree node component
function TreeNode({
  node,
  x,
  y,
  size,
}: {
  node: MerkleNode;
  x: number;
  y: number;
  size: number;
}) {
  const fillColor = node.isAffected
    ? '#dc2626' // red-600
    : node.isLeaf
    ? '#22c55e' // green-500
    : '#3b82f6'; // blue-500

  const strokeColor = node.isAffected ? '#fca5a5' : '#6b7280';

  return (
    <g>
      {/* Node circle */}
      <circle
        cx={x}
        cy={y}
        r={size}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
        className="transition-all duration-300"
      />

      {/* Hash label (truncated) */}
      <text
        x={x}
        y={y + size + 14}
        textAnchor="middle"
        className="fill-gray-400 text-[10px] font-mono"
      >
        {node.hash.slice(0, 8)}...
      </text>

      {/* Leaf label */}
      {node.isLeaf && node.receipt && (
        <text
          x={x}
          y={y + size + 26}
          textAnchor="middle"
          className="fill-gray-500 text-[9px]"
        >
          {node.receipt.action}
        </text>
      )}

      {/* Root label */}
      {node.id === 'root' && (
        <text
          x={x}
          y={y - size - 8}
          textAnchor="middle"
          className="fill-white text-xs font-semibold"
        >
          ROOT
        </text>
      )}
    </g>
  );
}

export function MerkleTree({ root, className = '' }: MerkleTreeProps) {
  const depth = getTreeDepth(root);
  const padding = 40;
  const nodeSize = 16;
  const levelHeight = 70;

  // Calculate viewBox dimensions
  const width = Math.max(400, Math.pow(2, depth - 1) * 80 + padding * 2);
  const height = depth * levelHeight + padding * 2;

  // Render tree recursively
  function renderNode(
    node: MerkleNode | undefined,
    x: number,
    y: number,
    spread: number,
    _level: number
  ): ReactNode {
    if (!node) return null;

    const leftX = x - spread / 2;
    const rightX = x + spread / 2;
    const childY = y + levelHeight;
    const childSpread = spread / 2;

    return (
      <g key={node.id}>
        {/* Lines to children */}
        {node.left && (
          <line
            x1={x}
            y1={y + nodeSize}
            x2={leftX}
            y2={childY - nodeSize}
            stroke={node.left.isAffected ? '#dc2626' : '#4b5563'}
            strokeWidth={node.left.isAffected ? 2 : 1}
            className="transition-all duration-300"
          />
        )}
        {node.right && (
          <line
            x1={x}
            y1={y + nodeSize}
            x2={rightX}
            y2={childY - nodeSize}
            stroke={node.right.isAffected ? '#dc2626' : '#4b5563'}
            strokeWidth={node.right.isAffected ? 2 : 1}
            className="transition-all duration-300"
          />
        )}

        {/* Node */}
        <TreeNode node={node} x={x} y={y} size={nodeSize} />

        {/* Children */}
        {renderNode(node.left, leftX, childY, childSpread, _level + 1)}
        {renderNode(node.right, rightX, childY, childSpread, _level + 1)}
      </g>
    );
  }

  return (
    <div
      className={`
        relative p-6 min-w-[450px] min-h-[350px]
        bg-gray-800/50 border border-gray-700 rounded-lg
        ${className}
      `}
    >
      {/* Title */}
      <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
        Merkle Tree
      </div>

      {/* SVG Tree - scales to fit container */}
      <div className="w-full h-full min-h-[280px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {renderNode(
            root,
            width / 2,
            padding + nodeSize,
            (width - padding * 2) * 0.8,
            0
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Leaf (Receipt)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Internal Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span>Affected</span>
        </div>
      </div>
    </div>
  );
}
