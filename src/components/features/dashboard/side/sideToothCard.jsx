'use client'

import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { Loader2, Smile } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDentalStore } from '@/stores/dataStore';
import { DataContext } from "../dashboard";
import ToothDiagnosis from "./card/ToothCard";
import { Switch } from '@/components/ui/switch';
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";

const translationKeys = {
  loadingDentalChart: 'side.loadingDentalChart',
  noMatchingTeethFound: 'side.noMatchingTeethFound',
  Print: 'side.Print'
};

const SideCardes = ({ layoutKey, toothNumberSelect, setToothNumberSelect }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedTeeth } = useContext(DataContext);
  const { data: dentalData } = useDentalStore();
  const [isLoading, setIsLoading] = useState(true);
  const [visibleImages, setVisibleImages] = useState({});
  const [showDiagnosisDetails, setShowDiagnosisDetails] = useState(true);
  const pathname = usePathname();

  const handlePDFReportViewsClick = useCallback(() => {
    try {
      router.push(`${pathname}/PDFReport`);
    } catch (error) {
      console.error('Error navigating to PDFReport:', error);
    }
  }, [router, pathname]);

  // Filter teeth based on selectedTeeth from tooth chart
  const filteredChart = useMemo(() => {
    let result = dentalData?.teeth || [];

    // Apply selectedTeeth filter
    if (selectedTeeth !== null) {
      result = result.filter(item => selectedTeeth.includes(item.toothNumber));
    }

    return result;
  }, [dentalData, selectedTeeth]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (toothNumberSelect) {
      const el = document.getElementById(`Tooth-Card-${toothNumberSelect}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [toothNumberSelect]);

  const handleToggleImage = (toothNumber) => {
    setVisibleImages((prev) => ({
      ...prev,
      [toothNumber]: !prev[toothNumber]
    }));
  };

  return (
    <div className="flex no-scrollbar p-1 flex-col h-full bg-transparent from-gray-50 to-white">
      {/* Header with Print button and Diagnosis details switch */}
      <div className="flex items-center justify-end gap-2 mb-2 px-2">
        <Button
          onClick={handlePDFReportViewsClick}
          variant="outline"
          className="transition-all duration-200 bg-[#7558db] text-white"
        >
          {t(translationKeys.Print) || 'Print'}
        </Button>

        <span className="text-sm text-gray-700">Diagnosis details</span>
        <Switch
          checked={showDiagnosisDetails}
          onCheckedChange={setShowDiagnosisDetails}
          className="data-[state=checked]:bg-indigo-500"
          id="diagnosis-details-switch"
        />
      </div>

      {/* Tooth Cards List */}
      <div
        className={
          layoutKey === 'XRAY_SIDE'
            ? 'flex-1 overflow-y-auto px-0 py-2 flex flex-col gap-2 bg-transparent scrollbar-hide'
            : 'flex-1 no-scrollbar overflow-y-auto'
        }
        style={layoutKey === 'XRAY_SIDE' ? { background: 'transparent' } : {}}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-sm text-gray-600 animate-pulse">
              {t(translationKeys.loadingDentalChart)}
            </p>
          </div>
        ) : filteredChart.length > 0 ? (
          <div className={layoutKey === 'XRAY_SIDE' ? 'flex flex-col gap-2' : 'space-y-4'}>
            <AnimatePresence mode="popLayout">
              {filteredChart.map((tooth) => (
                <motion.div
                  key={tooth.toothNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  layout
                >
                  <ToothDiagnosis
                    toothNumberSelect={toothNumberSelect}
                    setToothNumberSelect={setToothNumberSelect}
                    item={tooth}
                    idCard={tooth.toothNumber}
                    isSelected={toothNumberSelect == tooth.toothNumber}
                    showImage={!!visibleImages[tooth.toothNumber]}
                    onToggleImage={() => handleToggleImage(tooth.toothNumber)}
                    showDiagnosisDetails={showDiagnosisDetails}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center h-64 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-4 backdrop-blur-sm rounded-2xl">
              <Smile className="w-14 h-14 text-gray-300" />
            </div>
            <h3 className="text-base font-medium text-gray-900">
              {t(translationKeys.noMatchingTeethFound)}
            </h3>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SideCardes);
