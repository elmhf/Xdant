'use client';
import React,{useEffect} from 'react';
import { Circle, HeartPulse, Activity, Shield, MessageSquare, FileText, Eye, EyeOff } from 'lucide-react';
import RenderProblemDrwPDF from './RenderProblemDrwPDF';

// إعدادات العرض الافتراضية
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
  Jaw: {
    showUpperJaw: true, 
    showLowerJaw: true,
  },
  showDiagnoses: true, 
  showToothChart: true,  
  showCBCTAnalysis: true,
  showSignedByDoctor: false,
  showSlices: {
    upper: false,
    lower: false,     
  },
  problems: {
    showNerves: false,
    showNumbering: true,
    showCaries: true,
    showFilling: true,
    showCrack: true,
    showAbscess: true,
    showPulpStone: true,
    showEndo: true,
    showCrown: true,
    showRoot: true,
  },
  // إعدادات التقرير
  report: {
    showGumHealth: false,
    showClinicalNotes: true,
    showVisualAnalysis: true,
    showProblemCounts: true,
    showHealthyStatus: true,
    showProblemDetails: true,
    showDoctorComments: true,
  }
};

const ToothDetailsForPDF = ({ tooth, ShowSetting = DEFAULT_SETTINGS  }) => {
  if (!tooth) return null;

  // دمج الإعدادات مع الافتراضية
  const settings = { ...DEFAULT_SETTINGS, ...ShowSetting };
  useEffect(() => {console.log("settings",settings)}, [settings]);
  const problems = tooth.problems || [];
  const primaryProblem = problems[0];
  const titleColor = getColor(primaryProblem?.type);

  // تصفية المشاكل حسب إعدادات العرض
  const filteredProblems = problems.filter(problem => {
    const problemType = problem.type?.toLowerCase().replace(/\s+/g, '');
    return settings.problems?.[`show${problemType}`] !== false;
  });

  // حساب عدد المشاكل لكل نوع (بعد التصفية)
  const problemCounts = filteredProblems.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  // ألوان صحة اللثة - ألوان ناعمة وعصرية
  const getGumHealthColor = (health) => {
    switch(health) {
      case 'جيدة': return '#059669'; // Smooth emerald
      case 'متوسطة': return '#d97706'; // Smooth amber
      case 'ضعيفة': return '#dc2626'; // Smooth red
      default: return '#6b7280'; // Smooth gray
    }
  };

  // الحصول على أيقونة صحة اللثة
  const getGumHealthIcon = (health) => {
    switch(health) {
      case 'جيدة': return Shield;
      case 'متوسطة': return Activity;
      case 'ضعيفة': return HeartPulse;
      default: return HeartPulse;
    }
  };

  const GumIcon = getGumHealthIcon(tooth.gumHealth);


  return (
    <div className="bg-white border border-gray-300 w-full mb-6 print:break-inside-avoid print:mb-4">
      {/* Header Section - PDF Report Style */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-4"
              style={{ backgroundColor: `${titleColor}15`, border: `2px solid ${titleColor}` }}
            >
              <span className="text-sm font-bold" style={{ color: titleColor }}>
                {settings.showNumbering ? tooth.toothNumber : '•'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {settings.showNumbering ? `Tooth #${tooth.toothNumber}` : 'Tooth Analysis'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Dental Examination Report
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              <span className="text-sm">Clinical Assessment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-5">
        
        {/* Summary Statistics Row */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          
          {/* Problems Summary */}
          {settings.report?.showProblemCounts && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Identified Problems
              </h3>
              <div className="space-y-2">
                {filteredProblems.length > 0 ? (
                  Object.entries(problemCounts).map(([type, count], index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border border-gray-200">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: getColor(type) }}
                        ></div>
                        <span className="text-sm font-medium text-gray-800">{type}</span>
                      </div>
                      <span 
                        className="text-sm font-bold px-2 py-1 rounded"
                        style={{ 
                          color: getColor(type),
                          backgroundColor: `${getColor(type)}10`
                        }}
                      >
                        {count}×
                      </span>
                    </div>
                  ))
                ) : (
                  settings.report?.showHealthyStatus && (
                    <div className="flex items-center py-2 px-3 bg-emerald-50 rounded border border-emerald-200">
                      <Shield className="w-4 h-4 mr-3 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">No Problems Detected</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Gum Health Status */}
          {settings.report?.showGumHealth && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Gum Health Status
              </h3>
              <div 
                className="flex items-center py-3 px-4 bg-white rounded border-2"
                style={{ 
                  borderColor: getGumHealthColor(tooth.gumHealth),
                  backgroundColor: `${getGumHealthColor(tooth.gumHealth)}05`
                }}
              >
                <GumIcon 
                  className="w-6 h-6 mr-3" 
                  style={{ color: getGumHealthColor(tooth.gumHealth) }} 
                />
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <span 
                    className="ml-2 text-base font-semibold"
                    style={{ color: getGumHealthColor(tooth.gumHealth) }}
                  >
                    {tooth.gumHealth || 'Not Specified'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Doctor's Comment Section */}
        {settings.report?.showClinicalNotes && tooth.comment && (
          <div className="mb-6 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
            <div className="flex items-start">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 uppercase tracking-wide">
                  Clinical Notes
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  {tooth.comment}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Visual Analysis Section */}
        {settings.report?.showVisualAnalysis && (
          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center mb-4">
              <h3 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
                Visual Analysis & Diagnostic Images
              </h3>
              {!settings.showDiagnoses && (
                <div className="ml-3 flex items-center text-gray-500">
                  <EyeOff className="w-4 h-4 mr-1" />
                  <span className="text-xs">Diagnoses Hidden</span>
                </div>
              )}
            </div>
            
            {filteredProblems.length > 0 && settings.showDiagnoses ? (
              <div className="grid grid-cols-2 gap-6">
                {filteredProblems.map((p, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-center mb-3">
                      <RenderProblemDrwPDF
                        maskPoints={settings.showTeeth ? tooth?.teeth_mask : []}
                        problems={settings.report?.showProblemDetails ? [p.mask] : []}
                        size={140}
                        showRoots={settings.showRoots}
                        showCrown={settings.showCrown}
                        showEndo={settings.showEndo}
                      />
                    </div>
                    
                    {settings.report?.showProblemDetails && (
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span 
                            className="text-sm font-bold px-2 py-1 rounded"
                            style={{ 
                              color: getColor(p.type),
                              backgroundColor: `${getColor(p.type)}15`
                            }}
                          >
                            {p.type}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            Case #{index + 1}
                          </span>
                        </div>
                        
                        {p.locations?.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-600 font-medium">Location:</span>
                            <span className="text-xs text-gray-700 ml-1">
                              {p.locations.join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {p.comment && settings.report?.showDoctorComments && (
                          <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                            <span className="text-xs text-gray-600 font-medium block mb-1">Notes:</span>
                            <span className="text-xs text-gray-700 leading-relaxed">
                              {p.comment}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              settings.report?.showHealthyStatus && (
                <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200 text-center">
                  <div className="mb-3">
                    <RenderProblemDrwPDF
                      maskPoints={settings.showTeeth ? tooth?.teeth_mask : []}
                      problems={[]}
                      size={140}
                      showRoots={settings.showRoots}
                      showCrown={settings.showCrown}
                      showEndo={settings.showEndo}
                    />
                  </div>
                  <div className="border-t border-emerald-200 pt-4">
                    <div className="flex items-center justify-center">
                      <Shield className="w-5 h-5 mr-2 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">
                        {settings.showDiagnoses ? 'Healthy Tooth - No Pathology Detected' : 'Tooth Analysis Complete'}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      {settings.showDiagnoses ? 'Normal dental structure with no visible abnormalities' : 'Visual examination completed'}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// ألوان عصرية ناعمة ومريحة للعين - Modern Smooth Palette
function getColor(type) {
  switch (type) {
    case 'Caries': return '#ef4444'; // Modern red - أحمر ناعم للتسوس
    case 'Filling': return '#8b5cf6'; // Modern purple - بنفسجي ناعم للحشوات
    case 'Pulp stone': return '#64748b'; // Modern slate - رمادي ناعم لحصى اللب
    case 'Crack': return '#f97316'; // Modern orange - برتقالي ناعم للشقوق
    case 'Abscess': return '#ec4899'; // Modern pink - وردي ناعم للخراج
    case 'Endo': return '#8b5cf6'; // Modern purple - بنفسجي للعلاج اللبي
    case 'Crown': return '#f59e0b'; // Modern amber - عنبر للتيجان
    case 'Root': return '#78716c'; // Modern stone - بني للجذور
    default: return '#10b981'; // Modern emerald - أخضر ناعم افتراضي
  }
}

export default ToothDetailsForPDF;
export { DEFAULT_SETTINGS };