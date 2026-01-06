/**
 * TrustGap - Competitive Comparison Slide
 * v2.2 DIAMOND: "WHY BLACK BOXES FAIL" - Shows competitive advantage
 *
 * Names competitors (Auterion, Skydio) and highlights the accountability gap
 */

import { COLORS } from '../../constants/colors';

interface TrustGapProps {
  isVisible: boolean;
  onRestart?: () => void;
}

interface ComparisonRow {
  category: string;
  incumbent: string;
  incumbentDetail: string;
  flightRecorder: string;
  flightRecorderDetail: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    category: 'DATA CAPTURED',
    incumbent: 'Telemetry',
    incumbentDetail: '(Speed, Altitude, GPS)',
    flightRecorder: 'Decisions + Reasoning',
    flightRecorderDetail: '(RACI, Confidence, Intent)',
  },
  {
    category: 'WHEN AI UNCERTAIN',
    incumbent: 'Silent Failure',
    incumbentDetail: '(Hopes for the best)',
    flightRecorder: 'CRAG Fallback',
    flightRecorderDetail: '(Asks for help)',
  },
  {
    category: 'LIABILITY TRAIL',
    incumbent: 'Missing',
    incumbentDetail: '(Who decided? Unknown)',
    flightRecorder: 'Complete',
    flightRecorderDetail: '(Every handoff logged)',
  },
  {
    category: 'POST-INCIDENT',
    incumbent: 'Flight Data Recorder',
    incumbentDetail: '(What crashed)',
    flightRecorder: 'Court-Admissible Affidavit',
    flightRecorderDetail: "(Who's liable)",
  },
];

export function TrustGap({ isVisible, onRestart }: TrustGapProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      style={{ backgroundColor: COLORS.bgPrimary }}
    >
      <div className="w-full max-w-4xl px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="affidavit-title text-2xl mb-2"
            style={{ letterSpacing: '0.1em', color: COLORS.textPrimary }}
          >
            WHY BLACK BOXES FAIL
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: '13px' }}>
            The Accountability Gap in Autonomous Flight
          </p>
        </div>

        {/* Column Headers */}
        <div
          className="grid grid-cols-3 gap-4 mb-6 pb-4"
          style={{ borderBottom: `1px solid ${COLORS.borderBracket}` }}
        >
          <div></div>
          <div className="text-center">
            <span
              className="panel-header"
              style={{ color: COLORS.textDim, fontSize: '11px' }}
            >
              THE INCUMBENTS
            </span>
            <p style={{ color: COLORS.textTimestamp, fontSize: '10px', marginTop: '4px' }}>
              (Auterion, Skydio)
            </p>
          </div>
          <div className="text-center">
            <span
              className="panel-header"
              style={{ color: COLORS.textSecondary, fontSize: '11px' }}
            >
              AI FLIGHT RECORDER
            </span>
            <p style={{ color: COLORS.textMuted, fontSize: '10px', marginTop: '4px' }}>
              (Unbreakable Chain)
            </p>
          </div>
        </div>

        {/* Comparison Rows */}
        <div className="space-y-0">
          {COMPARISON_DATA.map((row, index) => (
            <div
              key={row.category}
              className="grid grid-cols-3 gap-4 py-4"
              style={{
                borderBottom: index < COMPARISON_DATA.length - 1
                  ? `1px solid ${COLORS.borderBracket}`
                  : 'none',
              }}
            >
              {/* Category */}
              <div
                className="flex items-center"
                style={{ color: COLORS.textMuted, fontSize: '11px', fontWeight: 500 }}
              >
                {row.category}
              </div>

              {/* Incumbent (dimmer) */}
              <div className="text-center comparison-incumbent">
                <div style={{ fontSize: '12px', fontWeight: 500 }}>
                  {row.incumbent}
                </div>
                <div style={{ fontSize: '10px', color: COLORS.textTimestamp, marginTop: '2px' }}>
                  {row.incumbentDetail}
                </div>
              </div>

              {/* Flight Recorder (brighter) */}
              <div className="text-center comparison-flight-recorder">
                <div style={{ fontSize: '12px', fontWeight: 500 }}>
                  {row.flightRecorder}
                </div>
                <div style={{ fontSize: '10px', color: COLORS.textMuted, marginTop: '2px' }}>
                  {row.flightRecorderDetail}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Punchline */}
        <div className="text-center mt-12 mb-8">
          <p className="comparison-punchline text-lg">
            "Telemetry tells you how it crashed.
            <br />
            Provenance tells you who is liable."
          </p>
        </div>

        {/* Restart Button */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="btn-stealth px-8 py-3"
            style={{ letterSpacing: '0.1em' }}
          >
            [ RESTART SCENARIO ]
          </button>
        </div>
      </div>
    </div>
  );
}
