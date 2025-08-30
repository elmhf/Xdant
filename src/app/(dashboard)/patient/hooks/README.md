# 🪝 Patient Hooks

هذا المجلد يحتوي على React Hooks مخصصة لإدارة المرضى والتقارير والاتصالات.

## 📁 الملفات

### `useWebSocket.js`
Hook متقدم لإدارة اتصالات WebSocket مع إدارة ذكية للحالات.

#### الميزات:
- ✅ **إدارة اتصال ذكية**: اتصال واحد مع إعادة الاتصال التلقائي
- ✅ **نظام Heartbeat**: للحفاظ على الاتصال نشطاً
- ✅ **إدارة الأخطاء**: معالجة شاملة للأخطاء
- ✅ **إحصائيات الاتصال**: تتبع محسن للحالة
- ✅ **تنظيف تلقائي**: عند تغيير URL أو إلغاء المكون

#### الاستخدام:
```javascript
import { useWebSocket } from './hooks';

const {
  isConnected,
  isConnecting,
  error,
  lastMessage,
  connectionStats,
  connect,
  disconnect,
  reconnect,
  sendMessage
} = useWebSocket('ws://localhost:5001/ws', {
  onMessage: (data) => console.log('Message received:', data),
  onOpen: () => console.log('Connected!'),
  onClose: () => console.log('Disconnected!'),
  onError: (error) => console.error('Error:', error),
  maxReconnectAttempts: 5,
  reconnectInterval: 3000,
  heartbeatInterval: 30000,
  autoReconnect: true
});
```

#### الحالات المدعومة:
- **CONNECTING**: الاتصال قيد التأسيس
- **OPEN**: الاتصال مفتوح ونشط
- **CLOSING**: الاتصال قيد الإغلاق
- **CLOSED**: الاتصال مغلق

### `useOrderReport.js`
Hook لإدارة طلبات التقارير.

#### الميزات:
- ✅ **إدارة الحالة**: تتبع التقرير المحدد
- ✅ **معالجة الطلبات**: إدارة عملية الطلب
- ✅ **إعادة تعيين**: تنظيف الحالة بعد الطلب

#### الاستخدام:
```javascript
import { useOrderReport } from './hooks';

const {
  selectedReport,
  isOrdering,
  handleReportSelect,
  handleOrderReport,
  handleCloseOrder
} = useOrderReport(patient, onReportCreated);
```

### `useReports.js`
Hook لإدارة التقارير وتحويلها إلى تنسيق مناسب.

#### الميزات:
- ✅ **تحويل البيانات**: تحويل التقارير إلى orders
- ✅ **إدارة التحميل**: حالة التحميل
- ✅ **تحديث تلقائي**: عند تغيير بيانات المريض

#### الاستخدام:
```javascript
import { useReports } from './hooks';

const { orders, loading } = useReports(patient);
```

## 🔧 الخيارات المتقدمة

### WebSocket Options:
```javascript
const options = {
  // Callbacks
  onMessage: (data) => {},      // عند استقبال رسالة
  onOpen: () => {},            // عند فتح الاتصال
  onClose: (event) => {},      // عند إغلاق الاتصال
  onError: (error) => {},      // عند حدوث خطأ
  
  // Reconnection
  maxReconnectAttempts: 5,     // عدد محاولات إعادة الاتصال
  reconnectInterval: 3000,      // الفاصل بين المحاولات (ms)
  autoReconnect: true,         // إعادة الاتصال التلقائي
  
  // Heartbeat
  heartbeatInterval: 30000     // فاصل Heartbeat (ms)
};
```

### الحالات المدعومة:
```javascript
// State
isConnected: boolean,           // الاتصال نشط
isConnecting: boolean,          // الاتصال قيد التأسيس
error: Error | null,           // خطأ في الاتصال
lastMessage: Object | null,    // آخر رسالة مستلمة
connectionStats: Object,       // إحصائيات الاتصال

// Actions
connect: Function,             // الاتصال يدوياً
disconnect: Function,          // قطع الاتصال
reconnect: Function,           // إعادة الاتصال
sendMessage: Function,         // إرسال رسالة

// Utility
readyState: number            // حالة الاتصال (0-3)
```

## 📊 إحصائيات الاتصال

```javascript
const connectionStats = {
  attempts: 0,                // عدد محاولات الاتصال
  lastConnected: "2024-01-15T10:30:00.000Z", // آخر اتصال
  totalMessages: 42           // إجمالي الرسائل المستلمة
};
```

## 🎯 أفضل الممارسات

1. **استخدم cleanup**: تأكد من تنظيف الاتصال عند إلغاء المكون
2. **تحقق من الحالة**: تحقق من `isConnected` قبل إرسال الرسائل
3. **معالجة الأخطاء**: استخدم `onError` لمعالجة الأخطاء
4. **Heartbeat**: استخدم نظام Heartbeat للحفاظ على الاتصال
5. **إعادة الاتصال**: اسمح بإعادة الاتصال التلقائي للحالات العادية

## 🔄 تدفق العمل

```
1. إنشاء Hook → 2. الاتصال التلقائي → 3. إدارة الرسائل → 4. إعادة الاتصال عند الحاجة
```

---

**📝 ملاحظة**: جميع Hooks مُحسّنة للأداء وسهولة الاستخدام. 