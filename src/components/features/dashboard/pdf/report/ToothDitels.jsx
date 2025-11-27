'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import RenderAllSlices from '../../side/card/randerSlice';

// Mock component for RenderProblemDrwPDF (you can remove it later)
const RenderProblemDrwPDF = ({ size = 100 }) => (
  <div
    style={{ width: size, height: size }}
    className="bg-gray-200 rounded-md flex items-center justify-center"
  >
    <span className="text-xs text-gray-500">Image</span>
  </div>
);

// Default display settings
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
  report: {
    showGumHealth: true,
    showClinicalNotes: true,
    showVisualAnalysis: true,
    showProblemCounts: true,
    showHealthyStatus: true,
    showProblemDetails: true,
    showDoctorComments: true,
  },
};

// Color palette helper
function getColor(type) {
  switch (type) {
    case 'Caries': return '#ef4444';
    case 'Filling': return '#8b5cf6';
    case 'Pulp stone': return '#64748b';
    case 'Crack': return '#f97316';
    case 'Abscess': return '#ec4899';
    case 'Endo': return '#3b82f6';
    case 'Crown': return '#f59e0b';
    case 'Root': return '#78716c';
    default: return '#10b981';
  }
}

// 🧩 Component to render problem tags
const ProblemTags = ({ problems }) => {
  const { t } = useTranslation(); // ✅ Hook correctly placed here

  if (!problems || problems.length === 0) {
    return <span>{t("side.card.NoProblemsDetected")}</span>;
  }

  const allTags = problems.flatMap(p => [p.type, ...(p.tags || [])]);

  return (
    <div className="flex flex-wrap gap-1 m-0">
      {allTags.map((tag, index) => (
        <span
          key={`tag-${index}`}
          className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700 border border-gray-300"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

// 🦷 Main ToothDetailsForPDF component
const ToothDetailsForPDF = ({ tooth, settings }) => {
  console.log('88888888888888888899989')
  const { t } = useTranslation(); // ✅ Hook inside component, perfect
  if (!tooth) return null;

  // Merge incoming settings with defaults
  // const settings = { ...DEFAULT_SETTINGS, ...ShowSetting };
  const problems = tooth.problems || [];



  return (
    <div className="bg-white  w-full rounded-lg  print:break-inside-avoid print:shadow-none shadow-sm ">
      {/* --- Header --- */}
      <div className="">
        <h2 className="text-2xl font-bold text-gray-800">
        
            {t("Tooth")} {tooth.toothNumber}
        </h2>
      </div>

      {/* --- Missing Tooth --- */}
      {tooth.status === 'Missing' || tooth.missing ? (
        <div className="text-center bg-gray-50 rounded-md border border-gray-200 p-4">
          <div className="flex flex-col items-center">
            <RenderProblemDrwPDF size={80} />
            <div className="flex items-center justify-center text-red-600 mt-2">
              <span className="text-lg font-bold">{t("Missing")}</span>
              <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                100%
              </span>
            </div>
          </div>
        </div>
      ) : (
        // --- Present Tooth ---
        <div className="space-y-4 ">
          {/* 🩺 Clinical Notes */}
          {settings?.report?.showClinicalNotes && tooth.comment && (
            <div className="bg-gray-50 rounded-md border border-gray-200 p-3">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-gray-500" />
                {t("Clinical Notes")}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {tooth.comment}
              </p>
            </div>
          )}

          {/* 🏷️ Problem Tags */}
          <ProblemTags problems={tooth?.problems} />

          {/* 🖼️ Image / Slices */}
{settings?.CBCTAnalysis.ShowSlices && (          <div className="flex flex-col w-full items-center justify-center bg-gray-50 rounded-md border border-gray-200 ">
            <RenderAllSlices
              teeth={tooth}
              ToothSlicemode={false}
              sliceDrager={false}
            />
          </div>)}
        </div>
      )}
    </div>
  );
};

export default ToothDetailsForPDF;
export { DEFAULT_SETTINGS };
