'use client'

import React, { useState, useEffect, memo, useRef } from "react";
import RenderAllSlices from "./randerSlice";
import { useTranslation } from "react-i18next";
import { useLayout } from "@/stores/setting";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare } from 'lucide-react';
import AddConditionDialog from './AddConditionDialog';
import { useDentalStore } from '@/stores/dataStore';
import { Badge } from "@/components/ui/badge";
import { useRouter, usePathname } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

const ToothDiagnosis = memo(({
  idCard,
  setToothNumberSelect = () => { },
  isSelected,
  showDiagnosisDetails,
  layoutKey,
  ToothSlicemode = false,
  isDragging = false,
  sliceDrager,
  // ✅ وقت السحب
}) => {
  const { applyLayout } = useLayout();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const tooth = useDentalStore(state => state.getToothByNumber(idCard));
  const updateToothApproval = useDentalStore(state => state.updateToothApproval);
  const isCbct = useDentalStore(state => state.isCbct());

  const isApproved = tooth?.approved;
  const roots = tooth?.roots ?? 0;
  const canals = tooth?.canals ?? 0;
  const notes = (tooth?.notes || []).filter(n => n.text && n.text.trim() !== '');

  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editText, setEditText] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);

  const cardRef = useRef(null);
  const [isReallyCompact, setIsReallyCompact] = useState(false);
  const [isExtraCompact, setIsExtraCompact] = useState(false);

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

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const noteData = {
      text: newNote,
      date: new Date().toISOString()
    };

    useDentalStore.getState().addToothNote(idCard, noteData);
    setNewNote('');
    setShowCommentBox(false);
  };

  const ProblemTags = ({ problems }) => {
    if (!problems || problems.length === 0) {
      return (
        <span className="text-xs font-medium px-3 py-2 rounded-md whitespace-nowrap border-2 border-gray-200 bg-white text-black">
          {t("side.card.NoProblemsDetected")}
        </span>
      );
    }

    return problems.map((p, index) => {
      const confidenceDisplay = p.confidence ? ` ${Math.round(p.confidence * 100)}%` : '';
      const tagText = `${p.type}${confidenceDisplay}`;
      const tagKey = `${idCard}-problem-${index}`;

      // Determine style based on problem type or severity if needed, 
      // currently alternating colors based on index as per original code
      const tagStyle = index % 2 === 0
        ? "bg-[#EDEBFA] text-[#5241cc]"
        : "bg-red-100 text-red-700";

      return (
        <React.Fragment key={tagKey}>
          <span className={`text-xs font-medium px-3 py-2 rounded-md whitespace-nowrap ${tagStyle}`}>
            {tagText}
          </span>
          {/* Render additional tags if any, without confidence for now as they are likely secondary */}
          {p.tags && p.tags.map((extraTag, extraIndex) => (
            <span key={`${tagKey}-extra-${extraIndex}`} className={`text-xs font-medium px-3 py-2 rounded-md whitespace-nowrap ${tagStyle}`}>
              {extraTag}
            </span>
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <div
      onClick={() => setToothNumberSelect(idCard)}
      ref={cardRef}
      className={`bg-white justify-between border-3 min-h-fit rounded-xl transition-all duration-200 flex flex-col w-full p-[1vw] 
        ${isReallyCompact ? 'p-2 text-[0.85rem] [&_*]:text-[0.85rem] [&_button]:text-[0.7rem] [&_button]:px-2 [&_button]:py-1 [&_button]:min-w-7 [&_button]:h-7 [&_button_svg]:w-4 [&_button_svg]:h-4' : ''} 
        ${isExtraCompact ? 'text-[0.7rem] [&_*]:text-[0.7rem] [&_button]:text-[0.6rem] [&_button]:px-1 [&_button]:py-0.5 [&_button]:min-w-5 [&_button]:h-5 [&_button_svg]:w-3 [&_button_svg]:h-3' : ''} 
        ${isSelected ? 'border-2 border-[#5241cc] shadow-lg' : 'border-2 border-gray-200 hover:border-gray-300 '}`}
      id={`Tooth-Card-${idCard}`}
      style={{ boxSizing: 'border-box' }}
    >

      <>
        {/* ===== Header ===== */}
        <div className="flex justify-between items-center ">
          <div className="flex items-center gap-2">
            <h2 className="text-[1.8rem] font-bold text-gray-900 m-0">
              {t('side.card.Tooth')} {idCard}
            </h2>


            <>
              <spam className="text-md font-medium border-[1px] border-gray-100 rounded-md px-2 py-1 text-black bg-transparent ">
                {roots} roots
              </spam>
              <spam className="text-md font-medium border-[1px] border-gray-100 rounded-md px-2 py-1 text-black bg-transparent " >
                {canals} canals
              </spam>
            </>

          </div>
        </div>

        {/* ✅ tags */}

        <div className="flex flex-wrap gap-1 mb-2">
          <ProblemTags problems={tooth?.problems} />
        </div>


        {/* ===== Images ===== */}
        {showDiagnosisDetails && tooth && (
          <div className="mb-2 min-h-fit">
            {isCbct && (
              <>
                <RenderAllSlices teeth={tooth} isDragging={isDragging} ToothSlicemode={ToothSlicemode} sliceDrager={sliceDrager} />
              </>
            )}
          </div>
        )}

        {/* ===== Footer actions ===== */}
        <div className="flex justify-between items-end pt-4 border-t border-gray-100">
          <div className="flex gap-3 w-full flex-wrap ">
            <AddConditionDialog toothNumber={idCard}>
              <Button variant="outline" size="sm" className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-[#0d0c22] flex items-center">
                <PlusCircle className="w-4 h-4 mr-2" />
                {t('side.card.Condition')}
              </Button>
            </AddConditionDialog>

            <Button
              variant="outline"
              size="sm"
              className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentBox(v => !v);
              }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('side.card.Note')}
            </Button>
          </div>

          <div className="ml-auto flex gap-2 ">
            {isCbct && !ToothSlicemode && (
              <Button
                variant="outline"
                size="sm"
                className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 flex items-center ml-2"
                onClick={() => {
                  router.push(`${pathname}/ToothSlice/${idCard}`);
                }}
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

        {/* Add Note Input */}
        {showCommentBox && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <Textarea
              placeholder={t('side.card.NotePlaceholder') || 'Add a note...'}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full min-h-[80px] mb-2 bg-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleAddNote();
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCommentBox(false);
                  setNewNote('');
                }}
              >
                {t('side.card.Cancel') || 'Cancel'}
              </Button>
              <Button
                size="sm"
                className="bg-[#0d0c22] text-white hover:bg-gray-900"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                {t('side.card.AddNote') || 'Add Note'}
              </Button>
            </div>
          </div>
        )}

        {/* Notes */}
        {notes.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 w-full">
            {notes.slice(0, showAllNotes ? notes.length : 3).map((n, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-base text-gray-800">
                {editIdx === idx ? (
                  <>
                    <textarea
                      className="w-full min-h-[200px] border rounded-lg p-2"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!editText.trim()) {
                            useDentalStore.getState().deleteToothNote(idCard, idx);
                          } else {
                            useDentalStore.getState().updateToothNote(idCard, idx, { text: editText });
                          }
                          setEditIdx(null);
                          setEditText('');
                        }}
                        className="bg-[#0d0c22] text-white"
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditIdx(null)}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
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
                    className="cursor-pointer break-words line-clamp-4"
                    title={n.text}
                  >
                    {n.text}
                  </div>
                )}
              </div>
            ))}

            {notes.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-gray-600 hover:text-[#0d0c22] w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllNotes(!showAllNotes);
                }}
              >
                {showAllNotes ? `Show less` : `Show ${notes.length - 3} more note${notes.length - 3 > 1 ? 's' : ''}`}
              </Button>
            )}
          </div>
        )}
      </>

    </div>
  );
});

export default ToothDiagnosis;
