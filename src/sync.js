// طبقة المزامنة السحابية + التخزين المحلي (Offline-first)
import { SEED_INDICATORS, regionOf } from './data';

export const LS = 'leyaka-v4';
export const TOKEN_KEY = 'leyaka-token';
export const SESSION_KEY = 'leyaka-session';
export const TABLES = ['visits', 'institutes', 'administrations', 'indicators'];

function splitVisitor(v) {
  if (!v || typeof v !== 'string') return null;
  const s = v.trim(); if (!s) return null;
  for (const sep of ['/', '-', '–', '|']) {
    const i = s.indexOf(sep);
    if (i > 0) return { name: s.slice(0, i).trim(), job: s.slice(i + 1).trim() };
  }
  return { name: s, job: '' };
}
function migrate(db) {
  const fix = (rows, dks) => (rows || []).map(r => {
    let n = r;
    if (!n.region) for (const dk of dks) { if (n[dk]) { const reg = regionOf(n[dk]); if (reg) { n = { ...n, region: reg }; break; } } }
    if (n.visitor && !n.visitor_name) {
      const sp = splitVisitor(n.visitor);
      if (sp) { const { visitor, ...rest } = n; n = { ...rest, visitor_name: sp.name, visitor_job: sp.job }; }
    }
    return n;
  });
  db.visits = fix(db.visits, ['administration']);
  db.institutes = fix(db.institutes, ['administration']);
  db.administrations = fix(db.administrations, ['admin_name']);
  db.users = db.users || [];
  db.sync = db.sync || { pending: [], lastPull: 0 };
  return db;
}
export function blankDb() {
  return {
    users: [], visits: [], institutes: [], administrations: [],
    indicators: SEED_INDICATORS.map((r, i) => ({ ...r, id: 'seed-' + i })),
    sync: { pending: [], lastPull: 0 },
  };
}
export function saveDb(next) { try { localStorage.setItem(LS, JSON.stringify(next)); } catch {} return next; }
export function loadLocal() {
  try {
    const raw = localStorage.getItem(LS);
    if (raw) return migrate(JSON.parse(raw));
    for (const k of ['fitness-react-v3', 'fitness-react-v2', 'fitness-react-v1']) {
      const old = localStorage.getItem(k);
      if (old) { const db = migrate(JSON.parse(old)); localStorage.setItem(LS, JSON.stringify(db)); return db; }
    }
  } catch {}
  return saveDb(blankDb());
}
export async function api(path, { method = 'GET', body, token } = {}) {
  const t = token ?? localStorage.getItem(TOKEN_KEY) ?? '';
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'خطأ في الاتصال');
  return data;
}
// دمج بيانات السحابة مع المحلية (يحمي التعديلات المعلّقة)
export function mergeCloud(db, data) {
  const next = { ...db, sync: { ...db.sync, lastPull: data.now || Date.now() } };
  for (const t of TABLES) {
    if (!data[t]) continue;
    const pend = new Set((db.sync.pending || []).filter(p => p.table === t).map(p => String(p.id)));
    const gone = new Set((data.deleted && data.deleted[t]) || []);
    const map = new Map(next[t].map(r => [String(r.id), r]));
    for (const r of data[t]) {
      const id = String(r.id);
      if (pend.has(id)) continue;
      if (r.deleted) map.delete(id); else map.set(id, r);
    }
    for (const id of gone) if (!pend.has(id)) map.delete(id);
    next[t] = [...map.values()];
  }
  if (data.users) next.users = data.users;
  return saveDb(next);
}
export function dropPending(db, keys) {
  const sent = new Set(keys);
  return saveDb({ ...db, sync: { ...db.sync, pending: db.sync.pending.filter(p => !sent.has(`${p.updated_at_ms}|${p.id}`)) } });
}