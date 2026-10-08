import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MODULES, CAN_EDIT, OPT_SELECT, OPT_YESNO, OPT_STATUS, OPT_STAGE, OPT_TYPE, REGIONS, REGION_LIST, regionOf } from '../data';
import { useStore } from '../store';
const OPTS = { select: OPT_SELECT, select_yesno: OPT_YESNO, select_status: OPT_STATUS };
const selectOpts = { stage: OPT_STAGE, type: OPT_TYPE };
// الحقول التي يُسمح بتركها فارغاً عند الحفظ (الباقي كله إلزامي)
const OPTIONAL_FIELDS = ['next_followup'];
const isReq = (k) => !OPTIONAL_FIELDS.includes(k);
// قائمة الحقول الإلزامية الفارغة (يُستثنى منها "موعد المتابعة التالية")
export function missingFields(f, cols) {
  return cols.filter(c => {
    if (OPTIONAL_FIELDS.includes(c[0])) return false;
    const v = f[c[0]];
    return v == null || String(v).trim() === '';
  }).map(c => ({ k: c[0], t: c[1] }));
}
function blank(m) { const o = {}; m.cols.forEach(c => { o[c[0]] = c[2].startsWith('number') ? 0 : ''; }); return o; }
function deptKeyOf(m) { const c = m.cols.find(c => c[2] === 'dept'); return c ? c[0] : null; }
export default function ModuleForm() {
  const { key, id } = useParams();
  const m = MODULES[key];
  const { db, user, addRow, updRow, msg } = useStore();
  const nav = useNavigate();
  const editing = db[m.table]?.find(r => r.id === Number(id));
  const [f, setF] = useState(() => {
    const init = { ...(editing || blank(m)) };
    // استنتاج المنطقة للسجلات القديمة
    if (!init.region) {
      const dk = deptKeyOf(m);
      const av = dk ? init[dk] : '';
      if (av) init.region = regionOf(av);
    }
    // فصل حقل الزائر القديم (الاسم/الوظيفة) إلى حقلين
    if (init.visitor && !init.visitor_name) {
      const s = String(init.visitor);
      const i = ['/', '-', '–', '|'].map(sep => s.indexOf(sep)).find(x => x > 0);
      if (i != null) { init.visitor_name = s.slice(0, i).trim(); init.visitor_job = s.slice(i + 1).trim(); }
      else { init.visitor_name = s; init.visitor_job = ''; }
    }
    return init;
  });
  const [tried, setTried] = useState(false);
  if (!CAN_EDIT.includes(user?.role)) return <div className="card">غير مصرح <Link to={`/m/${key}`}>رجوع</Link></div>;
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const deptKey = deptKeyOf(m);
  const deptOpts = f.region ? (REGIONS[f.region] || []) : [];
  const onRegion = (v) => {
    setF(s => {
      const n = { ...s, region: v };
      if (deptKey) {
        const cur = s[deptKey];
        const list = REGIONS[v] || [];
        if (!list.includes(cur)) n[deptKey] = '';
      }
      return n;
    });
  };
  const onDept = (v) => {
    // لو اختار إدارة والمنطقة فاضية: استنتج المنطقة تلقائياً
    setF(s => {
      const n = { ...s, [deptKey]: v };
      if (!s.region && v) n.region = regionOf(v);
      return n;
    });
  };
  // حساب تلقائي للنسب
  const auto = (k, v) => {
    const n = { ...f, [k]: v };
    if (key === 'institutes') {
      const t = +n.targeted || 0, p = +n.participants || 0;
      if (k === 'targeted' || k === 'participants') n.participation_rate = t ? +(p / t).toFixed(4) : 0;
    }
    if (key === 'administrations') {
      const c = +n.institutes_count || 0, im = +n.implemented || 0;
      if (k === 'institutes_count' || k === 'implemented') n.implemented_rate = c ? +(im / c).toFixed(4) : 0;
      const ts = +n.targeted_students || 0, ps = +n.participating || 0;
      if (k === 'targeted_students' || k === 'participating') n.participation_rate = ts ? +(ps / ts).toFixed(4) : 0;
    }
    if (key === 'indicators') {
      const a = +n.numerator || 0, b = +n.denominator || 0;
      if (k === 'numerator' || k === 'denominator') n.ratio = b ? +(a / b).toFixed(4) : 0;
    }
    setF(n);
  };
  const missing = missingFields(f, m.cols);
  const save = (e) => {
    e.preventDefault();
    // منع الحفظ حتى تكتمل جميع الحقول الإلزامية
    if (missing.length) {
      setTried(true);
      const names = missing.map(x => x.t);
      const shown = names.slice(0, 6).join('، ') + (names.length > 6 ? ` و${names.length - 6} حقول أخرى` : '');
      msg(`يرجى تعبئة جميع الحقول الإلزامية: ${shown}`, 'error');
      return;
    }
    if (editing) { updRow(m.table, editing.id, f); msg('تم التعديل'); }
    else { addRow(m.table, f); msg('تم الحفظ بنجاح'); }
    nav(`/m/${key}`);
  };
  const renderField = (c) => {
    const k = c[0], t = c[2], v = f[k] ?? '', rq = isReq(k);
    const bad = tried && rq && (v == null || String(v).trim() === '');
    const cls = bad ? { className: 'missing' } : {};
    if (t === 'region') return (
      <select value={v} required={rq} {...cls} onChange={e=>onRegion(e.target.value)}>
        <option value="">--- اختر المنطقة ---</option>
        {REGION_LIST.map(r=><option key={r} value={r}>{r}</option>)}
      </select>);
    if (t === 'dept') {
      const extra = v && !deptOpts.includes(v) ? [v] : [];
      return (
        <select value={v} required={rq} {...cls} onChange={e=>onDept(e.target.value)} disabled={!f.region && !v}>
          <option value="">{f.region ? '--- اختر الإدارة ---' : '--- اختر المنطقة أولاً ---'}</option>
          {[...extra, ...deptOpts].map(o=><option key={o} value={o}>{o}</option>)}
        </select>);
    }
    if (t === 'text') return <input value={v} required={rq} {...cls} onChange={e=>set(k, e.target.value)} />;
    if (t === 'date') return <input type="date" value={v} required={rq} {...cls} onChange={e=>set(k, e.target.value)} />;
    if (t === 'number') return <input type="number" value={v} required={rq} {...cls} onChange={e=>auto(k, e.target.value)} />;
    if (t === 'number_step') return <input type="number" step="any" value={v} required={rq} {...cls} onChange={e=>auto(k, e.target.value)} />;
    if (t in selectOpts || t.startsWith('select')) return (
      <select value={v} required={rq} {...cls} onChange={e=>set(k, e.target.value)}>
        {selectOpts[t] ? selectOpts[t].map(o=><option key={o} value={o}>{o || '---'}</option>) : OPTS[t].map(o=><option key={o} value={o}>{o || '---'}</option>)}
      </select>);
    return <input value={v} required={rq} {...cls} onChange={e=>set(k, e.target.value)} />;
  };
  return (<div className="card">
    <h2>{editing ? 'تعديل' : 'اضافة'} - {m.title}</h2>
    <form onSubmit={save} noValidate><div className="formgrid">
      {m.cols.map(c => <div key={c[0]}><label>{c[1]}{isReq(c[0]) && <span className="req" title="حقل إلزامي">*</span>}</label>{renderField(c)}</div>)}
    </div><br />
      <button className="btn">حفظ</button> <Link className="btn gray" to={`/m/${key}`}>رجوع</Link>
    </form>
  </div>);
}