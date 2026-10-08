import bcrypt from 'bcryptjs';
import { getDb } from './_db.js';
import { ok, err, readBody, sign, wrap } from './_auth.js';

const SEED_USERS = [
  { username: 'admin', full_name: 'مدير النظام', role: 'admin', active: 1 },
  { username: 'dataentry', full_name: 'مدخل بيانات', role: 'data_entry', active: 1 },
  { username: 'viewer', full_name: 'مستخدم مشاهدة', role: 'viewer', active: 1 },
];
const SEED_PW = { admin: 'admin123', dataentry: '123456', viewer: 'viewer123' };

async function ensureSeed(col) {
  const n = await col.countDocuments();
  if (n) return;
  for (const u of SEED_USERS) await col.insertOne({ ...u, password: await bcrypt.hash(SEED_PW[u.username], 10), created_at: new Date().toISOString().slice(0, 16) });
}
export default wrap(async function handler(req) {
  if (req.method === 'GET') return ok({ ok: true, time: Date.now() });
  if (req.method !== 'POST') return err('Method not allowed', 405);
  const { username, password } = await readBody(req);
  if (!username || !password) return err('اكمل البيانات');
  const db = await getDb();
  const col = db.collection('users');
  await ensureSeed(col);
  const u = await col.findOne({ username: String(username).trim() });
  if (!u || !u.active || !(await bcrypt.compare(password, u.password || ''))) return err('بيانات الدخول غير صحيحة', 401);
  const uid = String(u._id);
  const token = sign({ id: uid, username: u.username, full_name: u.full_name, role: u.role });
  return ok({ token, user: { id: uid, username: u.username, full_name: u.full_name, role: u.role } });
});