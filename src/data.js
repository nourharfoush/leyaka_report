  institutes: { title: 'متابعة المعاهد (ادارة)', table: 'institutes',
    cols: [['region','المنطقة','region'],['administration','الإدارة','dept'],
    ['stage','المرحلة','stage'],['type','النوع','type'],['institute','المعهد','text'],
    ['teacher','معلم التربية الرياضية','text'],
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