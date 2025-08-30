# WebSocket Implementation

## 📋 نظرة عامة

تم إنشاء نظام WebSocket شامل لإدارة الاتصالات في الوقت الفعلي بين المستخدمين والعيادة.

## 🏗️ الملفات

### 1. `useWebSocket.js`
Hook أساسي لإدارة اتصال WebSocket مع الخادم.

**الميزات:**
- ✅ اتصال تلقائي مع إعادة الاتصال
- ✅ إدارة حالة الاتصال
- ✅ استقبال الإشعارات في الوقت الفعلي
- ✅ إدارة المستخدمين والعيادات

**الاستخدام:**
```javascript
import { useWebSocket } from '../hooks/useWebSocket';

const { 
  isConnected, 
  connectionStatus, 
  notifications,
  selectPatient,
  clearNotifications 
} = useWebSocket(userId, clinicId);
```

### 2. `usePatientWebSocket.js`
Hook مخصص لصفحة المريض مع إدارة التقارير.

**الميزات:**
- ✅ مراقبة تقارير المريض المحدد
- ✅ تحديث حالة التقارير تلقائياً
- ✅ إضافة تقارير جديدة
- ✅ إحصائيات التقارير

**الاستخدام:**
```javascript
import { usePatientWebSocket } from '../hooks/usePatientWebSocket';

const {
  isConnected,
  patientReports,
  lastUpdate,
  updateReport,
  addReport,
  deleteReport
} = usePatientWebSocket(patientId, userId, clinicId);
```

### 3. `websocket-server.js`
خادم WebSocket مع إدارة العيادات والمستخدمين.

**الميزات:**
- ✅ إدارة المستخدمين المتصلين
- ✅ إدارة العيادات
- ✅ إرسال إشعارات في الوقت الفعلي
- ✅ محاكاة الأحداث للتجربة

## 📡 الأحداث المدعومة

### من العميل إلى الخادم:
- `user_login` - دخول المستخدم للعيادة
- `select_patient` - اختيار مريض معين

### من الخادم إلى العميل:
- `login_success` - نجاح دخول العيادة
- `login_error` - خطأ في دخول العيادة
- `report_status_changed_realtime` - تغيير حالة التقرير
- `report_created_realtime` - إنشاء تقرير جديد
- `user_joined_clinic` - انضمام مستخدم للعيادة
- `user_left_clinic` - مغادرة مستخدم للعيادة

## 🚀 تشغيل الخادم

```bash
# تثبيت المكتبات
npm install express socket.io cors nodemon

# تشغيل الخادم
node websocket-server.js

# أو للتطوير
nodemon websocket-server.js
```

## 📊 إحصائيات الخادم

الخادم يعرض إحصائيات كل 30 ثانية:
- عدد المستخدمين المتصلين
- عدد العيادات النشطة
- عدد المستخدمين في كل عيادة

## 🔧 التخصيص

### تغيير منفذ الخادم:
```javascript
const PORT = 5000; // تغيير الرقم حسب الحاجة
```

### تغيير عنوان الخادم في العميل:
```javascript
socketRef.current = io('http://localhost:5000', {
  // الخيارات
});
```

### إضافة أحداث جديدة:
```javascript
// في الخادم
socket.on('custom_event', (data) => {
  // معالجة الحدث
});

// في العميل
socket.emit('custom_event', data);
```

## 🛡️ الأمان

- ✅ CORS مُفعّل للعناوين المسموحة
- ✅ Credentials مُفعّل للجلسات
- ✅ إعادة الاتصال التلقائي
- ✅ معالجة الأخطاء

## 📱 الاستخدام في التطبيق

### في صفحة المريض:
```javascript
import { usePatientWebSocket } from '../hooks/usePatientWebSocket';

export default function PatientPage() {
  const {
    isConnected,
    patientReports,
    lastUpdate
  } = usePatientWebSocket(patientId, userId, clinicId);

  return (
    <div>
      {isConnected && (
        <div className="connection-status">
          ✅ متصل بالخادم
        </div>
      )}
      
      {lastUpdate && (
        <div className="last-update">
          آخر تحديث: {lastUpdate.timestamp}
        </div>
      )}
      
      {/* عرض التقارير */}
    </div>
  );
}
```

## 🎯 الميزات المستقبلية

- [ ] إشعارات صوتية
- [ ] مؤشرات حالة الاتصال في الواجهة
- [ ] إدارة الجلسات المتقدمة
- [ ] تشفير الرسائل
- [ ] دعم الغرف المتعددة 