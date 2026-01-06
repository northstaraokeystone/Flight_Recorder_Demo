/**
 * ComplianceBar - Regulatory compliance status display
 * Constant reminder this is regulatory-grade infrastructure
 */

import type { ComplianceStatus, ComplianceState } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface ComplianceBarProps {
  compliance: ComplianceStatus;
  isOffline: boolean;
  isVerified: boolean;
}

interface StandardDisplayProps {
  label: string;
  state: ComplianceState;
  isOffline: boolean;
  isVerified: boolean;
}

function StandardDisplay({ label, state, isOffline, isVerified }: StandardDisplayProps) {
  const getColor = () => {
    if (isVerified) return COLORS.alertGreen;
    if (isOffline) return COLORS.alertAmber;
    return COLORS.statusOnline;
  };

  const getStateText = () => {
    return state;
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="font-mono text-[10px] tracking-wider"
        style={{ color: COLORS.textMuted }}
      >
        {label}
      </span>
      <span
        className="font-mono text-xs font-bold tracking-wide transition-colors duration-300"
        style={{ color: getColor() }}
      >
        {getStateText()}
      </span>
    </div>
  );
}

export function ComplianceBar({ compliance, isOffline, isVerified }: ComplianceBarProps) {
  // Compute display states
  const faa108State: ComplianceState = isVerified
    ? 'COMPLIANT'
    : isOffline
    ? 'ACTIVE'
    : compliance.faa108;

  const dod300009State: ComplianceState = isVerified
    ? 'VERIFIED'
    : isOffline
    ? 'MONITORING'
    : compliance.dod300009;

  const euAiActState: ComplianceState = isVerified
    ? 'CHAIN_INTACT'
    : isOffline
    ? 'LOCAL_CAPTURE'
    : compliance.euAiAct;

  return (
    <div
      className="relative px-6 py-3 font-mono"
      style={{
        backgroundColor: 'rgba(13, 20, 36, 0.8)',
        border: `1px solid ${COLORS.borderBracket}`,
      }}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: COLORS.borderBracket }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: COLORS.borderBracket }} />

      {/* Standards row */}
      <div className="flex items-center justify-center gap-8">
        <StandardDisplay
          label="FAA PART 108"
          state={faa108State}
          isOffline={isOffline}
          isVerified={isVerified}
        />

        <div className="w-px h-8" style={{ backgroundColor: COLORS.borderBracket }} />

        <StandardDisplay
          label="DOD 3000.09"
          state={dod300009State}
          isOffline={isOffline}
          isVerified={isVerified}
        />

        <div className="w-px h-8" style={{ backgroundColor: COLORS.borderBracket }} />

        <StandardDisplay
          label="EU AI ACT"
          state={euAiActState}
          isOffline={isOffline}
          isVerified={isVerified}
        />
      </div>

      {/* Verification glow when verified */}
      {isVerified && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            boxShadow: `inset 0 0 20px rgba(100, 116, 139, 0.2)`,
          }}
        />
      )}
    </div>
  );
}
