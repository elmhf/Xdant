'use client';
import React, { useContext, useEffect, useRef, useCallback } from "react";
import { PDFContext } from "./report";
import ToothDetailsForPDF from "./ToothDitels";

export default function TeethDetailsSection({ teeth, settings }) {
  const { contextPDFRef } = useContext(PDFContext);
  const localRefs = useRef([]);

  // دالة تحدد الفك حسب رقم السن
  const isUpperTooth = (num) => {
    return (
      (num >= 11 && num <= 18) || // الفك العلوي اليمين
      (num >= 21 && num <= 28)    // الفك العلوي اليسار
    );
  };

  const isLowerTooth = (num) => {
    return (
      (num >= 31 && num <= 38) || // الفك السفلي اليسار
      (num >= 41 && num <= 48)    // الفك السفلي اليمين
    );
  };

  // فلترة الأسنان حسب إعدادات الفك
  const filteredTeeth = teeth?.filter(tooth => {
    const num = Number(tooth.toothNumber);
    if (isUpperTooth(num) && !settings?.CBCTAnalysis.showUpperJaw) return false;
    if (isLowerTooth(num) && !settings?.CBCTAnalysis.showLowerJaw) return false;
    return true;
  }) || [];

  // Initialize refs array when filteredTeeth changes
  useEffect(() => {
    if (filteredTeeth.length > 0) {
      localRefs.current = filteredTeeth.map((_, index) =>
        localRefs.current[index] || React.createRef()
      );
    }
  }, [filteredTeeth.length]);

  // Update context ref when refs are ready
  useEffect(() => {
    if (filteredTeeth.length > 0 && contextPDFRef) {
      const validRefs = localRefs.current
        .map(ref => ref?.current)
        .filter(Boolean);

      if (validRefs.length > 0) {
        contextPDFRef.current = validRefs;
      }
    }
  }, [filteredTeeth, contextPDFRef]);

  const getRefCallback = useCallback((index) => (element) => {
    if (localRefs.current[index]) {
      localRefs.current[index].current = element;
    }
  }, []);
useEffect(()=>{console.log(filteredTeeth,"filteredTeeth")},[filteredTeeth])
  // if (filteredTeeth.length === 0) {
  //   return (
  //     <div className="text-muted-foreground text-center p-4">
  //       <p>لا توجد بيانات للأسنان</p>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full space-y-8 tooth-section">
      {filteredTeeth.map((tooth, index) => (
        <div
          key={`tooth-${tooth.toothNumber || index}`}
          ref={getRefCallback(index)}
          className="overflow-hidden slices-grid rounded-2xl w-full space-y-8"
        >
          <ToothDetailsForPDF settings={settings} tooth={tooth} />
        </div>
      ))}
    </div>
  );
}
