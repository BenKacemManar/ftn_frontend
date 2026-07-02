import { pools_fr } from './pools.fr';

export const pools_ar: typeof pools_fr = {
  pools: {
    list: {
      kicker: 'المسابح',
      titlePre: 'مسابحنا',
      titleItalic: 'الرياضية.',
      empty: 'لا توجد مسابح.',
      length: 'الطول',
      lanes: 'الممرات',
      type: 'النوع',
      upcomingSlots: 'الحصص القادمة',
    },
    types: {
      indoor: 'مغطى',
      outdoor: 'مكشوف',
    },
    map: {
      title: 'خريطة المسابح',
      subtitle: 'المسابح المنتسبة إلى الجامعة التونسية للسباحة',
      inDevelopment: 'وحدة قيد التطوير',
      comingSoon: 'سيتم إطلاق هذه الوحدة قريبا.',
    },
  },
};
