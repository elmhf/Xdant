'use client';
import React, { useContext, useEffect, useRef, useCallback } from "react";
import { PDFContext } from "./report";
import ToothDetailsForPDF from "./ToothDitels";

export default function TeethDetailsSection({ teeth,settings }) {
  const { contextPDFRef } = useContext(PDFContext);
  const localRefs = useRef([]);

  // Initialize refs array when teeth length changes
  useEffect(() => {
    if (teeth && teeth.length > 0) {
      localRefs.current = teeth.map((_, index) => 
        localRefs.current[index] || React.createRef()
      );
    }
  }, [teeth?.length]);

  // Update context ref when refs are ready
  useEffect(() => {
    if (teeth && teeth.length > 0 && contextPDFRef) {
      const validRefs = localRefs.current
        .map(ref => ref?.current)
        .filter(Boolean);
      
      if (validRefs.length > 0) {
        contextPDFRef.current = validRefs;
      }
    }
  }, [teeth, contextPDFRef]);

  // Memoized ref callback to avoid unnecessary re-renders
  const getRefCallback = useCallback((index) => (element) => {
    if (localRefs.current[index]) {
      localRefs.current[index].current = element;
    }
  }, []);

  if (!teeth || teeth.length === 0) {
    return (
      <div className="text-muted-foreground text-center p-4">
        <p>لا توجد بيانات للأسنان</p>
      </div>
    );
  }

  return (
    <div className="grid w-full">
      {teeth.map((tooth, index) => (
        <div
          key={`tooth-${tooth.toothNumber || index}`}
          ref={getRefCallback(index)}
          className="overflow-hidden rounded-2xl w-full"
        >
          <ToothDetailsForPDF ShowSetting={settings} tooth={tooth} />
        </div>
      ))}
    </div>
  );
}