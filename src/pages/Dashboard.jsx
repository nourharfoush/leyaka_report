import React from 'react';
import { Link } from 'react-router-dom';
import { MODULES } from '../data';
import { useStore } from '../store';
export default function Dashboard() {
  const { db, user } = useStore();
  return (<>
    <div className="card"><h2>لوحة التحكم</h2><p>اهلا {user?.full_name}</p></div>
    <div className="grid">
      {Object.entries(MODULES).map(([k, m]) => (
        <div className="stat" key={k}><b>{db[m.table]?.length || 0}</b>{m.title}<br /><br />
          <Link className="btn gray" to={`/m/${k}`}>فتح السجل</Link></div>))}
      <div className="stat" style={{ background: 'linear-gradient(135deg,#334155,#0ea5e9)' }}>
        <b>{db.users.length}</b>المستخدمون<br /><br />
        {user?.role === 'admin' && <Link className="btn gray" to="/users">ادارة</Link>}
      </div>
    </div>
  </>);
}