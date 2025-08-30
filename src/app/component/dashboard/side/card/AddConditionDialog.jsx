"use client";

import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useDentalStore } from '@/stores/dataStore';
import { toast } from "sonner";
import { PlusCircle, X, Save, RotateCcw } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RanderImagwithDrw from './problrms/RanderImagwithDrw';

// Available conditions for teeth
const availableConditions = [
  { value: "healthy", label: "Healthy", color: "bg-green-100 text-green-700" },
  { value: "caries", label: "Caries", color: "bg-orange-100 text-orange-700" },
  { value: "filling", label: "Filling", color: "bg-blue-100 text-blue-700" },
  { value: "crown", label: "Crown", color: "bg-purple-100 text-purple-700" },
  { value: "root_canal", label: "Root Canal", color: "bg-red-100 text-red-700" },
  { value: "missing", label: "Missing", color: "bg-gray-100 text-gray-700" },
  { value: "implant", label: "Implant", color: "bg-cyan-100 text-cyan-700" },
  { value: "bridge", label: "Bridge", color: "bg-indigo-100 text-indigo-700" },
  { value: "gingivitis", label: "Gingivitis", color: "bg-pink-100 text-pink-700" },
  { value: "periodontitis", label: "Periodontitis", color: "bg-rose-100 text-rose-700" }
];

