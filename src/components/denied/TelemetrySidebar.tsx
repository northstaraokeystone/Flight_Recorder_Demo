/**
 * TelemetrySidebar - Overwhelming data density
 * Real operators drown in data. This is the flex.
 */

import { useEffect, useState, useRef } from 'react';
import type { DronePosition, ScenarioPhase } from '../../constants/scenario';
import { COLORS } from '../../constants/colors';

interface TelemetrySidebarProps {
  dronePosition: DronePosition;
  phase: ScenarioPhase;
  isOffline: boolean;
  bufferSize: number;
  receiptsPending: number;
}

// Generate random fluctuation for realism
function fluctuate(base: number, range: number): number {
  return base + (Math.random() - 0.5) * range;
}

export function TelemetrySidebar({
  dronePosition,
  phase,
  isOffline,
  bufferSize,
  receiptsPending,
}: TelemetrySidebarProps) {
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Fast telemetry updates - 100ms intervals
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setTick(t => t + 1);
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Derived telemetry values with fluctuation
  const lat = 47.6062 + (dronePosition.x / 1000) + (tick % 10) * 0.00001;
  const long = -122.3321 + (dronePosition.y / 1000) + (tick % 7) * 0.00001;
  const speed = fluctuate(45.2, 2);
  const altitude = fluctuate(120, 5);
  const heading = ((dronePosition.rotation + 360) % 360).toFixed(0);
  const vertRate = fluctuate(0.2, 0.5);
  const groundSpeed = fluctuate(44.8, 1.5);
  const windSpeed = fluctuate(8.3, 1);
  const windDir = fluctuate(270, 10);
  const batteryV = fluctuate(22.4, 0.1);
  const signalDb = isOffline ? 0 : fluctuate(-42, 3);
  const cpuLoad = fluctuate(34, 5);
  const memUsed = fluctuate(1.2, 0.1);

  const localTag = isOffline ? '[LOCAL]' : '';
  const dataColor = isOffline ? COLORS.alertAmber : COLORS.alertGreen;

  return (
    <div
      className="flex flex-col h-full overflow-hidden font-mono"
      style={{
        backgroundColor: COLORS.bgCard,
        borderRight: `1px solid ${COLORS.borderBracket}`,
        width: '160px',
        fontSize: '9px',
      }}
    >
      {/* Header */}
      <div
        className="px-2 py-1 border-b"
        style={{
          borderColor: COLORS.borderBracket,
          color: COLORS.textMuted,
          fontSize: '8px',
          letterSpacing: '0.1em',
        }}
      >
        TELEMETRY STREAM
      </div>

      {/* Telemetry data - overwhelming density */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* Position */}
        <TelemetryRow label="LAT" value={`${lat.toFixed(4)}° N`} color={dataColor} tag={localTag} />
        <TelemetryRow label="LONG" value={`${Math.abs(long).toFixed(4)}° W`} color={dataColor} tag={localTag} />
        <TelemetryRow label="ALT" value={`${altitude.toFixed(1)}m AGL`} color={dataColor} tag={localTag} />

        <Divider />

        {/* Velocity */}
        <TelemetryRow label="SPD" value={`${speed.toFixed(1)} m/s`} color={dataColor} tag={localTag} />
        <TelemetryRow label="GND_SPD" value={`${groundSpeed.toFixed(1)} m/s`} color={COLORS.textSecondary} />
        <TelemetryRow label="HDG" value={`${heading}°`} color={dataColor} tag={localTag} />
        <TelemetryRow label="V_RATE" value={`${vertRate > 0 ? '+' : ''}${vertRate.toFixed(2)} m/s`} color={COLORS.textSecondary} />

        <Divider />

        {/* Environment */}
        <TelemetryRow label="WIND" value={`${windSpeed.toFixed(1)} m/s @ ${windDir.toFixed(0)}°`} color={COLORS.textSecondary} />
        <TelemetryRow label="TEMP" value="14.2°C" color={COLORS.textMuted} />
        <TelemetryRow label="PRES" value="1013.2 hPa" color={COLORS.textMuted} />

        <Divider />

        {/* System */}
        <TelemetryRow label="BAT_V" value={`${batteryV.toFixed(2)}V`} color={COLORS.textSecondary} />
        <TelemetryRow label="SIG_dB" value={isOffline ? '---' : `${signalDb.toFixed(0)} dBm`} color={isOffline ? COLORS.alertRed : COLORS.textSecondary} />
        <TelemetryRow label="CPU" value={`${cpuLoad.toFixed(0)}%`} color={COLORS.textMuted} />
        <TelemetryRow label="MEM" value={`${memUsed.toFixed(1)} GB`} color={COLORS.textMuted} />

        <Divider />

        {/* Buffer - THE IMPORTANT NUMBER */}
        <div
          className="py-1 px-1 mt-1"
          style={{
            backgroundColor: isOffline ? 'rgba(255, 170, 0, 0.1)' : 'transparent',
            border: isOffline ? `1px solid ${COLORS.alertAmber}` : 'none',
          }}
        >
          <TelemetryRow
            label="BUFFER"
            value={`${bufferSize.toFixed(1)}mb`}
            color={isOffline ? COLORS.alertAmber : COLORS.textMuted}
            highlight={isOffline}
          />
          <TelemetryRow
            label="PENDING"
            value={`${receiptsPending}`}
            color={isOffline ? COLORS.alertAmber : COLORS.textMuted}
            highlight={isOffline}
          />
        </div>

        <Divider />

        {/* Mode indicator */}
        <div className="py-1 text-center" style={{ fontSize: '7px', letterSpacing: '0.05em' }}>
          <span style={{ color: COLORS.textMuted }}>MODE: </span>
          <span
            style={{
              color: isOffline ? COLORS.alertAmber : COLORS.alertGreen,
            }}
            className={isOffline ? 'animate-pulse' : ''}
          >
            {isOffline ? 'LOCAL_FIDUCIARY' : 'CLOUD_SYNC'}
          </span>
        </div>

        {/* Phase indicator */}
        <div className="py-0.5 text-center" style={{ fontSize: '7px' }}>
          <span style={{ color: COLORS.textMuted }}>PHASE: </span>
          <span style={{ color: COLORS.textSecondary }}>{phase}</span>
        </div>
      </div>

      {/* Footer timestamp */}
      <div
        className="px-2 py-1 border-t text-center"
        style={{
          borderColor: COLORS.borderBracket,
          color: COLORS.textTimestamp,
          fontSize: '7px',
        }}
      >
        {new Date().toISOString().slice(11, 23)}
      </div>
    </div>
  );
}

// Individual telemetry row
interface TelemetryRowProps {
  label: string;
  value: string;
  color: string;
  tag?: string;
  highlight?: boolean;
}

function TelemetryRow({ label, value, color, tag, highlight }: TelemetryRowProps) {
  return (
    <div
      className={`flex justify-between items-baseline ${highlight ? 'animate-dataFlicker' : ''}`}
      style={{ lineHeight: '1.4' }}
    >
      <span style={{ color: COLORS.textMuted, fontSize: '8px' }}>{label}</span>
      <span style={{ color, fontSize: '9px' }}>
        {value}
        {tag && (
          <span style={{ color: COLORS.alertAmber, fontSize: '6px', marginLeft: '2px' }}>
            {tag}
          </span>
        )}
      </span>
    </div>
  );
}

// Thin divider
function Divider() {
  return (
    <div
      className="my-1"
      style={{
        height: '1px',
        backgroundColor: COLORS.borderDefault,
      }}
    />
  );
}
