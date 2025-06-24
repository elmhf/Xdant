"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import MessageIcon from "@rsuite/icons/Message";
import useUpditeData from "../../JsFiles/UpditeData";

const AddComment = ({ idteeth }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { EditData } = useUpditeData();

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError(t("addComment.errorEmpty"));
      return;
    }

    setIsSubmitting(true);
    setError("");
    
    try {
      await EditData({ comment: comment.trim() }, idteeth);
      handleClose();
    } catch (error) {
      console.error("Error adding comment:", error);
      setError(t("addComment.errorSubmit"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComment("");
    setError("");
    setOpen(false);
  };

  const handleTextareaChange = (e) => {
    setComment(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  const isCommentValid = comment.trim().length > 0;
  const remainingChars = 1000 - comment.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 hover:bg-primary/5 transition-colors duration-200 border-primary/20 hover:border-primary/40"
        >
          <MessageIcon className="w-4 h-4" />
          {t("addComment.comment")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg mx-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-center">
            {t("addComment.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Textarea
              className={`min-h-[200px] resize-none border-2 transition-all duration-200 
                ${error 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-primary/50'
                } 
                ${isSubmitting ? 'opacity-50' : ''}
                text-sm leading-relaxed`}
              placeholder={t("addComment.placeholder")}
              value={comment}
              onChange={handleTextareaChange}
              maxLength={1000}
              disabled={isSubmitting}
            />
            
            {/* Character counter */}
            <div className={`absolute bottom-3 right-3 text-xs font-medium
              ${remainingChars < 50 
                ? 'text-orange-500' 
                : remainingChars < 20 
                  ? 'text-red-500' 
                  : 'text-gray-400'
              }`}>
              {remainingChars}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Helper text */}
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            {t("addComment.helper")}
          </div>
        </div>

        <DialogFooter className="gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            {t("addComment.cancel")}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!isCommentValid || isSubmitting}
            className={`flex-1 font-medium transition-all duration-200 
              ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md'
              }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("addComment.submitting")}
              </div>
            ) : (
              t("addComment.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddComment;