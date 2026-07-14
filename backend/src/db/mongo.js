import { MongoClient, ObjectId } from 'mongodb';

let client;
let db;

export async function connectDb() {
  if (db) {
    return db;
  }

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.DB_NAME || 'shelflife';

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  await Promise.all([
    db.collection('users').createIndex({ username: 1 }, { unique: true }),
    db.collection('pantryItems').createIndex({ userId: 1, expirationDate: 1 }),
    db.collection('recipes').createIndex({ userId: 1, title: 1 }),
    db.collection('mealPlans').createIndex({ userId: 1, plannedDate: 1 }),
    db.collection('shoppingListItems').createIndex({ userId: 1, checked: 1 }),
    db.collection('rescueLogs').createIndex({ userId: 1, rescuedAt: -1 }),
  ]);

  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database is not connected');
  }
  return db;
}

export function collection(name) {
  return getDb().collection(name);
}

export function toObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const err = new Error('Invalid id');
    err.status = 400;
    throw err;
  }
  return new ObjectId(id);
}

export function serializeDoc(doc) {
  if (!doc) {
    return null;
  }
  return {
    ...doc,
    _id: doc._id.toString(),
    userId: doc.userId?.toString?.() || doc.userId,
  };
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
}
