import { forum_fr } from './forum.fr';

export const forum_ar: typeof forum_fr = {
  forum: {
    home: {
      kicker: 'المنتدى',
      titleLine1: 'نقاشات',
      titleItalic: 'وتبادلات.',
      empty: 'لا توجد فئة منتدى حاليًا.',
      topicsCount: '{{count}} مواضيع',
    },
    backToForumLabel: 'العودة إلى المنتدى',
    backLabel: 'رجوع',
    newThread: {
      cta: '+ موضوع جديد',
      heading: 'موضوع جديد',
      titleLabel: 'العنوان',
      contentLabel: 'المحتوى',
      imageUrlLabel: 'رابط الصورة (اختياري)',
      create: 'إنشاء',
      cancel: 'إلغاء',
    },
    empty: 'لا توجد مواضيع.',
    notFound: 'الموضوع غير موجود.',
    views: 'مشاهدة',
    repliesCount: 'ردود',
    replies: {
      heading: 'الردود',
      formHeading: 'ردّك',
      placeholder: 'اكتب ردّك…',
      imageUrlLabel: 'رابط الصورة (اختياري)',
      sending: 'جارٍ الإرسال…',
      submit: 'الرد',
      loginPrompt: 'سجّل الدخول',
      loginSuffix: 'للرد.',
    },
  },
};
