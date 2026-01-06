/**
 * ConnectionStatus - Real-time link state display
 * The heartbeat of the denied environment demo
 */

import type { LinkState } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface ConnectionStatusProps {
  link: LinkState;
}

export function ConnectionStatus({ link }: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (link.status) {
      case 'OPTIMAL':
      case 'RESTORED':
        return COLORS.statusOnline;
      case 'DEGRADED':
        return COLORS.statusDegraded;
      case 'SEVERED':
        return COLORS.statusOffline;
    }
  };

  const getStatusText = () => {
    switch (link.status) {
      case 'OPTIMAL':
        return `LINK: OPTIMAL (${link.latencyMs}ms)`;
      case 'DEGRADED':
        return `LINK: DEGRADED (${link.latencyMs}ms)`;
      case 'SEVERED':
        return 'LINK: SEVERED';
      case 'RESTORED':
        return `LINK: RESTORED (${link.latencyMs}ms)`;
    }
  };

  const getBadgeText = () => {
    if (link.protocol === 'AUTONOMOUS_FIDUCIARY') {
      return 'AUTONOMOUS FIDUCIARY MODE';
    }
    return 'CLOUD SYNC ACTIVE';
  };

  const isOffline = link.status === 'SEVERED';

  return (
    <div className="flex flex-col gap-2">
      {/* Corner bracket styling */}
      <div
        className="relative px-4 py-3 font-mono text-sm"
        style={{
          backgroundColor: 'rgba(13, 20, 36, 0.8)',
          border: `1px solid ${COLORS.borderBracket}`,
        }}
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: getStatusColor() }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: getStatusColor() }} />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: getStatusColor() }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: getStatusColor() }} />

        {/* Signal bars */}
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3, 4, 5].map((bar) => {
              const isActive = link.status === 'OPTIMAL' || link.status === 'RESTORED'
                ? true
                : link.status === 'DEGRADED'
                ? bar <= 2
                : false;
              const height = bar * 3 + 4;
              return (
                <div
                  key={bar}
                  className={`w-1.5 transition-all duration-300 ${isActive ? '' : 'opacity-30'}`}
                  style={{
                    height: `${height}px`,
                    backgroundColor: isActive ? getStatusColor() : COLORS.textMuted,
                  }}
                />
              );
            })}
          </div>

          {/* Status text */}
          <span
            className="font-bold tracking-wide transition-colors duration-300"
            style={{ color: getStatusColor() }}
          >
            {getStatusText()}
          </span>
        </div>

        {/* Flatline effect when severed */}
        {isOffline && (
          <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 pointer-events-none">
            <div
              className="h-full animate-pulse"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${COLORS.statusOffline} 50%, transparent 100%)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Protocol badge */}
      <div
        className={`
          px-3 py-1.5 font-mono text-xs tracking-wider text-center
          transition-all duration-500
          ${isOffline ? 'animate-pulse' : ''}
        `}
        style={{
          backgroundColor: isOffline ? 'rgba(204, 51, 51, 0.2)' : 'rgba(0, 212, 255, 0.1)',
          border: `1px solid ${isOffline ? COLORS.statusOffline : COLORS.statusOnline}`,
          color: isOffline ? COLORS.statusOffline : COLORS.statusOnline,
        }}
      >
        {isOffline && <span className="mr-2">PROTOCOL:</span>}
        {getBadgeText()}
      </div>
    </div>
  );
}
