"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, FileText } from "lucide-react";
import { useTranslation } from 'react-i18next';

const ReportComments = ({ description = "", onEdit }) => {
  const { t } = useTranslation('patient');
  const [desc, setDesc] = useState(description);
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(desc);

  const handleSave = () => {
    setDesc(tempValue);
    if (onEdit) onEdit(tempValue);
    setOpen(false);
  };

  return (
    <div className="bg-white p-3 min-h-[120px] rounded-2xl  border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-2xl font-bold text-gray-950">
          {t('comments.title')}
        </h3>

        <Button
          onClick={() => {
            setTempValue(desc);
            setOpen(true);
          }}
          className="p-0 text-[#7564ed] transition bg-transparent duration-150 ease-in-out rounded-full border-0  focus:outline-none"
        >

          <Pencil className="w-6 h-6 text-[#7564ed] stroke-2 " />

        </Button>
      </div>

      {desc && desc.trim() !== "" ? (
        <p className="text-gray-600 whitespace-pre-wrap break-words">{desc}</p>
      ) : (
        <div className="flex flex-col justify-center items-center py-2 space-y-2">
          <FileText className="w-8 h-8 text-[#7564ed]" />
          <p className="text-sm text-gray-400">{t('comments.noDescription')}</p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className=" w-4xl sm: rounded-2xl border-none shadow-xl p-4 bg-white">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-gray-900">
              {t('comments.title')}
            </DialogTitle>
          </DialogHeader>

          <Textarea
            value={tempValue || ""}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder={t('comments.placeholder')}
            className="min-h-[120px] mt-3 bg-white/80 border  rounded-2xl text-gray-800"
          />

          <DialogFooter className="flex justify-end gap-3 mt-5">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-gray-700 hover:text-gray-900"
            >
              {t('comments.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4   px-6 py-2 rounded-2xl shadow-md transition-all duration-200"
            >
              {t('comments.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportComments;
