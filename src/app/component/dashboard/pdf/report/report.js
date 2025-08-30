'use client';
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDentalStore } from "@/stores/dataStore";
import useImageStore from '@/stores/ImageStore';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import { useDentalSettings } from '@/hooks/SettingHooks/useDentalSettings ';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, Settings, AlertCircle, Menu, X } from "lucide-react";
import ReportSettings from './ReportSettings';
import ReportView from './ReportView';
import { generatePDF } from './utils/pdfUtils';
import { ErrorBoundary } from 'react-error-boundary';
import { createContext } from 'react';

export const PDFContext = createContext();

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Enhanced Skeleton Loading Component with Animation
function PatientDataSkeleton() {
  const skeletonVariants = {
    animate: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="flex min-h-screen w-full items-center justify-center "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-7xl space-y-6 p-4 md:p-6">
        <motion.div variants={skeletonVariants} animate="animate">
          <Skeleton className="h-12 w-full" />
        </motion.div>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={staggerChildren}
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <Skeleton className="h-24" />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Skeleton className="h-24" />
          </motion.div>
        </motion.div>
        <motion.div variants={skeletonVariants} animate="animate">
          <Skeleton className="h-[60vh] w-full" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Error Fallback Component with Animation
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <motion.div 
      role="alert" 
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: 3 }}
      >
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
      </motion.div>
      <motion.h1 
        className="text-2xl font-bold text-destructive mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Something went wrong
      </motion.h1>
      <motion.p 
        className="text-muted-foreground mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {error.message}
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button onClick={resetErrorBoundary} variant="destructive">
          Try Again
        </Button>
      </motion.div>
    </motion.div>
  );
}

// Floating Action Button Component
const FloatingActionButton = ({ onClick, disabled, children, className = "", label }) => (
  <motion.div
    initial={{ scale: 0, rotate: 180 }}
    animate={{ scale: 1, rotate: 0 }}
    whileHover={{ scale: 1.1, rotate: 5 }}
    whileTap={{ scale: 0.9 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
    className={`fixed z-50 ${className}`}
  >
    <Button 
      onClick={onClick} 
      disabled={disabled} 
      size="icon" 
      aria-label={label}
      className="rounded-full h-14 w-14 shadow-lg focus:ring-2 focus:ring-primary hover:shadow-xl transition-shadow duration-300"
    >
      {children}
    </Button>
  </motion.div>
);

// Sidebar Component for Desktop
const Sidebar = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-full w-80 bg-background border-r z-50 lg:static lg:w-auto lg:border-r-0"
        >
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <h2 className="text-lg font-semibold">Report Settings</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function ReportPage() {
  const contextPDFRef = useRef([]);
  const contextValue = useMemo(() => ({ contextPDFRef }), [contextPDFRef]);

  // State Management
  const { getImage } = useImageStore();
  const patientData = useDentalStore(state => state.data);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pdfContentRef = useRef(null);
  const { settings, updateSetting, resetSettings } = useDentalSettings();

  // Initial Settings State
  const [ssettings, setSettings] = useState({
    showUpperJaw: true,
    showLowerJaw: true,
    showDiagnoses: true,
    showSlices: false,
    signedByDoctor: false,
    colorPrint: true,
    imageQuality: 0.9,
    resolutionScale: 2,
    showTeeth: true,
    showJaw: true,
    showRoots: true,
    showNerves: true,
    showNumbering: true,
    showCaries: true,
    problems: {
      showNerves: false,
      showNumbering: true,
      showCaries: true,
      showdfghjk: true,
    },
  });

  // Responsive Design Effect
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    const fetchPatientData = async () => {
      const start = performance.now();
      try {
        await useDentalStore.getState().fetchPatientData();
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load patient data', {
          description: error.message
        });
        setIsLoading(false);
      } finally {
        const end = performance.now();
              }
    };

    fetchPatientData();
    
    return () => window.removeEventListener('resize', checkScreenSize);
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
      processedImages: patientData.images?.map(img => ({ ...img }))
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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (event) => {
      if (event.key === 'Enter' && event.ctrlKey) {
        downloadPDF();
      }
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [downloadPDF]);

  // Loading State
  if (isLoading) {
    return <PatientDataSkeleton />;
  }

  // Responsive Layout Classes
const getLayoutClasses = () => {
  if (isMobile) return "flex flex-col min-h-screen";
  if (isTablet) return "flex min-h-screen";
  return "grid grid-cols-15 min-h-screen";
};

const getSidebarClasses = () => {
  if (isMobile) return "hidden";
  if (isTablet) return "w-60 bg-muted/30 flex-shrink-0 overflow-hidden"; // Prevent shrinking
  return " sticky col-span-3 xl:col-span-3  ";
};


const getMainContentClasses = () => {
  if (isMobile) return "flex-1 relative overflow-auto"; // Handle content overflow
  if (isTablet) return "flex-1 min-w-0"; // Prevent content from overflowing
  return "col-span-9 xl:col-span-10";
};

  return (
    <PDFContext.Provider value={contextValue}>
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onReset={() => setIsLoading(true)}
      >
        <motion.div 
          className={`${getLayoutClasses()} w-full font-sans bg-background`}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {/* Desktop/Tablet Sidebar */}
<div className={getSidebarClasses()}>
  <div className="sticky top-0 h-screen overflow-y-auto  scrollbar-hide no-scrollbar">
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.2 }}
    >
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
    </motion.div>
  </div>
