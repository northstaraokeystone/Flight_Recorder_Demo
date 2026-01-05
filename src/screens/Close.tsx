/**
 * Screen 7: Close
 * Purpose: Stats and memorable tagline
 * Per §CONSTRAINT-CENTERING - simple centered content
 */

interface CloseProps {
  onRestart: () => void;
}

interface StatProps {
  value: number | string;
  label: string;
}

function Stat({ value, label }: StatProps) {
  return (
    <div className="text-center">
      <div className="text-5xl md:text-6xl font-bold text-white">
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
    <div className="min-h-screen flex flex-col justify-center items-center p-8">
      <div className="max-w-4xl text-center space-y-16">
        {/* Stats row */}
        <div className="flex justify-center gap-16 md:gap-24">
          <Stat value={12} label="Decisions" />
          <Stat value={1} label="Escalation" />
          <Stat value={1} label="Rejection" />
          <Stat value={0} label="Ambiguity" />
        </div>

        {/* Tagline */}
        <div className="space-y-4">
          <p className="text-2xl md:text-3xl text-gray-300 leading-relaxed">
            Don't just log decisions.
            <br />
            <span className="text-white font-semibold">
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
              px-8 py-3
              rounded-lg
              text-lg font-medium
              transition-colors
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
