/**
 * ChainIntegrity - Visual proof of Merkle chain continuity
 * Shows blocks building and syncing
 */

import { useMemo } from 'react';
import type { ChainBlock, ScenarioPhase } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface ChainIntegrityProps {
  blocks: ChainBlock[];
  syncedCount: number;
  phase: ScenarioPhase;
}

export function ChainIntegrity({ blocks, syncedCount, phase }: ChainIntegrityProps) {
  const isSyncing = phase === 'BURST_SYNC';
  const isVerified = phase === 'VERIFIED' || phase === 'COMPLETE';

  // Display a subset of blocks (last 12)
  const displayBlocks = useMemo(() => {
    return blocks.slice(-12);
  }, [blocks]);

  const pendingCount = blocks.filter(b => b.status === 'PENDING').length;

  return (
    <div
      className="relative flex flex-col h-full"
      style={{
        backgroundColor: 'rgba(13, 20, 36, 0.8)',
        border: `1px solid ${COLORS.borderBracket}`,
      }}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 z-10" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 z-10" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 z-10" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 z-10" style={{ borderColor: COLORS.borderBracket }} />

      {/* Header */}
      <div
        className="px-4 py-2 text-[10px] font-mono tracking-widest border-b flex items-center justify-between"
        style={{
          color: COLORS.textMuted,
          borderColor: COLORS.borderBracket,
        }}
      >
        <span>CHAIN INTEGRITY</span>
        {pendingCount > 0 && !isVerified && (
          <span
            className="animate-pulse"
            style={{ color: COLORS.alertAmber }}
          >
            PENDING SYNC: {pendingCount}
          </span>
        )}
        {isVerified && (
          <span style={{ color: COLORS.alertGreen }}>
            CHAIN: VERIFIED
          </span>
        )}
      </div>

      {/* Chain visualization */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="flex items-center gap-1 overflow-hidden">
          {displayBlocks.map((block, index) => {
            const isSynced = block.status === 'SYNCED' || block.status === 'VERIFIED';
            const blockColor = isSynced ? COLORS.alertGreen : COLORS.zoneGrey;

            return (
              <div key={block.id} className="flex items-center">
                {/* Block */}
                <div
                  className={`
                    relative w-6 h-8 flex items-center justify-center
                    transition-all duration-100
                    ${isSyncing && !isSynced ? 'animate-pulse' : ''}
                  `}
                  style={{
                    backgroundColor: isSynced ? 'rgba(0, 170, 102, 0.2)' : 'rgba(74, 85, 104, 0.3)',
                    border: `1px solid ${blockColor}`,
                  }}
                >
                  {/* Hash preview */}
                  <span
                    className="text-[6px] font-mono"
                    style={{ color: blockColor }}
                  >
                    {block.hash.slice(0, 2)}
                  </span>

                  {/* Sync lightning effect */}
                  {isSyncing && index === syncedCount % displayBlocks.length && (
                    <div
                      className="absolute inset-0 animate-ping"
                      style={{
                        backgroundColor: COLORS.accentGlow,
                      }}
                    />
                  )}
                </div>

                {/* Chain link */}
                {index < displayBlocks.length - 1 && (
                  <div
                    className="w-2 h-0.5"
                    style={{
                      backgroundColor: isSynced ? COLORS.alertGreen : COLORS.zoneGrey,
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Ellipsis for more blocks */}
          {blocks.length > 12 && (
            <span
              className="ml-2 text-xs font-mono"
              style={{ color: COLORS.textMuted }}
            >
              +{blocks.length - 12}
            </span>
          )}
        </div>
      </div>

      {/* Status message */}
      <div
        className="px-4 py-2 text-center text-[10px] font-mono border-t"
        style={{
          borderColor: COLORS.borderBracket,
          color: isVerified ? COLORS.alertGreen : isSyncing ? COLORS.statusOnline : COLORS.textMuted,
        }}
      >
        {isVerified && 'CRYPTOGRAPHIC CONTINUITY RESTORED. 0 GAPS.'}
        {isSyncing && 'BURST SYNC IN PROGRESS...'}
        {!isVerified && !isSyncing && blocks.length > 0 && 'BUILDING CHAIN...'}
        {!isVerified && !isSyncing && blocks.length === 0 && 'AWAITING BLOCKS...'}
      </div>

      {/* Lightning effect during burst sync */}
      {isSyncing && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${COLORS.accentGlow} 50%, transparent 100%)`,
            animation: 'slideRight 0.5s linear infinite',
          }}
        />
      )}
    </div>
  );
}
