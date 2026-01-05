/**
 * Screen 4: Tampering Console
 * Purpose: Let viewer select and execute a tampering attempt
 * Uses DataViewLayout per §CONSTRAINT-LAYOUT
 */

import { useState, useMemo } from 'react';
import { DataViewLayout, AuthorityChainNode, ChainConnector } from '../components';
import { getAuthorityChain } from '../utils/receipts';
import type { Receipt, AttackType, Attack } from '../types';

interface TamperingConsoleProps {
  receipts: Receipt[];
  onAdvance: (attack: AttackType) => void;
}

const ATTACKS: Attack[] = [
  {
    id: 'REMOVE_APPROVAL',
    name: 'Remove human approval',
    description: '"Claim unauthorized autonomous engagement"',
  },
  {
    id: 'CHANGE_GATE',
    name: 'Change YELLOW to GREEN',
    description: '"Hide required escalation"',
  },
  {
    id: 'BACKDATE_APPROVAL',
    name: 'Backdate approval',
    description: '"Claim earlier authorization"',
  },
];

export function TamperingConsole({ receipts, onAdvance }: TamperingConsoleProps) {
  const [selectedAttack, setSelectedAttack] = useState<AttackType>('REMOVE_APPROVAL');
  const authorityChain = useMemo(() => getAuthorityChain(receipts), [receipts]);

  // Determine which node would be affected by the selected attack
  const getAffectedIndex = (attack: AttackType): number => {
    switch (attack) {
      case 'REMOVE_APPROVAL':
        return authorityChain.findIndex(r => r.action === 'APPROVE');
      case 'CHANGE_GATE':
        return authorityChain.findIndex(r => r.gate === 'yellow');
      case 'BACKDATE_APPROVAL':
        return authorityChain.findIndex(r => r.action === 'APPROVE');
      default:
        return -1;
    }
  };

  const affectedIndex = getAffectedIndex(selectedAttack);

  return (
    <DataViewLayout
      header={
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            TAMPERING SIMULATION
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Select an attack vector to attempt
          </p>
        </div>
      }
      leftPanel={
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-full">
          {/* Header */}
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
            Select Attack
          </div>

          {/* Attack options */}
          <div className="space-y-3">
            {ATTACKS.map((attack) => (
              <label
                key={attack.id}
                className={`
                  flex items-start gap-3
                  p-4
                  rounded-lg
                  border transition-colors cursor-pointer
                  ${
                    selectedAttack === attack.id
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800'
                  }
                `}
              >
                <input
                  type="radio"
                  name="attack"
                  value={attack.id}
                  checked={selectedAttack === attack.id}
                  onChange={() => setSelectedAttack(attack.id)}
                  className="mt-1 accent-red-500"
                />
                <div>
                  <div className="font-medium text-white">{attack.name}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {attack.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      }
      rightPanel={
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
            Authority Chain
          </div>

          {/* Chain nodes with highlighting */}
          <div className="space-y-2">
            {authorityChain.map((receipt, index) => (
              <div key={receipt.id}>
                <AuthorityChainNode
                  receipt={receipt}
                  isHighlighted={index === affectedIndex}
                />
                {index < authorityChain.length - 1 && <ChainConnector />}
              </div>
            ))}
          </div>
        </div>
      }
      bottomSection={
        <div className="flex justify-center">
          <button
            onClick={() => onAdvance(selectedAttack)}
            className="
              bg-transparent
              border-2 border-red-400
              text-red-400
              hover:bg-red-400/10
              px-8 py-3
              rounded-lg
              text-lg font-medium
              transition-colors
            "
          >
            Execute Tampering Attempt
          </button>
        </div>
      }
    />
  );
}
