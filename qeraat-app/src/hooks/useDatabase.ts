'use client';

import { useState, useEffect } from 'react';
import type { Database } from 'sql.js';
import { initDatabase } from '@/lib/sqljs-db';

type DbState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'ready'; db: Database }
    | { status: 'error'; error: string };

// Module-level singleton so the DB is only loaded once across components
let globalDb: Database | null = null;
let globalPromise: Promise<Database> | null = null;

export function useDatabase(): DbState {
    const [state, setState] = useState<DbState>(
        globalDb ? { status: 'ready', db: globalDb } : { status: 'idle' }
    );

    useEffect(() => {
        if (globalDb) {
            setState({ status: 'ready', db: globalDb });
            return;
        }

        setState({ status: 'loading' });

        if (!globalPromise) {
            globalPromise = initDatabase();
        }

        globalPromise
            .then((db) => {
                globalDb = db;
                setState({ status: 'ready', db });
            })
            .catch((err) => {
                globalPromise = null; // allow retry
                setState({ status: 'error', error: String(err) });
            });
    }, []);

    return state;
}
