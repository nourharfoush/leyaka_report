import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MODULES, ROLE_NAMES } from './data';
import { useStore } from './store';

const ICONS = {
  home: <svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z"/></svg>,
  visits: <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/></svg>,
  institutes: <svg viewBox="0 0 24 24"><path d="M12 3 2 8v2h20V8Zm-6 5h3v3H6Zm6 0h3v3h-3Zm6 0h2v3h-2ZM4 13h16v8H4Zm3 2v3h4v-3Z"/></svg>,
  administrations: <svg viewBox="0 0 24 24"><path d="M4 4h16v4H4Zm0 6h16v4H4Zm0 6h16v4H4Z"/></svg>,
  indicators: <svg viewBox="0 0 24 24"><path d="M4 20V10h3v10Zm6 0V4h3v16Zm6 0v-7h3v7Z"/></svg>,
  users: <svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z"/></svg>,
  logout: <svg viewBox="0 0 24 24"><path d="M9 3H4v18h5v-2H6V5h3Zm7 4 4 4-4 4v-3H9v-2h7Z"/></svg>,
};

export default function Layout() {
  const { user, logout, toast, db, online, syncErr } = useStore();
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const out = () => { logout(); nav('/login'); };

  const links = user ? [
    { to: '/', end: true, label: 'الرئيسية', icon: ICONS.home, count: null },
    ...Object.entries(MODULES).map(([k, m]) => ({
      to: `/m/${k}`, label: m.title,
      icon: ICONS[k] || ICONS.administrations,
      count: db?.[m.table]?.length ?? 0,
    })),
    ...(user.role === 'admin' ? [{ to: '/users', label: 'المستخدمون', icon: ICONS.users, count: db?.users?.length ?? 0 }] : []),
  ] : [];

  const sidebar = (
    <aside className={`sidebar noprint${collapsed ? ' collapsed' : ''}`}>
      <div className="brand">
        <img className="brand-img" src="/logo.jpg" alt="اللياقة البدنية مشروع حياة" />
        {!collapsed && <div className="brand-txt"><b>اللياقة البدنية</b><span>مشروع حياة - المتابعة والتقييم</span></div>}
      </div>
      {user && !collapsed && (
        <div className="user-card">
          <div className="avatar">{(user.full_name || user.username || '؟').trim().charAt(0)}</div>
          <div className="uinfo"><b>{user.full_name}</b><span>{ROLE_NAMES[user.role]}</span></div>
        </div>
      )}
      {user && (
        <nav className="side-links">
          <p className="side-cap">{!collapsed ? 'القائمة الرئيسية' : '•••'}</p>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => 'side-link' + (isActive ? ' active' : '')} title={l.label}>
              <span className="side-ico">{l.icon}</span>
              {!collapsed && <span className="side-lbl">{l.label}</span>}
              {!collapsed && l.count != null && <span className="side-badge">{l.count}</span>}
            </NavLink>
          ))}
        </nav>
      )}
      <div className="side-foot">
        {user && (
          <button className="side-link danger" onClick={out} title="تسجيل الخروج">
            <span className="side-ico">{ICONS.logout}</span>
            {!collapsed && <span className="side-lbl">تسجيل الخروج</span>}
          </button>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'توسيع' : 'طي'}>
          {collapsed ? '◀' : '▶'}
        </button>
      </div>
    </aside>
  );

  return (
    <div className={`shell${collapsed ? ' shell-collapsed' : ''}${mobileOpen ? ' side-open' : ''}`}>
      {toast && <div className={`flash ${toast.type}`}>{toast.text}</div>}
      {sidebar}
      {mobileOpen && <div className="scrim noprint" onClick={() => setMobileOpen(false)} />}
      <div className="main">
        <div className="topbar noprint">
          <button className="hamb" onClick={() => setMobileOpen(o => !o)}>☰</button>
          <div className="top-title"><b>نظام متابعة اللياقة البدنية</b><span>العام الدراسي 2026/2027</span></div>
          <div className="top-user">
            <span
              className={'sync-pill ' + (syncErr ? 'off' : online ? 'ok' : 'off')}
              title={syncErr
                ? `تعذر تحديث البيانات من السحابة: ${syncErr}`
                : online ? 'متصل بالمزامنة — التقارير تظهر على كل الأجهزة' : 'أوفلاين — التعديلات محفوظة محلياً وسترفع لاحقاً'}>
              {syncErr ? `⚠ ${syncErr}` : online ? `☁ مزامنة ✓` : `⚠ أوفلاين`}
            </span>
            {user ? <><span className="chip">{user.full_name} ({ROLE_NAMES[user.role]})</span><button className="btn gray btn-sm" onClick={out}>خروج</button></>
              : <Link className="btn btn-sm" to="/login">دخول</Link>}
          </div>
        </div>
        <div className="wrap"><Outlet /></div>
      </div>
    </div>
  );
}
