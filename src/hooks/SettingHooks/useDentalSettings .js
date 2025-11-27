import { useState, useCallback } from 'react';
// الإعدادات الافتراضية
const DEFAULT_SETTINGS = {

  CBCTAnalysis: {
  showPatientInfo:true,
  showCBCTImage:true,
  showToothChart:true,
  showUpperJaw:true,
  showLowerJaw :true,
  ShowSlices:true,
  ShowMasks:true,
  showDiagnoses:true
  },
       
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