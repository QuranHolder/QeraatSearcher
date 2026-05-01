'use client';

import { useState, useEffect } from 'react';
import type { Database } from 'sql.js';
import { initDatabase } from '../lib/sqljs-db';

type DbState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'ready'; db: Database; dbMore: Database }
    | { status: 'error'; error: string };

// Module-level singleton so the DB is only loaded once across components
let globalDb: Database | null = null;
let globalDbMore: Database | null = null;
let globalPromise: Promise<{ db: Database; dbMore: Database }> | null = null;

export function useDatabase(): DbState {
    const [state, setState] = useState<DbState>(
        globalDb && globalDbMore ? { status: 'ready', db: globalDb, dbMore: globalDbMore } : { status: 'idle' }
    );

    useEffect(() => {
        if (globalDb && globalDbMore) {
            setState({ status: 'ready', db: globalDb, dbMore: globalDbMore });
            return;
        }

        setState({ status: 'loading' });

        if (!globalPromise) {
            globalPromise = initDatabase();
        }

        const currentPromise = globalPromise;
        currentPromise
            .then(({ db, dbMore }) => {
                globalDb = db;
                globalDbMore = dbMore;
                setState({ status: 'ready', db, dbMore });
            })
            .catch((err) => {
                globalPromise = null; // allow retry
                setState({ status: 'error', error: String(err) });
            });
    }, []);

    return state;
}