const severityLevels = [
  { value: "very_mild", label: "Very Mild", color: "bg-green-100 text-green-700" },
  { value: "mild", label: "Mild", color: "bg-teal-100 text-teal-700" },
  { value: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-700" },
  { value: "severe", label: "Severe", color: "bg-orange-100 text-orange-700" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" }
];

const AddConditionDialog = ({ toothNumber, children }) => {
  const { t } = useTranslation();
  const { addToothProblem, updateTooth, getToothByNumber } = useDentalStore();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    condition: "",
    severity: "",
    description: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
    location: "",
    confidence: 0.95
  });
  // --- رسم/نقاط ---
  const [maskProblem, setmaskProblem] = useState([]);
  const [polygonPoints, setPolygonPoints] = useState([]);

  const tooth = getToothByNumber(toothNumber);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log(polygonPoints,"maskProblem")
    // Validate required fields
    if (!formData.condition) {
      toast.error(t("addCondition.selectConditionError") || "Please select a condition");
      return;
    }

    if (!formData.severity) {
      toast.error(t("addCondition.selectSeverityError") || "Please select severity level");
      return;
    }

    // Create the condition object
    const newCondition = {
      type: formData.condition,
      subtype: formData.location || "General",
      coordinates: {
        x: 0,
        y: 0
      },
      mask: polygonPoints,
      depth: "0mm",
      severity: formData.severity,
      confidence: formData.confidence,
      detectedAt: new Date().toISOString(),
      progression: "Initial",
      description: formData.description,
      notes: formData.notes,
      date: formData.date,
      images: []
    };

    try {
      // Add the condition to the tooth
      addToothProblem(toothNumber, newCondition);
      
      // Update tooth category if needed
      const selectedCondition = availableConditions.find(c => c.label.toLowerCase() === formData.condition.toLowerCase());
      if (selectedCondition) {
        updateTooth(toothNumber, {
          category: selectedCondition.label
        });
      } else {
        updateTooth(toothNumber, {
          category: formData.condition
        });
      }

      toast.success(t("addCondition.successMessage") || "Condition added successfully");
      handleReset();
      setOpen(false);
    } catch (error) {
      toast.error(t("addCondition.errorMessage") || "Failed to add condition");
      console.error("Error adding condition:", error);
    }
  };

  const handleReset = () => {
    setFormData({
      condition: "",
      severity: "",
      description: "",
      notes: "",
      date: new Date().toISOString().split('T')[0],
      location: "",
      confidence: 0.95
    });
    setmaskProblem([]);
    setPolygonPoints([]);
  };

  const selectedCondition = availableConditions.find(c => c.label.toLowerCase() === formData.condition.toLowerCase());
  const selectedSeverity = severityLevels.find(s => s.value === formData.severity);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="min-w-fit w-fit w-full rounded-2xl shadow-xl border border-gray-100 bg-white p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-2 border-b border-gray-100 bg-white">
          <DialogTitle className="text-lg font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-black/70" />
            {t("addCondition.title") || "Add Condition"} <span className="text-gray-400 font-normal">- Tooth {toothNumber}</span>
          </DialogTitle>
          <DialogClose asChild>
            <button className="rounded-full p-1 hover:bg-gray-100 transition"><X className="w-5 h-5 text-gray-400" /></button>
          </DialogClose>
        </div>
        {/* Main Content: صورة السن يمين، فورم يسار */}
        <div className="flex flex-col  sm:flex-row gap-6 sm:gap-8 px-4 sm:px-8 py-4 sm:py-8 bg-gray-50  overflow-y-auto">
          {/* صورة السن مع الرسم */}
          <div className="min-w-[300px]  sm:w-1/2  w-full order-2 sm:order-1 flex flex-col items-center mb-6 sm:mb-0">
            <Label className="block mb-2 text-sm font-medium text-gray-700">{t("addCondition.drawOnTooth") || "Mark/Draw on Tooth (optional)"}</Label>
            <div className="w-full h-fit rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex items-center justify-center">
              <RanderImagwithDrw maskPoints={tooth?.teeth_mask || []} polygonPoints={polygonPoints} setPolygonPoints={setPolygonPoints} />
            </div>
          </div>
          {/* الفورم */}
          <form className=" sm:w-1/2 w-full flex flex-col gap-6 order-1 sm:order-2 " onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
            {/* Condition Selection */}
            <div className="flex flex-col gap-1 min-w-0">
              <Label htmlFor="condition" className="text-sm font-medium text-gray-700 mb-1">
                {t("addCondition.condition") || "Condition"} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="condition"
                list="condition-list"
                className="h-12 rounded-xl border border-gray-200 bg-white focus:border-black focus:ring-0 shadow-sm px-4 text-base transition-all duration-150 placeholder-gray-400 w-full min-w-0"
                placeholder={t("addCondition.selectCondition") || "Select or type a condition"}
                value={formData.condition}
                onChange={e => handleInputChange('condition', e.target.value)}
                autoComplete="off"
              />
              <datalist id="condition-list">
                {availableConditions.map((condition) => (
                  <option key={condition.value} value={condition.label} />
                ))}
              </datalist>
              {formData.condition && (
                <Badge className={`mt-2 px-2 py-1 rounded-lg text-xs font-medium shadow ${selectedCondition ? selectedCondition.color : 'bg-gray-200 text-gray-700'}`}>
                  {formData.condition}
                </Badge>
              )}
            </div>
            {/* Severity Level */}
            <div className="flex flex-col gap-1 min-w-0">
              <Label htmlFor="severity" className="text-sm font-medium text-gray-700 mb-1">
                {t("addCondition.severity") || "Severity Level"} <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.severity} onValueChange={v => handleInputChange('severity', v)}>
                <SelectTrigger className="h-12 rounded-xl border border-gray-200 bg-white focus:border-black focus:ring-0 shadow-sm px-4 text-base transition-all duration-150 placeholder-gray-400 w-full min-w-0">
                  <SelectValue placeholder={t("addCondition.selectSeverity") || "Select severity level"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border border-gray-100">
                  <SelectGroup>
                    <SelectLabel className="text-xs text-gray-400">{t("addCondition.severityLevels") || "Severity Levels"}</SelectLabel>
                    {severityLevels.map((severity) => (
                      <SelectItem key={severity.value} value={severity.value} className="flex items-center gap-2 px-2 py-2 rounded-lg">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${severity.color}`}></span>
                        <span>{severity.label}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedSeverity && (
                <Badge className={`mt-2 px-2 py-1 rounded-lg text-xs font-medium shadow ${selectedSeverity.color}`}>{selectedSeverity.label}</Badge>
              )}
            </div>
            {/* Description */}
            <div className="flex flex-col gap-1 min-w-0">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1">
                {t("addCondition.description") || "Description"}
              </Label>
              <Textarea
                id="description"
                className="rounded-xl border border-gray-200 bg-white focus:border-black focus:ring-0 min-h-[80px] shadow-sm px-4 py-2 text-base transition-all duration-150 placeholder-gray-400 w-full min-w-0"
                placeholder={t("addCondition.descriptionPlaceholder") || "Describe the condition in detail..."}
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
            {/* Notes */}
            <div className="flex flex-col gap-1 min-w-0">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-1">
                {t("addCondition.notes") || "Additional Notes"}
              </Label>
              <Textarea
                id="notes"
                className="rounded-xl border border-gray-200 bg-white focus:border-black focus:ring-0 min-h-[60px] shadow-sm px-4 py-2 text-base transition-all duration-150 placeholder-gray-400 w-full min-w-0"
                placeholder={t("addCondition.notesPlaceholder") || "Any additional notes or observations..."}
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                rows={2}
              />
            </div>

          </form>
        </div>
        <DialogFooter className="px-4 sm:px-8 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-end gap-2 w-full flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="h-11 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 shadow w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              {t("addCondition.reset") || "Reset"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-11 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 shadow w-full sm:w-auto"
            >
              {t("addCondition.cancel") || "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="h-11 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 shadow-md hover:shadow-lg transition w-full sm:w-auto"
              disabled={!formData.condition || !formData.severity}
            >
              <Save className="w-4 h-4 mr-1" />
              {t("addCondition.save") || "Save Condition"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      
    </Dialog>
  );
};

export default AddConditionDialog; 