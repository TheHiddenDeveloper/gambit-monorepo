'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppSettings {
  stockfishDepth: number;
  setStockfishDepth: (depth: number) => void;
}

const SettingsContext = createContext<AppSettings | null>(null);

const STORAGE_KEY = 'gambit-settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [stockfishDepth, setStockfishDepthState] = useState(20);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.stockfishDepth) {
          setStockfishDepthState(settings.stockfishDepth);
        }
      }
    } catch {
      // Ignore errors
    }
    setIsLoaded(true);
  }, []);

  const setStockfishDepth = (depth: number) => {
    setStockfishDepthState(depth);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stockfishDepth: depth }));
    } catch {
      // Ignore errors
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <SettingsContext.Provider value={{ stockfishDepth, setStockfishDepth }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return { stockfishDepth: context.stockfishDepth };
}

export function useSettingsUpdate() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsUpdate must be used within a SettingsProvider');
  }
  return context;
}