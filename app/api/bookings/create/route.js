import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request) {
	try {
		const body = await request.json();
		const { flightId, passengerName, email, userId } = body;

		if (!flightId || !passengerName || !email) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const db = await getDatabase();
		const res = await db.collection('bookings').insertOne({
			flightId,
			passengerName,
			email,
			userId: userId || null,
			createdAt: new Date(),
		});

		return NextResponse.json({ success: true, insertedId: res.insertedId }, { status: 201 });
	} catch (error) {
		console.error('Create booking error:', error);
		return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
	}
}
