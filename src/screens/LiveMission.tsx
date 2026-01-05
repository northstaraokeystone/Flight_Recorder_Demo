/**
 * Screen 2: Live Mission
 * Purpose: Show real-time receipt generation during autonomous operations
 * Uses DataViewLayout per §CONSTRAINT-LAYOUT
 */

import { useState, useEffect } from 'react';
import { DataViewLayout, MissionMap, ReceiptStream, GateIndicator } from '../components';
import { generateMissionReceipts } from '../utils/receipts';
import type { Receipt } from '../types';

interface LiveMissionProps {
  onAdvance: () => void;
  onReceiptsGenerated: (receipts: Receipt[]) => void;
}

export function LiveMission({ onAdvance, onReceiptsGenerated }: LiveMissionProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isPlaying] = useState(true);

  // All mission receipts
  const allReceipts = generateMissionReceipts();

  // Current state derived from receipts
  const currentReceipt = receipts[receipts.length - 1];
  const confidence = currentReceipt?.confidence ?? 0;
  const gate = currentReceipt?.gate ?? 'green';
  const authority = receipts.some(r => r.action === 'APPROVE')
    ? 'HUMAN'
    : receipts.some(r => r.action === 'ESCALATE')
    ? 'PENDING'
    : 'AI';
  const merkleDepth = currentReceipt?.merkleDepth ?? 847;

  // Animate receipts appearing
  useEffect(() => {
    if (!isPlaying) return;

    if (receipts.length >= allReceipts.length) {
      // Mission complete - pause then advance
      const timer = setTimeout(() => {
        onReceiptsGenerated(allReceipts);
        onAdvance();
      }, 12000); // 6x: monitor dashboard focus area
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setReceipts(prev => [...prev, allReceipts[prev.length]]);
    }, 3000); // 6x: monitor dashboard focus area (was 500ms)

    return () => clearTimeout(timer);
  }, [receipts, isPlaying, allReceipts, onAdvance, onReceiptsGenerated]);

  return (
    <DataViewLayout
      header={
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            MISSION ACTIVE
          </h2>
          {isPlaying && (
            <p className="text-sm text-gray-400 mt-2 animate-pulse">
              Recording decision provenance...
            </p>
          )}
        </div>
      }
      leftPanel={
        <MissionMap receipts={receipts} className="h-full" />
      }
      rightPanel={
        <ReceiptStream receipts={receipts} className="h-full" />
      }
      bottomSection={
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          {/* Status row */}
          <div className="flex items-center justify-between gap-8">
            {/* Confidence gauge */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 uppercase tracking-wider">
                Confidence:
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      gate === 'green'
                        ? 'bg-green-500'
                        : gate === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-white font-mono">
                  {confidence.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Gate indicator */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 uppercase tracking-wider">
                Gate:
              </span>
              <GateIndicator gate={gate} size="lg" showLabel />
            </div>

            {/* Authority */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 uppercase tracking-wider">
                Authority:
              </span>
              <span
                className={`font-bold ${
                  authority === 'HUMAN'
                    ? 'text-green-500'
                    : authority === 'PENDING'
                    ? 'text-yellow-500'
                    : 'text-gray-400'
                }`}
              >
                {authority}
              </span>
            </div>
          </div>

          {/* Provenance info */}
          <div className="mt-4 flex items-center gap-8 text-xs text-gray-500 font-mono">
            <span>Model: FSD-v12.3.1</span>
            <span>Policy: ROE-Alpha-7</span>
            <span>Merkle Depth: {merkleDepth}</span>
          </div>
        </div>
      }
    />
  );
}
