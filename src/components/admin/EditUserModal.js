"use client";
import React, { useState, useEffect } from 'react';
import { Save, ChevronDown, ChevronUp, LogOut, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function EditUserModal({ user, open, onOpenChange, onUpdate }) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
    });
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loadingClinics, setLoadingClinics] = useState(true);
    const [expandedClinic, setExpandedClinic] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || user.firstName || '',
                last_name: user.last_name || user.lastName || '',
                email: user.email || '',
                phone: user.phone || user.phone_number || '',
                password: '', // Password is optional for updates
            });
            fetchUserClinics(user.user_id || user.id);
        }
    }, [user]);

    const fetchUserClinics = async (userId) => {
        try {
            setLoadingClinics(true);
            const data = await adminService.getUserClinics(userId);
            console.log(data);
            // Handle different response structures
            let clinicsList = [];
            if (Array.isArray(data)) clinicsList = data;
            else if (data?.data) clinicsList = data.data;
            else if (data?.clinics) clinicsList = data.clinics;

            setClinics(clinicsList);
        } catch (error) {
            console.error('Failed to fetch user clinics:', error);
            // Don't show error toast here to avoid spamming if endpoint doesn't exist yet
        } finally {
            setLoadingClinics(false);
        }
    };

    const handleUpdateRole = async (clinicId, newRole) => {
        try {
            await adminService.updateUserClinicRole(user.user_id || user.id, clinicId, newRole);
            toast.success('Role updated successfully');
            // Optimistic update or refetch
            setClinics(prev => prev.map(c => c.id === clinicId ? { ...c, role: newRole } : c));
        } catch (error) {
            console.error('Failed to update role:', error);
            toast.error('Failed to update role');
        }
    };

    const handleQuitClinic = async (clinicId) => {
        if (!confirm('Are you sure you want to remove this user from the clinic?')) return;

        try {
            await adminService.removeUserFromClinic(user.user_id || user.id, clinicId);
            toast.success('User removed from clinic');
            setClinics(prev => prev.filter(c => c.id !== clinicId));
        } catch (error) {
            console.error('Failed to remove user from clinic:', error);
            toast.error('Failed to remove user from clinic');
        }
    };

    const handleDeleteUser = async () => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        setLoading(true);
        try {
            await adminService.deleteUser(user.user_id || user.id);
            toast.success('User deleted successfully');
            onUpdate();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error('Failed to delete user');
        } finally {
            setLoading(false);
        }
    };

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
            const dataToUpdate = { ...formData };
            if (!dataToUpdate.password) {
                delete dataToUpdate.password;
            }
            await adminService.updateUser(user.user_id || user.id, dataToUpdate);
            toast.success('User updated successfully');
            onUpdate(); // Refresh parent list
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    const inputClassName = "";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[50vw] max-w-5xl bg-white p-0 overflow-hidden border-0 rounded-2xl">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">Edit User Info</DialogTitle>
                    </DialogHeader>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1  p-4 overflow-y-auto max-h-[80vh]">
                    <div className="flex  gap-4 flex-col lg:flex-row h-full">
                        {/* Left Side: Form */}
                        <div className="w-full lg:w-3/5 border-b lg:border-b-0 lg:border-r border-gray-100">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">First Name <span className="text-red-500">*</span></label>
                                        <Input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className={inputClassName}
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Last Name <span className="text-red-500">*</span></label>
                                        <Input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className={inputClassName}
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        placeholder="Enter email address"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                    <Input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`${inputClassName} pr-10`}
                                            placeholder="Enter new password"
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Footer Actions (Moved inside form column) */}
                                <div className="flex items-center justify-between pt-8 mt-4">
                                    <button
                                        type="button"
                                        onClick={handleDeleteUser}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors"
                                    >
                                        <Trash2 size={18} />
                                        Delete User
                                    </button>
                                    <div className="flex items-center gap-3">
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
                                            className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                                        >
                                            {loading ? "Updating..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Right Side: Clinics List */}
                        <div className="w-full lg:w-2/5 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Associated Clinics</h3>

                            {loadingClinics ? (
                                <div className="flex items-center justify-center py-8 text-gray-500">
                                    <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                                    Loading clinics...
                                </div>
                            ) : clinics.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                                    <p className="text-gray-500 text-sm">No clinics associated with this user.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto p-2">
                                    {clinics.map((clinic) => (
                                        <div
                                            key={clinic.id}
                                            className={`rounded-xl border-1 transition-all cursor-pointer overflow-hidden ${expandedClinic === clinic.id
                                                ? 'border-transparent outline-[#7564ed] outline-3 bg-white '
                                                : 'border-gray-300 border-1 bg-gray-50 '
                                                }`}
                                            onClick={() => setExpandedClinic(expandedClinic === clinic.id ? null : clinic.id)}
                                        >
                                            <div className="p-4 flex items-start gap-3">
                                                {clinic.logo_url ? (
                                                    <img
                                                        src={clinic.logo_url}
                                                        alt={clinic.clinic_name}
                                                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                                                        {clinic.clinic_name?.charAt(0) || 'C'}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 line-clamp-1">{clinic.clinic_name}</h4>
                                                    <p className="text-sm text-gray-500 line-clamp-1">{clinic.email || 'No email'}</p>
                                                </div>
                                                <div className="text-gray-400">
                                                    {expandedClinic === clinic.id ? (
                                                        <ChevronUp size={20} />
                                                    ) : (
                                                        <ChevronDown size={20} />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Dropdown / Expanded Actions */}
                                            {expandedClinic === clinic.id && (
                                                <div
                                                    className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50 space-y-3 animate-in slide-in-from-top-2 duration-200"
                                                    onClick={(e) => e.stopPropagation()} // Prevent closing when interacting with controls
                                                >
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Edit Role</label>
                                                        <select
                                                            className="w-full text-sm rounded-lg border-gray-300 border-1 px-3 py-2 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                            defaultValue={clinic.role || 'member'}
                                                            onChange={(e) => handleUpdateRole(clinic.id, e.target.value)}
                                                        >
                                                            <option value="full_access">Full Access</option>
                                                            <option value="clinic_access">Clinic Access</option>
                                                            <option value="assistant_access">Assistant Access</option>
                                                            <option value="limited_access">Limited Access</option>
                                                        </select>
                                                    </div>

                                                    <Button
                                                        onClick={() => handleQuitClinic(clinic.id)}
                                                        className="w-full flex items-center transition-all justify-center gap-2 text-red-600 bg-red-50 hover:outline-red-600 hover:outline-3 px-3 py-2 rounded-lg text-md font-semibold"
                                                    >
                                                        <LogOut size={16} />
                                                        Quit Clinic
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
