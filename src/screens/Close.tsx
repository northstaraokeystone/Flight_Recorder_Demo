/**
 * Screen 7: Close
 * Purpose: Stats and memorable tagline
 * Per §CONSTRAINT-CENTERING - simple centered content
 * Enhanced with animations and visual polish
 */

interface CloseProps {
  onRestart: () => void;
}

interface StatProps {
  value: number | string;
  label: string;
  highlight?: boolean;
}

function Stat({ value, label, highlight = false }: StatProps) {
  return (
    <div className="text-center">
      <div className={`text-5xl md:text-6xl font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-sm text-gray-400 uppercase tracking-wider mt-2">
        {label}
      </div>
    </div>
  );
}

export function Close({ onRestart }: CloseProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 animate-fadeIn relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.03)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl text-center space-y-16 relative z-10">
        {/* Stats row */}
        <div className="flex justify-center gap-16 md:gap-24">
          <Stat value={12} label="Decisions" />
          <Stat value={1} label="Escalation" />
          <Stat value={1} label="Rejection" />
          <Stat value={0} label="Ambiguity" highlight />
        </div>

        {/* Tagline */}
        <div className="space-y-4">
          <p className="text-2xl md:text-3xl text-gray-300 leading-relaxed">
            Don't just log decisions.
            <br />
            <span className="text-white font-semibold animate-glowPulse">
              Prove who made them.
            </span>
          </p>
        </div>

        {/* CTA */}
        <div className="pt-8">
          <button
            onClick={onRestart}
            className="
              bg-transparent
              border-2 border-white
              text-white
              hover:bg-white/10
              hover:scale-105
              px-8 py-3
              rounded-lg
              text-lg font-medium
              transition-all duration-200
            "
          >
            Press R to restart demo
          </button>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-600">
          AI Flight Recorder — Decision Provenance for Autonomous Systems
        </div>
      </div>
    </div>
  );
}
