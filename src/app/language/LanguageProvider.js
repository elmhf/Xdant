'use client';

import { useEffect } from 'react';
// import i18n from './i18n';
import { useTranslation } from 'react-i18next';

export function LanguageProvider({ children, defaultLanguage = 'en' }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Prefer the user's saved language from localStorage
    // 2. Fall back to the browser's language
    // 3. Finally fall back to the defaultLanguage prop
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const browserLanguage = navigator.language?.split('-')[0];
    const targetLang = savedLanguage || browserLanguage || defaultLanguage;

    if (targetLang && targetLang !== i18n.language) {
      i18n.changeLanguage(targetLang);
    }
    document.documentElement.lang = targetLang;
    document.documentElement.dir = targetLang === 'ar' ? 'rtl' : 'ltr';
  }, []); // Only run once on mount — user controls language after that

  return children;
}