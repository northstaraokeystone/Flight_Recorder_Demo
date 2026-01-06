/**
 * ChainIntegrity - Dense Merkle chain visualization
 * Smaller blocks, more visible at once
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

  // Display more blocks (last 20)
  const displayBlocks = useMemo(() => {
    return blocks.slice(-20);
  }, [blocks]);

  const pendingCount = blocks.filter(b => b.status === 'PENDING').length;

  return (
    <div
      className="relative flex flex-col h-full font-mono"
      style={{
        backgroundColor: COLORS.bgCard,
        border: `1px solid ${COLORS.borderBracket}`,
      }}
    >
      {/* Tiny corner brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b" style={{ borderColor: COLORS.borderBracket }} />

      {/* Header */}
      <div
        className="px-2 py-1 border-b flex items-center justify-between"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '8px',
          letterSpacing: '0.1em',
        }}
      >
        <span style={{ color: COLORS.textMuted }}>CHAIN INTEGRITY</span>
        {pendingCount > 0 && !isVerified && (
          <span className="animate-pulse" style={{ color: COLORS.alertAmber }}>
            PENDING: {pendingCount}
          </span>
        )}
        {isVerified && (
          <span style={{ color: COLORS.alertGreen }}>VERIFIED</span>
        )}
      </div>

      {/* Chain visualization - dense grid of tiny blocks */}
      <div className="flex-1 p-2 flex items-center justify-center overflow-hidden">
        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
          {displayBlocks.map((block, index) => {
            const isSynced = block.status === 'SYNCED' || block.status === 'VERIFIED';
            const blockColor = isSynced ? COLORS.alertGreen : COLORS.zoneGrey;
            const isSyncingThisBlock = isSyncing && index === syncedCount % displayBlocks.length;

            return (
              <div
                key={block.id}
                className={`
                  flex items-center justify-center
                  transition-all duration-75
                  ${isSyncingThisBlock ? 'animate-ping' : ''}
                `}
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: isSynced ? 'rgba(0, 170, 102, 0.3)' : 'rgba(68, 68, 68, 0.3)',
                  border: `1px solid ${blockColor}`,
                  fontSize: '5px',
                  color: blockColor,
                }}
                title={`Block ${block.id}: ${block.hash.slice(0, 8)}`}
              >
                {block.hash.slice(0, 1)}
              </div>
            );
          })}

          {/* More blocks indicator */}
          {blocks.length > 20 && (
            <div
              className="flex items-center justify-center"
              style={{
                width: '20px',
                height: '12px',
                fontSize: '6px',
                color: COLORS.textMuted,
              }}
            >
              +{blocks.length - 20}
            </div>
          )}
        </div>
      </div>

      {/* Status footer */}
      <div
        className="px-2 py-1 border-t text-center"
        style={{
          borderColor: COLORS.borderBracket,
          fontSize: '7px',
          color: isVerified ? COLORS.alertGreen : isSyncing ? COLORS.statusOnline : COLORS.textMuted,
        }}
      >
        {isVerified && 'CONTINUITY: 0 GAPS'}
        {isSyncing && 'BURST SYNC...'}
        {!isVerified && !isSyncing && blocks.length > 0 && 'BUILDING...'}
        {!isVerified && !isSyncing && blocks.length === 0 && 'AWAITING'}
      </div>

      {/* Lightning sweep during burst sync */}
      {isSyncing && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div
            className="absolute inset-y-0 w-8"
            style={{
              background: `linear-gradient(90deg, transparent, ${COLORS.accentGlow}, transparent)`,
              animation: 'slideRight 0.3s linear infinite',
            }}
          />
        </div>
      )}
    </div>
  );
}
