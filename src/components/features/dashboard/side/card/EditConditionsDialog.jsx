"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useDentalStore } from '@/stores/dataStore';
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";
import { X, Search, Check, ChevronLeft, Plus, Save, Trash2, ChevronDown, ChevronUp, Pencil } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

// Definitions

const EditConditionsDialog = ({ toothNumber, children }) => {
    const { pushNotification } = useNotification();
    const { t } = useTranslation();

    const availableConditions = [
        { value: "healthy", label: t('conditions.healthy') },
        { value: "caries", label: t('conditions.caries') },
        { value: "filling", label: t('conditions.filling') },
        { value: "crown", label: t('conditions.crown') },
        { value: "root_canal", label: t('conditions.root_canal') },
        { value: "missing", label: t('conditions.missing') },
        { value: "implant", label: t('conditions.implant') },
        { value: "bridge", label: t('conditions.bridge') },
        { value: "gingivitis", label: t('conditions.gingivitis') },
        { value: "periodontitis", label: t('conditions.periodontitis') }
    ];

    const getToothByNumber = useDentalStore(state => state.getToothByNumber);
    const updateToothProblems = useDentalStore(state => state.updateToothProblems);
    const updateTooth = useDentalStore(state => state.updateTooth);

    const [open, setOpen] = useState(false);
    const [viewMode, setViewMode] = useState("LIST"); // LIST | ADD
    const [searchQuery, setSearchQuery] = useState("");
    const [problems, setProblems] = useState([]);

    // Add Form State
    const [formData, setFormData] = useState({
        condition: "",
        severity: "",
        description: "",
        notes: "",
        targetProblem: true,
        type: "Unhealthy" // Default
    });

    // Expand Details State
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);

    // Fetch problems
    useEffect(() => {
        if (open) {
            const tooth = getToothByNumber(toothNumber);
            if (tooth && tooth.problems) {
                const initializedProblems = tooth.problems.map(p => ({
                    ...p,
                    targetProblem: p.targetProblem !== false
                }));
                // Sort or process if needed
                setProblems(initializedProblems);
            } else {
                setProblems([]);
            }
            // Reset to list view on open
            setViewMode("LIST");
            setExpandedIndex(null);
            setEditingIndex(null);
            setFormData({
                condition: "",
                severity: "",
                description: "",
                notes: "",
                targetProblem: true,
                type: "Unhealthy"
            });
        }
    }, [open, toothNumber, getToothByNumber]);

    const handleToggleTargetProblem = (index) => {
        const newProblems = [...problems];
        newProblems[index] = {
            ...newProblems[index],
            targetProblem: !newProblems[index].targetProblem
        };
        setProblems(newProblems);
        updateToothProblems(toothNumber, newProblems);
    };

    const handleDeleteProblem = (index) => {
        const newProblems = problems.filter((_, i) => i !== index);
        setProblems(newProblems);
        updateToothProblems(toothNumber, newProblems);
        pushNotification('success', t('diagnosis.notifications.removed'));
    };

    const handleUpdateDetails = (index, field, value) => {
        const newProblems = [...problems];
        newProblems[index] = {
            ...newProblems[index],
            [field]: value
        };
        setProblems(newProblems);
        updateToothProblems(toothNumber, newProblems);
    };

    const handleEditProblem = (index) => {
        const problem = problems[index];
        setFormData({
            condition: problem.type || "",
            severity: "",
            description: problem.description || "",
            notes: problem.notes || "",
            targetProblem: problem.targetProblem,
            type: problem.conditionType || "Unhealthy",
            percentage: problem.confidence ? Math.round(problem.confidence * 100).toString() : "95"
        });
        setEditingIndex(index);
        setViewMode("ADD");
    };

    // --- ADD Logic ---
    const handleAddInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddSubmit = () => {
        if (!formData.condition) {
            pushNotification('error', t('diagnosis.notifications.selectCondition'));
            return;
        }

        const confidenceValue = formData.percentage ? Math.min(Math.max(parseFloat(formData.percentage), 0), 100) / 100 : 0.95;

        try {
            let newProblemsList;

            if (editingIndex !== null) {
                // Update existing
                newProblemsList = [...problems];
                const existing = newProblemsList[editingIndex];

                newProblemsList[editingIndex] = {
                    ...existing,
                    type: formData.condition,
                    confidence: confidenceValue,
                    conditionType: formData.type,
                    description: formData.description,
                    notes: formData.notes
                };
                pushNotification('success', t('diagnosis.notifications.updated'));
            } else {
                // Add new
                const newCondition = {
                    type: formData.condition,
                    subtype: "General",
                    coordinates: { x: 0, y: 0 },
                    mask: [],
                    depth: "0mm",
                    confidence: confidenceValue,
                    detectedAt: new Date().toISOString(),
                    date: new Date().toISOString().split('T')[0],
                    targetProblem: true,
                    conditionType: formData.type,
                    description: formData.description,
                    notes: formData.notes
                };
                newProblemsList = [...problems, newCondition];
                pushNotification('success', t('diagnosis.notifications.added'));
            }

            setProblems(newProblemsList);
            updateToothProblems(toothNumber, newProblemsList);

            // Update tooth category
            const selectedCondition = availableConditions.find(c => c.label.toLowerCase() === formData.condition.toLowerCase());
            if (selectedCondition) {
                updateTooth(toothNumber, { category: selectedCondition.label });
            } else {
                updateTooth(toothNumber, { category: formData.condition });
            }

            // Reset
            setFormData({
                condition: "",
                severity: "",
                description: "",
                notes: "",
                targetProblem: true,
                type: "Unhealthy"
            });
            setEditingIndex(null);
            setViewMode("LIST");
        } catch (error) {
            console.error(error);
            pushNotification('error', t('diagnosis.notifications.saveFailed'));
        }
    };

    // Filter list
    const filteredProblems = problems.filter(p =>
        (p.type || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[700px] w-full rounded-2xl bg-white p-0 overflow-hidden border-0 shadow-2xl">

                {/* === HEADER === */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        {viewMode === "ADD" && (
                            <button onClick={() => {
                                setEditingIndex(null);
                                setViewMode("LIST");
                            }} className="p-1 hover:bg-gray-100 rounded-full mr-1">
                                <ChevronLeft className="w-5 h-5 text-gray-500" />
                            </button>
                        )}
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {viewMode === "LIST"
                                ? t('diagnosis.title', { number: toothNumber })
                                : (editingIndex !== null ? t('diagnosis.editCondition') : t('diagnosis.addCondition'))}
                        </DialogTitle>
                    </div>

                </div>

                {/* === LIST VIEW === */}
                {viewMode === "LIST" && (
                    <>
                        <div className="px-6 py-4 space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('diagnosis.searchPlaceholder')}
                                    className="pl-9 h-10 rounded-xl bg-white "
                                />
                            </div>
                        </div>

                        <ScrollArea className="h-[350px] px-6 pb-6">
                            <div className="space-y-3">
                                {filteredProblems.length > 0 ? filteredProblems.map((p, index) => {
                                    // Determine style based on problem type (matching ToothCard)
                                    let tagStyle = "text-[#5241cc]"; // Default: purple
                                    const problemType = p.type?.toLowerCase() || '';

                                    if (problemType.includes('overfilling')) {
                                        tagStyle = "text-[#E11D48]"; // Pink/Red
                                    } else if (problemType.includes('adequate') || problemType.includes('density')) {
                                        tagStyle = "text-[#1E40AF]"; // Blue/DarkBlue
                                    }

                                    return (
                                        <div key={index} className="transition-all">
                                            <div className="flex items-center gap-3">
                                                {/* Checkbox for Visibility */}
                                                <div
                                                    className={`flex items-center justify-center w-[20px] h-[20px] rounded-[5px] border-2 cursor-pointer transition-all duration-200 ${p.targetProblem
                                                        ? "bg-[#715cfa] border-[#715cfa]"
                                                        : "border-black bg-transparent hover:border-[#715cfa]"
                                                        }`}
                                                    onClick={() => handleToggleTargetProblem(index)}
                                                >
                                                    {p.targetProblem && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <span className={`text-[15px] font-[500] whitespace-nowrap ${tagStyle} transition-colors`}>
                                                        {p.type}
                                                        {p.confidence && (
                                                            <span className="ml-1 opacity-80 text-[0.8em]">
                                                                {Math.round(p.confidence * 100)}%
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>


                                                <div className="flex items-center gap-1 ml-auto">
                                                    <button
                                                        onClick={() => handleEditProblem(index)}
                                                        className="p-1.5 text-gray-400 hover:text-[#7564ed] rounded-2xl transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProblem(index)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-2xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                    );
                                }) : (
                                    <div className="text-center py-10">
                                        <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Search className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <h3 className="text-gray-900 font-medium text-sm">{t('diagnosis.noConditions')}</h3>
                                        <p className="text-gray-500 text-xs mt-1">{t('diagnosis.addPrompt')}</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                            <Button
                                className="w-full bg-[#0d0c22] hover:bg-gray-900 text-white h-11 rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                                onClick={() => {
                                    setEditingIndex(null);
                                    setFormData({
                                        condition: "",
                                        severity: "",
                                        description: "",
                                        notes: "",
                                        targetProblem: true,
                                        type: "Unhealthy"
                                    });
                                    setViewMode("ADD");
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t('diagnosis.addNewButton')}
                            </Button>
                        </div>
                    </>
                )}

                {/* === ADD VIEW === */}
                {viewMode === "ADD" && (
                    <div className="p-8 flex flex-col">
                        <form className="flex-1 flex flex-col gap-8" onSubmit={e => { e.preventDefault(); handleAddSubmit(); }}>
                            <div className="flex-1 space-y-6 pt-2">
                                <div className="grid grid-cols-12 gap-6">
                                    {/* Row 1: Condition (8 cols) + Percentage (4 cols) */}
                                    <div className="col-span-8 flex flex-col gap-2">
                                        <Label htmlFor="condition" className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            {t('diagnosis.conditionLabel')} <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="condition"
                                            className="h-11 rounded-2xl  focus:border-[#7564ed] "
                                            value={formData.condition}
                                            onChange={e => handleAddInputChange('condition', e.target.value)}

                                        />
                                        <datalist id="condition-list">
                                            {availableConditions.map((condition) => (
                                                <option key={condition.value} value={condition.label} />
                                            ))}
                                        </datalist>
                                    </div>

                                    <div className="col-span-4 flex flex-col gap-2">
                                        <Label htmlFor="percentage" className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            {t('diagnosis.percentageLabel')} <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="percentage"
                                                type="number"
                                                min="0"
                                                max="100"
                                                className="h-11 rounded-2xl  focus:border-[#7564ed]  pr-8"
                                                placeholder="95"
                                                value={formData.percentage || ''}
                                                onChange={e => handleAddInputChange('percentage', e.target.value)}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{t('diagnosis.statusTypeLabel')}</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => handleAddInputChange('type', value)}
                                    >
                                        <SelectTrigger className="h-11 rounded-2xl bg-white border-1 border-gray-400 focus:border-[#7564ed] focus:ring-4 focus:ring-[#7564ed]/10 transition-all">
                                            <SelectValue placeholder={t('diagnosis.selectStatusPlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unhealthy">{t('diagnosis.statusUnhealthy')}</SelectItem>
                                            <SelectItem value="Treated">{t('diagnosis.statusTreated')}</SelectItem>
                                            <SelectItem value="Healthy">{t('diagnosis.statusHealthy')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="description" className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{t('diagnosis.descriptionLabel')}</Label>
                                    <Textarea
                                        id="description"
                                        className="min-h-[100px] rounded-2xl border-2 border-gray-400 focus:border-[#7564ed] resize-none"
                                        placeholder={t('diagnosis.descriptionPlaceholder')}
                                        value={formData.description}
                                        onChange={e => handleAddInputChange('description', e.target.value)}
                                        autoComplete="off"
                                    />
                                </div>

                            </div>

                            <div className="flex gap-3 pt-2 mt-auto justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setEditingIndex(null);
                                        setFormData({
                                            condition: "",
                                            severity: "",
                                            description: "",
                                            notes: "",
                                            targetProblem: true,
                                            type: "Unhealthy"
                                        });
                                        setViewMode("LIST");
                                    }}
                                    className="text-gray-600 hover:bg-gray-100 text-lg font-bold transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                                >
                                    {t('diagnosis.cancel')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleAddSubmit}
                                    className="text-lg font-bold bg-[#EBE8FC] border text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                                    disabled={!formData.condition}
                                >
                                    {editingIndex !== null ? t('diagnosis.update') : t('diagnosis.save')}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EditConditionsDialog;
