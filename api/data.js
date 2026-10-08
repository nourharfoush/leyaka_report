// GET  /api/data?since=ISO  → كل الجداول (أو المتغيّرة منذ since + المحذوفة)
// POST /api/data            → رفع التعديلات المحلية { ops: [{table,type,id,doc,updated_at_ms}] }
import { ObjectId } from 'mongodb';
import { getDb, TABLES } from './_db.js';
import { ok, err, getUser, readBody, wrap } from './_auth.js';

export default wrap(async function handler(req) {
  const auth = getUser(req);
  if (!auth) return err('غير مصرح', 401);
  const db = await getDb();

  if (req.method === 'GET') {
    const since = getSince(req);
    const out = { now: Date.now(), users: [], counts: {}, deleted: {} };
    for (const t of TABLES) {
      const col = db.collection(t);
      if (t === 'users') {
        out.users = (await col.find({}, { projection: { password: 0 } }).toArray()).map(u => ({ ...u, id: String(u._id) }));
        continue;
      }
      const q = since ? { updated_at_ms: { $gt: since }, deleted: { $ne: true } } : { deleted: { $ne: true } };
      const rows = await col.find(q).toArray();
      out[t] = rows.map(r => ({ ...r, id: String(r._id) }));
      out.counts[t] = await col.countDocuments();
      // سجلات محذوفة منذ lastPull
      const dq = since ? { deleted: true, updated_at_ms: { $gt: since } } : { deleted: true };
      const dels = await col.find(dq, { projection: { _id: 1 } }).toArray();
      out.deleted[t] = dels.map(d => String(d._id));
    }
    return ok(out);
  }

  if (req.method === 'POST') {
    const { ops = [] } = await readBody(req);
    let applied = 0;
    for (const op of ops) {
      if (!op || !TABLES.includes(op.table) || op.table === 'users') continue;
      const col = db.collection(op.table);
      const ts = op.updated_at_ms || Date.now();
      try {
        if (op.type === 'delete') {
          const _id = safeId(op.id);
          await col.updateOne({ _id }, { $set: { deleted: true, updated_at_ms: ts, updated_by: auth.username } });
        } else {
          const _id = safeId(op.id);
          const doc = { ...(op.doc || {}), updated_at_ms: ts, updated_by: auth.username, deleted: false };
          // _id لا يُعدَّل في MongoDB (يمنع خطأ "immutable field") بعد السحب من السحابة
          delete doc.id;
          delete doc._id;
          await col.updateOne({ _id }, { $set: doc, $setOnInsert: { _id } }, { upsert: true });
        }
        applied++;
      } catch { /* يعاد في المزامنة القادمة */ }
    }
    return ok({ applied });
  }
  return err('Method not allowed', 405);
});
function safeId(id) {
  const s = String(id ?? '');
  try { if (ObjectId.isValid(s) && String(new ObjectId(s)) === s.toLowerCase()) return new ObjectId(s); } catch {}
  // id نصي من المتصفح: نخزنه كـ _id نصي
  return s.slice(0, 128);
}
// قراءة since بأمان: req.url على Vercel قد يكون مساراً نسبياً (لا يقبل new URL بدون أساس)
function getSince(req) {
  try {
    if (req.query && req.query.since != null) return Number(req.query.since) || 0;
    const u = new URL(String(req.url || '/api/data'), 'http://localhost');
    return Number(u.searchParams.get('since') || 0) || 0;
  } catch {
    return 0;
  }
}