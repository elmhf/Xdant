"use client";
import { useState } from 'react';

// الإعدادات الافتراضية
const DEFAULT_SETTINGS = {
  brightness: 100,
  contrast: 100,
  zoom: 100,
  showTeeth: true,
  showJaw: true,
  showRoots: false,
  showEndo: true,
  showCrown: true,
  showNerves: false,
  showNumbering: true,
  showCaries: true,
  problems: {
    showNerves: false,
    showNumbering: true,
    showCaries: true,
    showdfghjk: true,
  },
};

export const useDentalSettings = () => {
  // حالة الإعدادات
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // تحديث مشاكل معينة
  const updateSettingProblem = (problemsArray, setSettingList) => {
    const updatedProblems = problemsArray.reduce((acc, problem) => {
      acc[`show${problem}`] = true;
      return acc;
    }, {});
    setSettingList(prevSettings => ({
      ...prevSettings,
      problems: {
        ...prevSettings.problems,
        ...updatedProblems,
      },
    }));
  };

  // تغيير أي إعداد
  const SettingChange = (key, value, chapter = null) => {
    setSettings(prev => {
      let newSettings = { ...prev };
      if (chapter === "problems") {
        newSettings.problems = { ...newSettings.problems, [key]: value };
      } else {
        newSettings[key] = value;
      }
      // إذا ألغيت إظهار الأسنان، ألغِ الجذور والأعصاب تلقائيًا
      if (key === 'showTeeth' && value === false) {
        newSettings.showRoots = false;
        newSettings.showNerves = false;
      }
      return newSettings;
    });
  };

  // إعادة تعيين الإعدادات للوضع الافتراضي
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return { settings, SettingChange, updateSettingProblem, resetSettings, setSettings };
};