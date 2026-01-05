/**
 * Screen 1: Mission Context
 * Purpose: Set stakes with real regulation, establish value proposition
 * Per §CONSTRAINT-CENTERING - simple centered content
 */

interface MissionContextProps {
  onAdvance: () => void;
}

export function MissionContext({ onAdvance }: MissionContextProps) {
  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-8 cursor-pointer"
      onClick={onAdvance}
    >
      <div className="max-w-4xl text-center space-y-12">
        {/* DoD Directive Quote */}
        <div className="space-y-4">
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            DoD DIRECTIVE 3000.09 REQUIRES:
          </p>
          <blockquote className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto italic">
            "Appropriate levels of human judgment over the use of force"
          </blockquote>
        </div>

        {/* Main Title */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            THE UNALTERABLE
            <br />
            ENGAGEMENT
          </h1>
        </div>

        {/* Value Proposition */}
        <div className="space-y-4">
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Watch what happens when you try to lie about
            <br />
            whether a human approved lethal force.
          </p>
        </div>

        {/* CTA */}
        <div className="pt-8">
          <p className="text-sm text-gray-500 animate-pulse">
            Click or press Space to begin
          </p>
        </div>
      </div>
    </div>
  );
}
