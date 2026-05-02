export const DB_URLS = {
    'qeraat_data_v1.db': 'https://raw.githubusercontent.com/QuranHolder/QeraatSearcher/main/qeraat-native/public/db/qeraat_data_v1.db',
    'qeraat_more_v1.db': 'https://raw.githubusercontent.com/QuranHolder/QeraatSearcher/main/qeraat-native/public/db/qeraat_more_v1.db'
};

const DB_NAME = 'qeraat_dbs';
const STORE_NAME = 'databases';
const VERSION = 1;

function getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, VERSION);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getDatabaseFromCache(dbName: string): Promise<ArrayBuffer | null> {
    try {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(dbName);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Failed to get database from cache:', err);
        return null;
    }
}

export async function saveDatabaseToCache(dbName: string, buffer: ArrayBuffer): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(buffer, dbName);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function clearDatabaseCache(): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function updateDatabases(onProgress?: (progress: number, status: string) => void): Promise<void> {
    const dbs = Object.entries(DB_URLS);
    
    for (let i = 0; i < dbs.length; i++) {
        const [dbName, url] = dbs[i];
        
        // Use a generic status without assuming locale here
        // The UI will likely just show the percentage or a generic 'Updating...' string anyway,
        // but we'll provide english here as fallback for developers.
        if (onProgress) onProgress((i / dbs.length) * 100, `Downloading ${dbName}...`);
        
        // Add a cache buster to bypass aggressive caching
        const response = await fetch(`${url}?t=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${dbName}: ${response.statusText}`);
        }
        
        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let loaded = 0;

        const reader = response.body?.getReader();
        if (reader) {
            const chunks: Uint8Array[] = [];
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) {
                    chunks.push(value);
                    loaded += value.length;
                    if (total > 0 && onProgress) {
                        const fileProgress = loaded / total;
                        const overallProgress = ((i + fileProgress) / dbs.length) * 100;
                        onProgress(overallProgress, `Downloading ${dbName}...`);
                    }
                }
            }
            
            const allChunks = new Uint8Array(loaded);
            let position = 0;
            for (const chunk of chunks) {
                allChunks.set(chunk, position);
                position += chunk.length;
            }
            
            await saveDatabaseToCache(dbName, allChunks.buffer);
        } else {
            // Fallback if streams are not supported
            const buffer = await response.arrayBuffer();
            await saveDatabaseToCache(dbName, buffer);
        }
        
        if (onProgress) onProgress(((i + 1) / dbs.length) * 100, `Saved ${dbName}`);
    }
}
