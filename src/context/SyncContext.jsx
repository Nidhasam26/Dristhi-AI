import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { syncEngine, SyncStatus } from '../services/syncEngine.js';

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const [syncState, setSyncState] = useState({
    status: syncEngine.status,
    pendingCount: syncEngine.pendingCount,
    lastSyncTime: syncEngine.lastSyncTime,
    lastError: syncEngine.lastError,
    isProcessing: syncEngine.isProcessing,
  });

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((state) => {
      setSyncState(state);
    });
    return unsubscribe;
  }, []);

  const triggerSync = useCallback(() => {
    return syncEngine.processQueue();
  }, []);

  const enqueueOperation = useCallback((op) => {
    return syncEngine.enqueueOperation(op);
  }, []);

  return (
    <SyncContext.Provider
      value={{
        ...syncState,
        triggerSync,
        enqueueOperation,
        SyncStatus,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return ctx;
}
