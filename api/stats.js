// تجميع الإحصاءات (Dashboard + تقارير المنطقة/الإدارة)
import { getDb, TABLES } from './_db.js';
import { ok, err, getUser, wrap } from './_auth.js';

export default wrap(async function handler(req) {
  const auth = getUser(req);
  if (!auth) return err('غير مصرح', 401);
  if (req.method !== 'GET') return err('Method not allowed', 405);
  const db = await getDb();
  const stats = {};
  for (const t of TABLES) stats[t] = await db.collection(t).countDocuments();

  // تجميع: عدد الزيارات لكل منطقة وإدارة
  const visitsByRegion = await db.collection('visits').aggregate([
    { $group: { _id: { region: '$region', administration: '$administration' }, n: { $sum: 1 } } },
    { $sort: { '_id.region': 1, '_id.administration': 1 } },
  ]).toArray();

  // تجميع: متوسط النسب للمعاهد والإدارات
  const avg = async (t, fields) => db.collection(t).aggregate([
    { $match: { [fields[0]]: { $ne: '' } } },
    { $group: { _id: null, ...Object.fromEntries(fields.map(f => [f, { $avg: { $ifNull: [`$${f}`, 0] } }])) } },
  ]).toArray();

  const instAvg = (await avg('institutes', ['participation_rate']))[0] || {};
  const admAvg = (await avg('administrations', ['participation_rate', 'implemented_rate']))[0] || {};
  const indAvg = (await avg('indicators', ['ratio']))[0] || {};

  return ok({
    stats, visitsByRegion,
    averages: {
      institutes_participation: instAvg.participation_rate || 0,
      administrations_participation: admAvg.participation_rate || 0,
      administrations_implemented: admAvg.implemented_rate || 0,
      indicators_ratio: indAvg.ratio || 0,
    },
  });
});