// إدارة المستخدمين (admin فقط)
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDb } from './_db.js';
import { ok, err, getUser, readBody, wrap } from './_auth.js';

export default wrap(async function handler(req) {
  const auth = getUser(req);
  if (!auth) return err('غير مصرح', 401);
  if (auth.role !== 'admin') return err('للمدير فقط', 403);
  const db = await getDb();
  const col = db.collection('users');

  if (req.method === 'GET') {
    const rows = await col.find({}, { projection: { password: 0 } }).toArray();
    return ok(rows.map(u => ({ ...u, id: String(u._id) })));
  }
  const b = await readBody(req);
  if (req.method === 'POST') {
    const { username, password, full_name = '', role = 'data_entry' } = b;
    if (!username || !password) return err('اكمل البيانات');
    if (await col.findOne({ username })) return err('اسم المستخدم موجود');
    const r = await col.insertOne({ username, password: await bcrypt.hash(password, 10), full_name, role, active: 1, created_at: new Date().toISOString().slice(0, 16) });
    return ok({ id: String(r.insertedId) }, 201);
  }
  if (req.method === 'PATCH') {
    const { id, password, role, active, full_name } = b;
    const set = {};
    if (password) set.password = await bcrypt.hash(password, 10);
    if (role) set.role = role;
    if (active !== undefined) set.active = active ? 1 : 0;
    if (full_name !== undefined) set.full_name = full_name;
    await col.updateOne({ _id: safeId(id) }, { $set: set });
    return ok({ ok: true });
  }
  if (req.method === 'DELETE') {
    if (String(b.id) === String(auth.id)) return err('لا يمكنك حذف نفسك');
    await col.deleteOne({ _id: safeId(b.id) });
    return ok({ ok: true });
  }
  return err('Method not allowed', 405);
});
function safeId(id) {
  const s = String(id ?? '');
  try { if (ObjectId.isValid(s) && String(new ObjectId(s)) === s.toLowerCase()) return new ObjectId(s); } catch {}
  return s.slice(0, 128);
}