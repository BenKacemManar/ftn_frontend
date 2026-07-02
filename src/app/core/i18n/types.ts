export type Locale = 'fr' | 'en' | 'ar';

export const LOCALES: { code: Locale; nativeName: string; englishName: string }[] = [
  { code: 'fr', nativeName: 'Français', englishName: 'French' },
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic' },
];

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
