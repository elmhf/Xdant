'use client';
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useDentalStore } from "@/stores/dataStore";
import useImageStore from '@/stores/ImageStore';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, Settings, AlertCircle } from "lucide-react";
import ReportSettings from './ReportSettings';
import ReportView from './ReportView';
import { generatePDF } from './utils/pdfUtils';
import { ErrorBoundary } from 'react-error-boundary';

// Enhanced Skeleton Loading Component
function PatientDataSkeleton() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-4xl space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[60vh] w-full" />
      </div>
    </div>
  );
}

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <AlertCircle className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold text-destructive mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary} variant="destructive">
        Try Again
      </Button>
    </div>
  );
}

export default function ReportPage() {
  // State Management
  const { getImage } = useImageStore();
  const patientData = useDentalStore(state => state.data);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pdfContentRef = useRef(null);

  // Initial Settings State
  const [settings, setSettings] = useState({
    showUpperJaw: true,
    showLowerJaw: true,
    showDiagnoses: true,
    showSlices: false,
    signedByDoctor: false,
    colorPrint: true,
    imageQuality: 0.9,
    resolutionScale: 2,
  });

  // Responsive Design Effect
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Fetch patient data
    const fetchPatientData = async () => {
      try {
        // Assuming you have a method to fetch patient data
        await useDentalStore.getState().fetchPatientData();
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load patient data', {
          description: error.message
        });
        setIsLoading(false);
      }
    };

    fetchPatientData();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Memoized Callbacks
  const toggleSetting = useCallback((key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateQualitySetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Memoized Patient Data
  const memoizedPatientData = useMemo(() => {
    return patientData ? {
      ...patientData,
      // Add any additional processing here
      processedImages: patientData.images?.map(img => ({
        ...img,
        // Add any image processing logic
      }))
    } : null;
  }, [patientData]);

  // PDF Download Handler
  const downloadPDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      await generatePDF({
        element: pdfContentRef.current,
        settings,
        patientId: memoizedPatientData?.patientInfo?.patientId,
        onSuccess: (fileSize, totalPages) => {
          toast.success('PDF Generated Successfully', {
            description: `File Size: ${fileSize} KB | Pages: ${totalPages}`,
          });
        },
        onError: (error) => {
          toast.error('PDF Generation Failed', {
            description: error.message,
          });
        }
      });
    } catch (error) {
      toast.error('Unexpected Error', {
        description: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  }, [memoizedPatientData, settings]);

  // Keyboard Shortcut for Download
  useEffect(() => {
    const handleKeyboardDownload = (event) => {
      if (event.key === 'Enter' && event.ctrlKey) {
        downloadPDF();
      }
    };

    document.addEventListener('keydown', handleKeyboardDownload);
    return () => {
      document.removeEventListener('keydown', handleKeyboardDownload);
    };
  }, [downloadPDF]);

  // Loading State
  if (isLoading) {
    return <PatientDataSkeleton />;
  }

  // Render Main Content
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app so the error doesn't happen again
        setIsLoading(true);
      }}
    >
      <div className="flex min-h-screen w-full" style={gridStyle}>
        {/* Desktop Settings */}
        {!isMobile && (
          <div className="hidden md:flex w-72 flex-col g p-4 w-full " style={{ gridArea: 'setting' }}>
            <ReportSettings 
              settings={settings}
              toggleSetting={toggleSetting}
              updateQualitySetting={updateQualitySetting}
              downloadPDF={downloadPDF}
              isGenerating={isGenerating}
            />
          </div>
        )}

        {/* Report View */}
        <div className="flex-1 p-4 md:p-6" style={{ gridArea: 'PDFview' }}>
          <div ref={pdfContentRef}>
            <ReportView 
              patientData={memoizedPatientData} 
              settings={settings} 
              getImage={getImage} 
            />
          </div>

          {/* Mobile Download Button */}
          {isMobile && (
            <div className="fixed bottom-24 right-6 z-50">
              <Button 
                onClick={downloadPDF} 
                disabled={isGenerating} 
                size="icon" 
                aria-label="Download PDF"
                className="rounded-full h-14 w-14 shadow-lg focus:ring-2 focus:ring-primary"
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent"></div>
                ) : (
                  <Download className="h-6 w-6" />
                )}
              </Button>
            </div>
          )}

          {/* Mobile Settings Button */}
          {isMobile && (
            <div className="fixed bottom-6 right-6 z-50">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    size="icon" 
                    aria-label="Report Settings"
                    className="rounded-full h-14 w-14 shadow-lg focus:ring-2 focus:ring-primary"
                  >
                    <Settings className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Report Settings</SheetTitle>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <ReportSettings 
                      settings={settings}
                      toggleSetting={toggleSetting}
                      updateQualitySetting={updateQualitySetting}
                      downloadPDF={downloadPDF}
                      isGenerating={isGenerating}
                      mobileView
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Grid Layout Style
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr 2fr 1fr",
  gridTemplateRows: "repeat(5, 1fr)",
  gridTemplateAreas: `
    "setting PDFview PDFview ."
    "setting PDFview PDFview ."
    "setting PDFview PDFview ."
    "setting PDFview PDFview ."
    "setting PDFview PDFview ."
  `,
  gridColumnGap: "0px",
  gridRowGap: "0px"
};