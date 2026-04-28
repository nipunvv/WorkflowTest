export type LanguageCode = 'en' | 'zh-CN';

export type Language = {
  code: LanguageCode;
  flag: string;
  nativeName: string;
  englishName: string;
  accessibilityLabel: string;
};

export const LANGUAGES: readonly Language[] = [
  {
    code: 'en',
    flag: '🇺🇸',
    nativeName: 'English',
    englishName: 'English',
    accessibilityLabel: 'English',
  },
  {
    code: 'zh-CN',
    flag: '🇨🇳',
    nativeName: '简体中文',
    englishName: 'Simplified Chinese',
    accessibilityLabel: '简体中文, Simplified Chinese',
  },
] as const;
