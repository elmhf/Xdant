"use client"
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Plus } from 'lucide-react';
import { adminService } from '@/services/adminService';
import PatientsTable from '@/components/admin/PatientsTable';
import { DeletePatientDialog } from '@/components/admin/DeletePatientDialog';
import EditPatientModal from '@/components/admin/EditPatientModal';
import CreatePatientDialog from '@/components/admin/CreatePatientDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PatientsPage() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ from: '0', to: '10' });
    const [showFilters, setShowFilters] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
    const [isCreatePatientOpen, setIsCreatePatientOpen] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, [dateRange]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllPatients(dateRange.from, dateRange.to, searchTerm); // Assumes backend supports search param if updated, otherwise filtering client side
            console.log("Patients API Response:", data);

            let patientsArray = [];
            if (Array.isArray(data)) {
                patientsArray = data;
            } else if (data?.data && Array.isArray(data.data)) {
                patientsArray = data.data;
            } else if (data?.patients && Array.isArray(data.patients)) {
                patientsArray = data.patients;
            }

            setPatients(patientsArray);

            if (patientsArray.length < 10) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

        } catch (error) {
            console.error('Failed to fetch patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        const from = patients.length;
        const to = from + 10;
        try {
            const data = await adminService.getAllPatients(from.toString(), to.toString(), searchTerm);

            let newPatients = [];
            if (Array.isArray(data)) {
                newPatients = data;
            } else if (data?.data && Array.isArray(data.data)) {
                newPatients = data.data;
            }

            if (newPatients.length > 0) {
                setPatients(prev => [...prev, ...newPatients]);
                if (newPatients.length < 10) {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more patients:', error);
        }
    };

    const handleDeletePatient = (patient) => {
        setPatientToDelete(patient);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeletePatient = async () => {
        if (!patientToDelete) return;
        setDeleteLoading(true);
        try {
            await adminService.deletePatient(patientToDelete.patient_id);
            setPatients(prev => prev.filter(p => p.patient_id !== patientToDelete.patient_id));
            setIsDeleteDialogOpen(false);
            setPatientToDelete(null);
        } catch (error) {
            console.error('Failed to delete patient:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Client-side filtering as backup if search param not used, or for immediate feedback
    const filteredPatients = patients.filter(patient =>
        (patient.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clearFilters = () => {
        setDateRange({ from: '0', to: '10' });
        setSearchTerm('');
        setHasMore(true);
        // fetchPatients(); // Triggered by dateRange change
    };

    return (
        <div className="w-full h-full space-y-6">


            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Left: Title */}
                <p className="text-4xl font-bold text-gray-900">
                    All patients <span className="text-gray-400 font-normal ml-2">{patients?.length || 0}</span>
                </p>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:min-w-[500px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search patients..."
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

                    <Button
                        onClick={() => setIsCreatePatientOpen(true)}
                        className="h-10 px-4 bg-[#7564ed] hover:bg-[#6353d6] text-white font-medium"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Patient
                    </Button>
                </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-xl shadow max-w-full mx-auto">
                <PatientsTable
                    patients={filteredPatients}
                    loading={loading}
                    onDeletePatient={handleDeletePatient}
                    onEditPatient={(patient) => {
                        setEditingPatient(patient);
                        setIsEditPatientModalOpen(true);
                    }}
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
                        Load more patients
                    </Button>
                </div>
            )}

            <CreatePatientDialog
                open={isCreatePatientOpen}
                onOpenChange={setIsCreatePatientOpen}
                onPatientCreated={() => {
                    setDateRange({ from: '0', to: '10' });
                }}
            />

            <EditPatientModal
                patient={editingPatient}
                open={isEditPatientModalOpen}
                onOpenChange={setIsEditPatientModalOpen}
                onUpdate={() => {
                    setDateRange({ from: '0', to: '10' });
                }}
            />

            <DeletePatientDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                patient={patientToDelete}
                onConfirm={confirmDeletePatient}
                loading={deleteLoading}
            />
        </div>
    );
}
