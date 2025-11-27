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
import RenderAllSlices from '../../side/card/randerSlice';
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
  getImage,
  pateinInfo,
  getCurrentClinic
}) {
  const { contextPDFRef } = useContext(PDFContext);
  const currentClinic = getCurrentClinic();
  console.log(getCurrentClinic(), "currentClinic")
  const currentDate = new Date().toLocaleDateString();
  console.log(pateinInfo, "pateinInfo")
  const patientName = patientData?.patientInfo?.info?.fullName || 'Patient Name';
  const patientDOB = patientData?.patientInfo?.info?.dob || '--';
  const studyDate = patientData?.metadata?.lastUpdated
    ? new Date(patientData.metadata.lastUpdated).toLocaleDateString()
    : currentDate;
  console.log(settings, "settings")
  return (
    <div className="report-pdf-container rounded-lg overflow-hidden min-h-screen bg-white print:bg-white print:shadow-none">

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
          padding: 0.3in;
          font-family: 'Arial', sans-serif;
          line-height: 1.4;
        }
      `}</style>

      <Card className="border-0 shadow-none print:shadow-none">

        {/* Clinic Info Section */}
        <div className="flex justify-between items-start">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={currentClinic?.logo_url || "/XDENTAL.png"}
              alt="Clinic Logo"
              className="h-25 w-auto rounded-3xl overflow-hidden object-contain"
            />
          </div>

          {/* Clinic Contact Info */}
          <div className="text-sm text-gray-900 font-[400] text-end">
            <p className="font-semibold text-lg">{currentClinic?.clinic_name || "Unnamed Clinic"}</p>

            {currentClinic?.street_address && (
              <p>{currentClinic.street_address}</p>
            )}
            {currentClinic?.neighbourhood && (
              <p>{currentClinic.neighbourhood}</p>
            )}
            {(currentClinic?.city || currentClinic?.country) && (
              <p>
                {currentClinic.city || ""}, {currentClinic.country || ""}
              </p>
            )}


            {currentClinic?.phone && (
              <p>Phone: {currentClinic.phone}</p>
            )}

            {currentClinic?.email && (
              <p>Email: {currentClinic.email}</p>
            )}
          </div>
        </div>

        <div className="">
          <h2 className="text-2xl font-bold text-gray-800">CBCT AI Report</h2>
        </div>
        {settings.CBCTAnalysis.showPatientInfo && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <p className="mt-1 text-gray-600">{pateinInfo?.first_name || 'not specified'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <p className="mt-1 text-gray-600">{pateinInfo?.last_name || 'not specified'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-600">{pateinInfo?.email || 'not specified'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <p className="mt-1 text-gray-600">{pateinInfo?.phone || 'not specified'}</p>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="mt-1 text-gray-600">{pateinInfo?.address || 'not specified'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <p className="mt-1 text-gray-600">
              {pateinInfo?.date_of_birth
                ? new Date(pateinInfo.date_of_birth).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
                : 'not specified'}
            </p>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <p className="mt-1 text-gray-600">{pateinInfo?.gender || 'not specified'}</p>
          </div>
        </div>)}


        <CardContent className="space-y-9 p-0">

          {/* CBCT Analysis Section */}
          {settings.CBCTAnalysis.showCBCTImage && (

            <RenderProblemDrw
              tooth={patientData.teeth}
              Jaw={patientData.JAw}
              image={getImage()}
              ShowSetting={settings}
              stageRef={contextPDFRef}
            />

          )}

          {/* Tooth Chart Section */}
          {settings.CBCTAnalysis.showToothChart && (

            <div
              ref={(el) => (contextPDFRef.current[2] = el)}
              className="justify-center flex"
            >
              <ToothChar NumberOnlyMode={false} settings={settings} />
            </div>

          )}

          {/* Diagnoses Details Section */}
          {settings.CBCTAnalysis.showDiagnoses && (

            <TeethDetailsSection
              settings={settings}
              teeth={patientData.teeth}
            />

          )}

          {/* Additional Notes Section */}
          <ReportSection>
            <div className="bg-gray-50 pt-6  min-h-24 flex flex-row">
              <p className="text-sm text-gray-600 italic leading-relaxed">
                This report is generated using AI analysis of CBCT imaging.
                Clinical correlation and professional judgment are recommended for final diagnosis and treatment planning.
              </p>
              <div className=" flex flex-row min-w-fit">
                <img src="/XDENTAL.png" alt="Logo" className="h-9 rounded-2xl overflow-hidden w-auto " />
                <h2 className="text-3xl  font-bold text-[#0d0c22]">xdents</h2>
              </div>
            </div>

          </ReportSection>

        </CardContent>



      </Card>
    </div>
  );
}