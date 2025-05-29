export function useLanguage() {
    const { i18n } = useTranslation();
    
    return {
      currentLanguage: i18n.language,
      changeLanguage: (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.lang = lng;
        document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('preferredLanguage', lng);
      },
      t: i18n.t
    };
  }