'use client';
import React from 'react';
import { Circle, HeartPulse } from 'lucide-react';
import RenderProblemDrwPDF from './RenderProblemDrwPDF';

const ToothDetailsForPDF = ({ tooth }) => {
  if (!tooth) return null;

  const problems = tooth.problems || [];
  const primaryProblem = problems[0];
  const titleColor = getColor(primaryProblem?.type);
  const locations = primaryProblem?.locations?.join(', ');

  // حساب عدد المشاكل لكل نوع
  const problemCounts = problems.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg  border w-[100%]  ">
      {/* العنوان الرئيسي */}
      <div className="flex items-center mb-3">
        <Circle className="w-3 h-3 mr-2" style={{ color: titleColor, fill: titleColor }} />
        <h2 className="text-lg font-bold" style={{ color: titleColor }}>
          Tooth {tooth.toothNumber}
        </h2>
      </div>

      {/* إحصاءات المشاكل + صحة اللثة */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-3">
          {/* مشاكل الأسنان */}
          {problems.length > 0 ? (
            Object.entries(problemCounts).map(([type, count], index) => (
              <div
                key={index}
                className="flex items-center px-3 py-1 rounded-full bg-opacity-20"
                style={{ backgroundColor: `${getColor(type)}20`, border: `1px solid ${getColor(type)}` }}
              >
                <span className="font-semibold mr-1" style={{ color: getColor(type) }}>
                  {count}
                </span>
                <span className="text-sm" style={{ color: getColor(type) }}>
                  {type}
                </span>
              </div>
            ))
          ) : (
            <div
              className="flex items-center px-3 py-1 rounded-full bg-opacity-20"
              style={{ backgroundColor: `#9ca3af20`, border: '1px solid #9ca3af' }} // Gray-400
            >
              <span className="text-sm font-medium text-gray-600">
                No problems
              </span>
            </div>
          )}

          {/* صحة اللثة كتاج */}
          <div
            className="flex items-center px-3 py-1 rounded-full bg-opacity-20"
            style={{ backgroundColor: `#f43f5e20`, border: '1px solid #f43f5e' }} // Rose-500
          >
            <HeartPulse className="w-4 h-4 text-rose-500 mr-1" />
            <span className="text-sm font-medium text-rose-500">
              صحة اللثة: {tooth.gumHealth || 'غير متوفر'}
            </span>
          </div>
        </div>
      </div>

      {/* صور المشاكل */}
      <div className="flex flex-wrap gap-1">
        {problems.length > 0 ? (
          problems.map((p, index) => (
            <div
              key={index}
              className="flex flex-col items-center border rounded-lg overflow-hidden bg-gray-50"
              style={{ borderColor: getColor(p.type) }}
            >
              <RenderProblemDrwPDF
                maskPoints={tooth?.teeth_mask}
                problems={[p.mask]}
                size={160}
              />
              <span
                className="text-xs mt-1 font-medium"
                style={{ color: getColor(p.type) }}
              >
                {p.type}
                {p.locations?.length > 0 && ` (${p.locations.join(', ')})`}
              </span>
            </div>
          ))
        ) : (
          <div
            className="flex flex-col items-center p-2 border rounded-lg overflow-hidden bg-gray-50"
            style={{ borderColor: '#d1d5db' }} // gray-300
          >
            <RenderProblemDrwPDF
              maskPoints={tooth?.teeth_mask}
              problems={[]} // no problem mask
              size={160}
            />
          </div>
        )}
      </div>
    </div>
  );
};

function getColor(type) {
  switch (type) {
    // case 'Caries': return '#ef4444'; // Red-500
    // case 'Filling': return '#8b5cf6'; // Violet-500
    case 'Pulp stone': return '#6b7280'; // Gray-500
    default: return '#000';
  }
}

export default ToothDetailsForPDF;
