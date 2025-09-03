'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef, useContext } from "react";
import { X, Loader2, Smile, RotateCcw, Filter, Search, Star, Share2, MoreVertical, MessageCircle, Heart, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDentalStore } from '@/stores/dataStore';
import { DataContext } from "../dashboard";
import ToothDiagnosis from "./card/ToothCard";
import styles from './modern-side.module.css';
import { Switch } from '@/components/ui/switch';
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
// import { Router } from "express"; // Remove this - it's for server-side Express, not Next.js client

// Translation keys for the component
const translationKeys = {
  dentalChart: 'side.dentalChart',
  filterByStatus: 'side.filterByStatus',
  allTeeth: 'side.allTeeth',
  approved: 'side.approved',
  withIssues: 'side.withIssues',
  withNotes: 'side.withNotes',
  loadingDentalChart: 'side.loadingDentalChart',
  noMatchingTeethFound: 'side.noMatchingTeethFound',
  adjustSearchOrFilter: 'side.adjustSearchOrFilter',
  resetAllFilters: 'side.resetAllFilters',
  searchByProblemOrComment: 'side.searchByProblemOrComment',
  clearSearch: 'side.clearSearch',
  orthogonalViews: 'side.orthogonalViews' // Add translation key
};

const SideCardes = ({ layoutKey, toothNumberSelect, setToothNumberSelect }) => {
  const { t, i18n } = useTranslation();
  const router = useRouter(); // Initialize router for navigation
  
  useEffect(() => {
    console.log(toothNumberSelect, "toothNumberSelect")
  }, [toothNumberSelect])
  
  // const { toothNumberSelect, setToothNumberSelect } = useContext(DataContext);
  const isRTL = i18n.language === 'ar';
  
  const { data: dentalData, hasTeethData } = useDentalStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = useRef(null);
  const [visibleImages, setVisibleImages] = useState({});
  const [showDiagnosisDetails, setShowDiagnosisDetails] = useState(true);
  const pathname = usePathname();
  // Handle OrthogonalViews button click
  const handleOrthogonalViewsClick = useCallback(() => {
    try {
      // Option 1: Navigate to a specific route
      router.push(`${pathname}/OrthogonalViews`);
      
      
    } catch (error) {
      console.error('Error navigating to OrthogonalViews:', error);
      // Fallback: you could show a toast notification or handle the error
    }
  }, [router, toothNumberSelect, statusFilter, searchTerm]);

  // فلترة الأسنان مباشرة من dentalData.teeth
  const filteredChart = useMemo(() => {
    let result = dentalData?.teeth || [];
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item =>
        (item.problems && item.problems.some(p => p.type?.toLowerCase().includes(searchLower))) ||
        (item.notes && item.notes.some(n => n.text?.toLowerCase().includes(searchLower))) ||
        item.toothNumber.toString().includes(searchTerm)
      );
    }
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(item => {
        switch (statusFilter) {
          case "approved":
            return item.approved === true;
          case "problems":
            return item.problems && item.problems.length > 0;
          case "notes":
            return item.notes && item.notes.length > 0;
          default:
            return true;
        }
      });
    }
    console.log('filteredChart:', result);
    return result;
  }, [dentalData, statusFilter, searchTerm]);

  // Loading state only on first load
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setStatusFilter("all");
    setSearchTerm("");
    setToothNumberSelect(null);
  }, [setToothNumberSelect]);

  const hasActiveFilters = statusFilter !== "all" || searchTerm;

  // Filter options with counts
  const filterOptions = useMemo(() => [
    {
      value: "all",
      label: t(translationKeys.allTeeth),
      count: dentalData?.teeth.length || 0
    },
    {
      value: "approved",
      label: t(translationKeys.approved),
      count: dentalData?.teeth.filter(item => item.approved).length || 0
    },
    {
      value: "problems",
      label: t(translationKeys.withIssues),
      count: dentalData?.teeth.filter(item => item.problems && item.problems.length > 0).length || 0
    },
    {
      value: "notes",
      label: t(translationKeys.withNotes),
      count: dentalData?.teeth.filter(item => item.notes && item.notes.length > 0).length || 0
    }
  ], [dentalData, t]);

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
      {/* العنوان وسويتش Diagnosis details وزر الفلتر في نفس السطر */}
      <div className="flex items-center justify-end gap-2 mb-2 px-2">
        <Button 
          onClick={handleOrthogonalViewsClick}
          variant="outline"
          className="transition-all duration-200 hover:bg-blue-50 hover:border-blue-200"
        >
          {t(translationKeys.orthogonalViews) || 'OrthogonalViews'}
        </Button>

        <span className="text-sm text-gray-700">Diagnosis details</span>
        <Switch
          checked={showDiagnosisDetails}
          onCheckedChange={setShowDiagnosisDetails}
          className="data-[state=checked]:bg-indigo-500"
          id="diagnosis-details-switch"
        />
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="ml-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          title="Show filters"
        >
          <Filter className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      
      {/* الفلاتر */}
      {showFilters && (
        <div className={styles.filterCard}>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t(translationKeys.searchByProblemOrComment)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-full bg-[#F7F7F8] border border-[#E5E7EB] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all shadow-sm focus:shadow-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#E5E7EB] hover:bg-[#D1D5DB] text-gray-500 rounded-full p-1.5 transition shadow-sm"
                  title={t(translationKeys.clearSearch)}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap  justify-start  mb-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200
                  ${statusFilter === option.value
                    ? 'bg-black text-white'
                    : 'bg-[#F7F7F8] text-gray-700 hover:bg-black hover:text-white'}
                `}
                style={{ border: 'none' }}
                title={option.label}
              >
                {option.value === "all" && <Star size={15} />}
                {option.value === "approved" && <Heart size={15} />}
                {option.value === "problems" && <MessageCircle size={15} />}
                {option.value === "notes" && <MessageCircle size={15} />}
                <span>{option.label}</span>
                <span className="text-xs font-semibold">{option.count}</span>
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold bg-black text-white rounded-full hover:bg-gray-900 transition-all justify-end duration-200 shadow-sm"
                style={{ border: 'none' }}
              >
                <RotateCcw size={15} />
                {t(translationKeys.resetAllFilters)}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* قائمة الكروت */}
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
            className="flex flex-col items-center justify-center h-64 text-center "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-4 backdrop-blur-sm rounded-2xl ">
              <Smile className="w-14 h-14 text-gray-300" />
            </div>
            <h3 className="text-base font-medium text-gray-900 ">
              {t(translationKeys.noMatchingTeethFound)}
            </h3>
            <p className="text-sm text-gray-500  max-w-sm">
              {t(translationKeys.adjustSearchOrFilter)}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold bg-black text-white rounded-full hover:bg-gray-900 transition-all duration-200 shadow-sm"
              >
                <RotateCcw size={15} />
                {t(translationKeys.resetAllFilters)}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SideCardes);