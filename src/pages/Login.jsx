import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../store';
export default function Login() {
  const { user, login, msg, online } = useStore();
  const [u, setU] = useState(''); const [p, setP] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  if (user) return <Navigate to="/" />;
  const go = async (e) => {
    e.preventDefault(); setBusy(true);
    const ok = await login(u.trim(), p);
    setBusy(false);
    if (ok) { msg('مرحباً بك'); nav('/'); }
  };
  return (<div className="card login-card" style={{ maxWidth: 430, margin: '40px auto' }}>
    <img className="login-logo" src="/logo.jpg" alt="اللياقة البدنية مشروع حياة" />
    <div className="sync-line">
      <span className={'dot ' + (online ? 'on' : 'off')} />
      {online ? 'متصل بالسحابة' : 'غير متصل — لا يمكن الإضافة قُبل اتصال الإنترنت'}
    </div>
    <h2 style={{ textAlign: 'center' }}>تسجيل الدخول</h2>
    <form onSubmit={go}>
      <label>اسم المستخدم</label><input value={u} onChange={e=>setU(e.target.value)} required />
      <br /><br /><label>كلمة المرور</label><input type="password" value={p} onChange={e=>setP(e.target.value)} required />
      <br /><br /><button className="btn" style={{ width: '100%' }} disabled={busy}>{busy || syncing ? '...جارٍ الدخول' : 'دخول'}</button>
    </form>
  </div>);
}