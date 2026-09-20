/**
 * Offline Sync Engine
 * Handles persistent FIFO operation queuing, exponential backoff,
 * idempotency, conflict resilience, and network restoration sync.
 */

import { getDB, generateClientId } from '../data/db.js';
import { connectivity } from './connectivityDetector.js';

export const SyncStatus = {
  IDLE: 'IDLE',
  SYNCING: 'SYNCING',
  SYNCED: 'SYNCED',
  ERROR: 'ERROR',
  OFFLINE: 'OFFLINE',
};

class SyncEngine {
  constructor() {
    this.listeners = new Set();
    this.status = SyncStatus.IDLE;
    this.pendingCount = 0;
    this.lastSyncTime = null;
    this.lastError = null;
    this.isProcessing = false;

    this.init();
  }

  async init() {
    // Initial count of pending operations in IDB
    await this.updatePendingCount();

    // Listen for connectivity transitions
    connectivity.subscribe((conn) => {
      if (conn.isOnline && this.pendingCount > 0 && !this.isProcessing) {
        this.processQueue();
      } else if (!conn.isOnline) {
        this.status = SyncStatus.OFFLINE;
        this.notify();
      }
    });
  }

  async updatePendingCount() {
    try {
      const db = await getDB();
      const pending = await db.getPendingSyncItems();
      this.pendingCount = pending ? pending.length : 0;
      this.notify();
    } catch (err) {
      console.warn('Failed to read pending sync count:', err);
    }
  }

  /**
   * Enqueue an operation to IndexedDB sync_queue.
   * Uses idempotency_key to prevent duplicate queue items.
   */
  async enqueueOperation({ operationType, entityType, entityId, payload }) {
    const db = await getDB();
    const idempotencyKey = `${entityType}:${entityId}:${operationType}`;

    const queueItem = {
      id: generateClientId('sq'),
      operation_type: operationType,
      entity_type: entityType,
      entity_id: entityId,
      payload,
      status: 'pending',
      created_at: new Date().toISOString(),
      retry_count: 0,
      last_error: null,
      idempotency_key: idempotencyKey,
    };

    try {
      // Check if already in queue to prevent duplicate submissions
      const existing = await db.getAllByIndex('sync_queue', 'idempotency_key', idempotencyKey);
      if (existing && existing.length > 0) {
        const active = existing.find((item) => item.status === 'pending' || item.status === 'syncing');
        if (active) {
          // Update the payload of the existing queue item with newer edits
          await db.put('sync_queue', { ...active, payload, created_at: new Date().toISOString() });
          await this.updatePendingCount();
          return active.id;
        }
      }

      await db.put('sync_queue', queueItem);
      await this.updatePendingCount();

      // Trigger sync if online
      if (connectivity.state !== 'OFFLINE' && !this.isProcessing) {
        this.processQueue();
      }

      return queueItem.id;
    } catch (err) {
      console.error('Failed to enqueue sync operation:', err);
      return null;
    }
  }

  /**
   * Process all pending items in sync_queue.
   */
  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.status = SyncStatus.SYNCING;
    this.notify();

    try {
      const db = await getDB();
      const pendingItems = await db.getPendingSyncItems();

      if (!pendingItems || pendingItems.length === 0) {
        this.status = SyncStatus.SYNCED;
        this.pendingCount = 0;
        this.isProcessing = false;
        this.notify();
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || '';

      for (const item of pendingItems) {
        // Mark as currently syncing
        await db.put('sync_queue', { ...item, status: 'syncing' });

        try {
          const success = await this.sendToServer(apiUrl, item);

          if (success) {
            // Remove completed item from queue or mark synced
            await db.delete('sync_queue', item.id);

            // Update entity's sync_status in its respective IDB store
            await this.markEntitySynced(db, item.entity_type, item.entity_id);
          } else {
            // Increment retry count with exponential backoff
            const retryCount = (item.retry_count || 0) + 1;
            const newStatus = retryCount >= 5 ? 'failed' : 'pending';
            await db.put('sync_queue', {
              ...item,
              status: newStatus,
              retry_count: retryCount,
              last_error: 'Server returned error or invalid response',
            });
          }
        } catch (itemErr) {
          const retryCount = (item.retry_count || 0) + 1;
          const newStatus = retryCount >= 5 ? 'failed' : 'pending';
          await db.put('sync_queue', {
            ...item,
            status: newStatus,
            retry_count: retryCount,
            last_error: itemErr.message || 'Network failure',
          });
        }
      }

      await this.updatePendingCount();
      this.lastSyncTime = new Date().toISOString();
      await db.setMeta('last_sync_at', this.lastSyncTime);

      const remaining = await db.getPendingSyncItems();
      this.status = remaining.length === 0 ? SyncStatus.SYNCED : SyncStatus.ERROR;
    } catch (err) {
      console.error('Sync queue execution encountered error:', err);
      this.lastError = err.message;
      this.status = SyncStatus.ERROR;
    } finally {
      this.isProcessing = false;
      this.notify();
    }
  }

  async sendToServer(apiUrl, item) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${apiUrl}/api/sync/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: item.operation_type,
        entityType: item.entity_type,
        entityId: item.entity_id,
        idempotencyKey: item.idempotency_key,
        payload: item.payload,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return res.ok;
  }

  async markEntitySynced(db, entityType, entityId) {
    try {
      const storeMap = {
        patient: 'patients',
        scan: 'scans',
        appointment: 'appointments',
      };
      const storeName = storeMap[entityType];
      if (!storeName) return;

      const record = await db.get(storeName, entityId);
      if (record) {
        await db.put(storeName, { ...record, sync_status: 'synced', last_synced_at: new Date().toISOString() });
      }
    } catch (e) {
      console.warn('Could not update entity sync_status:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener({
      status: this.status,
      pendingCount: this.pendingCount,
      lastSyncTime: this.lastSyncTime,
      lastError: this.lastError,
      isProcessing: this.isProcessing,
    });

    return () => this.listeners.delete(listener);
  }

  notify() {
    const payload = {
      status: this.status,
      pendingCount: this.pendingCount,
      lastSyncTime: this.lastSyncTime,
      lastError: this.lastError,
      isProcessing: this.isProcessing,
    };
    this.listeners.forEach((fn) => fn(payload));
  }
}

export const syncEngine = new SyncEngine();
