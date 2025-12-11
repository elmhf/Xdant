"use client";

import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useDentalStore } from '@/stores/dataStore';
import { toast } from "sonner";
import { X, Save } from 'lucide-react';

import {
  Dialog,
  DialogContent,
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

import { Switch } from "@/components/ui/switch";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Available conditions for teeth
const availableConditions = [
  { value: "healthy", label: "Healthy" },
  { value: "caries", label: "Caries" },
  { value: "filling", label: "Filling" },
  { value: "crown", label: "Crown" },
  { value: "root_canal", label: "Root Canal" },
  { value: "missing", label: "Missing" },
  { value: "implant", label: "Implant" },
  { value: "bridge", label: "Bridge" },
  { value: "gingivitis", label: "Gingivitis" },
  { value: "periodontitis", label: "Periodontitis" }
];

const severityLevels = [
  { value: "very_mild", label: "Very Mild" },
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
  { value: "critical", label: "Critical" }
];

const AddConditionDialog = ({ toothNumber, children }) => {
  const { t } = useTranslation();
  const { addToothProblem, updateTooth } = useDentalStore();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    condition: "",
    severity: "",
    description: "",
    notes: "",
    targetProblem: true
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.condition) {
      toast.error(t("addCondition.selectConditionError") || "Please select a condition");
      return;
    }

    if (!formData.severity) {
      toast.error(t("addCondition.selectSeverityError") || "Please select severity level");
      return;
    }

    const newCondition = {
      type: formData.condition,
      subtype: "General",
      coordinates: { x: 0, y: 0 },
      mask: [],
      depth: "0mm",
      severity: formData.severity,
      confidence: 0.95,
      detectedAt: new Date().toISOString(),
      progression: "Initial",
      description: formData.description,
      notes: formData.notes,
      date: new Date().toISOString().split('T')[0],
      date: new Date().toISOString().split('T')[0],
      images: [],
      targetProblem: formData.targetProblem
    };

    try {
      addToothProblem(toothNumber, newCondition);

      const selectedCondition = availableConditions.find(c => c.label.toLowerCase() === formData.condition.toLowerCase());
      if (selectedCondition) {
        updateTooth(toothNumber, { category: selectedCondition.label });
      } else {
        updateTooth(toothNumber, { category: formData.condition });
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
      targetProblem: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className=" w-full rounded-2xl bg-white p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Add Condition - Tooth {toothNumber}
          </DialogTitle>
          <DialogClose asChild>
            <button className="rounded-lg p-2 hover:bg-gray-100 transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </DialogClose>
        </div>

        {/* Form */}
        <div className="px-8 pb-8">
          <form className="flex flex-col gap-5" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
            {/* Condition & Severity Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Condition */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="condition" className="text-sm font-medium text-gray-900">
                  Condition <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="condition"
                  list="condition-list"
                  className="h-12 rounded-lg  bg-white focus:border-gray-400 focus:ring-0 px-4 text-base text-gray-900 placeholder:text-gray-400"
                  placeholder="Select condition"
                  value={formData.condition}
                  onChange={e => handleInputChange('condition', e.target.value)}
                  autoComplete="off"
                />
                <datalist id="condition-list">
                  {availableConditions.map((condition) => (
                    <option key={condition.value} value={condition.label} />
                  ))}
                </datalist>
              </div>

              {/* Severity */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="severity" className="text-sm font-medium text-gray-900">
                  Severity Level <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.severity} onValueChange={v => handleInputChange('severity', v)}>
                  <SelectTrigger className="h-12 rounded-lg  bg-white focus:border-gray-400 focus:ring-0 px-4 text-base text-gray-900">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border border-gray-200 bg-white">
                    <SelectGroup>
                      {severityLevels.map((severity) => (
                        <SelectItem
                          key={severity.value}
                          value={severity.value}
                          className="px-3 py-2 text-gray-900 hover:bg-gray-50 cursor-pointer"
                        >
                          {severity.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Problem Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="target-problem"
                checked={formData.targetProblem}
                onCheckedChange={(checked) => handleInputChange('targetProblem', checked)}
              />
              <Label htmlFor="target-problem" className="text-sm font-medium text-gray-900 cursor-pointer">
                Target Problem? (Show on card)
              </Label>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-900">
                Description
              </Label>
              <Textarea
                id="description"
                className="rounded-lg  bg-white focus:border-gray-400 focus:ring-0 min-h-[100px] px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 resize-none"
                placeholder="Describe the condition in detail..."
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-900">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                className="rounded-lg  bg-white focus:border-gray-400 focus:ring-0 min-h-[80px] px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 resize-none"
                placeholder="Any additional notes or observations..."
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 h-12 rounded-lg  bg-white text-gray-700 hover:bg-gray-50 text-base font-medium"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="flex-1 h-12 rounded-lg bg-[#6366f1] text-white hover:bg-[#5558e3] text-base font-semibold shadow-lg shadow-[#6366f1]/30"
                disabled={!formData.condition || !formData.severity}
              >
                Add
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddConditionDialog;