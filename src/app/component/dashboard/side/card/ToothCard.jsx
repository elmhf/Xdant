'use client'

import React, { useState, useEffect, useContext, memo, useRef, useLayoutEffect } from "react";
import styles from './ToothCaard.module.css'
import RanderImages from "./problrms/randerImages";
import { useTranslation } from "react-i18next";
import { useLayout } from "@/stores/setting";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare, StickyNote, Eye, EyeOff } from 'lucide-react';
import AddConditionDialog from './AddConditionDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import AddCommentDialog from './AddCommentDialog';
import { Dialog as Modal, DialogTrigger as ModalTrigger, DialogContent as ModalContent } from "@/components/ui/dialog";
import { useDentalStore } from '@/stores/dataStore';
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const ToothDiagnosis = memo(({ idCard, setToothNumberSelect, isSelected, showImage, onToggleImage, showDiagnosisDetails, layoutKey }) => {
  const { applyLayout } = useLayout();
  const [viewMode, setViewMode] = useState('grid');
  const { t } = useTranslation();
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [note, setNote] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = [
    t("side.card.suggestion1") || "Let's emphasize this ",
    t("side.card.suggestion2") || "I like this one",
    t("side.card.suggestion3") || "Make this less prominent",
    t("side.card.suggestion4") || "Let's remove this one"
  ];
  const textareaRef = useRef(null);
  
  // جلب roots و canals من الستور - Move this to the top
  const tooth = useDentalStore(state => state.getToothByNumber(idCard));
  
  const hasProblems = tooth?.problems && tooth.problems.length > 0;
  const imagesCount = tooth?.images?.length || (tooth?.problems?.flatMap(p => p.images || []).length) || 0;
  const [showAllImages, setShowAllImages] = useState(false);
  const MAX_GALLERY_HEIGHT = 180;
  const galleryRef = useRef(null);
  const [galleryOverflow, setGalleryOverflow] = useState(false);
  const updateToothApproval = useDentalStore(state => state.updateToothApproval);
  const isApproved = tooth?.approved;
  const [isCompact, setIsCompact] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);
  const actionsRef = useRef(null);
  const buttonRefs = useRef([]);
  const footerActionsRef = useRef(null);
  const [smallFont, setSmallFont] = useState(false);
  const cardRef = useRef(null);
  const [isReallyCompact, setIsReallyCompact] = useState(false);
  const [isExtraCompact, setIsExtraCompact] = useState(false);
  const router = useRouter();
  const roots = tooth?.roots ?? 0;
  const canals = tooth?.canals ?? 0;
  const notes = (tooth?.notes || []).filter(n => n.text && n.text.trim() !== '');
  const [editIdx, setEditIdx] = useState(null);
  const [editText, setEditText] = useState('');

  // actions array
  const actions = [
    {
      key: 'condition',
      element: (
        <AddConditionDialog toothNumber={idCard}>
          <Button variant="outline" className={styles.actionButton}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {t('side.card.Condition')}
          </Button>
        </AddConditionDialog>
      )
    },
    {
      key: 'note',
      element: (
        <AddCommentDialog
          trigger={
            <Button variant="outline" className={styles.actionButton}>
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('side.card.Note')}
            </Button>
          }
          toothInfo={{ toothNumber: idCard }}
          onSend={({ note, file }) => {
            useDentalStore.getState().addToothNote(idCard, { text: note, file });
          }}
          placeholder={t('side.card.NotePlaceholder') || 'Add a note...'}
          buttonText={t('side.card.SendNote') || 'Send Note'}
          title={t('side.card.AddNote') || 'Add Note'}
        />
      )
    }
  ];

  useEffect(() => {
    if (galleryRef.current) {
      setGalleryOverflow(galleryRef.current.scrollHeight > MAX_GALLERY_HEIGHT);
    }
  }, [tooth]);

  useEffect(() => {
    const handleResize = () => {
      if (actionsRef.current) {
        setIsCompact(actionsRef.current.offsetWidth < 400);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!actionsRef.current) return;
      const containerWidth = actionsRef.current.offsetWidth;
      let used = 0;
      let count = 0;
      for (let i = 0; i < actions.length; i++) {
        const btn = buttonRefs.current[i];
        if (!btn) continue;
        used += btn.offsetWidth;
        if (used > containerWidth - 50) break;
        count++;
      }
      setVisibleCount(count);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [actions.length]);

  useEffect(() => {
    const handleResize = () => {
      if (footerActionsRef.current) {
        setSmallFont(footerActionsRef.current.offsetWidth <= 300);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const observer = new window.ResizeObserver(([entry]) => {
      setIsReallyCompact(layoutKey === 'XRAY_SIDE' || entry.contentRect.width < 400);
      setIsExtraCompact(entry.contentRect.width < 300);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [layoutKey]);

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

  const handleSuggestion = (text) => {
    setNote(text);
    setShowSuggestions(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSend = () => {
    // هنا يمكنك حفظ الملاحظة أو إرسالها
    setNote("");
    setShowSuggestions(false);
  };

  const isCbct = useDentalStore(state => state.isCbct());

  return (
    <div
    onClick={()=>setToothNumberSelect(idCard)}
      ref={cardRef}
      className={`bg-white border-3  rounded-xl transition-all duration-200 flex flex-col w-full p-[1vw] ${isReallyCompact ? styles.compactCard : ''} ${isExtraCompact ? styles.extraCompactCard : ''} ${isSelected ? 'border-2 border-[#5241cc] shadow-lg' : 'border-2 border-gray-200 hover:border-gray-300 '}`}
      id={`Tooth-Card-${idCard}`}
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex justify-between items-center ">
        <div className="flex items-center gap-2">
          <h2 className="text-[1.5rem] font-bold text-gray-900 m-0">{t('side.card.Tooth')} {idCard}</h2>
          <Badge className="text-xs custom-badge" style={{ backgroundColor: '#E5E7EB', color: '#4B5563' }}>{roots} roots</Badge>
          <Badge className="text-xs custom-badge" style={{ backgroundColor: '#E5E7EB', color: '#4B5563' }}>{canals} canals</Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <ProblemTags problems={tooth?.problems} />
      </div>

      {/* Conditionally show RanderImages with heading for pano */}
      {showDiagnosisDetails && tooth && (
        <div className="mb-2">
          {isCbct && (
            <RanderImages teeth={tooth} />
          )}
          
        </div>
      )}

      <div className="flex justify-between items-end pt-4 border-t border-gray-100">
        <div className="flex gap-3 w-full flex-wrap ">
         
          <AddConditionDialog toothNumber={idCard}>
            <Button variant="outline" size="sm" className="text-sm font-medium   transition-all duration-150 px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-black flex items-center">
              <PlusCircle className="w-4 h-4 mr-2" />
              {t('side.card.Condition')}
            </Button>
          </AddConditionDialog>
          <Button
            variant="outline"
            size="sm"
            className="text-sm font-medium transition-all duration-150 px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 flex items-center"
            onClick={() => setShowCommentBox(v => !v)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {t('side.card.Note')}
          </Button>
          {showCommentBox && (
            <div className="w-full mt-2">
              <textarea
                className="w-full text-l font-medium min-h-[80px] border rounded-lg p-2"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={t('side.card.NotePlaceholder') || 'Add a note...'}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => {
                    if (!note.trim()) return;
                    useDentalStore.getState().addToothNote(idCard, { text: note });
                    setNote("");
                    setShowCommentBox(false);
                  }}
                  className="bg-black text-white"
                >
                  {t('side.card.SendNote') || 'Send Note'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCommentBox(false)}
                >
                  {t('side.card.Cancel') || 'Cancel'}
                </Button>
              </div>
            </div>
          )}
          {/* عرض التعليقات */}
    
        </div>
        <div className="ml-auto flex gap-2 ">
          {isCbct && (
                   <Button
            variant="outline"
            size="sm"
            className="text-sm font-medium transition-all duration-150 px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 flex items-center ml-2"
            onClick={() => router.push(`ToothSlice/${idCard}`)}
          >
            Slice
          </Button>
          )}
   
    
          <Button
            variant={isApproved ? "success" : "outline"}
            size="sm"
            className="text-sm font-medium bg-white border border-gray-300 shadow-sm transition-all duration-150 px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 flex items-center min-w-[6vw] font-semibold"
            style={{ color: isApproved ? '#16a34a' : undefined }}
            onClick={() => updateToothApproval(idCard, !isApproved)}
          >
            {isApproved ? "Approved" : "Approve"}
          </Button>
        </div>
      </div>
            {notes.length > 0 && (
                <div className="flex flex-col gap-2 mt-4 w-full">
                  {notes.map((n, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-base text-gray-800">
                      {editIdx === idx ? (
                        <>
                          <textarea
                            className="w-full min-h-[60px] border rounded-lg p-2"
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              onClick={() => {
                                if (!editText.trim()) {
                                  useDentalStore.getState().deleteToothNote(idCard, idx);
                                } else {
                                  useDentalStore.getState().updateToothNote(idCard, idx, { text: editText });
                                }
                                setEditIdx(null);
                                setEditText('');
                              }}
                              className="bg-black text-white"
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditIdx(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                useDentalStore.getState().deleteToothNote(idCard, idx);
                                setEditIdx(null);
                                setEditText('');
                              }}
                              className="text-red-500"
                            >
                              Remove
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={() => { setEditIdx(idx); setEditText(n.text); }}
                          className="cursor-pointer break-words whitespace-pre-line max-h-32 overflow-y-auto flex-1"
                        >
                          {n.text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
    </div>
  );
});

export default ToothDiagnosis;