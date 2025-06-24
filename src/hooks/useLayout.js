import { useState, useEffect } from "react";

const LAYOUTS = {
  COMPACT: {
    name: 'Compact View',
    template: `
      "xray labels ."
      "xray side . "
      "xray side . "
    `,
    columns: '1fr 1fr 0.5fr',
    rows: '1fr 1fr 1fr',
    description: 'عرض مضغوط مع التركيز على صورة الأشعة'
  },
  DEFAULT: {
    name: 'Default View',
    template: `
      "xray  side"
      "labels  side"
    `,
    columns: '1fr  1fr',
    rows: '1.5fr 1fr',
    description: 'العرض الافتراضي مع توازن بين جميع المكونات'
  },
  VIEW: {
    name: 'VIEW',
    template: `
      "settings xray side"
      "settings xray side"
      "settings xray side"
    `,
    columns: '.5fr 1.75fr 1fr',
    rows: '1fr 1fr 1fr',
    description: 'العرض الافتراضي مع توازن بين جميع المكونات'
  },
  DETAILS_VIEW: {
    name: 'Details View',
    template: `
      "details details details"
    `,
    columns: '1fr',
    rows: '1fr',
    description: 'عرض مفصل لبيانات السن المحدد'
  },
  COMPARISON: {
    name: 'Comparison View',
    template: `
      "compare xray"
      "compare labels"
      "side side"
    `,
    columns: '1fr 2fr',
    rows: '1fr 1fr auto',
    description: 'عرض المقارنة مع التركيز على تحليل الأسنان'
  },
  FULL_XRAY: {
    name: 'Full X-Ray View',
    template: `
      "xray xray xray"
      "xray xray xray"
    `,
    columns: '1fr',
    rows: '1fr',
    description: 'عرض كامل لصورة الأشعة مع إخفاء العناصر الأخرى'
  },
  NEW_LAYOUT: {
    name: 'Dental Details View',
    template: `
      "labels newcomponent"
      "side newcomponent"
      "side newcomponent"
    `,
    columns: '1fr 1fr',
    rows: '1fr 1fr 1fr',
    description: 'عرض تفاصيل الأسنان بدون صورة الأشعة'
  }
};

export default function useLayout(defaultLayout = "DEFAULT") {
  const [layoutKey, setLayoutKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("xdental-layout") || defaultLayout;
    }
    return defaultLayout;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("xdental-layout", layoutKey);
    }
  }, [layoutKey]);

  const setLayout = (key) => {
    if (LAYOUTS[key]) setLayoutKey(key);
  };

  return {
    layoutKey,
    layout: LAYOUTS[layoutKey],
    setLayout,
    allLayouts: LAYOUTS
  };
} 