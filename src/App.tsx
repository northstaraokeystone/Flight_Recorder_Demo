/**
 * AI Flight Recorder v3.0
 * "Tamper-Evident Assurance for Autonomy in Denied Environments"
 *
 * Offline Fiduciary Continuity Platform
 * - Lost signal = preserved proof
 * - Verifiable Autonomy Assurance
 */

import { useState, useCallback } from 'react';
import { DeniedEnvironment } from './screens';

type AppMode = 'denied-environment' | 'complete';

function App() {
  const [mode, setMode] = useState<AppMode>('denied-environment');

  const handleComplete = useCallback(() => {
    setMode('complete');
  }, []);

  const handleRestart = useCallback(() => {
    setMode('denied-environment');
  }, []);

  if (mode === 'complete') {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          {/* Success badge */}
          <div
            className="inline-block px-6 py-2 mb-8 font-mono text-sm tracking-widest"
            style={{
              backgroundColor: 'rgba(0, 170, 102, 0.15)',
              border: '2px solid #00aa66',
              color: '#00aa66',
            }}
          >
            MISSION COMPLETE
          </div>

          {/* Main message */}
          <h1 className="text-4xl font-bold text-white mb-4 font-mono">
            Chain of Custody: Unbroken
          </h1>

          <p className="text-xl text-gray-400 mb-8 font-mono">
            142 decisions captured. Zero gaps. $15M liability avoided.
          </p>

          {/* The quote */}
          <div className="relative p-6 my-8 text-left" style={{ backgroundColor: 'rgba(13, 20, 36, 0.8)' }}>
            <div className="absolute top-2 left-4 text-4xl text-gray-700 font-serif">"</div>
            <p className="text-gray-300 italic pl-6 pr-4 text-sm leading-relaxed">
              When your drone goes dark over a school, our system proves—cryptographically—that
              it followed the rules you programmed in the boardroom. That proof is admissible
              in court, acceptable to insurers, and compliant with DOD 3000.09.
            </p>
            <p className="text-gray-300 italic pl-6 pr-4 text-sm leading-relaxed mt-4">
              Your current black box? It just says "signal lost."
            </p>
            <p className="text-[#00aa66] font-bold pl-6 mt-4 text-sm">
              Which one do you want when Congress subpoenas your logs?
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 my-8">
            <div className="p-4" style={{ backgroundColor: 'rgba(13, 20, 36, 0.8)', border: '1px solid #374151' }}>
              <div className="text-2xl font-mono font-bold text-[#00d4ff]">30-50%</div>
              <div className="text-xs text-gray-500 font-mono mt-1">PREMIUM REDUCTION</div>
            </div>
            <div className="p-4" style={{ backgroundColor: 'rgba(13, 20, 36, 0.8)', border: '1px solid #374151' }}>
              <div className="text-2xl font-mono font-bold text-[#00d4ff]">$15M</div>
              <div className="text-xs text-gray-500 font-mono mt-1">CLAIM AVOIDANCE</div>
            </div>
            <div className="p-4" style={{ backgroundColor: 'rgba(13, 20, 36, 0.8)', border: '1px solid #374151' }}>
              <div className="text-2xl font-mono font-bold text-[#00d4ff]">6-18mo</div>
              <div className="text-xs text-gray-500 font-mono mt-1">FASTER APPROVAL</div>
            </div>
          </div>

          {/* Restart button */}
          <button
            onClick={handleRestart}
            className="px-8 py-3 font-mono text-sm tracking-wider transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'transparent',
              border: '2px solid #00d4ff',
              color: '#00d4ff',
            }}
          >
            REPLAY DEMONSTRATION
          </button>

          {/* Footer tagline */}
          <p className="mt-12 text-gray-600 font-mono text-xs tracking-widest">
            LOST SIGNAL ≠ LOST CONTROL. LOST SIGNAL = PRESERVED PROOF.
          </p>
        </div>
      </div>
    );
  }

  return <DeniedEnvironment onComplete={handleComplete} />;
}

export default App;
