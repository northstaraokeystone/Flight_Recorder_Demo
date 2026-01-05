/**
 * GateIndicator - Displays decision gate status
 * Colors per §CONSTRAINT-COLORS
 */

import type { GateStatus } from '../types';

interface GateIndicatorProps {
  gate: GateStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const colorClasses = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

const labelClasses = {
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  red: 'text-red-500',
};

export function GateIndicator({ gate, size = 'md', showLabel = false }: GateIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`${sizeClasses[size]} ${colorClasses[gate]} rounded-full inline-block`}
      />
      {showLabel && (
        <span className={`${labelClasses[gate]} font-medium uppercase text-sm`}>
          {gate}
        </span>
      )}
    </span>
  );
}
