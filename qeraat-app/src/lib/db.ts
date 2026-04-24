import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb() {
    if (db) return db;

    // Database file is located in /data relative to project root
    // In development, process.cwd() is the project root
    const dbPath = path.join(process.cwd(), 'data', 'qeraat_data_v1.db');

    try {
        db = new Database(dbPath, {
            // verbose: console.log, // file logger if needed
            fileMustExist: true
        });
        db.pragma('journal_mode = WAL');
        return db;
    } catch (error) {
        console.error('Failed to open database:', error);
        throw error;
    }
}
