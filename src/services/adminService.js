import { apiClient } from '@/utils/apiClient';

export const adminService = {
    // Users
    getAllUsers: async (from = undefined, to = undefined, search = '') => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        if (search) params.append('search', search);
        const queryString = params.toString();
        return await apiClient(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
    },

    // Auth & Profile
    banUser: async (userId, data) => {
        return await apiClient('/api/admin/user/ban', {
            method: 'POST',
            body: JSON.stringify({ userId, ...data }),
        });
    },

    unbanUser: async (userId) => {
        return await apiClient('/api/admin/user/unban', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
    },

    getAdminProfile: async () => {
        return await apiClient('/api/admin/me');
    },

    updateAdminProfile: async (data) => {
        return await apiClient('/api/admin/update-profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    updateAdminPassword: async (data) => {
        return await apiClient('/api/admin/update-password', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    getSystemConfig: async () => {
        return await apiClient('/api/admin/system-config');
    },

    updateSystemConfig: async (data, password) => {
        return await apiClient('/api/admin/system-config', {
            method: 'PUT',
            body: JSON.stringify({ ...data, password }),
        });
    },

    addSystemConfig: async (data) => {
        return await apiClient('/api/admin/system-config', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    deleteSystemConfig: async (key) => {
        return await apiClient(`/api/admin/system-config/${key}`, {
            method: 'DELETE',
        });
    },

    getIncidentReports: async (from = undefined, to = undefined) => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        const queryString = params.toString();
        return await apiClient(`/api/admin/incident-reports${queryString ? `?${queryString}` : ''}`);
    },

    createUser: async (userData) => {
        return await apiClient('/api/admin/user/add', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    promoteToAdmin: async (email) => {
        return await apiClient('/api/admin/promote', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    deleteUser: async (userId) => {
        return await apiClient(`/api/admin/user/${userId}`, {
            method: 'DELETE',
        });
    },

    // Clinics
    getAllClinics: async (from = undefined, to = undefined) => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        const queryString = params.toString();
        return await apiClient(`/api/admin/clinics${queryString ? `?${queryString}` : ''}`, {
            method: 'POST',
        });
    },

    updateClinic: async (id, clinicData) => {
        return await apiClient('/api/admin/clinic/update', {
            method: 'POST',
            body: JSON.stringify({ ...clinicData, clinicId: id }),
        });
    },

    deleteClinic: async (clinicId) => {
        return await apiClient(`/api/admin/clinic/${clinicId}`, {
            method: 'DELETE',
        });
    },

    createClinic: async (clinicData) => {
        return await apiClient('/api/admin/clinic/add', {
            method: 'POST',
            body: JSON.stringify(clinicData),
        });
    },

    getClinicMembers: async (clinicId) => {
        return await apiClient(`/api/admin/clinic/${clinicId}/members`, {
            method: 'GET',
        });
    },

    addUserToClinic: async (clinicId, email, role) => {
        return await apiClient('/api/admin/clinic/add-member', {
            method: 'POST',
            body: JSON.stringify({ clinicId, email, role }),
        });
    },

    // Reports
    getAllReports: async (from = undefined, to = undefined) => {
        return await apiClient(`/api/admin/reports`, {
            method: 'POST',
            body: JSON.stringify({ from, to }),
        });
    },

    deleteReport: async (reportId) => {
        return await apiClient(`/api/admin/reports/${reportId}`, {
            method: 'DELETE',
        });
    },

    // Patients
    getAllPatients: async (from = undefined, to = undefined, search = '') => {
        return await apiClient(`/api/admin/patients`, {
            method: 'POST',
            body: JSON.stringify({ from, to, search }),
        });
    },

    deletePatient: async (patientId) => {
        return await apiClient(`/api/admin/patients/${patientId}`, {
            method: 'DELETE',
        });
    },

    updatePatient: async (id, patientData) => {
        return await apiClient('/api/admin/patient/update', {
            method: 'POST',
            body: JSON.stringify({ ...patientData, patientId: id }),
        });
    },

    getPatientDoctors: async (patientId) => {
        return await apiClient(`/api/admin/patient/${patientId}/doctors`);
    },

    addDoctorToPatient: async (patientId, doctorId, clinicId) => {

        return await apiClient('/api/admin/patient/add-doctor', {
            method: 'POST',
            body: JSON.stringify({ patientId, doctorId, clinicId }),
        });
    },

    createPatient: async (patientData) => {
        return await apiClient('/api/admin/patient/add', {
            method: 'POST',
            body: JSON.stringify(patientData),
        });
    },

    // Single Items
    getUserById: async (id) => {
        return await apiClient(`/api/admin/user/${id}`);
    },

    updateUser: async (id, userData) => {
        return await apiClient(`/api/admin/user/update`, {
            method: 'POST',
            body: JSON.stringify({ ...userData, userId: id }),
        });
    },

    getUserClinics: async (id) => {
        return await apiClient(`/api/admin/clinics`, {
            method: 'POST',
            body: JSON.stringify({ users: [id] }),
        });
    },

    removeUserFromClinic: async (userId, clinicId) => {
        return await apiClient(`/api/admin/clinic/remove-user`, {
            method: 'POST',
            body: JSON.stringify({ userId, clinicId }),
        });
    },

    updateUserClinicRole: async (userId, clinicId, role) => {
        return await apiClient(`/api/admin/clinic/update-role`, {
            method: 'POST',
            body: JSON.stringify({ userId, clinicId, role }),
        });
    },

    getClinicById: async (id) => {
        return await apiClient(`/api/admin/clinic/${id}`);
    },

    getDashboardStats: async (range = '6m') => {
        return await apiClient(`/api/admin/dashboard-stats?range=${range}`);
    },

    // Storage
    getStorageStats: async () => {
        return await apiClient('/api/admin/storage/stats');
    },

    getBucketContent: async (bucketName, path = '') => {
        return await apiClient(`/api/admin/storage/bucket/${bucketName}?path=${encodeURIComponent(path)}`);
    }
};
