"use client";
import React, { useState } from 'react';
import { useNotification } from '@/components/shared/jsFiles/NotificationProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/utils/apiClient';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AddIntegrationModal({ open, onOpenChange, onIntegrationAdded }) {
    const { pushNotification } = useNotification();
    const [formData, setFormData] = useState({
        Integrations: '',
        deiscription: '',
        logo_Integration: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.Integrations || !formData.deiscription) {
                pushNotification('error', "Please fill in all required fields");
                return;
            }

            await apiClient('/api/admin/integration/add', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            pushNotification('success', 'Integration created successfully');
            if (onIntegrationAdded) onIntegrationAdded();
            onOpenChange(false);
            setFormData({
                Integrations: '',
                deiscription: '',
                logo_Integration: ''
            });
        } catch (error) {
            console.error('Failed to create integration:', error);
            // Error is handled by apiClient toast
        } finally {
            setLoading(false);
        }
    };

    const inputClassName = "flex border-1 border-gray-300 py-3 bg-white hover:border-[#7564ed] hover:border-2 focus:border-[#7564ed] focus:border-2 focus:outline-none focus:ring-0 transition-colors duration-200 h-12 text-base rounded-2xl px-3 w-full text-gray-900";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-0 rounded-2xl">
                <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">Add Integration</DialogTitle>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Name <span className="text-red-500">*</span></label>
                            <Input
                                type="text"
                                name="Integrations"
                                value={formData.Integrations}
                                onChange={handleChange}
                                className={inputClassName}
                                placeholder="e.g. HubSpot"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
                            <Input
                                type="text"
                                name="deiscription"
                                value={formData.deiscription}
                                onChange={handleChange}
                                className={inputClassName}
                                placeholder="e.g. CRM integration"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Logo URL</label>
                            <Input
                                type="text"
                                name="logo_Integration"
                                value={formData.logo_Integration}
                                onChange={handleChange}
                                className={inputClassName}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4 transition-all duration-150 px-6 py-2.5 rounded-2xl flex items-center"
                            >
                                {loading ? "Adding..." : "Add Integration"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
