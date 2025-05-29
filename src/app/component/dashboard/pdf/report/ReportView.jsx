'use client';
import { useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import PatientInfoSection from "./PatientInfoSection";
import TeethDetailsSection from "./TeethDetailsSection";
import TreatmentPlansSection from "./TreatmentPlansSection";
import RenderProblemDrw from "./RenderProblemDrw";
import ToothChar from "../../main/ToothLabels/ToothChar/ToothChar";

// مكون التوقيع الجديد
const SignaturePad = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState(null);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    ctx.lineCap = 'round';
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    setSignature(dataUrl);
    onSave(dataUrl);
  };

  return (
    <div className="signature-pad-container">
      <div className="border rounded-lg p-4 mb-4 bg-white">
        <canvas
          ref={canvasRef}
          width={300}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          className="w-full border-b border-gray-200 cursor-crosshair bg-white"
        />
        <div className="flex justify-between mt-2">
          <Button variant="outline" onClick={clearSignature} size="sm">
            مسح
          </Button>
          <Button onClick={saveSignature} size="sm" disabled={!signature}>
            حفظ التوقيع
          </Button>
        </div>
      </div>
    </div>
  );
};

// مكون توقيع الطبيب المعدل
function DoctorSignature() {
  const [signature, setSignature] = useState(null);
  const [showPad, setShowPad] = useState(false);

  return (
    <CardFooter className="flex justify-end">
      <div className="text-right">
        <p className="font-medium">د. خبير الأسنان</p>
        <p className="text-sm text-muted-foreground">طبيب أسنان مرخص</p>
        
        {signature ? (
          <div className="mt-4">
            <img src={signature} alt="Doctor Signature" className="h-16" />
            <p className="text-xs text-muted-foreground mt-1">
              التوقيع الإلكتروني - {new Date().toLocaleDateString()}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-xs"
              onClick={() => setShowPad(true)}
            >
              تعديل التوقيع
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowPad(true)}
          >
            أضف توقيعك
          </Button>
        )}

        {showPad && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-bold mb-4">التوقيع الإلكتروني</h3>
              <SignaturePad 
                onSave={(sig) => {
                  setSignature(sig);
                  setShowPad(false);
                }} 
              />
              <Button 
                variant="outline" 
                className="mt-2 w-full"
                onClick={() => setShowPad(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </div>
    </CardFooter>
  );
}

export default function ReportView({ 
  patientData, 
  settings, 
  getImage 
}) {
  return (
    <Card className={settings.colorPrint ? "report-pdf" : "report-pdf grayscale"}>
      {/* Report Header with Clinic Info */}
      <CardHeader>
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div className="flex items-center gap-4">
            <img src="/41.png" alt="Clinic Logo" className="w-14 h-14 rounded" />
            <div>
              <h2 className="text-lg font-bold">Dental Clinic</h2>
              <p className="text-xs text-muted-foreground">ON M5S 2B3, Canada, Toronto</p>
              <p className="text-xs text-muted-foreground">648 Bay St</p>
              <p className="text-xs text-muted-foreground">+1 647-850-7650</p>
              <p className="text-xs text-muted-foreground">info@dentalclinic.ca</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-primary">CBCT AI Report</h3>
            <p className="text-xs">{patientData?.patientInfo?.info?.fullName || 'Patient Name'}</p>
            <p className="text-xs">DoB: {patientData?.patientInfo?.info?.dob || '--'}</p>
            <p className="text-xs">Study Date: {patientData?.metadata?.lastUpdated ? new Date(patientData.metadata.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-7 p-[40px] justify-center items-center">
        {/* X-ray Image */}
        <div className="w-[90%] flex flex-col gap-4 justify-center mb-6">
          <h1 className="text-xl font-bold text-primary">CBCT AI Report</h1>
          <RenderProblemDrw image={getImage()} />
        </div>
        {/* Tooth Chart */}
        <div className="w-full w-2xl max-w-[85%] mb-6">
          <ToothChar />
        </div>

        {/* Teeth Details Table */}
        {settings.showDiagnoses && (
          <div className=" w-[90%] mb-6">
            <TeethDetailsSection teeth={patientData.teeth} />
          </div>
        )}
        {/* Treatment Plan Table */}
        {settings.showSlices && patientData.treatmentPlan && (
          <div className="w-full max-w-3xl mb-6">
            <TreatmentPlansSection treatmentPlans={patientData.treatmentPlan} />
          </div>
        )}
        <Separator />
      </CardContent>
      
      {/* Doctor Signature */}
      {settings.signedByDoctor && <DoctorSignature />}
    </Card>
  );
}

function ReportHeader({ patientData }) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <CardTitle className="text-2xl">تقرير صحة الأسنان</CardTitle>
        <p className="text-sm text-muted-foreground">
          تحليل شامل لصحة الأسنان لـ {patientData.patientInfo?.info?.fullName || 'المريض'}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        {patientData.metadata?.lastUpdated ?
          new Date(patientData.metadata.lastUpdated).toLocaleDateString() :
          new Date().toLocaleDateString()}
      </p>
    </div>
  );
}