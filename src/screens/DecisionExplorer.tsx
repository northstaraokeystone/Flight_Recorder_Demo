/**
 * Screen 3: Decision Explorer
 * Purpose: Show the authority chain and Merkle proof
 * Uses DataViewLayout per §CONSTRAINT-LAYOUT
 */

import { useMemo } from 'react';
import { DataViewLayout, AuthorityChainNode, ChainConnector, MerkleTree } from '../components';
import { getAuthorityChain, buildMerkleTree } from '../utils/receipts';
import type { Receipt } from '../types';

interface DecisionExplorerProps {
  receipts: Receipt[];
  onAdvance: () => void;
}

export function DecisionExplorer({ receipts, onAdvance }: DecisionExplorerProps) {
  const authorityChain = useMemo(() => getAuthorityChain(receipts), [receipts]);
  const merkleTree = useMemo(() => buildMerkleTree(receipts), [receipts]);

  return (
    <DataViewLayout
      header={
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            DECISION PROVENANCE EXPLORER
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Cryptographically immutable authority chain
          </p>
        </div>
      }
      leftPanel={
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
            Authority Chain
          </div>

          {/* Chain nodes */}
          <div className="space-y-2">
            {authorityChain.map((receipt, index) => (
              <div key={receipt.id}>
                <AuthorityChainNode receipt={receipt} />
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
        <div className="flex justify-center">
          <button
            onClick={onAdvance}
            className="
              bg-transparent
              border-2 border-white
              text-white
              hover:bg-white/10
              px-8 py-3
              rounded-lg
              text-lg font-medium
              transition-colors
            "
          >
            Attempt to Alter Record
          </button>
        </div>
      }
    />
  );
}
