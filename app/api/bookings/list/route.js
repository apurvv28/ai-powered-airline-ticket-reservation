import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request) {
	try {
		const url = new URL(request.url);
		const userId = url.searchParams.get('userId');

		const db = await getDatabase();
		const filter = {};
		if (userId) filter.userId = userId;

		const rows = await db.collection('bookings').find(filter).sort({ createdAt: -1 }).limit(100).toArray();

		return NextResponse.json({ success: true, bookings: rows });
	} catch (error) {
		console.error('List bookings error:', error);
		return NextResponse.json({ error: 'Failed to list bookings' }, { status: 500 });
	}
}
