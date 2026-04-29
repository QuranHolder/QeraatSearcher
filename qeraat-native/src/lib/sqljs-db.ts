import initSqlJs from 'sql.js';
import type { SqlJsStatic, Database } from 'sql.js';
import type { BookQuran, QuranData, QuranSora, Qareemaster, Tagsmaster, SearchOptions } from './types';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

/**
 * Resolves the correct base URL for fetching assets,
 * works in both browser (Next.js) and Electron/Capacitor WebView.
 */
function getBaseUrl(): string {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return '';
}


export async function initDatabase(): Promise<Database> {
    if (db) return db;

    const baseUrl = getBaseUrl();

    if (!SQL) {
        SQL = await initSqlJs({
            locateFile: () => `${baseUrl}/sql-wasm.wasm`,
        });
    }

    const response = await fetch(`${baseUrl}/db/qeraat_data_v1.db`);
    if (!response.ok) {
        throw new Error(`Failed to fetch database: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buffer));

    return db;
}

// ─────────────────────────────────────────────
// Helper: build WHERE clauses from SearchOptions
// ─────────────────────────────────────────────
function buildFilterClauses(opts: SearchOptions): { where: string[]; params: any } {
    const where: string[] = [];
    const params: any = {};

    // Include tags (OR logic)
    if (opts.includeTags && opts.includeTags.length > 0) {
        const tagClauses = opts.includeTags.map((tag, i) => {
            params[`$itag${i}`] = `%,${tag},%`;
            return `(',' || ifnull(tags,'') || ',') LIKE $itag${i}`;
        });
        where.push(`(${tagClauses.join(' OR ')})`);
    }

    // Exclude tags (AND NOT logic)
    if (opts.excludeTags && opts.excludeTags.length > 0) {
        opts.excludeTags.forEach((tag, i) => {
            params[`$etag${i}`] = `%,${tag},%`;
            where.push(`(',' || ifnull(tags,'') || ',') NOT LIKE $etag${i}`);
        });
    }

    // Include qarees (OR logic) — Q1..Q10
    if (opts.includeQarees && opts.includeQarees.length > 0) {
        const qClauses = opts.includeQarees.map(q => `ifnull(${q},'0') = '1'`);
        where.push(`(${qClauses.join(' OR ')})`);
    }

    // Exclude Hafs: ifnull(r5_2,0)<>1
    if (opts.excludeHafsa) {
        where.push(`ifnull(R5_2,0)<>1`);
    }

    return { where, params };
}

// ─────────────────────────────────────────────
// Helper: resolve the search-column WHERE clause
// for each search type, returning the clause and
// any params it needs.
// ─────────────────────────────────────────────
type SearchType = 'text' | 'root' | 'reading' | 'tag';

function buildSearchCondition(
    searchType: SearchType,
    query: string,
    opts: SearchOptions
): { clause: string; params: Record<string, any> } {
    const params: Record<string, any> = {};
    let clause: string;

    switch (searchType) {
        case 'root':
            params['$q'] = query;
            clause = `root = $q`;
            break;

        case 'reading':
            if (opts.wholeWord) {
                params['$q'] = query;
                clause = `reading = $q`;
            } else {
                params['$q'] = `%${query}%`;
                clause = `reading LIKE $q`;
            }
            break;

        case 'tag':
            params['$tagExact'] = `%,${query},%`;
            params['$qLike'] = `%${query}%`;
            clause = `((',' || ifnull(tags,'') || ',') LIKE $tagExact OR tags LIKE $qLike)`;
            break;

        default: // 'text'
            if (opts.wholeWord) {
                params['$q'] = query;
                clause = `(sub_subject = $q OR sub_subject1 = $q)`;
            } else {
                params['$q'] = `%${query || '%'}%`;
                clause = `(sub_subject LIKE $q OR sub_subject1 LIKE $q)`;
            }
    }

    return { clause, params };
}

// ─────────────────────────────────────────────
// Core: single SQL template shared by all searches
// ─────────────────────────────────────────────
function buildBaseSql(where: string[]): string {
    return `
        SELECT qd.*, qs.sora_name
        FROM quran_data qd
        LEFT JOIN quran_sora qs ON qs.sora = qd.sora
        WHERE ${where.join(' AND ')}
        ORDER BY qd.aya_index ASC, qd.id ASC
        LIMIT $limit OFFSET $offset
    `;
}

// ─────────────────────────────────────────────
// Core: execute a search query and return rows
// ─────────────────────────────────────────────
function executeSearch(
    db: Database,
    searchType: SearchType,
    query: string,
    opts: SearchOptions = {}
): QuranData[] {
    const limit = opts.limit ?? 200;
    const { where, params: filterParams } = buildFilterClauses(opts);
    const { clause, params: searchParams } = buildSearchCondition(searchType, query, opts);

    where.unshift(clause);

    const params = {
        ...searchParams,
        ...filterParams,
        $limit: limit,
        $offset: opts.offset ?? 0,
    };

    const stmt = db.prepare(buildBaseSql(where));
    stmt.bind(params);
    const results: QuranData[] = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject() as unknown as QuranData);
    }
    stmt.free();
    return results;
}

/**
 * Interpolates named params ($name) into an SQL string for human-readable debugging.
 * Values are quoted as SQLite literals.
 */
export function buildDebugSql(sql: string, params: Record<string, any>): string {
    // Sort by key length desc so $offset doesn't partially match $offsetX etc.
    const keys = Object.keys(params).sort((a, b) => b.length - a.length);
    let result = sql;
    for (const key of keys) {
        const val = params[key];
        const literal =
            val === null || val === undefined
                ? 'NULL'
                : typeof val === 'number'
                ? String(val)
                : `'${String(val).replace(/'/g, "''")}'`;
        result = result.split(key).join(literal);
    }
    return result.trim();
}

