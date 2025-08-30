# 📁 Patient Module Structure

هذا المجلد يحتوي على جميع المكونات والوظائف المتعلقة بإدارة المرضى في تطبيق XDental.

## 📂 هيكل المجلد

```
patient/
├── README.md                 # هذا الملف - دليل المجلد
├── page.js                   # صفحة قائمة المرضى الرئيسية
├── hooks/                    # React Hooks مخصصة
│   ├── index.js             # تصدير مركزي للـ hooks
│   ├── useOrderReport.js    # Hook لإدارة طلبات التقارير
│   └── useReports.js        # Hook لإدارة التقارير
├── components/               # مكونات React
│   ├── AIOrdersList.jsx     # قائمة تقارير الذكاء الاصطناعي
│   ├── AddDoctorDialog.jsx  # حوار إضافة طبيب
│   ├── AddPatientDialog.jsx # حوار إضافة مريض
│   ├── CreateAIReportDialog.jsx # حوار إنشاء تقرير AI
│   ├── DeleteDoctorDialog.jsx   # حوار حذف طبيب
│   ├── DeletePatientDialog.jsx  # حوار حذف مريض
│   ├── EditPatientDialog.jsx    # حوار تعديل بيانات المريض
│   ├── OrderAIReport.jsx        # مكون طلب تقرير AI
│   ├── PatientTable.jsx         # جدول المرضى
│   └── UploadToast.jsx          # إشعارات التحميل
├── utils/                    # وظائف مساعدة
│   ├── index.js             # تصدير مركزي للـ utils
│   ├── patientUtils.js      # وظائف خاصة بالمرضى
│   ├── reportUtils.js       # وظائف خاصة بالتقارير
│   ├── formUtils.js         # وظائف النماذج والتحقق
│   └── toastUtils.js        # وظائف الإشعارات
└── [patientId]/             # صفحة تفاصيل المريض
    └── page.js              # صفحة المريض الفردية
```

## 🎯 الوظائف الرئيسية

### 📋 إدارة المرضى
- عرض قائمة المرضى
- إضافة مريض جديد
- تعديل بيانات المريض
- حذف المريض
- البحث والتصفية

### 👨‍⚕️ إدارة الأطباء المعالجين
- إضافة طبيب معالج
- حذف طبيب معالج
- عرض الأطباء المعالجين

### 🤖 تقارير الذكاء الاصطناعي
- طلب تقارير AI
- عرض حالة التقارير
- تحميل التقارير المكتملة
- حذف التقارير

## 🔧 الاستخدام

### استيراد Hooks
```javascript
import { useOrderReport, useReports } from './hooks';
```

### استيراد Utils
```javascript
import { 
  formatPatientName, 
  convertReportsToOrders,
  validatePatientForm 
} from './utils';
```

### استيراد Components
```javascript
import AIOrdersList from './components/AIOrdersList';
import AddPatientDialog from './components/AddPatientDialog';
```

## 📊 أنواع التقارير المدعومة

- **CBCT**: Cone Beam Computed Tomography
- **Pano**: Panoramic X-ray
- **IOXRay**: Intraoral X-ray
- **3D Model**: Three-dimensional model
- **Implant**: Dental implant analysis
- **Ortho**: Orthodontic treatment
- **Dental Analysis**: Comprehensive dental analysis
- **X-Ray Analysis**: X-ray image analysis

## 🎨 حالات التقارير

- **Pending**: في الانتظار
- **Processing**: قيد المعالجة
- **Completed**: مكتمل
- **Failed**: فشل

## 🔄 تدفق العمل

1. **إضافة مريض** → `AddPatientDialog.jsx`
2. **عرض المرضى** → `PatientTable.jsx`
3. **تفاصيل المريض** → `[patientId]/page.js`
4. **طلب تقرير AI** → `OrderAIReport.jsx`
5. **عرض التقارير** → `AIOrdersList.jsx`

## 🛠️ التطوير

### إضافة نوع تقرير جديد
1. تحديث `reportUtils.js` بإضافة الاسم والوصف والأيقونة
2. تحديث `OrderAIReport.jsx` بإضافة الخيار الجديد
3. اختبار التكامل

### إضافة وظيفة جديدة
1. إنشاء الملف في المجلد المناسب
2. إضافة التصدير في `index.js`
3. تحديث هذا الملف README.md

---

**📝 ملاحظة**: جميع الملفات منظمة ومُحسّنة للأداء وسهولة الصيانة. 