'use client'
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from "react";
import styles from './side.module.css';
import dynamic from 'next/dynamic';
import { DataContext } from "../dashboard";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Smile, Filter, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';


const ToothDiagnosis = dynamic(() => import('./card/ToothCard'), {
  loading: () => (
    <div className={styles.cardSkeleton}>
      <div className={styles.skeletonContent} />
    </div>
  ),
  ssr: false
});

const SideCardes = () => {

  const { t } = useTranslation();
  const [dentalChart, setDentalChart] = useState([]);
  const [filteredChart, setFilteredChart] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filtersEnabled, setFiltersEnabled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  
  const { data, ToothEditData } = useContext(DataContext);
  const cardsListRef = useRef(null);
  const timeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  const processedData = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data.teeth) ? data.teeth : data;
  }, [data]);

  useEffect(() => {
    setIsLoading(true);
    setDentalChart(processedData);
    setFilteredChart(processedData);
    setFiltersEnabled(processedData.length > 0);
    
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [processedData]);

  const applyFilters = useCallback(() => {
    setIsFiltering(true);
    let result = dentalChart;
    
    if (filtersEnabled) {

      
if (searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  const length = ToothEditData.hestoriqData.length;
  const latestEntry = ToothEditData.hestoriqData[length - 1];
  const latestTeeth = latestEntry?.teeth || [];

  result = result.filter(item => {
    const toothData = latestTeeth.find(t => t.toothNumber === item.toothNumber);

    console.log(toothData, 'toothData');

    return (
      toothData?.problems?.some(p =>
        p.type.toLowerCase().includes(searchLower)
      ) ||
      toothData?.comments?.some(c =>
        c.text.toLowerCase().includes(searchLower)
      )
    );
  });
}

      
      if (statusFilter !== "all") {
        result = result.filter(item => {
          const toothData = ToothEditData?.toothEditData?.find(t => t.tooth == item.toothNumber);
          if (!toothData) return false;
          
          switch (statusFilter) {
            case "approved": return toothData.Approve;
            case "problems": return toothData.Problems?.length > 0;
            case "comments": return toothData.Comments?.length > 0;
            default: return true;
          }
        });
      }
    }
    
    setTimeout(() => setIsFiltering(false), 100);
    return result;
  }, [dentalChart, searchTerm, statusFilter, ToothEditData?.toothEditData, filtersEnabled]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFilteredChart(applyFilters());
    }, 300);
    return () => clearTimeout(timeoutRef.current);
  }, [applyFilters]);

  const handleCardClick = useCallback((toothNumber) => {
    setSelectedCard(toothNumber);
    const cardElement = document.getElementById(`TooTh-Card-${toothNumber}`);
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      
      // Add temporary highlight effect
      cardElement.classList.add(styles.highlightedItem);
      setTimeout(() => {
        cardElement.classList.remove(styles.highlightedItem);
      }, 1000);
    }
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => {
      const newState = !prev;
      if (newState && searchInputRef.current) {
        setTimeout(() => searchInputRef.current.focus(), 100);
      }
      return newState;
    });
  }, []);

  const renderItem = useCallback((item, index) => {
    const toothData = ToothEditData?.toothEditData?.find(t => t.tooth == item.toothNumber);
    const isSelected = selectedCard === item.toothNumber;
    
    return (
      <motion.div
        key={`${item.toothNumber}-${index}`}
        id={`TooTh-Card-${item.toothNumber}`}
        onClick={() => handleCardClick(item.toothNumber)}
        className={`${styles.listItem} ${isSelected ? styles.selectedItem : ''}`}
        role="button"
        tabIndex={0}
        aria-label={`Tooth ${item.toothNumber} card`}
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick(item.toothNumber)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.001 }}
        whileTap={{ scale: 0.98 }}
      >
        <ToothDiagnosis 
          idCard={`TooTh-Card-${item.toothNumber}`}
          item={item} 
          problems={toothData?.Problems || []}
          comments={toothData?.Comments || []}
          isSelected={isSelected}
        />
      </motion.div>
    );
  }, [selectedCard, ToothEditData, handleCardClick]);

  return (
    <div className={styles.sideCardsContainer} ref={cardsListRef}>
      <div className={styles.filterHeader}>
        <h2 className={styles.sectionTitle}>{t('side.dentalChart')}</h2>
        <motion.button 
          onClick={toggleFilters}
          className={`${styles.filterToggleButton} ${!filtersEnabled ? styles.disabledButton : ''}`}
          disabled={!filtersEnabled}
          aria-label={showFilters ? t('side.hideFilters') : t('side.showFilters')}
          whileHover={{ scale: filtersEnabled ? 1.05 : 1 }}
          whileTap={{ scale: filtersEnabled ? 0.95 : 1 }}
        >
          {showFilters ? (
            <>
              <X size={18} />
              <span>{t('side.hideFilters')}</span>
            </>
          ) : (
            <>
              <Filter size={18} />
              <span>{t('side.showFilters')}</span>
            </>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className={styles.filterControls}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.searchFilter}>
              <Label htmlFor="problem-search">{t('side.searchDentalIssues')}</Label>
              <motion.div
                className={styles.searchContainer}
                whileHover={{ boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)' }}
              >
                <Input
                  id="problem-search"
                  type="text"
                  placeholder={t('side.searchByProblemOrComment')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                  disabled={!filtersEnabled}
                  aria-describedby="search-help"
                  ref={searchInputRef}
                />
                {searchTerm && (
                  <motion.button
                    onClick={() => setSearchTerm('')}
                    className={styles.clearSearchButton}
                    aria-label={t('side.clearSearch')}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </motion.div>
            </div>
            
            <div className={styles.statusFilter}>
              <Label>{t('side.filterByStatus')}</Label>
              <ToggleGroup 
                type="single" 
                value={statusFilter}
                onValueChange={setStatusFilter}
                className={styles.toggleGroup}
                disabled={!filtersEnabled}
                aria-label="Tooth status filter"
              >
                <ToggleGroupItem value="all" aria-label="All teeth">
                  {t('side.allTeeth')}
                </ToggleGroupItem>
                <ToggleGroupItem value="approved" aria-label="Approved teeth">
                  {t('side.approved')}
                </ToggleGroupItem>
                <ToggleGroupItem value="problems" aria-label="Teeth with problems">
                  {t('side.withIssues')}
                </ToggleGroupItem>
                <ToggleGroupItem value="comments" aria-label="Teeth with comments">
                  {t('side.withNotes')}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.cardsList}>
        {isLoading ? (
          <motion.div
            className={styles.loadingState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className={styles.spinner} size={48} aria-hidden="true" />
            <p>{t('side.loadingDentalChart')}</p>
          </motion.div>
        ) : isFiltering ? (
          <motion.div
            className={styles.loadingState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className={styles.spinner} size={32} aria-hidden="true" />
            <p>{t('side.applyingFilters')}</p>
          </motion.div>
        ) : filteredChart.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`filtered-list-${filteredChart.length}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.cardsListInner}
            >
              {filteredChart.map(renderItem)}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Smile className={styles.emptyLogo} size={48} aria-hidden="true" />
            <h3>{filtersEnabled ? t('side.noMatchingTeethFound') : t('side.dataNotAvailable')}</h3>
            <p>{filtersEnabled ? t('side.adjustSearchOrFilter') : t('side.loadPatientToEnableFilters')}</p>
            {filtersEnabled && (
              <motion.button 
                onClick={handleResetFilters} 
                className={styles.resetButton}
                aria-label={t('side.resetAllFilters')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('side.resetAllFilters')}
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SideCardes);