/**
 * Returns the debug SQL string (params inlined) for the given search type and options,
 * without executing anything.
 */
export function getSearchSql(
    searchType: SearchType,
    query: string,
    opts: SearchOptions = {}
): string {
    const limit = opts.limit ?? 200;
    const { where, params: filterParams } = buildFilterClauses(opts);
    const { clause, params: searchParams } = buildSearchCondition(searchType, query, opts);

    where.unshift(clause);

    const params = {
        ...searchParams,
        ...filterParams,
        $limit: limit,
        $offset: opts.offset ?? 0,
    };

    return buildDebugSql(buildBaseSql(where), params);
}

// ─────────────────────────────────────────────
// Public search functions — thin wrappers over executeSearch
// ─────────────────────────────────────────────
export function searchText(db: Database, query: string, opts: SearchOptions = {}): QuranData[] {
    return executeSearch(db, 'text', query, opts);
}

export function searchRoot(db: Database, query: string, opts: SearchOptions = {}): QuranData[] {
    return executeSearch(db, 'root', query, opts);
}

export function searchReading(db: Database, query: string, opts: SearchOptions = {}): QuranData[] {
    return executeSearch(db, 'reading', query, opts);
}

export function searchTag(db: Database, query: string, opts: SearchOptions = {}): QuranData[] {
    return executeSearch(db, 'tag', query, opts);
}

// ─────────────────────────────────────────────
// Search by selected tags (multi-select visual filter)
// Uses its own condition builder since it takes string[] not a single query.
// ─────────────────────────────────────────────
export function searchBySelectedTags(db: Database, tags: string[], opts: SearchOptions = {}): QuranData[] {
    if (tags.length === 0) return [];

    const { where, params } = buildFilterClauses({ ...opts, includeTags: undefined });

    const tagClauses = tags.map((tag, i) => {
        params[`$stag${i}`] = `%,${tag},%`;
        return `(',' || ifnull(tags,'') || ',') LIKE $stag${i}`;
    });
    where.unshift(`(${tagClauses.join(' OR ')})`);

    params['$limit'] = opts.limit ?? 200;
    params['$offset'] = opts.offset ?? 0;

    const stmt = db.prepare(buildBaseSql(where));
    stmt.bind(params);
    const results: QuranData[] = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject() as unknown as QuranData);
    }
    stmt.free();
    return results;
}

// ─────────────────────────────────────────────
// Get all tags from tagsmaster
// ─────────────────────────────────────────────
export function getAllTags(db: Database): Tagsmaster[] {
    const stmt = db.prepare(`SELECT * FROM tagsmaster ORDER BY srt ASC, tag ASC`);
    const results: Tagsmaster[] = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject() as unknown as Tagsmaster);
    }
    stmt.free();
    return results;
}

// ─────────────────────────────────────────────
// Get all qarees from qareemaster
// ─────────────────────────────────────────────
export function getAllQarees(db: Database): Qareemaster[] {
    const stmt = db.prepare(`SELECT * FROM qareemaster ORDER BY id ASC`);
    const results: Qareemaster[] = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject() as unknown as Qareemaster);
    }
    stmt.free();
    return results;
}

// ─────────────────────────────────────────────
// Get aya detail page data
// ─────────────────────────────────────────────
export function getAya(db: Database, ayaIndex: number): {
    aya: BookQuran | null;
    sora: QuranSora | null;
    quranData: QuranData[];
    qareeMap: Record<string, string>;
} {
    // Get aya text
    const ayaStmt = db.prepare(`SELECT * FROM book_quran WHERE aya_index = $idx`);
    ayaStmt.bind({ $idx: ayaIndex });
    const aya = ayaStmt.step() ? (ayaStmt.getAsObject() as unknown as BookQuran) : null;
    ayaStmt.free();

    if (!aya) return { aya: null, sora: null, quranData: [], qareeMap: {} };

    // Get sora info
    const soraStmt = db.prepare(`SELECT * FROM quran_sora WHERE sora = $sora`);
    soraStmt.bind({ $sora: aya.sora });
    const sora = soraStmt.step() ? (soraStmt.getAsObject() as unknown as QuranSora) : null;
    soraStmt.free();

    // Get readings
    const dataStmt = db.prepare(
        `SELECT qd.*, qs.sora_name FROM quran_data qd 
         LEFT JOIN quran_sora qs ON qs.sora = qd.sora
         WHERE qd.aya_index = $idx ORDER BY qd.id ASC`
    );
    dataStmt.bind({ $idx: ayaIndex });
    const quranData: QuranData[] = [];
    while (dataStmt.step()) {
        quranData.push(dataStmt.getAsObject() as unknown as QuranData);
    }
    dataStmt.free();

    // Build qaree name map
    const qareeMap: Record<string, string> = {};
    const qareeStmt = db.prepare(`SELECT qkey, sname FROM qareemaster`);
    while (qareeStmt.step()) {
        const row = qareeStmt.getAsObject() as { qkey: string; sname: string };
        qareeMap[row.qkey] = row.sname;
    }
    qareeStmt.free();

    return { aya, sora, quranData, qareeMap };
}
