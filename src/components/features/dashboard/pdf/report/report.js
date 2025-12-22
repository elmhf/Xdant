'use client';
import React, { useRef, useState, useEffect, useMemo, useCallback, createContext } from 'react';
import { motion } from 'framer-motion';
import { useDentalStore } from "@/stores/dataStore";
import useImageStore from '@/stores/ImageStore';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import { useDentalSettings } from '@/hooks/SettingHooks/useDentalSettings ';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import ReportSettings from './ReportSettings';
import ReportView from './ReportView';
import { generatePDF } from './utils/pdfUtils';
import { ErrorBoundary } from 'react-error-boundary';
import { useCurrentPatient } from '@/stores/patientStore';
import useUserStore from '@/components/features/profile/store/userStore';


export const PDFContext = createContext();

function PatientDataSkeleton() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-[60vh] w-full" />
      </div>
    </div>
  );
}



import ErrorCard from "@/components/shared/ErrorCard";

function ErrorFallback({ error, resetErrorBoundary }) {
  return <ErrorCard error={error} onRetry={resetErrorBoundary} />;
}

export default function ReportPage() {
  const { getCurrentClinic } = useUserStore();
  const pdfContentRef = useRef(null);
  const contextPDFRef = useRef([]);
  const contextValue = useMemo(() => ({ contextPDFRef }), []);
  const patient = useCurrentPatient();

  const { getImage } = useImageStore();
  const patientData = useDentalStore(state => state.data);
  const { settings, updateSetting, resetSettings } = useDentalSettings();

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customSettings, setSettings] = useState({
    showUpperJaw: true,
    showLowerJaw: true,
    showDiagnoses: true,
    colorPrint: true,
    imageQuality: 0.9,
    resolutionScale: 2,
    showTeeth: true,
    showJaw: true,
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        await useDentalStore.getState().fetchPatientData();
      } catch (error) {
        toast.error('Failed to load patient data', { description: error.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatientData();
  }, []);

  const toggleSetting = useCallback((key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateQualitySetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const memoizedPatientData = useMemo(() => {
    return patientData ? { ...patientData, processedImages: patientData.images?.map(img => ({ ...img })) } : null;
  }, [patientData]);

  const [staticCanvasImage, setStaticCanvasImage] = useState(null);

  const downloadPDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      // 1. Capture Canvas as Static Image
      if (contextPDFRef.current?.[1]) {
        const stage = contextPDFRef.current[1];
        const dataUrl = stage.toDataURL({ pixelRatio: 2 });
        setStaticCanvasImage(dataUrl);
        // Wait for state update and re-render
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 2. Generate PDF
      await generatePDF({
        element: pdfContentRef.current,
        settings,
        patientId: memoizedPatientData?.patientInfo?.patientId,
        onSuccess: (fileSize, totalPages) => {
          toast.success('PDF Generated Successfully', {
            description: `Size: ${fileSize} KB | Pages: ${totalPages}`,
          });
        },
        onError: (error) => {
          toast.error('PDF Generation Failed', { description: error.message });
        },
      });
    } catch (error) {
      toast.error('Unexpected Error', { description: error.message });
    } finally {
      // 3. Cleanup
      setStaticCanvasImage(null);
      setIsGenerating(false);
    }
  }, [memoizedPatientData, settings]);

  if (isLoading) return <PatientDataSkeleton />;

  return (
    <PDFContext.Provider value={contextValue}>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setIsLoading(true)}>
        <div className="flex max-h-[92vh] pt-5 min-w-full flex-col justify-center md:flex-row  bg-background text-foreground">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 max-w-fit bg-muted/20  overflow-y-auto">
            <ReportSettings
              settings={settings}
              updateSetting={updateSetting}
              resetSettings={resetSettings}
              setSettings={setSettings}
              toggleSetting={toggleSetting}
              updateQualitySetting={updateQualitySetting}
              downloadPDF={downloadPDF}
              isGenerating={isGenerating}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 px-4 max-w-fit  overflow-y-auto">
            <motion.div ref={pdfContentRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ReportView
                patientData={memoizedPatientData}
                settings={settings}
                getImage={getImage}
                pateinInfo={patient}
                getCurrentClinic={getCurrentClinic}
                staticCanvasImage={staticCanvasImage}
              />
            </motion.div>

          </div>
        </div>
      </ErrorBoundary>
    </PDFContext.Provider>
  );
}
