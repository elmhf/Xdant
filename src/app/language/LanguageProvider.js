'use client';

import { useEffect } from 'react';
// import i18n from './i18n';
import { useTranslation } from 'react-i18next';

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Initialize language from localStorage or browser preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const browserLanguage = navigator.language.split('-')[0];
    const defaultLanguage = savedLanguage || (['ar', 'fr'].includes(browserLanguage) ? browserLanguage : 'en');
    
    i18n.changeLanguage(defaultLanguage);
    document.documentElement.lang = defaultLanguage;
    document.documentElement.dir = defaultLanguage === 'ar' ? 'rtl' : 'ltr';
  }, []);

  return children;
}