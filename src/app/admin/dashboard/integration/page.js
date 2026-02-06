"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

import AddIntegrationModal from './AddIntegrationModal';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function IntegrationPage() {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const data = await apiClient('/api/admin/integrations');
            setIntegrations(data || []);
        } catch (error) {
            console.error('Error fetching integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleIntegration = async (id, currentStatus) => {
        try {
            // Optimistic update
            setIntegrations(integrations.map(integration =>
                integration.Integrations_id === id
                    ? { ...integration, is_Integration: !currentStatus }
                    : integration
            ));

            await apiClient('/api/admin/integration/update', {
                method: 'PUT',
                body: JSON.stringify({ id, is_Integration: !currentStatus })
            });

        } catch (error) {
            // Revert on error
            setIntegrations(integrations.map(integration =>
                integration.Integrations_id === id
                    ? { ...integration, is_Integration: currentStatus }
                    : integration
            ));
            console.error('Error updating integration:', error);
        }
    };

    const deleteIntegration = async (id) => {
        if (!confirm('Are you sure you want to delete this integration?')) {
            return;
        }

        try {
            setIntegrations(prev => prev.filter(i => i.Integrations_id !== id));

            await apiClient(`/api/admin/integration/${id}`, {
                method: 'DELETE'
            });

            // Re-fetch to ensure sync (optional, since optimistic update handled it)
            // fetchIntegrations(); 
        } catch (error) {
            console.error('Error deleting integration:', error);
            // Optionally revert or show toast error
            fetchIntegrations();
        }
    };

    if (loading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="w-full  mx-auto space-y-8 pb-10">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900 tracking-tight">Integrations</p>
                    <p className="text-lg text-gray-500">Manage third-party integrations.</p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-[#7564ed] text-white px-4 py-2 rounded-xl hover:bg-[#6254c7] transition-colors font-medium text-sm"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Integration
                </Button>
            </div>

            <AddIntegrationModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onIntegrationAdded={fetchIntegrations}
            />

            <div className="flex flex-wrap gap-6">
                {integrations.map((integration) => (
                    <div
                        key={integration.Integrations_id}
                        className="bg-white max-w-md min-w-md border boundary-gray-200 rounded-lg p-6 flex flex-col justify-between h-[220px]"
                    >
                        <div className="flex items-start space-x-4">
                            <Avatar className="h-14 w-14 rounded-lg border border-gray-200 bg-white">
                                <AvatarImage
                                    src={integration.logo_Integration || `https://www.google.com/s2/favicons?domain=${integration.Integrations?.toLowerCase().replace(/\s+/g, '')}.com&sz=128`}
                                    alt={integration.Integrations}
                                    className="object-contain p-2"
                                />
                                <AvatarFallback className="rounded-lg text-xl font-bold text-gray-400 bg-transparent">
                                    {integration.Integrations?.[0] || 'I'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {integration.Integrations}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-3 mt-1">
                                    Enable this integration to allow users to securely log in and sign up using their {integration.Integrations} account.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                            <div className="flex space-x-3">
                                <Button
                                    onClick={() => deleteIntegration(integration.Integrations_id)}
                                    className="text-sm font-medium text-red-600 hover:text-red-700 bg-white border border-gray-300 px-3 py-1.5 rounded-md shadow-sm transition-colors"
                                >
                                    Remove
                                </Button>
                            </div>

                            <Switch
                                checked={integration.is_Integration}
                                onCheckedChange={() => toggleIntegration(integration.Integrations_id, integration.is_Integration)}
                            />
                        </div>
                    </div>
                ))}
            </div>
            {
                integrations.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No integrations found.
                    </div>
                )
            }
        </div >
    );
}
