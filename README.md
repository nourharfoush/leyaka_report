# نظام متابعة اللياقة البدنية 🏋️

تطبيق React + باك اند MongoDB لمتابعة وتقييم اللياقة البدنية — يعمل من أي جهاز وأي مكان مع مزامنة سحابية.

## المزايا

- ✅ دخول سحابي (JWT) من أي جهاز + مزامنة تلقائية كل 30 ثانية
- ✅ Offline-first: بدون إنترنت التعديلات تُحفظ محلياً وتُرفع لاحقاً (طابور pending)
- ✅ 4 سجلات: الزيارات / المعاهد / الإدارات / مؤشرات الأداء
- ✅ المنطقة ← الإدارة بقوائم ديناميكية (27 منطقة)
- ✅ تصدير/استيراد Excel + طباعة + صلاحيات (مدير/مدخل/مشاهدة)
- ✅ إحصاءات وتجميع (تجميع الزيارات لكل منطقة + متوسط النسب)

## التشغيل محلياً

```bash
# 1) انسخ .env.example إلى .env.local واملأ MONGODB_URI من Atlas
#    (Atlas → Network Access → أضف 0.0.0.0/0 → Connect → Drivers → Node)
npm install

# 2) شغّل API محلياً (يحتاج npm i -g vercel)
vercel dev
# أو شغّل منتاين سيرفرين: vite على 5173 + vercel dev على 3000

# 3) الواجهة
npm run dev
```

## حسابات الدخول (تُزرع تلقائياً أول اتصال)

| الدور | المستخدم | كلمة المرور |
|------|----------|-------------|
| مدير | `admin` | `admin123` |
| مدخل بيانات | `dataentry` | `123456` |
| مشاهدة | `viewer` | `viewer123` |

## الرفع على GitHub

```bash
git add -A
git commit -m "feat: backend + sync"
git push origin main
```

## الرفع على Vercel (مع الباك اند)

1. [vercel.com](https://vercel.com) → **Add New → Project** → اربط `leyaka_report`
2. **Environment Variables** أضف:
   - `MONGODB_URI` = رابط Atlas (مثل `mongodb+srv://user:pass@cluster0.../leyaka`)
   - `MONGODB_DB` = `leyaka`
   - `SESSION_SECRET` = نص عشوائي طويل
3. اضغط **Deploy** — ملفات `api/*.js` هتشتغل Serverless تلقائياً
4. أول دخول هيزرع الحسابات الثلاثة

## البنية

```
api/            ← Vercel Serverless Functions (MongoDB)
  login.js      ← دخول + JWT
  data.js       ← سحب/رفع البيانات (مزامنة)
  stats.js      ← إحصاءات وتجميع
  users.js      ← إدارة المستخدمين (admin)
src/            ← React SPA (Offline-first store)
public/logo.jpg
vercel.json     ← rewrites للـ API و React Router
```
