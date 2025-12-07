'use client'

import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { Loader2, Smile, Check } from "lucide-react";
import TextEditor from "@/components/ui/TextEditor";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDentalStore } from '@/stores/dataStore';
import { DataContext } from "../dashboard";
import ToothDiagnosis from "./card/ToothCard";
import { Switch } from '@/components/ui/switch';
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const translationKeys = {
  loadingDentalChart: 'side.loadingDentalChart',
  noMatchingTeethFound: 'side.noMatchingTeethFound',
  Print: 'side.Print'
};

const SideCardes = ({ layoutKey, toothNumberSelect, setToothNumberSelect }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedTeeth } = useContext(DataContext);
  const { data: dentalData, setConclusion: setConclusionStore, getConclusionUpdatedAt, updateToothApproval } = useDentalStore();
  const [isLoading, setIsLoading] = useState(true);
  const [visibleImages, setVisibleImages] = useState({});
  const [showDiagnosisDetails, setShowDiagnosisDetails] = useState(true);
  const [conclusion, setConclusion] = useState("");
  const [isConclusionSaved, setIsConclusionSaved] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [unapprovedTeeth, setUnapprovedTeeth] = useState([]);
  const pathname = usePathname();

  // Load conclusion from store
  useEffect(() => {
    if (dentalData?.conclusion) {
      setConclusion(dentalData.conclusion);
      setIsConclusionSaved(true);
    }
  }, [dentalData?.conclusion]);

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

  // Get unapproved teeth
  const getUnapprovedTeeth = useCallback(() => {
    if (!dentalData?.teeth) return [];
    return dentalData.teeth.filter(tooth => !tooth.approved);
  }, [dentalData]);

  // Handle validate and sign click
  const handleValidateClick = useCallback(() => {
    const unapproved = getUnapprovedTeeth();
    if (unapproved.length > 0) {
      setUnapprovedTeeth(unapproved);
      setShowApproveDialog(true);
    } else {
      // All teeth already approved, proceed with signing
      console.log('All teeth approved, proceeding with signing');
    }
  }, [getUnapprovedTeeth]);

  // Approve all teeth
  const handleApproveAll = useCallback(() => {
    unapprovedTeeth.forEach(tooth => {
      updateToothApproval(tooth.toothNumber, true);
    });
    setShowApproveDialog(false);
    console.log('All teeth approved and signed');
  }, [unapprovedTeeth, updateToothApproval]);

  // Check if all teeth are approved
  const allTeethApproved = useMemo(() => {
    if (!dentalData?.teeth || dentalData.teeth.length === 0) return false;
    return dentalData.teeth.every(tooth => tooth.approved);
  }, [dentalData]);

  return (
    <div className="flex no-scrollbar  flex-col h-auto lg:h-full bg-transparent from-gray-50 to-white">


      {/* Tooth Cards List & Conclusion */}
      <div
        className={
          layoutKey === 'XRAY_SIDE'
            ? 'flex-1 px-0 py-2 flex flex-col gap-2 bg-transparent scrollbar-hide overflow-visible lg:overflow-y-auto'
            : 'flex-1 no-scrollbar overflow-visible lg:overflow-y-auto'
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

            {/* Conclusion Card - Scrolls with content */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mt-4 mb-4">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Conclusion</h3>

              {!isConclusionSaved ? (
                <>
                  <div className="mb-3">
                    <TextEditor
                      value={conclusion}
                      onChange={setConclusion}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="text-lg font-bold bg-[#EBE8FC] border text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-lg  flex items-center min-w-[6vw] "
                      onClick={() => {
                        console.log('Save conclusion:', conclusion);
                        setConclusionStore(conclusion);
                        setIsConclusionSaved(true);
                      }}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="prose prose-sm max-w-none mb-3 text-gray-700 min-h-[60px]"
                    dangerouslySetInnerHTML={{ __html: conclusion }}
                  />
                  {dentalData?.conclusionUpdatedAt && (
                    <div className="text-xs text-gray-500 mb-3">
                      Dernière modification: {new Date(dentalData.conclusionUpdatedAt).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-lg font-bold bg-[#EBE8FC] border text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-lg  flex items-center min-w-[6vw] "
                      onClick={() => setIsConclusionSaved(false)}
                    >
                      Modifier
                    </Button>
                  </div>
                </>
              )}
            </div>
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

      {/* Fixed Actions Footer */}

      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col gap-3">
        {allTeethApproved ? (
          // All teeth approved - show Diagnosis details and Print button
          <>
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm text-gray-700">Diagnosis details</span>
              <Switch
                checked={showDiagnosisDetails}
                onCheckedChange={setShowDiagnosisDetails}
                className="data-[state=checked]:bg-indigo-500"
                id="diagnosis-details-switch"
              />
            </div>

            <Button
              className="w-full bg-[#7564ed] text-white py-6 text-lg font-semibold rounded-xl gap-2 shadow-lg shadow-purple-200"
              onClick={handlePDFReportViewsClick}
            >
              Print report
            </Button>
          </>
        ) : (
          // Not all teeth approved - show Print without signature and Diagnosis details in same row
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                onClick={handlePDFReportViewsClick}
                className="text-[#7564ed] text-md font-medium hover:underline text-left"
              >
                Print report without signature
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-gray-700">Diagnosis details</span>
                <Switch
                  checked={showDiagnosisDetails}
                  onCheckedChange={setShowDiagnosisDetails}
                  className="data-[state=checked]:bg-indigo-500"
                  id="diagnosis-details-switch"
                />
              </div>
            </div>

            <Button
              className="w-full bg-[#7564ed]  text-white py-6 text-lg font-semibold rounded-xl gap-2 shadow-lg shadow-purple-200"
              onClick={handleValidateClick}
            >
              <Check className="w-6 h-6" />
              Valider tout et signer
            </Button>
          </>
        )}
      </div>

      {/* Approval Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Confirmer l'approbation</DialogTitle>
            <DialogDescription className="text-gray-600">
              Les dents suivantes ne sont pas encore approuvées. Voulez-vous les approuver toutes ?
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[300px] overflow-y-auto my-4">
            <div className="grid grid-cols-6 gap-2">
              {unapprovedTeeth.map((tooth) => (
                <div
                  key={tooth.toothNumber}
                  className="flex items-center justify-center p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <span className="text-sm font-semibold text-amber-900">
                    {tooth.toothNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              className="border-gray-300"
            >
              Annuler
            </Button>
            <Button
              onClick={handleApproveAll}
              className="bg-[#7564ed] hover:bg-[#6454d7] text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Approuver tout ({unapprovedTeeth.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default React.memo(SideCardes);
