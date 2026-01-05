/**
 * Screen 1: Mission Context
 * Purpose: Set stakes with real regulation, establish value proposition
 * Per §CONSTRAINT-CENTERING - simple centered content
 * Enhanced with visual drama per v2.1 spec
 */

interface MissionContextProps {
  onAdvance: () => void;
}

export function MissionContext({ onAdvance }: MissionContextProps) {
  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-8 cursor-pointer relative overflow-hidden"
      onClick={onAdvance}
    >
      {/* Vignette overlay for visual drama */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Subtle radial gradient background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.05)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl text-center space-y-12 relative z-10">
        {/* DoD Directive Quote - with decorative styling */}
        <div className="animate-initial animate-fadeInUp space-y-4">
          <p className="text-sm md:text-base text-gray-500 uppercase tracking-[0.2em] max-w-2xl mx-auto">
            DoD DIRECTIVE 3000.09 REQUIRES:
          </p>
          <blockquote className="relative text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            {/* Decorative quote marks */}
            <span className="absolute -left-8 -top-4 text-6xl text-gray-700/50 font-serif select-none">"</span>
            <span className="italic border-l-2 border-gray-600 pl-6 block">
              Appropriate levels of human judgment over the use of force
            </span>
            <span className="absolute -right-4 bottom-0 text-6xl text-gray-700/50 font-serif select-none">"</span>
          </blockquote>
        </div>

        {/* Main Title - with glow effect */}
        <div className="animate-initial animate-fadeInUp delay-200 space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight animate-glowPulse">
            THE UNALTERABLE
            <br />
            ENGAGEMENT
          </h1>
        </div>

        {/* Value Proposition */}
        <div className="animate-initial animate-fadeInUp delay-400 space-y-4">
          <p className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto leading-relaxed">
            Watch what happens when you try to lie about
            whether a human approved lethal force.
          </p>
        </div>

        {/* CTA - delayed appearance */}
        <div className="animate-initial animate-fadeIn delay-800 pt-8">
          <p className="text-sm text-gray-500 animate-pulse">
            Click or press Space to begin
          </p>
        </div>
      </div>
    </div>
  );
}
