/**
 * Screen Navigation State Machine
 * Manages demo flow from intro through close
 */

import { useState, useCallback, useEffect } from 'react';
import type { ScreenId } from '../types';

const SCREEN_ORDER: ScreenId[] = [
  'mission-context',
  'live-mission',
  'decision-explorer',
  'tampering-console',
  'rejection',
  'comparison',
  'close',
];

interface UseScreenNavigationReturn {
  currentScreen: ScreenId;
  currentIndex: number;
  totalScreens: number;
  goToNext: () => void;
  goToPrevious: () => void;
  goToScreen: (screen: ScreenId) => void;
  restart: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function useScreenNavigation(): UseScreenNavigationReturn {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentScreen = SCREEN_ORDER[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === SCREEN_ORDER.length - 1;

  const goToNext = useCallback(() => {
    if (currentIndex < SCREEN_ORDER.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const goToScreen = useCallback((screen: ScreenId) => {
    const index = SCREEN_ORDER.indexOf(screen);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, []);

  const restart = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ': // Space
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          goToNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          restart();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentIndex(SCREEN_ORDER.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, restart]);

  return {
    currentScreen,
    currentIndex,
    totalScreens: SCREEN_ORDER.length,
    goToNext,
    goToPrevious,
    goToScreen,
    restart,
    isFirst,
    isLast,
  };
}
