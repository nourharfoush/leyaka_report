import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { MODULES, REGIONS, REGION_LIST, regionOf } from '../data';
import { useStore } from '../store';
function deptKeyOf(m) { const c = m.cols.find(c => c[2] === 'dept'); return c ? c[0] : null; }
export default function PrintView() {
  const { key } = useParams();
  const [sp] = useSearchParams();
  const m = MODULES[key];
  const { db } = useStore();
  const dk = deptKeyOf(m);
  const fR = sp.get('r') || '', fD = sp.get('d') || '';
  const rows = (db[m.table] || []).filter(r => {
    const reg = r.region || (dk ? regionOf(r[dk]) : '');
    if (fR && reg !== fR) return false;
    if (fD && dk && r[dk] !== fD) return false;
    return true;
  });
  const today = new Date().toISOString().slice(0, 10);
  const sub = [fR && `المنطقة: ${fR}`, fD && `الإدارة: ${fD}`].filter(Boolean).join(' | ');
  return (<div className="card">
    <div className="noprint toolbar"><button className="btn" onClick={()=>window.print()}>اطبع الآن</button>
      <Link className="btn gray" to={`/m/${key}`}>رجوع</Link></div>
    <h2 style={{ textAlign: 'center' }}>{m.title}</h2>
    <p style={{ textAlign: 'center' }}>التاريخ: {today} | عدد السجلات: {rows.length}{sub ? ` | ${sub}` : ''}</p>
    <table><thead><tr><th>م</th>{m.cols.map(c=><th key={c[0]}>{c[1]}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={r.id}><td>{i + 1}</td>{m.cols.map(c=><td key={c[0]}>{c[2] === 'region' ? (r.region || (dk ? regionOf(r[dk]) : '')) : r[c[0]]}</td>)}</tr>)}</tbody></table>
    <br /><div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>توقيع المدخل: ............</span><span>توقيع المدير: ............</span></div>
  </div>);
}