import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { BookQuran, QuranData, QuranSora } from '@/lib/types';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ index: string }> }
) {
    const { index } = await params;
    const ayaIndex = parseInt(index, 10);

    if (isNaN(ayaIndex)) {
        return NextResponse.json({ error: 'Invalid aya index' }, { status: 400 });
    }

    try {
        const db = getDb();

        // 1. Get Aya Text
        const ayaStmt = db.prepare('SELECT * FROM book_quran WHERE aya_index = ?');
        const aya = ayaStmt.get(ayaIndex) as BookQuran | undefined;

        if (!aya) {
            return NextResponse.json({ error: 'Aya not found' }, { status: 404 });
        }

        // 2. Get Sora Info
        const soraStmt = db.prepare('SELECT * FROM quran_sora WHERE sora = ?');
        const sora = soraStmt.get(aya.sora) as QuranSora | undefined;

        // 3. Get Readings (Quran Data)
        const dataStmt = db.prepare('SELECT * FROM quran_data WHERE aya_index = ? ORDER BY id ASC');
        const quranData = dataStmt.all(ayaIndex) as QuranData[];

        return NextResponse.json({
            aya,
            sora,
            quranData
        });

    } catch (error) {
        console.error('Aya API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
