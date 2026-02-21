import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files directly — this is far more reliable than HttpBackend in Next.js
import en from '../../../public/locales/en.json';
import fr from '../../../public/locales/fr.json';
import ar from '../../../public/locales/ar.json';

const savedLanguage =
  typeof window !== 'undefined'
    ? localStorage.getItem('preferredLanguage') || 'en'
    : 'en';

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      resources: {
        en: { translation: en, ...en },
        fr: { translation: fr, ...fr },
        ar: { translation: ar, ...ar },
      },
    });
}

export default i18n;