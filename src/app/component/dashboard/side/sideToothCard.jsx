'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef, useContext } from "react";
import { X, Loader2, Smile, RotateCcw, Filter, Search, Star, Share2, MoreVertical, MessageCircle, Heart } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDentalStore } from '@/stores/dataStore';
import { DataContext } from "../dashboard";
import ToothDiagnosis from "./card/ToothCard";
import styles from './modern-side.module.css';

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
  clearSearch: 'side.clearSearch'
};

const SideCardes = () => {
  const { t, i18n } = useTranslation();
  const { ToothNumberSelect, seToothNumberSelect } = useContext(DataContext);
  const isRTL = i18n.language === 'ar';
  
  const [dentalChart, setDentalChart] = useState([]);
  const [filteredChart, setFilteredChart] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Get data from the real dental store
  const { data: dentalData, hasTeethData } = useDentalStore();
  const searchInputRef = useRef(null);

  // Process dental data
  const processedData = useMemo(() => {
    if (!dentalData?.teeth) return [];
    return dentalData.teeth.sort((a, b) => a.toothNumber - b.toothNumber);
  }, [dentalData]);

  // Initialize data
  useEffect(() => {
    setIsLoading(true);
    setDentalChart(processedData);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [processedData]);

  // Apply filters
  const applyFilters = useMemo(() => {
    let result = dentalChart;
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item => {
        return (
          item.problems?.some(p => p.type?.toLowerCase().includes(searchLower)) ||
          item.comments?.some(c => c.text?.toLowerCase().includes(searchLower)) ||
          item.toothNumber.toString().includes(searchTerm)
        );
      });
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(item => {
        switch (statusFilter) {
          case "approved":
            return item.Approve;
          case "problems":
            return item.problems?.length > 0;
          case "comments":
            return item.comments?.length > 0;
          default:
            return true;
        }
      });
    }
    
    return result;
  }, [dentalChart, statusFilter, searchTerm]);

  useEffect(() => {
    setFilteredChart(applyFilters);
  }, [applyFilters]);

  const handleResetFilters = useCallback(() => {
    setStatusFilter("all");
    setSearchTerm("");
    seToothNumberSelect(null);
  }, [seToothNumberSelect]);

  const hasActiveFilters = statusFilter !== "all" || searchTerm;

  // Filter options with counts
  const filterOptions = useMemo(() => [
    {
      value: "all",
      label: t(translationKeys.allTeeth),
      count: dentalChart.length
    },
    {
      value: "approved",
      label: t(translationKeys.approved),
      count: dentalChart.filter(item => item.Approve).length
    },
    {
      value: "problems",
      label: t(translationKeys.withIssues),
      count: dentalChart.filter(item => item.problems?.length > 0).length
    },
    {
      value: "comments",
      label: t(translationKeys.withNotes),
      count: dentalChart.filter(item => item.comments?.length > 0).length
    }
  ], [dentalChart, t]);

  return (
    <div className="flex no-scrollbar flex-col h-full bg-transparent from-gray-50 to-white">
      {/* Search Input + زر إظهار/إخفاء الفلاتر */}
      <div className="mb-3">
        <div className={showFilters ? styles.filterCard : ""}>
          <div className="flex items-center gap-2 mb-2">
            {showFilters && (
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
            )}
            {/* زر إظهار/إخفاء الفلاتر دائماً ظاهر */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-1.5 rounded-full ml-2 bg-black text-white text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-gray-900 transition-all duration-200 ${showFilters ? 'ring-2 ring-black/30' : ''}`}
              title="إظهار/إخفاء الفلاتر"
            >
              <Filter size={15} />
            </button>
          </div>
          {/* الفلاتر */}
          {showFilters && (
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
                  {/* أيقونة حسب الفلتر */}
                  {option.value === "all" && <Star size={15} />}
                  {option.value === "approved" && <Heart size={15} />}
                  {option.value === "problems" && <MessageCircle size={15} />}
                  {option.value === "comments" && <MessageCircle size={15} />}
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
          )}
        </div>
      </div>
      {/* قائمة الكروت */}
      <div className="flex-1 no-scrollbar overflow-y-auto  ">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-sm text-gray-600 animate-pulse">
              {t(translationKeys.loadingDentalChart)}
            </p>
          </div>
        ) : filteredChart.length > 0 ? (
          <div className="space-y-4">
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
                  className="transform-gpu"
                >
                  <ToothDiagnosis
                    item={tooth}
                    idCard={tooth.toothNumber}
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
            <div className="p-4 backdrop-blur-sm rounded-2xl mb-4">
              <Smile className="w-14 h-14 text-gray-300" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {t(translationKeys.noMatchingTeethFound)}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
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