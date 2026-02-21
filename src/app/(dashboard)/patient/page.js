"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, UserPlus, X, LayoutGrid, List } from "lucide-react";
import { useClinicMembers, usePermissions } from "@/app/(dashboard)/company/hooks";
import useUserStore from "@/components/features/profile/store/userStore";
import { useDentalStore } from "@/stores/dataStore";
import PatientTable from './components/PatientTable';
import PatientCardGrid from './components/PatientCardGrid';
import AddPatientDialog from './components/AddPatientDialog';
import EditPatientDialog from './components/EditPatientDialog';
import { DeletePatientDialog } from './components/DeletePatientDialog';
import PatientInfoDialog from './components/PatientInfoDialog';
import PatientsLoadingState from './components/PatientsLoadingState';
import NoClinicState from './components/NoClinicState';
import {
  filterPatientsBySearch,
  filterPatientsByTab,
  sortPatients,
  getTabCounts
} from './utils/patientUtils';
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";
import { useTranslation } from "react-i18next";

export default function PatientPage() {
  const router = useRouter();
  // Get current clinic from the same hook used in company page
  const { currentClinic } = useClinicMembers();
  const { pushNotification } = useNotification();
  const { t } = useTranslation('patient');
  const resetDentalStore = useDentalStore(state => state.resetData);
  const { userRole } = usePermissions(currentClinic?.id);
  const user = useUserStore(state => state.userInfo);

  const isOwner = currentClinic?.created_by === user?.user_id;
  const canAddPatient = isOwner || userRole === 'full_access';

  useEffect(() => {
    // Clear dental store data when entering patient list to ensure fresh report loading later
    resetDentalStore();
    console.log("resetDentalStore");
  }, []);

  const [activeTab, setActiveTab] = useState("my");
  const [viewMode, setViewMode] = useState("cards"); // 'table' or 'cards'
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState({ column: 'name', direction: 'asc' });
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Delete dialog state
  const [isDeletePatientOpen, setIsDeletePatientOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  // Patient data state
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState(null);
  const [favoriteLoadingStates, setFavoriteLoadingStates] = useState({});

  // Info dialog state
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [patientToView, setPatientToView] = useState(null);

  // Fetch patients when clinic changes
  useEffect(() => {
    const fetchPatients = async () => {
      // Skip during build/SSR
      if (typeof window === 'undefined') return;

      if (!currentClinic?.id) {
        setPatients([]);
        return;
      }

      setPatientsLoading(true);
      setPatientsError(null);

      try {
        const result = await useUserStore.getState().getPatients(currentClinic.id);
        if (result.success) {
          setPatients(result.patients || []);
        } else {
          setPatientsError(result.message);
          setPatients([]);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatientsError(t('list.notifications.fetchError'));
        setPatients([]);
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, [currentClinic?.id]);

  // Get tab counts using utility function
  const tabCounts = getTabCounts(patients);
  const tabs = [
    { id: "my", label: t('list.tabs.my'), count: tabCounts.my },
    { id: "all", label: t('list.tabs.all'), count: tabCounts.all },
    { id: "favorites", label: t('list.tabs.favorites'), count: tabCounts.favorites }
  ];

  // Filter and sort patients using utility functions
  const filteredPatients = filterPatientsBySearch(
    filterPatientsByTab(patients, activeTab),
    searchQuery
  );
  const sortedPatients = sortPatients(filteredPatients, sorting);

  const handleSort = (column) => {
    setSorting(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery;

  const handlePatientAdded = async () => {
    // Refresh patients list after adding a new patient
    if (currentClinic?.id) {
      const result = await useUserStore.getState().getPatients(currentClinic.id);
      if (result.success) {
        setPatients(result.patients || []);
      }
    }
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setIsEditPatientOpen(true);
  };

  const handleDeletePatient = (patient) => {
    setPatientToDelete(patient);
    setIsDeletePatientOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;

    setDeleteLoading(true);

    try {
      const result = await useUserStore.getState().deletePatient(patientToDelete.id);

      if (result.success) {
        pushNotification("success", t('list.notifications.deleteSuccess'));

        // Refresh patients list
        if (currentClinic?.id) {
          const patientsResult = await useUserStore.getState().getPatients(currentClinic.id);
          if (patientsResult.success) {
            setPatients(patientsResult.patients || []);
          }
        }

        // Close dialog after success
        setIsDeletePatientOpen(false);
        setPatientToDelete(null);

      } else {
        pushNotification("error", result.message || t('list.notifications.deleteError'));
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      pushNotification("error", t('list.notifications.deleteError'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePatientUpdated = async () => {
    // Refresh patients list after updating a patient
    if (currentClinic?.id) {
      const result = await useUserStore.getState().getPatients(currentClinic.id);
      if (result.success) {
        setPatients(result.patients || []);
      }
    }
  };

  const handleToggleFavorite = async (patient) => {
    if (!patient) return;

    // Set loading state for this specific patient
    setFavoriteLoadingStates(prev => ({ ...prev, [patient.id]: true }));

    try {
      const newFavoriteStatus = !patient.isFavorite;

      const result = await useUserStore.getState().toggleFavorite(patient.id, newFavoriteStatus);

      if (result.success) {
        // Update the patient in the local state
        setPatients(prev => prev.map(p =>
          p.id === patient.id
            ? { ...p, isFavorite: newFavoriteStatus }
            : p
        ));
      } else {
        console.error('Error toggling favorite:', result.message);
        // You could add a toast notification here to show the error to the user
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Network error while updating favorite status');
    } finally {
      // Clear loading state for this specific patient
      setFavoriteLoadingStates(prev => ({ ...prev, [patient.id]: false }));
    }
  };

  const handleViewInfo = (patient) => {
    setPatientToView(patient);
    setIsInfoDialogOpen(true);
  };

  // Loading state
  if (patientsLoading) {
    return <PatientsLoadingState />;
  }

  // No clinic state
  if (!currentClinic?.id) {
    return <NoClinicState />;
  }

  return (
    <div className="bg-transparent w-full h-full">
      {/* Header Section */}
      <div className="bg-transparent flex-wrap">
        <div className="px-0 sm:px-0 lg:px-0 py-2">
          <div className="flex items-center flex-wrap justify-between">
            <h1 className="text-3xl md:text-4xl font-[500] text-gray-900">
              <span className="text-7xl md:text-7xl font-[700]">{t('list.title')}</span>
              <span className="text-lg md:text-xl font-bold text-gray-600 ml-2">
                {currentClinic?.clinic_name || t('side.clinic', 'Clinic')}
              </span>
            </h1>

            {/* Add Patient Button */}
            {canAddPatient && (
              <Button
                onClick={() => setIsAddPatientOpen(true)}
                className="bg-[#7564ed] hover:bg-[#6a4fd8] text-xl text-white border-2 border-[#7564ed] h-12 font-semibold px-6"
              >
                <Plus className="mr-2 text-xl h-5 w-5" />
                {t('list.addNew')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" px-0 sm:px-0 lg:px-0 py-1">
        {/* Filter Bar Above Table */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
          {/* Tabs */}
          <div className="flex font-[500] space-x-1 p-1 rounded-2xl min-w-fit overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 rounded-2xl h-12 text-[20px] md:text-[20px]  ${activeTab === tab.id
                  ? "bg-[#7564ed] text-white"
                  : "bg-[#979eb02d] text-gray-700  hover:bg-[#7564ed] hover:text-white"
                  }`}
              >
                {tab.label} <span className="opacity-70">{tab.count}</span>
              </Button>
            ))}
          </div>

          {/* Search Controls */}
          <div className="flex items-center gap-2 w-full">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t('list.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-gray-950 pr-10 h-12 w-full"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-7 h-7 cursor-pointer" />
                </button>
              )}
            </div>

            {/* View Toggle Buttons */}
            <div className="flex gap-1 bg-[#979eb02d]  rounded-2xl p-1.5">
              <Button
                onClick={() => setViewMode("cards")}
                variant="ghost"
                size="sm"
                className={`h-11 w-11 p-0 rounded-xl transition-all ${viewMode === "cards"
                  ? "bg-[#7564ed] text-white "
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/20"
                  }`}
                title={t('list.view.cards')}
              >
                <LayoutGrid className="h-8 w-8" />
              </Button>
              <Button
                onClick={() => setViewMode("table")}
                variant="ghost"
                size="sm"
                className={`h-11 w-11 p-0 rounded-xl transition-all ${viewMode === "table"
                  ? "bg-[#7564ed] text-white "
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/20"
                  }`}
                title={t('list.view.table')}
              >
                <List className="h-8 w-8" />

              </Button>
            </div>
          </div>
        </div>

        <div className={`${viewMode === 'table' ? 'bg-white rounded-xl shadow' : ''} max-w-full mx-auto`}>
          {/* Conditional Rendering based on viewMode */}
          {viewMode === "table" ? (
            <PatientTable
              patients={sortedPatients}
              sorting={sorting}
              onSort={handleSort}
              searchQuery={searchQuery}
              activeTab={activeTab}
              onEditPatient={handleEditPatient}
              onDeletePatient={handleDeletePatient}
              onToggleFavorite={handleToggleFavorite}
              onViewInfo={handleViewInfo}
              favoriteLoadingStates={favoriteLoadingStates}
            />
          ) : (
            <PatientCardGrid
              patients={sortedPatients}
              onEditPatient={handleEditPatient}
              onDeletePatient={handleDeletePatient}
              onToggleFavorite={handleToggleFavorite}
              onViewInfo={handleViewInfo}
              favoriteLoadingStates={favoriteLoadingStates}
            />
          )}
        </div>
      </div>

      {/* Add Patient Dialog */}
      <AddPatientDialog
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onPatientAdded={handlePatientAdded}
      />

      {/* Edit Patient Dialog */}
      <EditPatientDialog
        isOpen={isEditPatientOpen}
        onClose={() => {
          setIsEditPatientOpen(false);
          setSelectedPatient(null);
        }}
        onPatientUpdated={handlePatientUpdated}
        patient={selectedPatient}
        onDelete={(patient) => {
          setIsEditPatientOpen(false);
          handleDeletePatient(patient);
        }}
      />

      {/* Delete Patient Dialog */}
      <DeletePatientDialog
        open={isDeletePatientOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeletePatientOpen(false);
            setPatientToDelete(null);
          }
        }}
        patient={patientToDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      {/* Patient Info Dialog */}
      <PatientInfoDialog
        isOpen={isInfoDialogOpen}
        onClose={() => {
          setIsInfoDialogOpen(false);
          setPatientToView(null);
        }}
        patient={patientToView}
      />
    </div>
  );
}