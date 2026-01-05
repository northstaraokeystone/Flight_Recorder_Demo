/**
 * AI Flight Recorder Demo
 * "The Unalterable Engagement" - Decision Provenance for Autonomous Systems
 */

import { useState, useCallback } from 'react';
import { useScreenNavigation } from './hooks/useScreenNavigation';
import {
  MissionContext,
  LiveMission,
  DecisionExplorer,
  TamperingConsole,
  Rejection,
  Comparison,
  Close,
} from './screens';
import type { Receipt, AttackType } from './types';

function App() {
  const { currentScreen, goToNext, restart } = useScreenNavigation();

  // State shared between screens
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedAttack, setSelectedAttack] = useState<AttackType>('REMOVE_APPROVAL');

  // Handle receipt generation from live mission
  const handleReceiptsGenerated = useCallback((newReceipts: Receipt[]) => {
    setReceipts(newReceipts);
  }, []);

  // Handle attack selection from tampering console
  const handleAttackSelected = useCallback((attack: AttackType) => {
    setSelectedAttack(attack);
    goToNext();
  }, [goToNext]);

  // Handle restart
  const handleRestart = useCallback(() => {
    setReceipts([]);
    setSelectedAttack('REMOVE_APPROVAL');
    restart();
  }, [restart]);

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'mission-context':
        return <MissionContext onAdvance={goToNext} />;

      case 'live-mission':
        return (
          <LiveMission
            onAdvance={goToNext}
            onReceiptsGenerated={handleReceiptsGenerated}
          />
        );

      case 'decision-explorer':
        return (
          <DecisionExplorer
            receipts={receipts}
            onAdvance={goToNext}
          />
        );

      case 'tampering-console':
        return (
          <TamperingConsole
            receipts={receipts}
            onAdvance={handleAttackSelected}
          />
        );

      case 'rejection':
        return (
          <Rejection
            receipts={receipts}
            attackType={selectedAttack}
            onAdvance={goToNext}
          />
        );

      case 'comparison':
        return <Comparison onAdvance={goToNext} />;

      case 'close':
        return <Close onRestart={handleRestart} />;

      default:
        return <MissionContext onAdvance={goToNext} />;
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {renderScreen()}
    </div>
  );
}

export default App;
