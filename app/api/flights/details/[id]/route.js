import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
	try {
		const parts = request.nextUrl.pathname.split('/');
		const id = parts[parts.length - 1];

		const db = await getDatabase();
		let query = { _id: id };
		try {
			query = { _id: new ObjectId(id) };
		} catch (e) {
			// keep string id if not a valid ObjectId
			query = { id };
		}

		const flight = await db.collection('flights').findOne(query);
		if (!flight) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });

		return NextResponse.json({ success: true, flight });
	} catch (error) {
		console.error('Flight details error:', error);
		return NextResponse.json({ error: 'Failed to fetch flight details' }, { status: 500 });
	}
}
