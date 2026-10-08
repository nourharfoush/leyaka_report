import React, { useState } from 'react';
import { ROLE_NAMES } from '../data';
import { useStore } from '../store';
export default function Users() {
  const { db, user, addUser, patchUser, removeUser, msg } = useStore();
  const [f, setF] = useState({ username: '', password: '', full_name: '', role: 'data_entry' });
  const [pw, setPw] = useState({});
  if (user?.role !== 'admin') return <div className="card">غير مصرح لك</div>;
  const add = (e) => {
    e.preventDefault();
    if (!f.username.trim() || !f.password) return msg('اكمل البيانات', 'error');
    if (db.users.some(x => x.username === f.username.trim())) return msg('اسم المستخدم موجود', 'error');
    addUser({ username: f.username.trim(), password: f.password, full_name: f.full_name, role: f.role });
    setF({ username: '', password: '', full_name: '', role: 'data_entry' }); msg('تم اضافة المستخدم');
  };
  return (<>
    <div className="card"><h2>اضافة مستخدم</h2>
      <form onSubmit={add}><div className="formgrid">
        <div><label>اسم المستخدم</label><input value={f.username} onChange={e=>setF({...f, username: e.target.value})} required /></div>
        <div><label>كلمة المرور</label><input value={f.password} onChange={e=>setF({...f, password: e.target.value})} required /></div>
        <div><label>الاسم الكامل</label><input value={f.full_name} onChange={e=>setF({...f, full_name: e.target.value})} /></div>
        <div><label>الدور</label><select value={f.role} onChange={e=>setF({...f, role: e.target.value})}>
          <option value="admin">مدير</option><option value="data_entry">مدخل بيانات</option><option value="viewer">مشاهدة</option></select></div>
      </div><br /><button className="btn">اضافة</button></form></div>
    <div className="card"><h2>المستخدمون</h2>
      <table><thead><tr><th>م</th><th>المستخدم</th><th>الاسم</th><th>الدور</th><th>نشط</th><th>اجراءات</th></tr></thead>
      <tbody>{db.users.map((r, i) => <tr key={r.id}><td>{i + 1}</td><td>{r.username}</td><td>{r.full_name}</td>
        <td>{ROLE_NAMES[r.role]}</td><td>{r.active ? 'نعم' : 'لا'}</td>
        <td><button className="link" onClick={() => { patchUser(r.id, { active: r.active ? 0 : 1 }); msg('تم التحديث'); }}>تفعيل/ايقاف</button> |{' '}
          <button className="link danger" onClick={() => { if (r.id === user.id) return msg('لا يمكنك حذف نفسك', 'error'); if (window.confirm('حذف؟')) { removeUser(r.id); msg('تم حذف المستخدم'); } }}>حذف</button>{' '}
          <input placeholder="كلمة جديدة" style={{ width: 110, display: 'inline' }} value={pw[r.id] || ''} onChange={e=>setPw({...pw, [r.id]: e.target.value})} />
          <button className="btn blue" onClick={() => { if (pw[r.id]) { patchUser(r.id, { password: pw[r.id] }); setPw({...pw, [r.id]: ''}); msg('تم تغيير كلمة المرور'); } }}>تغيير</button>
        </td></tr>)}</tbody></table></div>
  </>);
}