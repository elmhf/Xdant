"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, BrainCircuit, RefreshCw, Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import ModelList from '@/components/admin/ai-models/ModelList';
import AddModelModal from '@/components/admin/ai-models/AddModelModal';
import { DeleteModelDialog } from '@/components/admin/ai-models/DeleteModelDialog';
import { ModelActionDialog } from '@/components/admin/ai-models/ModelActionDialog';
import { modelService } from '@/services/modelService';

import { showToast } from '@/components/ui/toast-templates';

export default function AIModelsPage() {
    const [models, setModels] = useState([]);
    const [activeModels, setActiveModels] = useState({});
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog States
    const [modelToDelete, setModelToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [actionDialogState, setActionDialogState] = useState({
        open: false,
        type: null, // 'activate' or 'deactivate'
        target: null, // model object or type string
        targetName: ''
    });

    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await modelService.getAllModels();
            setModels(data.models || []);
            setActiveModels(data.active_models || {});
        } catch (error) {
            console.error("Failed to fetch models", error);
            showToast('error', "Failed to connect to Model Server. Is it running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const handleAddModel = async (modelData, file) => {
        try {
            await modelService.registerModel(modelData, file);
            showToast('success', "Model registered successfully");
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Add model error:", error);
            showToast('error', "Failed to register model");
            throw error;
        }
    };

    // --- Action Handlers (Open Dialogs) ---

    // 1. Delete
    const handleDeleteClick = (modelId) => {
        const model = models.find(m => m.id === modelId);
        if (model) {
            setModelToDelete(model);
            setIsDeleteDialogOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!modelToDelete) return;
        setActionLoading(true);
        try {
            await modelService.deleteModel(modelToDelete.id);
            showToast('success', "Model deleted successfully");
            setRefreshTrigger(prev => prev + 1);
            setIsDeleteDialogOpen(false);
            setModelToDelete(null);
        } catch (error) {
            console.error("Delete model error:", error);
            showToast('error', "Failed to delete model");
        } finally {
            setActionLoading(false);
        }
    };

    // 2. Set Active
    const handleSetActiveClick = (modelId) => {
        const model = models.find(m => m.id === modelId);
        if (model) {
            setActionDialogState({
                open: true,
                type: 'activate',
                target: model.id,
                targetName: model.name
            });
        }
    };

    // 3. Deactivate (Revert to Default) - Triggered maybe from a "Revert" button in UI (not yet in ModelList, but let's prep or update ModelList if needed, 
    // actually ModelList only has 'Activate' button for inactive rows. The 'Revert' was in the summary cards which we removed or need to check if user wants it back?
    // Wait, the new ModelList design puts everything in a table. It doesn't show separate 'Active' summary cards. 
    // So 'Unactive' essentially means "setting a default one" or if we have a way to 'turn off' custom models.
    // The previous `activeModels` structure allowed deactivating a type entirely.
    // Let's assume on the table, if a model IS active, maybe we show a 'Deactivate' or 'Revert' button?
    // Or we just stick to 'Activate' another one.
    // But the user specially asked for "unactive". So I should probably add a way to 'deactivate' a currently active model (revert to default).

    const handleDeactivateClick = (type, currentActiveModelName) => {
        setActionDialogState({
            open: true,
            type: 'deactivate',
            target: type,
            targetName: currentActiveModelName || type
        });
    };

    const confirmAction = async () => {
        const { type, target } = actionDialogState;
        setActionLoading(true);
        try {
            if (type === 'activate') {
                await modelService.setActiveModel(target);
                showToast('success', "Active model updated");
            } else if (type === 'deactivate') {
                await modelService.deactivateModelType(target);
                showToast('success', "Reverted to system default");
            }
            setRefreshTrigger(prev => prev + 1);
            setActionDialogState(prev => ({ ...prev, open: false }));
        } catch (error) {
            console.error("Action error:", error);
            showToast('error', "Failed to perform action");
        } finally {
            setActionLoading(false);
        }
    };


    // Filter models client-side
    const filteredModels = models.filter(model =>
        (model.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (model.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (model.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clearFilters = () => {
        setSearchTerm('');
    };

    return (
        <div className="w-full h-full space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Left: Title */}
                <p className="text-4xl font-bold text-gray-900">
                    All models <span className="text-gray-400 font-normal ml-2">{models?.length || 0}</span>
                </p>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:min-w-[500px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search models..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 w-full"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filters Button (Visual only for now matching Clinics page) */}
                    <Button variant="outline" className="h-10 px-4 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-medium">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>

                    {/* Add Model Button */}
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-gray-900 hover:bg-gray-800 text-white h-10 px-4 font-medium"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Model
                    </Button>
                </div>
            </div>

            {/* Models Table */}
            <div className="bg-white rounded-xl shadow max-w-full mx-auto">
                <ModelList
                    models={filteredModels}
                    activeModels={activeModels}
                    onSetActive={handleSetActiveClick}
                    onDelete={handleDeleteClick}
                    onDeactivate={handleDeactivateClick} // Pass this down
                    loading={loading}
                />
            </div>

            <AddModelModal
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onAdd={handleAddModel}
            />

            <DeleteModelDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                model={modelToDelete}
                onConfirm={confirmDelete}
                loading={actionLoading}
            />

            <ModelActionDialog
                open={actionDialogState.open}
                onOpenChange={(open) => setActionDialogState(prev => ({ ...prev, open }))}
                actionType={actionDialogState.type}
                targetName={actionDialogState.targetName}
                onConfirm={confirmAction}
                loading={actionLoading}
            />
        </div>
    );
}
