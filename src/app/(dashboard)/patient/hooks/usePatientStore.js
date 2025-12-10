import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useUserStore from "@/components/features/profile/store/userStore";

// Initial state structure
const initialState = {
  // Patient data
  currentPatient: null,
  patients: [],

  // Reports data
  reports: [],
  reportsLoading: false,
  reportsError: null,

  // WebSocket state
  wsConnected: false,
  wsConnectionStatus: 'disconnected',
  wsLastUpdate: null,
  wsNotifications: [],

  // UI state
  loading: false,
  error: null,

  // Dialog states
  isAddDoctorOpen: false,
  isDeleteDoctorOpen: false,
  isEditPatientOpen: false,
  isDeleteReportOpen: false,

  // Selected items
  doctorToDelete: null,
  reportToDelete: null,

  // Loading states
  favoriteLoading: false,
  deleteDoctorLoading: false,
  deleteReportLoading: false,

  // Messages
  deleteDoctorMessage: "",
  deleteReportMessage: "",

  // Filters
  dateFilter: '',
  typeFilter: 'all',

  // Pagination
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0
};

export const usePatientStore = create(

    (set, get) => ({
      // ===== INITIAL STATE =====
      ...initialState,

      // ===== PATIENT MANAGEMENT =====

      // Set current patient
      setCurrentPatient: (patient) => {
        set(state => {
          if (JSON.stringify(state.currentPatient) === JSON.stringify(patient)) {
            return state;
          }
          return { currentPatient: patient };
        });
      },

      // Clear current patient
      clearCurrentPatient: () => {
        set(state => {
          if (!state.currentPatient) return state;
          return { currentPatient: null };
        });
      },

      // Update patient data
      updatePatient: (updates) => {
        set(state => {
          if (!state.currentPatient) return state;

          // تحقق من أن التحديثات مختلفة فعلاً
          const hasChanges = Object.keys(updates).some(key =>
            state.currentPatient[key] !== updates[key]
          );

          if (!hasChanges) return state;

          return {
            currentPatient: { ...state.currentPatient, ...updates }
          };
        });
      },

      // Add patient to list
      addPatient: (patient) => {
        set(state => {
          const existingPatient = state.patients.find(p => p.id === patient.id);
          if (existingPatient) return state;
          return { patients: [...state.patients, patient] };
        });
      },

      // Update patient in list
      updatePatientInList: (patientId, updates) => {
        set(state => {
          const patientIndex = state.patients.findIndex(p => p.id === patientId);
          if (patientIndex === -1) return state;

          const updatedPatient = { ...state.patients[patientIndex], ...updates };
          const updatedPatients = [...state.patients];
          updatedPatients[patientIndex] = updatedPatient;

          return { patients: updatedPatients };
        });
      },

      // Remove patient from list
      removePatient: (patientId) => {
        set(state => {
          const filteredPatients = state.patients.filter(p => p.id !== patientId);
          if (filteredPatients.length === state.patients.length) return state;
          return { patients: filteredPatients };
        });
      },

      // ===== REPORTS MANAGEMENT =====

      // Set reports
      setReports: (reports) => {
        set(state => {
          if (JSON.stringify(state.reports) !== JSON.stringify(reports)) {
            return { reports };
          }
          return state;
        });
      },

      // Add report
      addReport: (report) => {
        set(state => {
          // تحقق من أن التقرير غير موجود بالفعل
          const existingReport = state.reports.find(r => r.id === report.id);
          if (existingReport) return state;

          return { reports: [...state.reports, report] };
        });
      },

      // Update report
      updateReport: (reportId, updates) => {
        set(state => {
          const reportIndex = state.reports.findIndex(report => report.id === reportId);
          if (reportIndex === -1) return state;

          const updatedReport = { ...state.reports[reportIndex], ...updates, updatedAt: new Date().toISOString() };
          const updatedReports = [...state.reports];
          updatedReports[reportIndex] = updatedReport;

          return { reports: updatedReports };
        });
      },

      // Remove report
      removeReport: (reportId) => {
        set(state => {
          const filteredReports = state.reports.filter(report => report.id !== reportId);
          if (filteredReports.length === state.reports.length) return state;

          return { reports: filteredReports };
        });
      },

      // Set reports loading
      setReportsLoading: (loading) => {
        set(state => {
          if (state.reportsLoading === loading) return state;
          return { reportsLoading: loading };
        });
      },

      // Set reports error
      setReportsError: (error) => {
        set(state => {
          if (state.reportsError === error) return state;
          return { reportsError: error };
        });
      },

      // ===== WEBSOCKET MANAGEMENT =====

      // Set WebSocket connection status
      setWsConnection: (connected, status = 'connected') => {
        set(state => {
          if (state.wsConnected === connected && state.wsConnectionStatus === status) {
            return state;
          }
          return {
            wsConnected: connected,
            wsConnectionStatus: status
          };
        });
      },

      // Set WebSocket last update
      setWsLastUpdate: (update) => {
        set(state => {
          if (state.wsLastUpdate?.timestamp === update?.timestamp) {
            return state;
          }
          return { wsLastUpdate: update };
        });
      },

      // Add WebSocket notification
      addWsNotification: (notification) => {
        set(state => {
          const existingNotification = state.wsNotifications.find(n => n.id === notification.id);
          if (existingNotification) return state;
          return { wsNotifications: [...state.wsNotifications, notification] };
        });
      },

      // Remove WebSocket notification
      removeWsNotification: (notificationId) => {
        set(state => {
          const filteredNotifications = state.wsNotifications.filter(n => n.id !== notificationId);
          if (filteredNotifications.length === state.wsNotifications.length) return state;
          return { wsNotifications: filteredNotifications };
        });
      },

      // Clear WebSocket notifications
      clearWsNotifications: () => {
        set(state => {
          if (state.wsNotifications.length === 0) return state;
          return { wsNotifications: [] };
        });
      },

      // ===== UI STATE MANAGEMENT =====

      // Set loading state
      setLoading: (loading) => {
        set(state => {
          if (state.loading === loading) return state;
          return { loading };
        });
      },

      // Set error state
      setError: (error) => {
        set(state => {
          if (state.error === error) return state;
          return { error };
        });
      },

      // Clear error
      clearError: () => {
        set(state => {
          if (!state.error) return state;
          return { error: null };
        });
      },

      // ===== DIALOG MANAGEMENT =====

      // Add Doctor Dialog
      openAddDoctorDialog: () => {
        set(state => {
          if (state.isAddDoctorOpen) return state;
          return { isAddDoctorOpen: true };
        });
      },

      closeAddDoctorDialog: () => {
        set(state => {
          if (!state.isAddDoctorOpen) return state;
          return { isAddDoctorOpen: false };
        });
      },

      // Delete Doctor Dialog
      openDeleteDoctorDialog: (doctor) => {
        set(state => {
          if (state.isDeleteDoctorOpen && JSON.stringify(state.doctorToDelete) === JSON.stringify(doctor)) {
            return state;
          }
          return {
            isDeleteDoctorOpen: true,
            doctorToDelete: doctor,
            deleteDoctorMessage: ""
          };
        });
      },

      closeDeleteDoctorDialog: () => {
        set(state => {
          if (!state.isDeleteDoctorOpen) return state;
          return {
            isDeleteDoctorOpen: false,
            doctorToDelete: null,
            deleteDoctorMessage: ""
          };
        });
      },

      // Edit Patient Dialog
      openEditPatientDialog: () => {
        set(state => {
          if (state.isEditPatientOpen) return state;
          return { isEditPatientOpen: true };
        });
      },

      closeEditPatientDialog: () => {
        set(state => {
          if (!state.isEditPatientOpen) return state;
          return { isEditPatientOpen: false };
        });
      },

      // Delete Report Dialog
      openDeleteReportDialog: (report) => {
        set(state => {
          if (state.isDeleteReportOpen && JSON.stringify(state.reportToDelete) === JSON.stringify(report)) {
            return state;
          }
          return {
            isDeleteReportOpen: true,
            reportToDelete: report,
            deleteReportMessage: ""
          };
        });
      },

      closeDeleteReportDialog: () => {
        set(state => {
          if (!state.isDeleteReportOpen) return state;
          return {
            isDeleteReportOpen: false,
            reportToDelete: null,
            deleteReportMessage: ""
          };
        });
      },

      // ===== LOADING STATES =====

      setFavoriteLoading: (loading) => {
        set(state => {
          if (state.favoriteLoading === loading) return state;
          return { favoriteLoading: loading };
        });
      },

      setDeleteDoctorLoading: (loading) => {
        set(state => {
          if (state.deleteDoctorLoading === loading) return state;
          return { deleteDoctorLoading: loading };
        });
      },

      setDeleteReportLoading: (loading) => {
        set(state => {
          if (state.deleteReportLoading === loading) return state;
          return { deleteReportLoading: loading };
        });
      },

      // ===== MESSAGES =====

      setDeleteDoctorMessage: (message) => {
        set(state => {
          if (state.deleteDoctorMessage === message) return state;
          return { deleteDoctorMessage: message };
        });
      },

      setDeleteReportMessage: (message) => {
        set(state => {
          if (state.deleteReportMessage === message) return state;
          return { deleteReportMessage: message };
        });
      },

      // ===== FILTERS =====

      setDateFilter: (filter) => {
        set(state => {
          if (state.dateFilter === filter) return state;
          return { dateFilter: filter };
        });
      },

      setTypeFilter: (filter) => {
        set(state => {
          if (state.typeFilter === filter) return state;
          return { typeFilter: filter };
        });
      },

      clearFilters: () => {
        set(state => {
          if (state.dateFilter === '' && state.typeFilter === 'all') return state;
          return { dateFilter: '', typeFilter: 'all' };
        });
      },

      // ===== PAGINATION =====

      setCurrentPage: (page) => {
        set(state => {
          if (state.currentPage === page) return state;
          return { currentPage: page };
        });
      },

      setItemsPerPage: (items) => {
        set(state => {
          if (state.itemsPerPage === items) return state;
          return { itemsPerPage: items };
        });
      },

      setTotalItems: (total) => {
        set(state => {
          if (state.totalItems === total) return state;
          return { totalItems: total };
        });
      },

      // ===== COMPUTED VALUES =====

      // Get filtered reports
      getFilteredReports: () => {
        const { reports, dateFilter, typeFilter } = get();

        return reports.filter(report => {
          const matchesDate = !dateFilter ||
            new Date(report.createdAt || report.created_at).toISOString().split('T')[0] === dateFilter;

          const matchesType = !typeFilter ||
            typeFilter === 'all' ||
            (report.type || report.raport_type || '').toLowerCase().includes(typeFilter.toLowerCase());

          return matchesDate && matchesType;
        });
      },

      // Get pending reports
      getPendingReports: () => {
        return get().reports.filter(report => report.status === 'pending');
      },

      // Get completed reports
      getCompletedReports: () => {
        return get().reports.filter(report => report.status === 'completed');
      },

      // Get active reports
      getActiveReports: () => {
        return get().reports.filter(report =>
          report.status === 'pending' || report.status === 'processing'
        );
      },

      // Get reports statistics
      getReportsStats: () => {
        const reports = get().reports;
        return {
          total: reports.length,
          pending: reports.filter(r => r.status === 'pending').length,
          processing: reports.filter(r => r.status === 'processing').length,
          completed: reports.filter(r => r.status === 'completed').length,
          failed: reports.filter(r => r.status === 'failed').length
        };
      },

      // ===== ACTIONS =====

      // Fetch patient data
      fetchPatient: async (patientId) => {
        if (!patientId) {
          set({ error: "Patient ID not found", loading: false });
          return { success: false, message: "Patient ID not found" };
        }

        set({ loading: true, error: null });

        try {
          const result = await useUserStore.getState().getPatient(patientId);
          if (result.success) {
            set({
              currentPatient: result.patient,
              loading: false
            });

            // Initialize reports from patient data
            if (result.patient.reports) {
              set({ reports: result.patient.reports });
            }

            return { success: true, patient: result.patient };
          } else {
            set({
              error: result.message || "Error fetching patient",
              loading: false
            });
            return { success: false, message: result.message };
          }
        } catch (error) {
          console.error('Error fetching patient:', error);
          set({
            error: 'Network error while fetching patient',
            loading: false
          });
          return { success: false, message: 'Network error while fetching patient' };
        }
      },

      // Fetch reports from server
      fetchReports: async (patientId) => {
        if (!patientId) return;

        set({ reportsLoading: true });
        try {
          const response = await fetch(`http://localhost:5000/api/reports/patient/${patientId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            const serverReports = data.reports || [];

            // Merge server reports with existing reports, avoiding duplicates
            set(state => {
              const existingReportIds = new Set(state.reports.map(r => r.id));
              const newReports = serverReports.filter(report => !existingReportIds.has(report.id));
              return { reports: [...state.reports, ...newReports] };
            });
          }
        } catch (error) {
          console.error('Error fetching reports:', error);
          set({ reportsError: error.message });
        } finally {
          set({ reportsLoading: false });
        }
      },

      // Toggle favorite status
      toggleFavorite: async (patientId, newStatus) => {
        const { currentPatient } = get();
        if (!currentPatient) return { success: false, message: "No patient selected" };

        set({ favoriteLoading: true });
        try {
          const result = await useUserStore.getState().toggleFavorite(patientId, newStatus);

          if (result.success) {
            set(state => ({
              currentPatient: state.currentPatient
                ? { ...state.currentPatient, isFavorite: newStatus }
                : null,
              favoriteLoading: false
            }));
            return { success: true };
          } else {
            set({ favoriteLoading: false });
            return { success: false, message: result.message };
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
          set({ favoriteLoading: false });
          return { success: false, message: 'Network error while updating favorite status' };
        }
      },

      // Delete doctor from patient
      deleteDoctor: async (doctorId) => {
        const { currentPatient, doctorToDelete } = get();
        if (!currentPatient || !doctorToDelete) return;

        set({ deleteDoctorLoading: true, deleteDoctorMessage: "" });

        try {
          // Remove the doctor from treating_doctors array
          const updatedTreatingDoctors = currentPatient.treating_doctors.filter(d => d.id !== doctorToDelete.id);
          const treating_doctor_ids = updatedTreatingDoctors.map(doctor => doctor.id);

          const patientData = {
            patientId: currentPatient.id,
            first_name: currentPatient.first_name,
            last_name: currentPatient.last_name,
            gender: currentPatient.gender,
            date_of_birth: currentPatient.date_of_birth,
            email: currentPatient.email || "",
            phone: currentPatient.phone || "",
            address: currentPatient.address || "",
            treating_doctor_id: treating_doctor_ids
          };

          const response = await fetch(`http://localhost:5000/api/patients/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(patientData)
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to remove doctor');
          }

          set({ deleteDoctorMessage: "Doctor removed successfully" });

          // Refresh patient data
          const result = await useUserStore.getState().getPatient(currentPatient.id);
          if (result.success) {
            set({ currentPatient: result.patient });
          }

          set({
            isDeleteDoctorOpen: false,
            doctorToDelete: null,
            deleteDoctorMessage: "",
            deleteDoctorLoading: false
          });

          return { success: true };
        } catch (error) {
          console.error('Error removing doctor:', error);
          set({
            deleteDoctorMessage: error.message || 'Failed to remove doctor',
            deleteDoctorLoading: false
          });
          return { success: false, message: error.message };
        }
      },

      // Delete report
      deleteReport: async (reportId) => {
        const { currentPatient, reportToDelete } = get();
        if (!reportToDelete) return;

        set({ deleteReportLoading: true, deleteReportMessage: "" });

        try {
          console.log('🗑️ Deleting report from server:', {
            reportId: reportToDelete.id,
            patientId: currentPatient?.id
          });

          const response = await fetch(`http://localhost:5000/api/reports/delete`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              report_id: reportToDelete.id,
              patient_id: currentPatient?.id
            })
          });

          if (response.status === 200) {
            console.log('✅ Report deleted successfully from server');

            // Remove the report from local state immediately
            set(state => ({
              reports: state.reports.filter(report => report.id !== reportToDelete.id),
              isDeleteReportOpen: false,
              reportToDelete: null,
              deleteReportMessage: "",
              deleteReportLoading: false
            }));

            return { success: true };
          } else {
            console.error('❌ Failed to delete report from server');
            set({
              deleteReportMessage: 'Failed to delete report from server',
              deleteReportLoading: false
            });
            return { success: false, message: 'Failed to delete report from server' };
          }
        } catch (error) {
          console.error('❌ Error deleting report:', error);
          set({
            deleteReportMessage: error.message || 'Error deleting report',
            deleteReportLoading: false
          });
          return { success: false, message: error.message };
        }
      },

      // Reset store to initial state
      reset: () => {
        set(initialState);
      },

      // Clear current session data
      clearSession: () => {
        set({
          currentPatient: null,
          reports: [],
          wsNotifications: [],
          loading: false,
          error: null,
          reportsLoading: false,
          reportsError: null
        });
      }
    }),
    {
      name: 'patient-store',
      version: 1,
      partialize: (state) => ({
        // Only persist non-sensitive data
        patients: state.patients,
        dateFilter: state.dateFilter,
        typeFilter: state.typeFilter,
        currentPage: state.currentPage,
        itemsPerPage: state.itemsPerPage
      }),
    }
  )
;

// Export selectors for better performance
export const usePatientSelector = (selector) => usePatientStore(selector);

// Common selectors
export const useCurrentPatient = () => usePatientStore(state => state.currentPatient);
export const useReports = () => usePatientStore(state => state.reports);
export const useReportsLoading = () => usePatientStore(state => state.reportsLoading);
export const useWsConnection = () => usePatientStore(state => ({
  isConnected: state.wsConnected,
  connectionStatus: state.wsConnectionStatus,
  lastUpdate: state.wsLastUpdate
}));
export const useReportsStats = () => usePatientStore(state => state.getReportsStats());
export const useFilteredReports = () => usePatientStore(state => state.getFilteredReports());