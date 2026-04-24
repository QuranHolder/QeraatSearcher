import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { QuranData } from '@/lib/types';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'text'; // text, root, tag

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const db = getDb();
        let sql = '';
        let params: any[] = [];

        // Limit results to preventing large payload
        const LIMIT = 50;

        if (type === 'root') {
            sql = `
        SELECT * FROM quran_data 
        WHERE root = ? 
        LIMIT ?
      `;
            params = [query, LIMIT];
        } else if (type === 'tag') {
            sql = `
        SELECT * FROM quran_data 
        WHERE tags LIKE ? 
        LIMIT ?
      `;
            params = [`%${query}%`, LIMIT];
        } else {
            // Default: text search on sub_subject or sub_subject1
            // Using LIKE for partial match, or exact? Let's try partial.
            sql = `
        SELECT * FROM quran_data 
        WHERE sub_subject LIKE ? OR sub_subject1 LIKE ?
        LIMIT ?
      `;
            params = [`%${query}%`, `%${query}%`, LIMIT];
        }

        const stmt = db.prepare(sql);
        const results = stmt.all(...params) as QuranData[];

        return NextResponse.json({
            count: results.length,
            results
        });

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
