export const REGIONS = {
  'الإسكندرية': ['العامرية','المنتزه','الورديان','شرق الإسكندرية','غرب الإسكندرية','وسط الإسكندرية'],
  'الإسماعيلية': ['الإسماعيلية','التل الكبير','القنطرة غرب','أبو صوير','فايد'],
  'الأقصر': ['الأقصر','القرنة','إسنا شرق','إسنا غرب','أرمنت'],
  'البحر الأحمر': ['الغردقة','القصير','حلايب','رأس غارب','سفاجا','شلاتين','مرسى علم'],
  'البحيرة': ['الدلنجات','الرحمانية','إدفينا','إيتاى البارود','أبو المطامير','أبو حمص','بدر','حوش عيسى','دمنهور','شبراخيت','كفر الدوار','كوم حمادة'],
  'الجيزة': ['6 أكنوبر','البدرشين','الصديق','الصف','العياط','الواحات البحرية','إمبابة','أطفيح','أوسيم','صلاح أبو إسماعيل','كرداسة'],
  'الدقهلية': ['الجمالية','السنبلاوين','المطرية','المنزلة','المنصورة','أجا','بلقاس','بنى عبيد','تمى الأمديد','دكرنس','شربين','طلخا','منية النصر','ميت سلسبيل','ميت غمر','نبروه'],
  'السويس': ['السويس'],
  'الشرقية': ['الإبراهيمية','الحسينية','العاشر','أبو حماد','أبو كبير','أولاد صقر','بلبيس','ديرب نجم','شرق الزقازيق','صان الحجر','غرب الزقازيق','فاقوس','كفر صقر','مشتول السوق','منشية أبو عمر','منيا القمح','ههيا'],
  'الغربية': ['السنطة','المحلة الكبرى','بسيون','بشبيش','زفتى','سمنود','طنطا','قطور','كفر الزيات'],
  'الفيوم': ['الفيوم','إبشواى','إطسا','سنورس','طامية'],
  'القاهرة': ['القطامية','المعادى','جنوب القاهرة','شرق القاهرة','شمال القاهرة','غرب القاهرة'],
  'القليوبية': ['الخانكة','القناطر الخيرية','بنها','شبين القناطر','طوخ','قليوب','كفر شكر'],
  'المنوفية': ['الباجور','السادات','الشهداء','أشمون','بركة السبع','تلا','شبين الكوم','قويسنا','منوف'],
  'المنيا': ['العدوة','المنيا','أبوقرقاص','بنى مزار','ديرمواس','سمالوط','مطاى','مغاغة','ملوى'],
  'الوادى الجديد': ['الخارجة','الداخلة','الفرافرة'],
  'أسوان': ['إدفو','أسوان','كوم أمبو'],
  'أسيوط': ['البدارى','الساحل','الغنايم','الفتح','القوصية','أبنوب','أبوتيج','أسيوط شرق','أسيوط غرب','ديروط','ساحل سليم','صدفا','منفلوط'],
  'بنى سويف': ['الفشن','الواسطى','إهناسيا','ببا','بنى سويف','سمسطا','ناصر'],
  'بورسعيد': ['بورسعيد'],
  'جنوب سيناء': ['الطور','دهب','رأس سدر','سانت كاترين'],
  'دمياط': ['الزرقا','دمياط','دمياط الجديدة','فارسكور','كفر سعد'],
  'سوهاج': ['البلينا','الجلاوية','العسيرات','المراغة','المنشأة','أخميم','جرجا','جهينة','دار السلام','ساقلتة','سوهاج','طما','طهطا'],
  'شمال سيناء': ['الحسنة','الشيخ زويد','العريش','بئر العبد','رفح','وسط سيناء'],
  'قنا': ['الوقف','أبو تشت','دشنا','فرشوط','قفط','قنا','قوص','نجع حماد','نقادة'],
  'كفر الشيخ': ['الحامول','الرياض','بلطيم','بيلا','دسوق','سيدى سالم','فوه','قلين','كفر الشيخ','مطوبس'],
  'مرسى مطروح': ['الحمام','الضبعة','مطروح'],
};
export const REGION_LIST = Object.keys(REGIONS);
// استنتاج المنطقة من اسم الإدارة (للبيانات القديمة)
export function regionOf(admin) {
  if (!admin) return '';
  for (const [r, list] of Object.entries(REGIONS)) if (list.includes(admin)) return r;
  return '';
}
export const MODULES = {
  visits: { title: 'الزيارات الميدانية', table: 'visits',
    cols: [['visit_date','التاريخ','date'],
    ['region','المنطقة','region'],['administration','الادارة','dept'],
    ['stage','المرحلة','stage'],['type','النوع','type'],['institute','المعهد','text'],
    ['visitor_name','اسم المتابع','text'],['visitor_job','الوظيفة','text'],
    ['purpose','الغرض','text'],['attendance','حضور الحصص الحركية','select'],
    ['records','سجلات المسح والتدريب','select'],['tests_perf','أداء الاختبارات وفق الشروط','select'],
    ['tools','الأدوات والملاعب','select'],['awareness','الإعلان والتوعية','select'],
    ['recommendations','التوصيات','text'],['next_followup','موعد المتابعة التالية','date']],
    search: ['region','administration','institute','visitor_name','visitor_job','visitor','purpose'] },
  institutes: { title: 'متابعة المعاهد (ادارة)', table: 'institutes',
    cols: [['region','المنطقة','region'],['administration','الإدارة','dept'],
    ['stage','المرحلة','stage'],['type','النوع','type'],['institute','المعهد','text'],
    ['teacher','معلم التربية الرياضية','text'],
    ['total_students','اجمالي الطلاب','number'],['targeted','المستهدفون بالمسح','number'],
    ['participants','المشاركون في المسح','number'],['participation_rate','نسبة المشاركة','number_step'],
    ['full_survey','تم المسح الشامل','select_yesno'],['survey_date','تاريخ المسح','date'],
    ['finals_students','طلاب مشاركون بالتصفيات','number'],['finals_threshold','استيفاء حد التصفيات (7)','select'],
    ['report_received','وصل تقرير المعهد','select_yesno'],['visits_count','عدد الزيارات الميدانية','number'],
    ['avg_score','متوسط درجات المنتخب','number_step'],['notes','ملاحظات','text']],
    search: ['region','institute','administration','teacher'] },
  administrations: { title: 'متابعة الادارات (منطقة)', table: 'administrations',
    cols: [['region','المنطقة','region'],['admin_name','الادارة التعليمية','dept'],['institutes_count','عدد المعاهد','number'],
    ['implemented','المعاهد المنفذة للمشروع','number'],['implemented_rate','نسبة المعاهد المنفذة','number_step'],
    ['targeted_students','الطلاب المستهدفون','number'],['participating','الطلاب المشاركون','number'],
    ['participation_rate','نسبة المشاركة','number_step'],['finals_institutes','معاهد شاركت في التصفيات','number'],
    ['team_complete','منتخب الادارة مكتمل (10+2)','select_yesno'],['report_received','وصل تقرير الادارة','select_yesno'],
    ['field_visits','زيارات ميدانية','number'],['coordinator','موجه الادارة / المنسق','text'],['notes','ملاحظات','text']],
    search: ['region','admin_name','coordinator'] },
  indicators: { title: 'مؤشرات الاداء', table: 'indicators',
    cols: [['field','المجال','text'],['indicator','المؤشر','text'],['tool','اداة القياس','text'],
    ['numerator','المحقق (البسط)','number'],['denominator','المخطط (المقام)','number'],
    ['ratio','النسبة','number_step'],['target','المستهدف','number_step'],['status','الحالة','select_status']],
    search: ['field','indicator'] },
};
export const CAN_EDIT = ['admin','data_entry'];
export const ROLE_NAMES = { admin: 'مدير', data_entry: 'مدخل بيانات', viewer: 'مشاهدة' };
export const OPT_SELECT = ['', 'مستوفى','غير مستوفى','نعم','لا','جيد','مقبول','ممتاز'];
export const OPT_STAGE = ['الإبتدائية','الإعدادية','الثانوية'];
export const OPT_TYPE = ['بنين','بنات'];
export const OPT_YESNO = ['', 'نعم','لا'];
export const OPT_STATUS = ['', 'محقق','غير محقق','قيد التنفيذ','مستوفى','غير مستوفى'];
export const SEED_USERS = [
  { id: 1, username: 'admin', password: 'admin123', full_name: 'مدير النظام', role: 'admin', active: 1 },
  { id: 2, username: 'dataentry', password: '123456', full_name: 'مدخل بيانات', role: 'data_entry', active: 1 },
  { id: 3, username: 'viewer', password: 'viewer123', full_name: 'مستخدم مشاهدة', role: 'viewer', active: 1 },
];
export const SEED_INDICATORS = [
  { field: 'الانتشار', indicator: 'نسبة المعاهد المنفذة للمشروع', tool: 'سجل الحصر والمتابعة', numerator: 0, denominator: 0, ratio: '', target: 1, status: '' },
  { field: 'التنفيذ', indicator: 'نسبة الأنشطة المنفذة', tool: 'الخطة التنفيذية', numerator: '', denominator: '', ratio: '', target: 1, status: '' },
  { field: 'المشاركة', indicator: 'عدد ونسبة الطلاب المشاركين', tool: 'كشوف المشاركة', numerator: 0, denominator: 0, ratio: '', target: 1, status: '' },
  { field: 'الأداء', indicator: 'مستوى إتقان الاختبارات', tool: 'استمارة الاختبار', numerator: '', denominator: '', ratio: '', target: 1, status: '' },
  { field: 'التطور', indicator: 'نسبة التحسن في النتائج', tool: 'تحليل القياسات', numerator: '', denominator: '', ratio: '', target: 0.1, status: '' },
  { field: 'الجودة', indicator: 'مدى الالتزام بالمعايير الفنية', tool: 'بطاقة الملاحظة', numerator: '', denominator: '', ratio: '', target: 1, status: '' },
];