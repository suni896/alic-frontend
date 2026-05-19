import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'zh-CN' | 'zh-TW';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: { code: Language; label: string }[];
}

const languagesConfig = [
  { code: 'en' as Language, label: 'English' },
  { code: 'zh-CN' as Language, label: '简体中文' },
  { code: 'zh-TW' as Language, label: '繁體中文' },
];

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLangState] = useState<Language>(
    (i18n.language as Language) || 'en'
  );

  const setLanguage = useCallback(
    (lang: Language) => {
      setLangState(lang);
      i18n.changeLanguage(lang);
    },
    [i18n]
  );

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, languages: languagesConfig }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
};
