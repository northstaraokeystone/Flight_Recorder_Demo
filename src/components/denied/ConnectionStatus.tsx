/**
 * ConnectionStatus - Compact header display
 * SYS: ONLINE | LINK: 12ms | MODE: CLOUD_SYNC
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

  const isOffline = link.status === 'SEVERED';
  const statusColor = getStatusColor();

  return (
    <div className="flex items-center gap-3 font-mono">
      {/* System status */}
      <div className="flex items-center gap-2">
        {/* Status dot */}
        <div
          className={`w-2 h-2 rounded-full ${isOffline ? 'animate-pulse' : ''}`}
          style={{
            backgroundColor: statusColor,
            boxShadow: `0 0 6px ${statusColor}`,
          }}
        />
        <div className="flex flex-col">
          <span className="text-[8px] tracking-wider" style={{ color: COLORS.textMuted }}>
            SYS
          </span>
          <span
            className="text-[10px] font-bold"
            style={{ color: statusColor }}
          >
            {isOffline ? 'OFFLINE' : 'ONLINE'}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6" style={{ backgroundColor: COLORS.borderBracket }} />

      {/* Link status */}
      <div className="flex flex-col">
        <span className="text-[8px] tracking-wider" style={{ color: COLORS.textMuted }}>
          LINK
        </span>
        <span
          className="text-[10px] font-bold"
          style={{ color: isOffline ? COLORS.statusOffline : COLORS.textSecondary }}
        >
          {isOffline ? '---' : `${link.latencyMs}ms`}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-6" style={{ backgroundColor: COLORS.borderBracket }} />

      {/* Mode */}
      <div className="flex flex-col">
        <span className="text-[8px] tracking-wider" style={{ color: COLORS.textMuted }}>
          MODE
        </span>
        <span
          className={`text-[10px] font-bold ${isOffline ? 'animate-pulse' : ''}`}
          style={{ color: isOffline ? COLORS.alertAmber : COLORS.statusOnline }}
        >
          {link.protocol === 'AUTONOMOUS_FIDUCIARY' ? 'LOCAL_FIDUCIARY' : 'CLOUD_SYNC'}
        </span>
      </div>
    </div>
  );
}
