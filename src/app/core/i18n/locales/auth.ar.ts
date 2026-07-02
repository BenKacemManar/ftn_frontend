import { auth_fr } from './auth.fr';

export const auth_ar: typeof auth_fr = {
  auth: {
    brand: {
      since: 'الترجي · 1919',
      section: 'قسم السباحة',
    },
    login: {
      stepLabel: 'تسجيل الدخول',
      titleLine1: 'أهلاً بعودتك',
      titleItalic: 'بيننا.',
      passwordLabel: 'كلمة المرور',
      submitting: 'تسجيل الدخول…',
      submit: 'تسجيل الدخول',
      noAccount: 'ليس لديك حساب بعد؟',
      registerLink: 'إنشاء حساب',
      invalidCredentials: 'بيانات الدخول غير صحيحة.',
    },
    register: {
      stepLabel: 'التسجيل',
      titleLine1: 'انضم إلى',
      titleItalic: 'العائلة.',
      firstName: 'الاسم الأول',
      passwordLabel: 'كلمة المرور',
      roleLabel: 'الصفة',
      roleAthlete: 'رياضي',
      roleCoach: 'مدرّب',
      submitting: 'إنشاء الحساب…',
      submit: 'إنشاء حسابي',
      hasAccount: 'لديك حساب؟',
      loginLink: 'تسجيل الدخول',
      registerError: 'خطأ في إنشاء الحساب.',
    },
  },
};
