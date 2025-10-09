import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
  const searchParams = request.nextUrl.searchParams;
  // Accept multiple possible param names from the client
  const source = searchParams.get('source') || searchParams.get('origin');
  const destination = searchParams.get('destination') || searchParams.get('destination');
  const date = searchParams.get('date') || searchParams.get('departDate');
  const flightClass = searchParams.get('class') || searchParams.get('cabin') || 'Economy';

    // Build query
    const query = {};
    if (source) query.source = new RegExp(source, 'i');
    if (destination) query.destination = new RegExp(destination, 'i');
    if (flightClass) query.class = flightClass;
    
    if (date) {
      const searchDate = new Date(date);
      query['departure.date'] = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lte: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }

    // Query database
    const db = await getDatabase();
    const flights = await db
      .collection('flights')
      .find(query)
      .sort({ price: 1 })
      .limit(50)
      .toArray();

    // If no flights found and date filter was used, relax the date filter and retry
    let relaxed = false;
    if (flights.length === 0 && date) {
      // Retry without date
      const queryNoDate = { ...query };
      delete queryNoDate['departure.date'];
      const alt = await db
        .collection('flights')
        .find(queryNoDate)
        .sort({ price: 1 })
        .limit(50)
        .toArray();

      if (alt.length > 0) {
        relaxed = true;
        return NextResponse.json({ success: true, count: alt.length, flights: alt, relaxed: 'removed-date' });
      }

      // Try +/- 3 days window around requested date
      const searchDate = new Date(date);
      const gte = new Date(searchDate);
      gte.setDate(gte.getDate() - 3);
      gte.setHours(0,0,0,0);
      const lte = new Date(searchDate);
      lte.setDate(lte.getDate() + 3);
      lte.setHours(23,59,59,999);

      const queryWindow = { ...query };
      queryWindow['departure.date'] = { $gte: gte, $lte: lte };
      const alt2 = await db
        .collection('flights')
        .find(queryWindow)
        .sort({ price: 1 })
        .limit(50)
        .toArray();

      if (alt2.length > 0) {
        relaxed = true;
        return NextResponse.json({ success: true, count: alt2.length, flights: alt2, relaxed: 'window-3days' });
      }
    }

    return NextResponse.json({
      success: true,
      count: flights.length,
      flights
    });
  } catch (error) {
    console.error('Flight search error:', error);
    return NextResponse.json(
      { error: 'Failed to search flights' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const source = body.origin || body.source;
    const destination = body.destination || body.destination;
    const date = body.departDate || body.date;
    const flightClass = body.cabin || body.class || 'Economy';

    const query = {};
    if (source) query.source = new RegExp(source, 'i');
    if (destination) query.destination = new RegExp(destination, 'i');
    if (flightClass) query.class = flightClass;

    if (date) {
      const searchDate = new Date(date);
      query['departure.date'] = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lte: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }

    const db = await getDatabase();
    let flights = await db
      .collection('flights')
      .find(query)
      .sort({ price: 1 })
      .limit(50)
      .toArray();

    if (flights.length === 0 && date) {
      // Retry without date
      const queryNoDate = { ...query };
      delete queryNoDate['departure.date'];
      const alt = await db.collection('flights').find(queryNoDate).sort({ price: 1 }).limit(50).toArray();
      if (alt.length > 0) return NextResponse.json({ success: true, count: alt.length, flights: alt, relaxed: 'removed-date' });

      // Try +/-3 day window
      const searchDate = new Date(date);
      const gte = new Date(searchDate);
      gte.setDate(gte.getDate() - 3);
      gte.setHours(0,0,0,0);
      const lte = new Date(searchDate);
      lte.setDate(lte.getDate() + 3);
      lte.setHours(23,59,59,999);
      const queryWindow = { ...query };
      queryWindow['departure.date'] = { $gte: gte, $lte: lte };
      const alt2 = await db.collection('flights').find(queryWindow).sort({ price: 1 }).limit(50).toArray();
      if (alt2.length > 0) return NextResponse.json({ success: true, count: alt2.length, flights: alt2, relaxed: 'window-3days' });
    }

    return NextResponse.json({ success: true, count: flights.length, flights });
  } catch (error) {
    console.error('Flight search POST error:', error);
    return NextResponse.json({ error: 'Failed to search flights' }, { status: 500 });
  }
}