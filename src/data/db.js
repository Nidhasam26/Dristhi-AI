/**
 * IndexedDB wrapper using the native IDBFactory API (no external lib)
 *
 * Stores (v4):
 *   patients       — patient records (existing, preserved)
 *   scans          — retinal scan records (existing, preserved)
 *   appointments   — appointment records (existing, preserved)
 *   sync_queue     — NEW: operations waiting to sync to backend
 *   auth_cache     — NEW: offline session tokens (NO passwords/PINs)
 *   settings       — NEW: per-user app settings
 *   notifications  — NEW: SMS/WhatsApp notification records
 *   meta           — NEW: app metadata (last_sync, etc.)
 *
 * Migration safety:
 *   v3 → v4: Only adds new stores. Never deletes existing stores or data.
 *   All existing patient/scan/appointment records are fully preserved.
 *
 * Sync metadata (added to existing records going forward):
 *   sync_status: 'pending_sync' | 'syncing' | 'synced' | 'failed'
 *   Records without sync_status are treated as 'synced' (pre-v4 data).
 */

const DB_NAME = 'drishti_db';
const DB_VERSION = 4;

let dbPromise = null;

export function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(wrapDB(request.result));

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;

      // ── v3 migration: drop all stores so re-seed stamps ownerUserId on every record ──
      // This was the existing migration — preserved exactly.
      if (oldVersion > 0 && oldVersion < 3) {
        ['patients', 'scans', 'appointments'].forEach((name) => {
          if (db.objectStoreNames.contains(name)) db.deleteObjectStore(name);
        });
      }

      // ── Create patients store (v1+) ──
      if (!db.objectStoreNames.contains('patients')) {
        const ps = db.createObjectStore('patients', { keyPath: 'id' });
        ps.createIndex('created_by', 'created_by', { unique: false });
        ps.createIndex('district', 'district', { unique: false });
        ps.createIndex('userId', 'userId', { unique: false });
        ps.createIndex('sync_status', 'sync_status', { unique: false });
      }

      // ── Create scans store (v1+) ──
      if (!db.objectStoreNames.contains('scans')) {
        const ss = db.createObjectStore('scans', { keyPath: 'id' });
        ss.createIndex('patient_id', 'patient_id', { unique: false });
        ss.createIndex('scanned_by', 'scanned_by', { unique: false });
        ss.createIndex('scan_date', 'scan_date', { unique: false });
        ss.createIndex('ownerUserId', 'ownerUserId', { unique: false });
        ss.createIndex('sync_status', 'sync_status', { unique: false });
      }

      // ── Create appointments store (v1+) ──
      if (!db.objectStoreNames.contains('appointments')) {
        const as = db.createObjectStore('appointments', { keyPath: 'id' });
        as.createIndex('patientId', 'patientId', { unique: false });
        as.createIndex('doctorId', 'doctorId', { unique: false });
        as.createIndex('scanId', 'scanId', { unique: false });
        as.createIndex('date', 'date', { unique: false });
        as.createIndex('status', 'status', { unique: false });
        as.createIndex('ownerUserId', 'ownerUserId', { unique: false });
        as.createIndex('sync_status', 'sync_status', { unique: false });
      }

      // ── v4 ADDITIONS — new stores only, never touches existing stores ──

      // sync_queue: persistent FIFO queue of operations waiting to sync to backend
      if (!db.objectStoreNames.contains('sync_queue')) {
        const sq = db.createObjectStore('sync_queue', { keyPath: 'id' });
        sq.createIndex('status', 'status', { unique: false });
        sq.createIndex('operation_type', 'operation_type', { unique: false });
        sq.createIndex('entity_type', 'entity_type', { unique: false });
        sq.createIndex('created_at', 'created_at', { unique: false });
        sq.createIndex('idempotency_key', 'idempotency_key', { unique: true });
      }

      // auth_cache: offline session data (NO passwords, NO PINs, NO secrets)
      if (!db.objectStoreNames.contains('auth_cache')) {
        db.createObjectStore('auth_cache', { keyPath: 'userId' });
      }

      // settings: per-user application settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'userId' });
      }

      // notifications: SMS/WhatsApp reminder records
      if (!db.objectStoreNames.contains('notifications')) {
        const ns = db.createObjectStore('notifications', { keyPath: 'id' });
        ns.createIndex('appointment_id', 'appointment_id', { unique: false });
        ns.createIndex('status', 'status', { unique: false });
        ns.createIndex('created_at', 'created_at', { unique: false });
      }

      // meta: app-level key/value metadata (last_sync_at, app_version, etc.)
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };
  });

  return dbPromise;
}

/** Reset the cached DB promise (used after version upgrade to get fresh instance) */
export function resetDBCache() {
  dbPromise = null;
}

/** Light promise wrapper around an IDBDatabase instance */
function wrapDB(db) {
  return {
    // ── Core CRUD ──
    get: (store, key) => tx(db, store, 'readonly', (s) => s.get(key)),
    getAll: (store) => tx(db, store, 'readonly', (s) => s.getAll()),
    put: (store, value) => tx(db, store, 'readwrite', (s) => s.put(value)),
    delete: (store, key) => tx(db, store, 'readwrite', (s) => s.delete(key)),

    // ── Index queries ──
    getAllByIndex: (store, index, value) =>
      tx(db, store, 'readonly', (s) => s.index(index).getAll(value)),

    // ── Count (lightweight, no data transfer) ──
    count: (store) => tx(db, store, 'readonly', (s) => s.count()),

    // ── Batch operations ──
    putAll: async (store, items) => {
      const transaction = db.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        for (const item of items) {
          objectStore.put(item);
        }
      });
    },

    // ── Sync queue helpers ──
    getPendingSyncItems: () =>
      tx(db, 'sync_queue', 'readonly', (s) => s.index('status').getAll('pending')),

    getFailedSyncItems: () =>
      tx(db, 'sync_queue', 'readonly', (s) => s.index('status').getAll('failed')),

    // ── Meta helpers ──
    getMeta: (key) => tx(db, 'meta', 'readonly', (s) => s.get(key)),
    setMeta: (key, value) => tx(db, 'meta', 'readwrite', (s) =>
      s.put({ key, value, updated_at: new Date().toISOString() })
    ),
  };
}

function tx(db, storeName, mode, fn) {
  return new Promise((resolve, reject) => {
    let transaction;
    try {
      transaction = db.transaction(storeName, mode);
    } catch (err) {
      reject(err);
      return;
    }
    const store = transaction.objectStore(storeName);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Seed the DB with demo data on first run.
 * Only seeds if the store is empty — never overwrites existing data.
 */
export async function seedDBIfEmpty(patients, scans, appointments = []) {
  const db = await getDB();

  const existingPatients = await db.getAll('patients');
  if (existingPatients.length === 0) {
    for (const patient of patients) {
      await db.put('patients', {
        ...patient,
        sync_status: 'synced', // Demo data is considered already synced
      });
    }
  }

  const existingScans = await db.getAll('scans');
  if (existingScans.length === 0) {
    for (const scan of scans) {
      await db.put('scans', {
        ...scan,
        sync_status: 'synced',
      });
    }
  }

  const existingAppointments = await db.getAll('appointments');
  if (existingAppointments.length === 0 && appointments.length > 0) {
    for (const apt of appointments) {
      await db.put('appointments', {
        ...apt,
        sync_status: 'synced',
      });
    }
  }
}

/**
 * Generate a stable client-side ID.
 * Format: <prefix>_<timestamp>_<random6>
 * These IDs are used offline before the server assigns a canonical ID.
 */
export function generateClientId(prefix = 'rec') {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${rand}`;
}
