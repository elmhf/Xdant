'use client';
import { useRef, useState, useEffect, useCallback, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PatientInfoSection from "./PatientInfoSection";
import TeethDetailsSection from "./TeethDetailsSection";
import TreatmentPlansSection from "./TreatmentPlansSection";
import RenderProblemDrw from "./RenderProblemDrw";
import ToothChar from "../../main/ToothLabels/ToothChar/ToothChar";
import { useDentalSettings } from '@/hooks/SettingHooks/useDentalSettings ';
import { PDFContext } from "./report";

// ======================== SIGNATURE PAD COMPONENT ========================
const SignaturePad = ({ onSave, disabled = false }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    
    // Set fixed canvas size for consistent PDF output
    canvas.width = 400;
    canvas.height = 150;
  }, []);

  // Get point coordinates
  const getPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  }, []);

  // Drawing handlers
  const startDrawing = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const point = getPoint(e);
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, [disabled, getPoint]);

  const draw = useCallback((e) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const point = getPoint(e);
    
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    
    if (!hasSignature) {
      setHasSignature(true);
    }
  }, [isDrawing, disabled, getPoint, hasSignature]);

  const endDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Clear signature
  const clearSignature = useCallback(() => {
    setIsClearing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      setIsClearing(false);
    }, 150);
  }, []);

  // Save signature
  const saveSignature = useCallback(() => {
    if (!hasSignature) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    onSave?.(dataUrl);
  }, [hasSignature, onSave]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          منطقة التوقيع الإلكتروني
        </h3>
        <p className="text-sm text-slate-600">ارسم توقيعك في المنطقة أدناه</p>
      </div>

      <div className="relative bg-white border-2 border-slate-300 rounded-lg p-2">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className={`
            w-full h-32 border border-slate-200 rounded cursor-crosshair touch-none
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            ${isClearing ? 'opacity-30' : ''}
          `}
        />
        
        {!hasSignature && !isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-slate-400 text-sm">ابدأ بالرسم هنا</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          onClick={clearSignature}
          disabled={!hasSignature || isClearing || disabled}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          مسح
        </Button>
        <Button
          onClick={saveSignature}
          disabled={!hasSignature || disabled}
          className="bg-slate-900 hover:bg-slate-800"
        >
          حفظ التوقيع
        </Button>
      </div>
    </div>
  );
};

