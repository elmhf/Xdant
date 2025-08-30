const LAYOUTS = {

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
  XRAY_SIDE: {
    name: 'Xray Side View',
    template: `
      "xray side"
    `,
    columns: '4fr 1fr',
    rows: '1fr',
    description: 'عرض صورة الأشعة مع جانب واحد فقط'
  },
  wLayout: {
    name: 'Xray Side',
    template:  `

    "xray labels"
    "xray side"
  `,
    columns: '2fr 1fr',
    rows: 'fit-content(300px)  3fr ',
    description: 'عرض صورة الأشعة مع جانب واحد فقط'
  }
};

export default LAYOUTS; 