import type { SqlJsStatic, Database } from 'sql.js';
import type { BookQuran, QuranData, QuranSora } from './types';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

/**
 * Resolves the correct base URL for fetching assets,
 * works in both browser (Next.js) and Electron/Capacitor WebView.
 */
function getBaseUrl(): string {
    if (typeof window !== 'undefined') {
        // In Capacitor/Electron the origin may be capacitor:// or file://
        // We always serve assets relative to the root
        return window.location.origin;
    }
    return '';
}

export async function initDatabase(): Promise<Database> {
    if (db) return db;

    const baseUrl = getBaseUrl();

    // Load sql.js
    if (!SQL) {
        const initSqlJs = (await import('sql.js')).default;
        SQL = await initSqlJs({
            locateFile: () => `${baseUrl}/sql-wasm.wasm`,
        });
    }

    // Fetch the SQLite database file
    const response = await fetch(`${baseUrl}/db/qeraat_data_v1.db`);
    if (!response.ok) {
        throw new Error(`Failed to fetch database: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buffer));

    return db;
}

export function searchText(db: Database, query: string, limit = 50): QuranData[] {
    const stmt = db.prepare(
        `SELECT * FROM quran_data WHERE sub_subject LIKE $q OR sub_subject1 LIKE $q LIMIT $limit`
    );
    stmt.bind({ $q: `%${query}%`, $limit: limit });
    const results: QuranData[] = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject() as unknown as QuranData);
    }
    stmt.free();
    return results;
}

export function searchRoot(db: Database, query: string, limit = 50): QuranData[] {
    const stmt = db.prepare(
        `SELECT * FROM quran_data WHERE root = $root LIMIT $limit`
    );
    stmt.bind({ $root: query, $limit: limit });
    const results: QuranData[] = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject() as unknown as QuranData);
    }
    stmt.free();
    return results;
}

export function searchTag(db: Database, query: string, limit = 50): QuranData[] {
    const stmt = db.prepare(
        `SELECT * FROM quran_data WHERE tags LIKE $q LIMIT $limit`
    );
    stmt.bind({ $q: `%${query}%`, $limit: limit });
    const results: QuranData[] = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject() as unknown as QuranData);
    }
    stmt.free();
    return results;
}

export function getAya(db: Database, ayaIndex: number): {
    aya: BookQuran | null;
    sora: QuranSora | null;
    quranData: QuranData[];
} {
    // Get aya text
    const ayaStmt = db.prepare(`SELECT * FROM book_quran WHERE aya_index = $idx`);
    ayaStmt.bind({ $idx: ayaIndex });
    const aya = ayaStmt.step() ? (ayaStmt.getAsObject() as unknown as BookQuran) : null;
    ayaStmt.free();

    if (!aya) return { aya: null, sora: null, quranData: [] };

    // Get sora info
    const soraStmt = db.prepare(`SELECT * FROM quran_sora WHERE sora = $sora`);
    soraStmt.bind({ $sora: aya.sora });
    const sora = soraStmt.step() ? (soraStmt.getAsObject() as unknown as QuranSora) : null;
    soraStmt.free();

    // Get readings
    const dataStmt = db.prepare(
        `SELECT * FROM quran_data WHERE aya_index = $idx ORDER BY id ASC`
    );
    dataStmt.bind({ $idx: ayaIndex });
    const quranData: QuranData[] = [];
    while (dataStmt.step()) {
        quranData.push(dataStmt.getAsObject() as unknown as QuranData);
    }
    dataStmt.free();

    return { aya, sora, quranData };
}
