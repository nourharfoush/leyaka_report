import React, { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { MODULES, CAN_EDIT, REGIONS, REGION_LIST, regionOf } from '../data';
import { useStore } from '../store';
function norm(v) { if (v == null) return ''; if (v instanceof Date) return v.toISOString().slice(0,10); return String(v).trim(); }
function deptKeyOf(m) { const c = m.cols.find(c => c[2] === 'dept'); return c ? c[0] : null; }
export default function ModuleList() {
  const { key } = useParams();
  const m = MODULES[key];
  const { db, user, delRow, bulkAdd, msg } = useStore();
  const [q, setQ] = useState('');
  const [fRegion, setFRegion] = useState('');
  const [fDept, setFDept] = useState('');
  const fileRef = useRef();
  const canEdit = CAN_EDIT.includes(user?.role);
  const isAdmin = user?.role === 'admin';
  const dk = m ? deptKeyOf(m) : null;
  const hasRegion = m ? m.cols.some(c => c[2] === 'region') : false;
  const rows = useMemo(() => {
    const all = [...(db[m.table] || [])].reverse();
    return all.filter(r => {
      const reg = r.region || (dk ? regionOf(r[dk]) : '');
      if (fRegion && reg !== fRegion) return false;
      if (fDept && dk && r[dk] !== fDept) return false;
      const s = q.trim(); if (!s) return true;
      const hay = [...m.search.map(c => norm(c === 'region' ? reg : r[c])), norm(reg)];
      return hay.some(v => v.includes(s));
    });
  }, [db, m, q, fRegion, fDept]);
  const doExport = () => {
    const hdr = ['م', ...m.cols.map(c => c[1])];
    const data = [hdr, ...rows.map((r, i) => [i + 1, ...m.cols.map(c => {
      if (c[2] === 'region') return r.region || (dk ? regionOf(r[dk]) : '');
      return r[c[0]] ?? '';
    })])];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = hdr.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, m.title.slice(0, 30));
    XLSX.writeFile(wb, `${key}.xlsx`);
  };
  const doImport = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (!aoa.length) return msg('ملف فارغ', 'error');
        const heads = aoa[0].map(h => norm(h));
        const idx = {};
        const LEGACY = { visitor_name: ['الزائر (الاسم/الوظيفة)', 'الزائر', 'اسم الزائر'], visitor_job: ['الوظيفة'], visit_date: ['تاريخ الزيارة'] };
        m.cols.forEach((c, k) => {
          let j = heads.findIndex(h => h === c[1]);
          if (j < 0 && LEGACY[c[0]]) j = heads.findIndex(h => LEGACY[c[0]].includes(h));
          if (j >= 0) idx[k] = j;
        });
        if (!Object.keys(idx).length) m.cols.forEach((c, k) => { idx[k] = k + 1; });
        // تخطي صف العناوين + صف المثال إن وُجد: نبدأ من أول صف بعد العناوين
        const headRow = aoa.findIndex(r => r.map(norm).includes(m.cols[0][1]));
        const body = headRow >= 0 ? aoa.slice(headRow + 1) : aoa.slice(1);
        const dKey = deptKeyOf(m);
        const list = [];
        for (const r of body) {
          if (r.every(v => norm(v) === '')) continue;
          if (norm(r[0]) === 'مثال') continue;
          const o = {};
          m.cols.forEach((c, k) => { o[c[0]] = norm(r[idx[k]] ?? ''); });
          if (Object.values(o).every(v => v === '')) continue;
          // منطقة فارغة؟ استنتجها من الإدارة
          if (dKey && !o.region && o[dKey]) o.region = regionOf(o[dKey]);
          list.push(o);
        }
        if (!list.length) return msg('لا توجد صفوف صالحة', 'error');
        bulkAdd(m.table, list); msg(`تم استيراد ${list.length} سجل`);
      } catch { msg('تعذر قراءة الملف', 'error'); }
      e.target.value = '';
    };
    rd.readAsArrayBuffer(f);
  };
  const del = (id) => { if (window.confirm('حذف؟')) { delRow(m.table, id); msg('تم الحذف'); } };
  if (!m) return <div className="card">قسم غير موجود</div>;
  return (<div className="card">
    <h2>{m.title} ({rows.length})</h2>
    <div className="toolbar noprint">
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="بحث..." style={{ width: 180 }} />
      </div>
      {hasRegion && <select value={fRegion} onChange={e=>{setFRegion(e.target.value);setFDept('');}} style={{ width: 170 }}>
        <option value="">كل المناطق</option>
        {REGION_LIST.map(r=><option key={r} value={r}>{r}</option>)}
      </select>}
      {hasRegion && dk && <select value={fDept} onChange={e=>setFDept(e.target.value)} style={{ width: 180 }}>
        <option value="">كل الإدارات</option>
        {(fRegion ? (REGIONS[fRegion] || []) : [...new Set((db[m.table]||[]).map(r=>r[dk]).filter(Boolean))]).map(o=><option key={o} value={o}>{o}</option>)}
      </select>}
      {(fRegion || fDept) && <button className="btn gray" onClick={()=>{setFRegion('');setFDept('');}}>مسح الفلتر</button>}
      {canEdit && <><Link className="btn" to={`/m/${key}/add`}>+ اضافة جديد</Link>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={doImport} />
        <button className="btn amber" onClick={()=>fileRef.current.click()}>استيراد اكسيل</button></>}
      <button className="btn gray" onClick={doExport}>تصدير اكسيل ({rows.length})</button>
      <Link className="btn blue" to={`/m/${key}/print${(fRegion || fDept) ? `?r=${encodeURIComponent(fRegion)}&d=${encodeURIComponent(fDept)}` : ''}`} target="_blank">طباعة{fRegion || fDept ? ' المفلتر' : ''}</Link>
    </div>
    <div style={{ overflow: 'auto' }}>
      <table><thead><tr><th>م</th>{m.cols.map(c=><th key={c[0]}>{c[1]}</th>)}<th className="noprint">اجراءات</th></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={r.id}><td>{i + 1}</td>
        {m.cols.map(c=><td key={c[0]}>{c[2] === 'region' ? (r.region || (dk ? regionOf(r[dk]) : '')) : r[c[0]]}</td>)}
        <td className="noprint">{canEdit && <Link to={`/m/${key}/edit/${r.id}`}>تعديل</Link>}
          {canEdit && isAdmin && ' | '}{isAdmin && <button className="link danger" onClick={()=>del(r.id)}>حذف</button>}</td>
      </tr>)}
      {!rows.length && <tr><td colSpan={20}>لا توجد بيانات</td></tr>}</tbody></table>
    </div>
  </div>);
}