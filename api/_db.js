import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'leyaka';
let client, db;
export async function getDb() {
  if (db) return db;
  if (!uri) throw new Error('MONGODB_URI غير مضبوط');
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  db = client.db(dbName);
  return db;
}
export const TABLES = ['visits', 'institutes', 'administrations', 'indicators', 'users'];

// ObjectId صالح؟ وإلا نخزّه كـ نص
export function toMongoId(id) {
  const s = String(id ?? '');
  if (ObjectId.isValid(s) && new ObjectId(s).toHexString() === s.toLowerCase().replace(/^0x/, '')) {
    try { return new ObjectId(s); } catch {}
  }
  if (ObjectId.isValid(s)) { try { return new ObjectId(s); } catch {} }
  return s;
}
export function fromMongoId(r) {
  if (!r || r._id == null) return r;
  const { _id, ...rest } = r;
  return { ...rest, id: String(_id) };
}