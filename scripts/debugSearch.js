const { MongoClient } = require('mongodb');

(async function(){
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB || 'airline_booking';
  const origin = process.env.DEBUG_ORIGIN || 'mumbai';
  const destination = process.env.DEBUG_DEST || 'pune';
  const dateStr = process.env.DEBUG_DATE || '2025-10-10';

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const coll = db.collection('flights');

    const d = new Date(dateStr);
    const gte = new Date(d);
    gte.setHours(0,0,0,0);
    const lte = new Date(d);
    lte.setHours(23,59,59,999);

    console.log('Query params:', { origin, destination, dateStr, gte: gte.toISOString(), lte: lte.toISOString() });

    const qExact = { source: new RegExp(origin, 'i'), destination: new RegExp(destination, 'i'), 'departure.date': { $gte: gte, $lte: lte } };
    const cExact = await coll.countDocuments(qExact);
    console.log('Exact date matches:', cExact);
    if (cExact > 0) {
      const docs = await coll.find(qExact).limit(5).toArray();
      console.log('Sample exact docs:', JSON.stringify(docs, null, 2));
    }

    const qNoDate = { source: new RegExp(origin, 'i'), destination: new RegExp(destination, 'i') };
    const cNoDate = await coll.countDocuments(qNoDate);
    console.log('Matches without date filter:', cNoDate);
    if (cNoDate > 0) {
      const docs2 = await coll.find(qNoDate).limit(5).toArray();
      console.log('Sample no-date docs:', JSON.stringify(docs2, null, 2));
    }

    const gte2 = new Date(d);
    gte2.setDate(gte2.getDate() - 3);
    gte2.setHours(0,0,0,0);
    const lte2 = new Date(d);
    lte2.setDate(lte2.getDate() + 3);
    lte2.setHours(23,59,59,999);

    const qWindow = { source: new RegExp(origin, 'i'), destination: new RegExp(destination, 'i'), 'departure.date': { $gte: gte2, $lte: lte2 } };
    const cWindow = await coll.countDocuments(qWindow);
    console.log('Matches within ±3 days:', cWindow);
    if (cWindow > 0) {
      const docs3 = await coll.find(qWindow).limit(5).toArray();
      console.log('Sample window docs:', JSON.stringify(docs3, null, 2));
    }

  } catch (err) {
    console.error('Debug search error:', err);
  } finally {
    try { await client.close(); } catch (e) {}
    process.exit(0);
  }
})();
