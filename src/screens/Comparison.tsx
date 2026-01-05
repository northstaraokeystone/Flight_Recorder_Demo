/**
 * Screen 6: Comparison
 * Purpose: Side-by-side traditional vs Flight Recorder
 * Per §CONSTRAINT-COLORS - MUTABLE=red, IMMUTABLE=green
 */

interface ComparisonProps {
  onAdvance: () => void;
}

export function Comparison({ onAdvance }: ComparisonProps) {
  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-8 cursor-pointer animate-fadeIn"
      onClick={onAdvance}
    >
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Traditional Logging vs Decision Provenance
          </h2>
        </div>

        {/* Comparison columns */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left column - Traditional (BAD) */}
          <div className="border-l-4 border-l-red-500 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            {/* Badge */}
            <div className="mb-4">
              <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
                MUTABLE
              </span>
            </div>

            <h3 className="text-xl font-semibold text-white mb-4">
              Traditional Logging
            </h3>

            {/* Log entries */}
            <div className="space-y-2 font-mono text-sm mb-6">
              <div className="text-gray-400">14:06:00 DETECT</div>
              <div className="text-gray-400">14:06:02 APPROVE <span className="text-red-400">(backdated)</span></div>
              <div className="text-gray-400">14:06:03 ENGAGE</div>
            </div>

            {/* Deficiencies */}
            <div className="space-y-2 text-sm mb-6">
              <div className="flex items-center gap-2 text-red-400">
                <span>✗</span>
                <span>No confidence tracking</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <span>✗</span>
                <span>No RACI accountability</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <span>✗</span>
                <span>No temporal binding</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <span>✗</span>
                <span>Alterable</span>
              </div>
            </div>

            {/* Modify button - outline style per §CONSTRAINT-BUTTONS */}
            <button className="
              w-full
              bg-transparent
              border border-red-500
              text-red-400
              px-4 py-2
              rounded-lg
              text-sm
              hover:bg-red-500/10
              transition-colors
            ">
              Modify Record ✓
            </button>
          </div>

          {/* Right column - Flight Recorder (GOOD) */}
          <div className="border-l-4 border-l-green-500 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            {/* Badge */}
            <div className="mb-4">
              <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">
                IMMUTABLE
              </span>
            </div>

            <h3 className="text-xl font-semibold text-white mb-4">
              Flight Recorder
            </h3>

            {/* Log entries with gates */}
            <div className="space-y-2 font-mono text-sm mb-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">14:06:00 DETECT</span>
                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                <span className="text-yellow-500 text-xs">YELLOW</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">14:06:00 ESCALATE → OPR-M</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">14:06:02 APPROVE (OPR-M)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">14:06:03 ENGAGE</span>
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-green-500 text-xs">GREEN</span>
              </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-2 text-sm mb-6">
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span>
                <span>Confidence gates</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span>
                <span>Full RACI chain</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span>
                <span>Merkle-anchored</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span>
                <span>Cryptographically immutable</span>
              </div>
            </div>

            {/* Blocked button per §CONSTRAINT-BUTTONS */}
            <button className="
              w-full
              bg-gray-800
              border border-red-500
              text-red-400
              px-4 py-2
              rounded-lg
              text-sm
              cursor-not-allowed
            ">
              ⊘ REJECTED
            </button>
          </div>
        </div>

        {/* Summary - with highlighted keywords */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-gray-300 text-lg">
            Traditional logging allows <span className="text-red-400 font-medium">disputed</span> accountability.
          </p>
          <p className="text-white text-xl font-medium">
            Decision provenance makes accountability{' '}
            <span className="text-green-400 font-semibold">mathematically provable</span>.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 animate-pulse">
            Click or press Space to continue
          </p>
        </div>
      </div>
    </div>
  );
}
