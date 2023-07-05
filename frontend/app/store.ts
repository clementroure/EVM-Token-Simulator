import { useEffect, useState } from 'react';
import { create } from 'zustand';

type AppState = {
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  selectedChain: string;
  setSelectedChain: (value: string) => void;
  testMode: boolean;
  setTestMode: (value: boolean) => void;
  isLogged: boolean;
  setIsLogged: (value: boolean) => void;
  isPWA: boolean;
  setIsPWA: (value: boolean) => void;
  walletAddress: string;
  setWalletAddress: (value: string) => void;
  isSimulating: boolean;
  setIsSimulating: (value: boolean) => void;
  isSimulationLoading: boolean;
  setIsSimulationLoading: (value: boolean) => void;
  simulationProgress: any;
  setSimulationProgress: (value: any) => void;
};

const PERSIST_STATE = false; // Change this to false if you don't want to persist state
const localStorageKey = 'token-simulator';

const getLocalStorageState = (): AppState => {
  // Check if the code is running in the browser and if state persistence is enabled
  if (typeof window !== 'undefined' && PERSIST_STATE) {
    const storageValue = localStorage.getItem(localStorageKey);
    if (storageValue) {
      return JSON.parse(storageValue);
    }
  }

  // If no data in local storage or persistence is disabled, return default state
  return {
    selectedProduct: 'Uniswap V2',
    setSelectedProduct: () => {},
    selectedChain: '4',
    setSelectedChain: () => {},
    testMode: true,
    setTestMode: () => {},
    isLogged: false,
    setIsLogged: () => {},
    isPWA: false,
    setIsPWA: () => {},
    walletAddress: '',
    setWalletAddress: () => {},
    isSimulating: false,
    setIsSimulating: () => {},
    isSimulationLoading: false,
    setIsSimulationLoading: () => {},
    simulationProgress: 0,
    setSimulationProgress: () => {},
  };
};

const setLocalStorageState = (state: AppState) => {
  // Check if the code is running in the browser and if state persistence is enabled
  if (typeof window !== 'undefined' && PERSIST_STATE) {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }
};

export const useStore = create<AppState>((set) => {
  const initialState = getLocalStorageState();
  return {
    ...initialState,
    setSelectedProduct: (value: string) => set((state) => {
      const newState = { ...state, selectedProduct: value };
      setLocalStorageState(newState);
      return newState;
    }),
    setSelectedChain: (value: string) => set((state) => {
      const newState = { ...state, selectedChain: value };
      setLocalStorageState(newState);
      return newState;
    }),
    setTestMode: (value: boolean) => set((state) => {
      const newState = { ...state, testMode: value };
      setLocalStorageState(newState);
      return newState;
    }),
    setIsLogged: (value: boolean) => set((state) => {
      const newState = { ...state, isLogged: value };
      setLocalStorageState(newState);
      return newState;
    }),
    setIsPWA: (value: boolean) => set((state) => {
      const newState = { ...state, isPWA: value };
      setLocalStorageState(newState);
      return newState;
    }),
    setWalletAddress: (value: string) => set((state) => {
      const newState = { ...state, walletAddress: value };
      setLocalStorageState(newState);
      return newState;
    }),
    setIsSimulating: (value: boolean) => set((state) => {
      const newState = { ...state, isSimulating: value };
      setLocalStorageState(newState);
      return newState;
    }),
    setIsSimulationLoading: (value: boolean) => set((state) => {
      const newState = { ...state, isSimulationLoading: value };
      setLocalStorageState(newState);
      return newState;
    }),
    setSimulationProgress: (value: number) => set((state) => {
      const newState = { ...state, simulationProgress: value };
      setLocalStorageState(newState);
      return newState;
    }),
  };
});

// Custom hook - prevent hydration errors with Next.js
export const usePersistentStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};
