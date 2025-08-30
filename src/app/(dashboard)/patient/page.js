"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, UserPlus } from "lucide-react";
import { useClinicMembers } from "@/app/(dashboard)/company/hooks";
import useUserStore from "@/app/component/profile/store/userStore";
import PatientTable from './components/PatientTable';
import AddPatientDialog from './components/AddPatientDialog';
import EditPatientDialog from './components/EditPatientDialog';
import { DeletePatientDialog } from './components/DeletePatientDialog';
import {
  filterPatientsBySearch,
  filterPatientsByTab,
  sortPatients,
  getTabCounts
} from './utils/patientUtils';

export default function PatientPage() {
  const router = useRouter();
  // Get current clinic from the same hook used in company page
  const { currentClinic } = useClinicMembers();
  
  const [activeTab, setActiveTab] = useState("my");
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState({ column: 'name', direction: 'asc' });
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Delete dialog state
  const [isDeletePatientOpen, setIsDeletePatientOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  // Patient data state
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState(null);
  const [favoriteLoadingStates, setFavoriteLoadingStates] = useState({});

  // Fetch patients when clinic changes
  useEffect(() => {
    const fetchPatients = async () => {
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
        setPatientsError('Erreur lors du chargement des patients');
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
    { id: "my", label: "My Patients", count: tabCounts.my },
    { id: "all", label: "All Patients", count: tabCounts.all },
    { id: "favorites", label: "Favorites", count: tabCounts.favorites }
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
    setDeleteMessage("");
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;

    setDeleteLoading(true);
    setDeleteMessage("");

    try {
      const result = await useUserStore.getState().deletePatient(patientToDelete.id);
      
      if (result.success) {
        setDeleteMessage("Patient supprimé avec succès");
        
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
          setDeleteMessage("");

      } else {
        setDeleteMessage(result.message || "Erreur lors de la suppression du patient");
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      setDeleteMessage("Erreur réseau lors de la suppression");
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

  // Loading state
  if (patientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7c5cff] mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chargement des patients
            </h2>
            <p className="text-gray-600 text-lg">
              Veuillez patienter pendant le chargement des patients...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No clinic state
  if (!currentClinic?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aucune clinique trouvée
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Vous devez créer une clinique ou rejoindre une clinique existante pour gérer les patients.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => router.push('/welcome')}
                className="bg-[#7c5cff] hover:bg-[#6a4fd8] text-white border-2 border-[#7c5cff] h-12 font-semibold px-6"
              >
                Créer une clinique
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent w-full">
      {/* Header Section */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-[900] text-gray-900">
              Patients
              <span className="text-lg md:text-xl font-bold text-gray-600 ml-2">
                {currentClinic?.clinic_name || 'Clinic'}
              </span>
            </h1>
            
            {/* Add Patient Button */}
            <Button 
              onClick={() => setIsAddPatientOpen(true)}
              className="bg-[#7c5cff] hover:bg-[#6a4fd8] text-xl text-white border-2 border-[#7c5cff] h-12 font-semibold px-6"
            >
              <Plus className="mr-2 text-xl h-5 w-5" />
              Add new patient
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-1">
        {/* Filter Bar Above Table */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
          {/* Tabs */}
          <div className="flex space-x-1 p-1 rounded-lg min-w-fit overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-sm md:text-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#7c5cff] text-white border-2 border-[#7c5cff]"
                    : "bg-[#979eb033] text-gray-500 border-2 border-[#7c5cff] hover:bg-[#7c5cff] hover:text-white"
                }`}
              >
                {tab.label} {tab.count}
              </button>
            ))}
          </div>

          {/* Search Controls */}
          <div className="flex items-center gap-0.5 w-full">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre o email del paciente"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 w-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-gray-100 max-w-full mx-auto">
          {/* Patient Table Component */}
          <PatientTable
            patients={sortedPatients}
            sorting={sorting}
            onSort={handleSort}
            searchQuery={searchQuery}
            activeTab={activeTab}
            onEditPatient={handleEditPatient}
            onDeletePatient={handleDeletePatient}
            onToggleFavorite={handleToggleFavorite}
            favoriteLoadingStates={favoriteLoadingStates}
          />
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
      />

      {/* Delete Patient Dialog */}
      <DeletePatientDialog
        open={isDeletePatientOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeletePatientOpen(false);
            setPatientToDelete(null);
            setDeleteMessage("");
          }
        }}
        patient={patientToDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        message={deleteMessage}
      />
    </div>
  );
}