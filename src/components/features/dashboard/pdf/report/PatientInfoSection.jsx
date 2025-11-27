'use client';

export default function PatientInfoSection({ patientData }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">معلومات المريف</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p><span className="font-medium">الاسم:</span> {patientData.patientInfo?.info?.fullName || 'غير متوفر'}</p>
          <p><span className="font-medium">رقم المريض:</span> {patientData.patientInfo?.patientId || 'غير متوفر'}</p>
          <p><span className="font-medium">العمر:</span> {patientData.patientInfo?.info?.age || 'غير متوفر'}</p>
          <p><span className="font-medium">الجنس:</span> {patientData.patientInfo?.info?.gender || 'غير متوفر'}</p>
        </div>
        <div className="space-y-2">
          <p><span className="font-medium">فصيلة الدم:</span> {patientData.patientInfo?.info?.bloodType || 'غير متوفر'}</p>
          <p><span className="font-medium">الحساسيات:</span> {patientData.patientInfo?.info?.allergies?.join(', ') || 'لا يوجد'}</p>
          <p><span className="font-medium">آخر مسح:</span> {patientData.scanInfo?.scanDate ?
            new Date(patientData.scanInfo.scanDate).toLocaleDateString() : 'غير متوفر'}</p>
        </div>
      </div>
    </div>
  );
}