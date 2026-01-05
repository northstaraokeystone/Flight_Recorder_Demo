/**
 * ReceiptStream - Live scrolling receipt list
 * Per §CONSTRAINT-TEXT - proper overflow handling, no truncation
 */

import { useEffect, useRef } from 'react';
import type { Receipt } from '../types';
import { GateIndicator } from './GateIndicator';

interface ReceiptStreamProps {
  receipts: Receipt[];
  className?: string;
}

export function ReceiptStream({ receipts, className = '' }: ReceiptStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new receipts added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [receipts]);

  return (
    <div
      className={`
        bg-gray-800/50 border border-gray-700 rounded-lg p-4
        ${className}
      `}
    >
      {/* Header */}
      <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
        Receipt Stream
      </div>

      {/* Receipt list with proper scrolling */}
      <div
        ref={containerRef}
        className="
          min-h-[280px]
          max-h-[400px]
          overflow-y-auto
          scroll-smooth
          space-y-2
          pr-2
        "
      >
        {receipts.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Waiting for receipts...
          </div>
        ) : (
          receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="
                flex items-center justify-between gap-4
                p-3 rounded-lg
                bg-gray-900/50
                border border-gray-800
                break-words
                animate-[fadeIn_0.3s_ease-in]
              "
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-gray-400 font-mono text-sm flex-shrink-0">
                  {receipt.timestamp}
                </span>
                <span className="text-white font-medium flex-shrink-0">
                  {receipt.action}
                </span>
                {receipt.reason && (
                  <span className="text-gray-500 text-xs font-mono truncate">
                    ({receipt.reason})
                  </span>
                )}
              </div>
              <div className="flex-shrink-0">
                <GateIndicator gate={receipt.gate} showLabel />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Receipt count */}
      <div className="mt-4 text-xs text-gray-500 text-right">
        {receipts.length} receipt{receipts.length !== 1 ? 's' : ''} recorded
      </div>
    </div>
  );
}
