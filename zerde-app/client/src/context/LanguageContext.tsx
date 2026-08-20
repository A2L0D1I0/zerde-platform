import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage } from '@/types';
import { translations, TranslationKey } from '@/i18n';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  getLocalized: (data: any, field: string, fallback?: string) => string;
}

/**
 * Universal localized field extractor:
 * Tries field_kz / field_ru / field_en, fieldKZ / fieldRU / fieldEN, field[kz/ru/en], or plain field
 */
export function getLocalizedField(data: any, field: string, lang: AppLanguage, fallback: string = ''): string {
  if (!data) return fallback;

  const lowerLang = lang.toLowerCase();
  const upperLang = lang.toUpperCase();

  // 1. Direct language specific fields: e.g. question_kz, title_ru, description_en
  const suffixLower = `${field}_${lowerLang}`;
  if (data[suffixLower] !== undefined && data[suffixLower] !== null && data[suffixLower] !== '') {
    return String(data[suffixLower]);
  }

  // 2. CamelCase specific fields: e.g. nameKZ, titleRU
  const camelLang = `${field}${upperLang}`;
  if (data[camelLang] !== undefined && data[camelLang] !== null && data[camelLang] !== '') {
    return String(data[camelLang]);
  }

  // 3. Object-based localization: e.g. title: { kz: '...', ru: '...' }
  if (data[field] && typeof data[field] === 'object') {
    const nested = data[field][lowerLang] || data[field][upperLang] || data[field].kz || data[field].KZ || data[field].ru || data[field].RU;
    if (nested) return String(nested);
  }

  // 4. Fallback order: KZ -> RU -> EN -> generic field -> fallback
  const fallbackKz = data[`${field}_kz`] || data[`${field}KZ`];
  if (fallbackKz) return String(fallbackKz);

  const fallbackRu = data[`${field}_ru`] || data[`${field}RU`];
  if (fallbackRu) return String(fallbackRu);

  const fallbackEn = data[`${field}_en`] || data[`${field}EN`];
  if (fallbackEn) return String(fallbackEn);

  if (data[field] !== undefined && data[field] !== null && typeof data[field] !== 'object') {
    return String(data[field]);
  }

  return fallback;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('zerde_language') as AppLanguage;
    if (saved && (saved === 'KZ' || saved === 'RU' || saved === 'EN')) {
      return saved;
    }
    return 'KZ';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('zerde_language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const currentDict = translations[language] as Record<string, string>;
    const ruDict = translations.RU as Record<string, string>;
    const kzDict = translations.KZ as Record<string, string>;

    let text = currentDict?.[key] || kzDict?.[key] || ruDict?.[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramVal));
      });
    }

    return text;
  };

  const getLocalized = (data: any, field: string, fallback: string = ''): string => {
    return getLocalizedField(data, field, language, fallback);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { translations };
export type { TranslationKey };

