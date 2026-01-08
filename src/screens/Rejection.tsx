/**
 * Screen 5: Rejection - THE MONEY SHOT
 * Purpose: Show the tampering rejection with ALL proof layers
 * Uses DataViewLayout with DRAMATIC styling per §CONSTRAINT-LAYOUT, §CONSTRAINT-POLISH
 */

import { useState, useEffect, useMemo } from 'react';
import { DataViewLayout, AuthorityChainNode, ChainConnector, MerkleTree } from '../components';
import { getAuthorityChain, buildMerkleTree } from '../utils/receipts';
import type { Receipt, AttackType, VerificationResult } from '../types';

interface RejectionProps {
  receipts: Receipt[];
  attackType: AttackType;
  onAdvance: () => void;
}

function getVerificationResults(attackType: AttackType): VerificationResult[] {
  const baseResults: VerificationResult[] = [
    {
      name: 'Hash verification',
      passed: false,
      details: 'Dual-hash mismatch detected',
      expected: 'a9d5662ae8de6d92:76f27656c37d181e',
      computed: '3e4d17bd5194ce4c:cf7b396065663944',
    },
    {
      name: 'RACI verification',
      passed: false,
      details: 'Accountable party missing for ENGAGE decision',
    },
    {
      name: 'Merkle verification',
      passed: false,
      details: 'Root mismatch detected. Affected nodes: 4',
    },
    {
      name: 'Temporal verification',
      passed: false,
      details: 'ENGAGE receipt anchored at 14:06:03.847',
    },
  ];

  // Customize based on attack type
  switch (attackType) {
    case 'REMOVE_APPROVAL':
      baseResults[1].details = 'Accountable party missing for ENGAGE decision. DoD 3000.09 requires human judgment for lethal force';
      baseResults[3].details = 'Approval gap detected (no valid approval before ENGAGE)';
      break;
    case 'CHANGE_GATE':
      baseResults[0].details = 'Gate status hash mismatch';
      baseResults[1].details = 'Escalation chain broken. Yellow gate requires human review';
      break;
    case 'BACKDATE_APPROVAL':
      baseResults[3].details = 'Timestamp ordering violation. APPROVE cannot precede DETECT';
      baseResults[2].details = 'Temporal anchor mismatch. Merkle root locked before claimed approval time';
      break;
  }

  return baseResults;
}

function getAttackDescription(attackType: AttackType): string {
  switch (attackType) {
    case 'REMOVE_APPROVAL':
      return 'Remove human approval receipt';
    case 'CHANGE_GATE':
      return 'Change YELLOW gate to GREEN';
    case 'BACKDATE_APPROVAL':
      return 'Backdate approval timestamp';
  }
}

export function Rejection({ receipts, attackType, onAdvance }: RejectionProps) {
  const [countdown, setCountdown] = useState(30); // 6x: rejection output focus area (was 5)

  const authorityChain = useMemo(() => getAuthorityChain(receipts), [receipts]);
  const verificationResults = useMemo(() => getVerificationResults(attackType), [attackType]);

  // Determine which chain node is broken
  const brokenIndex = useMemo(() => {
    switch (attackType) {
      case 'REMOVE_APPROVAL':
        return authorityChain.findIndex(r => r.action === 'APPROVE');
      case 'CHANGE_GATE':
        return authorityChain.findIndex(r => r.gate === 'yellow');
      case 'BACKDATE_APPROVAL':
        return authorityChain.findIndex(r => r.action === 'APPROVE');
      default:
        return -1;
    }
  }, [attackType, authorityChain]);

  // Build merkle tree with affected path
  const merkleTree = useMemo(() => {
    // Mark the affected receipt and its ancestors
    const affectedIndices = brokenIndex >= 0 ? [brokenIndex] : [];
    return buildMerkleTree(receipts, affectedIndices);
  }, [receipts, brokenIndex]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      onAdvance();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onAdvance]);

  return (
    <DataViewLayout
      header={
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-red-500 animate-pulse drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            ⊘ TAMPERING REJECTED ⊘
          </h2>
        </div>
      }
      leftPanel={
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
            Authority Chain
          </div>

          {/* Chain nodes with broken indicator */}
          <div className="space-y-2">
            {authorityChain.map((receipt, index) => (
              <div key={receipt.id}>
                <AuthorityChainNode
                  receipt={receipt}
                  isBroken={index === brokenIndex}
                />
                {index < authorityChain.length - 1 && <ChainConnector />}
              </div>
            ))}
          </div>
        </div>
      }
      rightPanel={
        <MerkleTree root={merkleTree} className="h-full" />
      }
      bottomSection={
        <div className="space-y-4">
          {/* Violation panel with PULSING RED GLOW - THE MONEY SHOT */}
          <div
            className="
              bg-gray-900/80
              border-2 border-red-500/60
              rounded-lg
              p-6
              animate-redGlowPulse
            "
          >
            <h3 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-4">
              <span className="animate-pulse">●</span>
              <span>INTEGRITY VIOLATION</span>
              <span className="animate-pulse">●</span>
            </h3>

            <p className="text-gray-300 mb-4">
              <span className="text-gray-500">Attack attempted: </span>
              <span className="text-red-400">{getAttackDescription(attackType)}</span>
            </p>

            {/* Verification results in a structured grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-sm">
              {verificationResults.map((result) => (
                <div
                  key={result.name}
                  className="bg-gray-800/50 border border-gray-700 rounded p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-xs">{result.name}</span>
                    {/* CRITICAL: FAILED must be RED per §CONSTRAINT-COLORS */}
                    <span className="text-red-500 font-bold text-xs">FAILED</span>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {result.details}
                  </div>
                  {result.expected && (
                    <div className="text-gray-600 text-xs mt-1 truncate">
                      Expected: <span className="text-gray-400">{result.expected}</span>
                    </div>
                  )}
                  {result.computed && (
                    <div className="text-gray-600 text-xs truncate">
                      Computed: <span className="text-red-400/70">{result.computed}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Countdown */}
          <div className="text-center text-sm text-gray-500">
            Analyzing integrity violation... {countdown}s
          </div>
        </div>
      }
    />
  );
}
