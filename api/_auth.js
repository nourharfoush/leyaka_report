// توليد/فحص JWT بسيط (HS256) بدون مكتبات خارجية
import { createHmac } from 'crypto';
const SECRET = process.env.SESSION_SECRET || 'leyaka-dev-secret';
const b64u = (s) => Buffer.from(s).toString('base64url');
function hmac(data) {
  return createHmac('sha256', SECRET).update(data).digest('base64url');
}
export function sign(payload, expSec = 60 * 60 * 24 * 7) {
  const head = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64u(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expSec }));
  return `${head}.${body}.${hmac(`${head}.${body}`)}`;
}
export function verify(token) {
  try {
    const [h, b, s] = token.split('.');
    if (!h || !b || !s) return null;
    if (hmac(`${h}.${b}`) !== s) return null;
    const p = JSON.parse(Buffer.from(b, 'base64url').toString('utf8'));
    if (p.exp && p.exp < Date.now() / 1000) return null;
    return p;
  } catch { return null; }
}
export function getUser(req) {
  const a = req.headers.authorization || '';
  if (a.startsWith('Bearer ')) return verify(a.slice(7));
  return null;
}
export function ok(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } });
}
export function err(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } });
}
export async function readBody(req) {
  try {
    // Node runtime على Vercel: req.body متحوّل لـ JSON تلقائياً
    if (req.body !== undefined && req.body !== null) {
      if (typeof req.body === 'string') return req.body ? JSON.parse(req.body) : {};
      return req.body;
    }
    if (typeof req.json === 'function') return await req.json();
  } catch {}
  return {};
}
// غلاف: يدعم كلاً من (req,res) في Node runtime و Web Response
export function wrap(fn) {
  return async function (req, res) {
    let out;
    try {
      out = await fn(req);
    } catch (e) {
      // خطأ غير متوقع: نرجع رسالة JSON بدل FUNCTION_INVOCATION_FAILED ليظهر سببه
      out = err('خطأ في الخادم: ' + String((e && e.message) || e), 500);
    }
    if (!res) return out;
    const body = await out.text();
    res.statusCode = out.status;
    out.headers.forEach((v, k) => res.setHeader(k, v));
    res.end(body);
  };
}