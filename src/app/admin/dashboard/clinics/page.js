"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, X } from 'lucide-react';
import { adminService } from '@/services/adminService';
import ClinicsTable from '@/components/admin/ClinicsTable';
import EditClinicModal from '@/components/admin/EditClinicModal';
import { DeleteClinicDialog } from '@/components/admin/DeleteClinicDialog';
import AddClinicModal from '@/components/admin/AddClinicModal';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ClinicsPage() {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ from: '0', to: '10' });
    const [showFilters, setShowFilters] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [editingClinic, setEditingClinic] = useState(null);
    const [isEditClinicModalOpen, setIsEditClinicModalOpen] = useState(false);
    const [isAddClinicModalOpen, setIsAddClinicModalOpen] = useState(false);
    const [clinicToDelete, setClinicToDelete] = useState(null);
    const [isDeleteClinicDialogOpen, setIsDeleteClinicDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchClinics();
    }, [dateRange]);

    const fetchClinics = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllClinics(dateRange.from, dateRange.to);
            console.log("Clinics API Response:", data);

            let clinicsArray = [];
            if (Array.isArray(data)) {
                clinicsArray = data;
            } else if (data?.data && Array.isArray(data.data)) {
                clinicsArray = data.data;
            } else if (data?.clinics && Array.isArray(data.clinics)) {
                clinicsArray = data.clinics;
            } else if (data?.results && Array.isArray(data.results)) {
                clinicsArray = data.results;
            } else {
                console.warn('Unexpected clinics response structure:', data);
            }
            setClinics(clinicsArray);

            if (clinicsArray.length < 10) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

        } catch (error) {
            console.error('Failed to fetch clinics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        const from = clinics.length;
        const to = from + 10;
        try {
            const data = await adminService.getAllClinics(from.toString(), to.toString());

            let newClinics = [];
            if (Array.isArray(data)) {
                newClinics = data;
            } else if (data?.data && Array.isArray(data.data)) {
                newClinics = data.data;
            } else if (data?.clinics && Array.isArray(data.clinics)) {
                newClinics = data.clinics;
            } else if (data?.results && Array.isArray(data.results)) {
                newClinics = data.results;
            }

            if (newClinics.length > 0) {
                setClinics(prev => [...prev, ...newClinics]);
                if (newClinics.length < 10) {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more clinics:', error);
        }
    };

    const filteredClinics = clinics.filter(clinic =>
        (clinic.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clinic.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clearFilters = () => {
        setDateRange({ from: '0', to: '10' });
        setSearchTerm('');
        setHasMore(true);
    };

    const handleDeleteClinic = (clinic) => {
        setClinicToDelete(clinic);
        setIsDeleteClinicDialogOpen(true);
    };

    const confirmDeleteClinic = async () => {
        if (!clinicToDelete) return;
        setDeleteLoading(true);
        try {
            await adminService.deleteClinic(clinicToDelete.id);
            setClinics(prev => prev.filter(c => c.id !== clinicToDelete.id));
            setIsDeleteClinicDialogOpen(false);
            setClinicToDelete(null);
        } catch (error) {
            console.error('Failed to delete clinic:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="w-full h-full space-y-6">


            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Left: Title */}
                <p className="text-4xl font-bold text-gray-900">
                    All clinics <span className="text-gray-400 font-normal ml-2">{clinics?.length || 0}</span>
                </p>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:min-w-[500px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 w-full "
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

                    {/* Filters Button */}
                    <Button variant="outline" className="h-10 px-4 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-medium">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>

                    {/* Add Clinic Button */}
                    <Button
                        onClick={() => setIsAddClinicModalOpen(true)}
                        className="bg-gray-900 hover:bg-gray-800 text-white h-10 px-4 font-medium"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Clinic
                    </Button>
                </div>
            </div>

            {/* Clinics Table */}
            <div className="bg-white rounded-xl shadow max-w-full mx-auto">
                <ClinicsTable
                    clinics={filteredClinics}
                    loading={loading}
                    onEditClinic={(clinic) => {
                        setEditingClinic(clinic);
                        setIsEditClinicModalOpen(true);
                    }}
                    onDeleteClinic={handleDeleteClinic}
                />
            </div>

            {/* Pagination */}
            {hasMore && !loading && (
                <div className="flex justify-center mt-6">
                    <Button
                        variant="ghost"
                        onClick={handleLoadMore}
                        className="text-[#7564ed] hover:bg-[#7564ed]/10 hover:text-[#7564ed]"
                    >
                        Load more clinics
                    </Button>
                </div>
            )}

            <EditClinicModal
                clinic={editingClinic}
                open={isEditClinicModalOpen}
                onOpenChange={setIsEditClinicModalOpen}
                onUpdate={() => {
                    // Reset pagination and reload
                    setDateRange({ from: '0', to: '10' }); // Trigger re-effect
                }}
            />

            <AddClinicModal
                open={isAddClinicModalOpen}
                onOpenChange={setIsAddClinicModalOpen}
                onClinicAdded={() => {
                    // Reset pagination and reload
                    setDateRange({ from: '0', to: '10' }); // Trigger re-effect
                }}
            />
            <DeleteClinicDialog
                open={isDeleteClinicDialogOpen}
                onOpenChange={setIsDeleteClinicDialogOpen}
                clinic={clinicToDelete}
                onConfirm={confirmDeleteClinic}
                loading={deleteLoading}
            />
        </div>
    );
}
