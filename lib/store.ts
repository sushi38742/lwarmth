'use client';
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, RawRow, ColumnMapping, WarmPathResult } from './types';

const initialState: AppState = {
  isAuthenticated: false,
  currentStep: 0,
  targetRows: [],
  connectionRows: [],
  targetHeaders: [],
  connectionHeaders: [],
  targetMapping: {},
  connectionMapping: {},
  results: [],
  selectedResultId: null,
};

type Action =
  | { type: 'SET_AUTH'; payload: boolean }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_TARGET_DATA'; payload: { rows: RawRow[]; headers: string[] } }
  | { type: 'SET_CONNECTION_DATA'; payload: { rows: RawRow[]; headers: string[] } }
  | { type: 'SET_TARGET_MAPPING'; payload: ColumnMapping }
  | { type: 'SET_CONNECTION_MAPPING'; payload: ColumnMapping }
  | { type: 'SET_RESULTS'; payload: WarmPathResult[] }
  | { type: 'SET_SELECTED_RESULT'; payload: string | null }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_AUTH': return { ...state, isAuthenticated: action.payload };
    case 'SET_STEP': return { ...state, currentStep: action.payload };
    case 'SET_TARGET_DATA': return { ...state, targetRows: action.payload.rows, targetHeaders: action.payload.headers };
    case 'SET_CONNECTION_DATA': return { ...state, connectionRows: action.payload.rows, connectionHeaders: action.payload.headers };
    case 'SET_TARGET_MAPPING': return { ...state, targetMapping: action.payload };
    case 'SET_CONNECTION_MAPPING': return { ...state, connectionMapping: action.payload };
    case 'SET_RESULTS': return { ...state, results: action.payload };
    case 'SET_SELECTED_RESULT': return { ...state, selectedResultId: action.payload };
    case 'RESET': return { ...initialState };
    default: return state;
  }
}

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('wpf-state');
        if (saved) return JSON.parse(saved) as AppState;
      } catch (_e) {}
    }
    return init;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('wpf-state', JSON.stringify(state));
    } catch (_e) {}
  }, [state]);

  return React.createElement(
    StoreContext.Provider,
    { value: { state, dispatch } },
    children
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
