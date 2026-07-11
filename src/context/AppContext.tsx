'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AppState, AppMode, ScanConfig, JobApplication, ApplicationStatus } from '@/types';
import { MOCK_APPLICATIONS, NEW_CARD_TEMPLATES } from '@/lib/mockData';

interface AppContextValue extends AppState {
  setMode: (mode: AppMode) => void;
  setConfig: (config: Partial<ScanConfig>) => void;
  loadPreviewMode: () => void;
  startLiveSync: () => Promise<void>;
  simulateNewEmail: () => void;
  updateCardStatus: (id: string, status: ApplicationStatus) => void;
  clearNewCard: () => void;
  scanError: string | null;
}

const defaultConfig: ScanConfig = {
  email: '',
  password: '',
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    mode: 'idle',
    applications: [],
    config: defaultConfig,
    isNewCard: null,
  });
  const [scanError, setScanError] = useState<string | null>(null);
  const templateIndexRef = useRef(0);

  const setMode = useCallback((mode: AppMode) => {
    setState((p) => ({ ...p, mode }));
  }, []);

  const setConfig = useCallback((config: Partial<ScanConfig>) => {
    setState((p) => ({ ...p, config: { ...p.config, ...config } }));
  }, []);

  const loadPreviewMode = useCallback(() => {
    setScanError(null);
    setState((p) => ({ ...p, mode: 'preview', applications: MOCK_APPLICATIONS, isNewCard: null }));
  }, []);

  const startLiveSync = useCallback(async () => {
    setScanError(null);
    setState((p) => ({ ...p, mode: 'scanning' }));

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.config.email,
          password: state.config.password,
          startDate: state.config.startDate,
          endDate: state.config.endDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Scan failed');
      }

      const apps = data.applications as JobApplication[];
      setState((p) => ({
        ...p,
        mode: 'live',
        applications: apps.length > 0 ? apps : MOCK_APPLICATIONS,
        isNewCard: null,
      }));

      if (apps.length === 0) {
        setScanError('No application emails found in this date range — showing demo data');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setScanError(msg);
      setState((p) => ({ ...p, mode: 'idle' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.config]);

  const simulateNewEmail = useCallback(() => {
    const template = NEW_CARD_TEMPLATES[templateIndexRef.current % NEW_CARD_TEMPLATES.length];
    templateIndexRef.current += 1;
    const today = new Date().toISOString().split('T')[0];
    const newCard: JobApplication = {
      ...template,
      id: `sim-${Date.now()}`,
      appliedDate: today,
      lastActivity: today,
    };
    setState((p) => ({
      ...p,
      applications: [newCard, ...p.applications],
      isNewCard: newCard.id,
    }));
  }, []);

  const updateCardStatus = useCallback((id: string, status: ApplicationStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setState((p) => ({
      ...p,
      applications: p.applications.map((a) =>
        a.id === id ? { ...a, status, lastActivity: today } : a
      ),
    }));
  }, []);

  const clearNewCard = useCallback(() => {
    setState((p) => ({ ...p, isNewCard: null }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setMode,
        setConfig,
        loadPreviewMode,
        startLiveSync,
        simulateNewEmail,
        updateCardStatus,
        clearNewCard,
        scanError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
