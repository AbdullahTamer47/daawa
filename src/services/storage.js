// ══════════════════════════════════════
// Storage Service - IndexedDB + LocalStorage
// ══════════════════════════════════════

const DB_NAME = 'daawa_db';
const DB_VERSION = 1;
const STORES = ['worship', 'quran', 'challenges', 'lessons', 'points', 'settings', 'tips'];

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            STORES.forEach(store => {
                if (!db.objectStoreNames.contains(store)) {
                    db.createObjectStore(store, { keyPath: 'id' });
                }
            });
        };
    });
}

export async function dbGet(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function dbGetAll(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function dbPut(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function dbDelete(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function dbClear(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// LocalStorage helpers
export function lsGet(key, fallback = null) {
    try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
}

export function lsSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { console.error('Storage error:', e); }
}

export function lsRemove(key) {
    localStorage.removeItem(key);
}

// Get today's date key
export function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

// Session helpers (for keeping user logged in after refresh)
export function getSession() {
    try {
        const val = sessionStorage.getItem('daawa_session');
        return val ? JSON.parse(val) : null;
    } catch { return null; }
}

export function setSession(userName, isAdmin = false) {
    try {
        sessionStorage.setItem('daawa_session', JSON.stringify({ userName, isAdmin }));
    } catch (e) { console.error('Session error:', e); }
}

export function clearSession() {
    try {
        sessionStorage.removeItem('daawa_session');
    } catch {}
}

// ══════════════════════════════════════════════════════
// Smart Offline Mutation Queue (for Offline-First Sync)
// ══════════════════════════════════════════════════════
const QUEUE_KEY = 'daawa_offline_queue';

export function queueOfflineMutation(eventType, payload) {
    try {
        const queue = lsGet(QUEUE_KEY, []);
        const mutation = {
            id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            eventType,
            payload,
            timestamp: new Date().toISOString(),
        };
        queue.push(mutation);
        lsSet(QUEUE_KEY, queue);
        return mutation;
    } catch (e) {
        console.error('Queue error:', e);
        return null;
    }
}

export function getOfflineQueue() {
    return lsGet(QUEUE_KEY, []);
}

export function clearOfflineQueue() {
    lsRemove(QUEUE_KEY);
}

export async function flushOfflineQueue(syncCallback) {
    const queue = getOfflineQueue();
    if (!queue || queue.length === 0) return 0;

    try {
        if (typeof syncCallback === 'function') {
            await syncCallback(queue);
            clearOfflineQueue();
            return queue.length;
        }
    } catch (err) {
        console.warn('Failed to flush offline queue:', err);
    }
    return 0;
}

// Automatic online event hook
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        window.dispatchEvent(new CustomEvent('daawa_flush_queue'));
    });
}