// ======================== DOCTOR SIGNATURE COMPONENT ========================
const DoctorSignature = () => {
  const [signature, setSignature] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveSignature = (sig) => {
    setSignature(sig);
    setIsDialogOpen(false);
  };

  return (
    <div className="print:break-inside-avoid">
      <div className="border-t-2 border-slate-200 pt-8 mt-8">
        <div className="flex justify-between items-end">
          
          {/* Doctor Info */}
          <div className="space-y-2">
            <div className="text-sm text-slate-600">
              <p>تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
            </div>
          </div>

          {/* Signature Area */}
          <div className="text-center">
            <div className="w-64 h-20 border-b-2 border-slate-800 mb-2 flex items-end justify-center pb-1">
              {signature ? (
                <img 
                  src={signature} 
                  alt="Doctor Signature" 
                  className="max-h-16 max-w-60 object-contain"
                />
              ) : (
                <span className="text-slate-400 text-sm print:hidden">منطقة التوقيع</span>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Dr. Dental Expert</p>
              <p className="text-sm text-slate-600">Licensed Dentist</p>
              <p className="text-xs text-slate-500">DDS, Oral & Maxillofacial Surgery</p>
            </div>

            {/* Signature Button - Hidden in print */}
            <div className="mt-4 print:hidden">
              {signature ? (
                <div className="flex gap-2 justify-center">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        تعديل التوقيع
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>التوقيع الإلكتروني</DialogTitle>
                      </DialogHeader>
                      <SignaturePad onSave={handleSaveSignature} />
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setSignature(null)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    حذف
                  </Button>
                </div>
              ) : (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
                      أضف توقيعك
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>التوقيع الإلكتروني</DialogTitle>
                    </DialogHeader>
                    <SignaturePad onSave={handleSaveSignature} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ======================== REPORT SECTION WRAPPER ========================
const ReportSection = ({ title, children, className = "", printClass = "" }) => (
  <div className={`print:break-inside-avoid ${printClass} ${className}`}>
    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
      {title}
    </h3>
    <div className="bg-white rounded-lg border">
      {children}
    </div>
  </div>
);

// ======================== MAIN REPORT COMPONENT ========================
export default function ReportView({ 
  patientData, 
  settings, 
  getImage 
}) {
  const { contextPDFRef } = useContext(PDFContext);
  
  const currentDate = new Date().toLocaleDateString();
  const patientName = patientData?.patientInfo?.info?.fullName || 'Patient Name';
  const patientDOB = patientData?.patientInfo?.info?.dob || '--';
  const studyDate = patientData?.metadata?.lastUpdated 
    ? new Date(patientData.metadata.lastUpdated).toLocaleDateString() 
    : currentDate;

  return (
    <div className="report-pdf-container min-h-screen bg-white print:bg-white print:shadow-none">
      
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .report-pdf-container {
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:break-after-page {
            break-after: page;
          }
          .print\\:hidden {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
        .report-pdf-container {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
          font-family: 'Arial', sans-serif;
          line-height: 1.4;
        }
      `}</style>

      <Card className="border-0 shadow-none print:shadow-none">
        
        {/* Report Header */}
        <CardHeader 
          ref={(el) => (contextPDFRef.current[0] = el)}
          className="print:break-inside-avoid border-b-2 border-blue-600 pb-6 mb-8"
        >
          <div className="flex justify-between items-start gap-8">
            
            {/* Clinic Information */}
            <div className="flex-1">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-blue-800">XDental</h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">648 Bay St</p>
                  <p>Toronto, ON M5S 2B3, Canada</p>
                  <p>Phone: +1 647-850-7650</p>
                  <p>Email: info@dentalclinic.ca</p>
                </div>
              </div>
            </div>
            
            {/* Report Information */}
            <div className="flex-1 text-right">
              <h2 className="text-3xl font-bold text-blue-800 mb-6">CBCT AI REPORT</h2>
              <Card className="bg-gray-50 border">
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Patient:</span>
                      <span className="font-medium">{patientName}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">DOB:</span>
                      <span>{patientDOB}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Study Date:</span>
                      <span>{studyDate}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Report Date:</span>
                      <span>{currentDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          
          {/* CBCT Analysis Section */}
          {settings.showCBCTAnalysis && (
            <ReportSection title="CBCT Analysis">
              <div className="p-4">
                <RenderProblemDrw 
                  tooth={patientData.teeth} 
                  Jaw={patientData.jawData} 
                  image={getImage()} 
                  ShowSetting={settings} 
                  stageRef={contextPDFRef} 
                />
              </div>
            </ReportSection>
          )}

          {/* Tooth Chart Section */}
          {settings.showToothChart && (
            <ReportSection 
              title="Tooth Chart"
              className="space-y-4"
            >
              <div 
                ref={(el) => (contextPDFRef.current[2] = el)}
                className="p-4"
              >
                <ToothChar />
              </div>
            </ReportSection>
          )}

          {/* Diagnoses Details Section */}
          {settings.showDiagnoses && (
            <ReportSection title="Diagnoses Details">
              <TeethDetailsSection 
                settings={settings} 
                teeth={patientData.teeth} 
              />
            </ReportSection>
          )}

          {/* Treatment Plan Section */}
          {settings.showSlices && patientData.treatmentPlan && (
            <ReportSection title="Treatment Plan">
              <div className="p-4">
                {/* <TreatmentPlansSection treatmentPlans={patientData.treatmentPlan} /> */}
                <p className="text-gray-600 italic">Treatment plan details will be displayed here.</p>
              </div>
            </ReportSection>
          )}

          {/* Additional Notes Section */}
          <ReportSection title="Additional Notes">
            <div className="bg-gray-50 p-6 min-h-24">
              <p className="text-sm text-gray-600 italic leading-relaxed">
                This report is generated using AI analysis of CBCT imaging. 
                Clinical correlation and professional judgment are recommended for final diagnosis and treatment planning.
              </p>
            </div>
          </ReportSection>

        </CardContent>
        
        {/* Doctor Signature Section */}
        {settings.showSignedByDoctor && (
          <CardFooter className="mt-12">
            <DoctorSignature />
          </CardFooter>
        )}
        
        {/* Report Footer */}
        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200 space-y-1">
          <p className="font-medium">This report is confidential and intended for medical professionals only.</p>
          <p>Generated on {currentDate} | Page 1 of 1</p>
        </div>
        
      </Card>
    </div>
  );
}