import { useState, useCallback } from 'react';
// الإعدادات الافتراضية
const DEFAULT_SETTINGS = {

  CBCTAnalysis: {
  showTeeth: true,           // إظهار الأسنان
  showJaw: true,             // إظهار الفك
  showRoots: true,           // إظهار الجذور
  showEndo: true,            // إظهار علاج العصب
  showCrown: true,           // إظهار التيجان
  showNerves: true,   
  },
  Jaw: {
    showUpperJaw: true,
    showLowerJaw: true,
  },
  showDiagnoses: true,       // إظهار التشخيصات
  showToothChart: true,      // إظهار مخطط الأسنان
  showCBCTAnalysis: true,    // إظهار تحليل الأشعة
  showSignedByDoctor: true,  // توقيع الطبيب (للاعترافية)
  showSlices: {
    upper: true,
    lower: true,
  },
  problems: {
  },

  report: {
    showGumHealth: true,         // صحة اللثة
    showClinicalNotes: true,     // ملاحظات سريرية
    showVisualAnalysis: true,    // تحليل بصري
    showProblemCounts: true,     // عدد المشاكل
    showHealthyStatus: true,     // حالة الصحة
    showProblemDetails: true,    // تفاصيل المشاكل
    showDoctorComments: true,    // تعليقات الطبيب
  },
    basic: {
      title: "New Report",
      author: "User",
      addPageNumbers: true,
      fontSize: 12,
      enableRTL: true
    },
    page: {
      size: "A4",
      margins: 20,
      orientation: "portrait"
    },
    quality: {
      imageQuality: 85,
      compression: true,
      optimizeSize: true
    },
    security: {
      protect: false,
      password: "",
      allowPrint: true,
      allowCopy: true
    }
       
};
// Hook مبسط لإدارة الإعدادات
export const useDentalSettings = (initialSettings = DEFAULT_SETTINGS) => {
  const [settings, setSettings] = useState(initialSettings);
  // تحديث قيمة واحدة (يدعم المسارات nested)
  const updateSetting = useCallback((path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      if (path.includes('.')) {
        const keys = path.split('.');
        let current = newSettings;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        newSettings[path] = value;
      }
      return newSettings;
    });
  }, []);
  // تحديث جماعي
  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);
  // إعادة تعيين
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);
  // الحصول على قيمة إعداد معين
  const getSetting = useCallback((path) => {
    if (path.includes('.')) {
      const keys = path.split('.');
      return keys.reduce((obj, key) => obj?.[key], settings);
    }
    return settings[path];
  }, [settings]);
  // إنشاء نسخة داخلية من الإعدادات تحت مفتاح معيّن
  const cloneToKey = useCallback((keyName) => {
    setSettings(prev => ({
      ...prev,
      [keyName]: { ...prev },
    }));
  }, []);
  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    getSetting,
    cloneToKey, // استعمال: cloneToKey('newFormSetting')
  };
};