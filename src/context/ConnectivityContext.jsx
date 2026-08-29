import { createContext, useContext, useEffect, useState } from 'react';
import { connectivity, NetworkState } from '../services/connectivityDetector.js';

const ConnectivityContext = createContext(null);

export function ConnectivityProvider({ children }) {
  const [connState, setConnState] = useState({
    state: connectivity.state,
    isOnline: connectivity.state !== NetworkState.OFFLINE,
    isSlow: connectivity.state === NetworkState.SLOW,
    latencyMs: connectivity.latencyMs,
    effectiveType: connectivity.effectiveType,
  });

  useEffect(() => {
    const unsubscribe = connectivity.subscribe((state) => {
      setConnState(state);
    });
    return unsubscribe;
  }, []);

  const refreshHealth = () => connectivity.checkHealth();

  return (
    <ConnectivityContext.Provider value={{ ...connState, refreshHealth }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  const ctx = useContext(ConnectivityContext);
  if (!ctx) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return ctx;
}
