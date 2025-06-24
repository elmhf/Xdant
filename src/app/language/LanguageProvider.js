'use client';

import { useEffect } from 'react';
// import i18n from './i18n';
import { useTranslation } from 'react-i18next';

export function LanguageProvider({ children, defaultLanguage = 'en' }) {
  const { i18n } = useTranslation();

  // Set initial language from prop (SSR-safe)
  useEffect(() => {
    if (i18n.language !== defaultLanguage) {
      i18n.changeLanguage(defaultLanguage);
      document.documentElement.lang = defaultLanguage;
      document.documentElement.dir = defaultLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, [defaultLanguage, i18n]);

  // Allow user to change language after hydration (client-only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferredLanguage');
      const browserLanguage = navigator.language?.split('-')[0];
      const newLang = savedLanguage || browserLanguage || defaultLanguage;
      if (newLang && newLang !== i18n.language) {
        i18n.changeLanguage(newLang);
        document.documentElement.lang = newLang;
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      }
    }
  }, [i18n, defaultLanguage]);

  return children;
}