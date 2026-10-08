// متجر مركزي: دخول سحابي + قاعدة بيانات في السحابة
// كل عملية إضافة/تعديل/حذف تُرسل فوراً للخادم ويُرى النتيجة فوراً على كل الأجهزة
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { LS, TOKEN_KEY, SESSION_KEY, loadLocal, saveDb, api, blankDb, mergeCloud } from './sync';

const Ctx = createContext(null);
export function StoreProvider({ children }) {
  const [db, setDb] = useState(loadLocal);
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } });
  const [toast, setToast] = useState(null);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncErr, setSyncErr] = useState('');
  const dbRef = useRef(db);
  useEffect(() => { dbRef.current = db; }, [db]);

  const msg = (text, type = 'ok') => { setToast({ text, type }); setTimeout(() => setToast(null), 3200); };

  /* ===== أونلاين/أوفلاين ===== */
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  /* ===== تحديث تلقائي خفيف لكل الأجهزة (كل 5 ثوانٍ) ===== */
  useEffect(() => {
    const iv = setInterval(() => refresh(), 5000);
    return () => clearInterval(iv);
  }, []);
  const refresh = async () => {
    if (!localStorage.getItem(TOKEN_KEY)) { setSyncErr('دخول محلي — لا توجد مزامنة سحابية'); return; }
    try {
      const data = await api('/data');
      setSyncErr('');
      setDb(d => mergeCloud(d, data));
    } catch (e) { setSyncErr(errMsg(e)); }
  };

  /* ===== رسائل الأخطاء ===== */
  const errMsg = (e) => {
    const m = String((e && e.message) || e || '');
    if (/غير مصرح|401|انتهت/i.test(m)) return 'انتهت صلاحية الدخول — سجّل الخروج ثم الدخول';
    if (/fetch|network|Failed to fetch|Load failed/i.test(m)) return 'لا يوجد اتصال بالإنترنت';
    return m || 'تعذر الاتصال بالخادم';
  };

  /* ===== رفع/سحب بسيط للملفات ===== */
  const saveToCloud = async (ops) => {
    if (!localStorage.getItem(TOKEN_KEY)) { setSyncErr('دخول محلي — لا توجد مزامنة سحابية'); return false; }
    try { await api('/data', { method: 'POST', body: { ops } }); setSyncErr(''); return true; }
    catch (e) { setSyncErr(errMsg(e)); return false; }
  };
  const pushOne = (t, id, doc) => saveToCloud([{ table: t, type: 'upsert', id, doc }]);
  const pushDel = (t, id) => saveToCloud([{ table: t, type: 'delete', id }]);

  /* ===== الإضافات: فوراً للمحلي + للخادم، بعد كل عملية نرسل الجميع للمحدث ===== */
  const addRow = (t, vals) => {
    const r = { ...vals, id: vals.id || nextId() };
    mutate(t, rows => [...rows, r]);
    pushOne(t, r.id, r);
    refresh();
  };
  const updRow = (t, id, vals) => {
    const r = { ...vals, id };
    mutate(t, rows => rows.map(x => String(x.id) === String(id) ? r : x));
    pushOne(t, id, r);
    refresh();
  };
  const delRow = (t, id) => {
    mutate(t, rows => rows.filter(x => String(x.id) !== String(id)));
    pushDel(t, id);
    refresh();
  };
  const bulkAdd = (t, list) => {
    const rows = list.map(v => ({ ...v, id: v.id || nextId() }));
    mutate(t, cur => [...cur, ...rows]);
    rows.forEach(r => pushOne(t, r.id, r));
    refresh();
  };

  /* ===== المستخدمون ===== */
  const isAdmin = user?.role === 'admin';
  const addUser = (u) => {
    const r = { ...u, id: nextId(), active: 1 };
    mutate('users', rows => [...rows, r]);
    if (isAdmin) api('/users', { method: 'POST', body: r }).catch(() => {});
  };
  const patchUser = (id, p) => {
    mutate('users', rows => rows.map(x => String(x.id) === String(id) ? { ...x, ...p } : x));
    if (isAdmin) api('/users', { method: 'PATCH', body: { id, ...p } }).catch(() => {});
  };
  const removeUser = (id) => {
    mutate('users', rows => rows.filter(x => String(x.id) !== String(id)));
    if (isAdmin) api('/users', { method: 'DELETE', body: { id } }).catch(() => {});
  };

  const resetAll = () => { localStorage.removeItem(LS); setDb(saveDb(blankDb())); msg('تمت إعادة التعيين'); };

  const login = async (u, p) => {
    if (typeof navigator === 'undefined' || navigator.onLine) {
      try {
        const r = await api('/login', { method: 'POST', body: { username: u, password: p }, token: '' });
        localStorage.setItem(TOKEN_KEY, r.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(r.user));
        setUser(r.user);
        await refresh();
        return true;
      } catch (e) { if (!/fetch|network/i.test(String(e.message))) { msg(e.message, 'error'); return false; } }
    }
    msg('تحتاج إلى إنترنت للدخول — قاعدة البيانات متصلة في السحابة', 'error');
    return false;
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY); localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <Ctx.Provider value={{
      db, user, login, logout, addRow, updRow, delRow, bulkAdd,
      addUser, patchUser, removeUser, resetAll, msg, toast,
      online, syncErr,
    }}>
      {children}
    </Ctx.Provider>
  );
}
export const useStore = () => useContext(Ctx);