</div>

          {/* Mobile Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
            <ReportSettings 
              settings={settings}
              updateSetting={updateSetting} 
              resetSettings={resetSettings}
              setSettings={setSettings}
              toggleSetting={toggleSetting}
              updateQualitySetting={updateQualitySetting}
              downloadPDF={downloadPDF}
              isGenerating={isGenerating}
              mobileView
            />
          </Sidebar>

          {/* Main Content */}
          <motion.div 
            className={getMainContentClasses()}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          >
            <div className="h-full overflow-y-auto">
              <div className="p-4 md:p-6 lg:p-8">
                <motion.div 
                  ref={pdfContentRef}
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4 }}
                >
                  <ReportView 
                    patientData={memoizedPatientData} 
                    settings={settings} 
                    getImage={getImage} 
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Mobile Menu Button */}
          {isMobile && (
            <FloatingActionButton
              onClick={() => setSidebarOpen(true)}
              className="top-4 left-4"
              label="Open Settings"
            >
              <Menu className="h-6 w-6" />
            </FloatingActionButton>
          )}

          {/* Mobile Download Button */}
          {isMobile && (
            <FloatingActionButton
              onClick={downloadPDF}
              disabled={isGenerating}
              className="bottom-20 right-4"
              label="Download PDF"
            >
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : (
                  <motion.div
                    key="download"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <Download className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </FloatingActionButton>
          )}

          {/* Mobile Settings Sheet */}
          {isMobile && (
            <div className="fixed bottom-6 right-4 z-50">
              <Sheet>
                <SheetTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button 
                      size="icon" 
                      aria-label="Report Settings"
                      className="rounded-full h-14 w-14 shadow-lg focus:ring-2 focus:ring-primary"
                    >
                      <Settings className="h-6 w-6" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Report Settings</SheetTitle>
                  </SheetHeader>
                  <motion.div 
                    className="grid gap-4 py-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <ReportSettings 
                      settings={settings}
                      updateSetting={updateSetting} 
                      resetSettings={resetSettings}
                      setSettings={setSettings}
                      toggleSetting={toggleSetting}
                      updateQualitySetting={updateQualitySetting}
                      downloadPDF={downloadPDF}
                      isGenerating={isGenerating}
                      mobileView
                    />
                  </motion.div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </motion.div>
      </ErrorBoundary>
    </PDFContext.Provider>
  );
}