/**
 * AuthorityChainNode - Displays a single node in the authority chain
 * Per §CONSTRAINT-POLISH - all cards have visible borders
 */

import type { Receipt } from '../types';
import { GateIndicator } from './GateIndicator';

interface AuthorityChainNodeProps {
  receipt: Receipt;
  isHighlighted?: boolean;
  isBroken?: boolean;
}

export function AuthorityChainNode({
  receipt,
  isHighlighted = false,
  isBroken = false,
}: AuthorityChainNodeProps) {
  const borderClass = isBroken
    ? 'border-red-500 border-dashed'
    : isHighlighted
    ? 'border-red-500'
    : 'border-gray-700';

  return (
    <div
      className={`
        bg-gray-800/50
        border ${borderClass}
        rounded-lg
        p-4
        min-w-[280px]
        relative
      `}
    >
      {/* Broken indicator */}
      {isBroken && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          ✕
        </div>
      )}

      {/* Timestamp and action */}
      <div className="text-sm text-gray-400 font-mono">{receipt.timestamp}</div>
      <div className="text-lg font-semibold text-white mt-1">{receipt.action}</div>

      {/* RACI and confidence */}
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Responsible:</span>
          <span className="text-white">{receipt.raci.responsible}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Accountable:</span>
          <span className="text-white">{receipt.raci.accountable}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Confidence:</span>
          <span className="text-white">{receipt.confidence.toFixed(2)}</span>
        </div>
        {receipt.reason && (
          <div className="flex justify-between">
            <span className="text-gray-400">Reason:</span>
            <span className="text-white text-xs font-mono">{receipt.reason}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Gate:</span>
          <GateIndicator gate={receipt.gate} showLabel />
        </div>
      </div>
    </div>
  );
}

/**
 * Connector line between nodes
 */
export function ChainConnector() {
  return (
    <div className="flex flex-col items-center py-2">
      <div className="w-0.5 h-4 bg-gray-600" />
      <div className="text-gray-500">▼</div>
    </div>
  );
}
