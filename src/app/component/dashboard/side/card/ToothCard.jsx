'use client'

import React, { useState, useEffect, useContext, memo } from "react";
import styles from './ToothCaard.module.css'
import RanderImages from "./problrms/randerImages";
import { DataContext } from "../../dashboard";
import { useTranslation } from "react-i18next";
import { useLayout } from "@/stores/setting";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare } from 'lucide-react';

const ToothDiagnosis = memo(({ item, idCard }) => {
  const { setToothNumberSelect } = useContext(DataContext);
  const { applyLayout } = useLayout();
  const [viewMode, setViewMode] = useState('grid');
  const { t } = useTranslation();

  const handleCardClick = () => {
    applyLayout('NEW_LAYOUT');
    setToothNumberSelect(idCard);
  };
  
  const ProblemTags = ({ problems }) => {
    if (!problems || problems.length === 0) {
      return (
        <span className={`${styles.tag} ${styles.noProblemTag}`}>
          {t("side.card.NoProblemsDetected")}
        </span>
      );
    }
  
    // Combine all tags into a single array
    const allTags = problems.flatMap(p => [
      p.type, 
      ...(p.tags || [])
    ]);
  
    return allTags.map((tag, index) => {
      const tagKey = `${idCard}-tag-${index}`;
      // Basic logic to alternate colors, can be improved
      const tagStyle = index % 2 === 0 ? styles.tagPurple : styles.tagRed;
      return (
        <span key={tagKey} className={`${styles.tag} ${tagStyle}`}>
          {tag}
        </span>
      );
    });
  };

  const hasProblems = item.problems && item.problems.length > 0;

  return (
    <div className={styles.cardWrapper} >
      <div className={styles.cardHeader}>
        <div className={styles.toothInfo}>
          <h2 className={styles.toothTitle}>{t('side.card.Tooth')} {item.toothNumber}</h2>
          <span className={styles.toothMeta}>{item.roots || 2} roots</span>
          <span className={styles.toothMeta}>{item.canals || 3} canals</span>
        </div>
        {/* Optional: Add a button or icon here if needed */}
      </div>

      <div className={styles.tagsContainer}>
        <ProblemTags problems={item.problems} />
      </div>

      {hasProblems && (
        <div className={styles.galleryContainer}>
          <RanderImages teeth={item} />
        </div>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.footerActions}>
          <Button variant="outline" className={styles.actionButton}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {t('side.card.Condition')}
          </Button>
          <Button variant="outline" className={styles.actionButton}>
            <MessageSquare className="w-4 h-4 mr-2" />
            {t('side.card.Comment')}
          </Button>
        </div>
        <div className={styles.footerStatus}>
          <span className={styles.statusText}>{t('side.card.Slices')}</span>
          <span className={styles.statusBadge}>{t('side.card.Approved')}</span>
        </div>
      </div>
    </div>
  );
});

export default ToothDiagnosis;