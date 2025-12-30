import React, { useState, useEffect } from 'react';
import { Save, Trash2, UserMinus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function EditPatientModal({ patient, open, onOpenChange, onUpdate }) {
    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
    });

    // Doctors Tab State
    const [doctors, setDoctors] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(false);
    const [clinicMembers, setClinicMembers] = useState([]);
    const [clinicMembersLoading, setClinicMembersLoading] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');

    useEffect(() => {
        if (patient) {
            setFormData({
                first_name: patient.first_name || '',
                last_name: patient.last_name || '',
                email: patient.email || '',
                phone: patient.phone || '',
                date_of_birth: patient.date_of_birth || '',
                gender: patient.gender || '',
            });

            if (activeTab === 'doctors') {
                fetchDoctors();
                fetchClinicMembers();
            }
        }
    }, [patient, activeTab]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenderChange = (value) => {
        setFormData(prev => ({
            ...prev,
            gender: value
        }));
    }

    const fetchDoctors = async () => {
        if (!patient?.id) return;
        setDoctorsLoading(true);
        try {
            const res = await adminService.getPatientDoctors(patient.id);
            console.log("Doctors fetched:", res.doctors);
            setDoctors(res.doctors || []);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
            // toast.error('Failed to load doctors');
        } finally {
            setDoctorsLoading(false);
        }
    };

    const fetchClinicMembers = async () => {
        if (!patient?.clinic_id) return;
        setClinicMembersLoading(true);
        try {
            const res = await adminService.getClinicMembers(patient.clinic_id);
            setClinicMembers(res.members || []);
        } catch (error) {
            console.error('Failed to fetch clinic members:', error);
        } finally {
            setClinicMembersLoading(false);
        }
    };

    const handleAddDoctor = async () => {
        if (!selectedDoctorId || !patient?.clinic_id) return;
        setLoading(true);
        try {
            await adminService.addDoctorToPatient(patient.id, selectedDoctorId, patient.clinic_id);
            toast.success('Doctor added successfully');
            setSelectedDoctorId('');
            fetchDoctors();
        } catch (error) {
            console.error('Failed to add doctor:', error);
            toast.error(error.message || 'Failed to add doctor');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDoctor = async (doctorId) => {
        setLoading(true);
        try {
            await adminService.removeDoctorFromPatient(patient.id, doctorId);
            toast.success('Doctor removed successfully');
            fetchDoctors();
        } catch (error) {
            console.error('Failed to remove doctor:', error);
            toast.error('Failed to remove doctor');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''} `.toUpperCase();
    };

    const filteredClinicMembers = clinicMembers.filter(m => !doctors.some(d => (d.id === m.userId || d.user_id === m.userId)));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminService.updatePatient(patient.id, formData);
            toast.success('Patient updated successfully');
            onUpdate();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to update patient:', error);
            toast.error('Failed to update patient');
        } finally {
            setLoading(false);
        }
    };

    const inputClassName = "flex border-1 border-gray-300 py-3 bg-white hover:border-[#7564ed] hover:border-2 focus:border-[#7564ed] focus:border-2 focus:outline-none focus:ring-0 transition-colors duration-200 h-12 text-base max-w-sm rounded-2xl px-3 w-full text-gray-900";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[40vw] max-w-3xl bg-white p-0 overflow-hidden border-0 rounded-2xl">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0 flex justify-between items-center">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">Edit Patient</DialogTitle>
                    </DialogHeader>
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 mx-5 rounded-xl">
                        <Button
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab !== 'details' ? 'bg-white  text-gray-900' : 'text-white '} `}
                        >
                            Details
                        </Button>
                        <Button
                            onClick={() => setActiveTab('doctors')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab !== 'doctors' ? 'bg-white  text-gray-900' : 'text-white'} `}
                        >
                            Treating Doctors
                        </Button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto max-h-[80vh] p-8">
                    {activeTab === 'details' ? (
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        placeholder="Enter email address"
                                        required
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Date of Birth</label>
                                    <Input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                        className={inputClassName}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Gender</label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={handleGenderChange}
                                    >
                                        <SelectTrigger className={inputClassName}>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex mx-2 items-center justify-end gap-3 pt-8 mt-4 border-t border-gray-100">
                                <Button
                                    type="Button"
                                    onClick={() => onOpenChange(false)}
                                    className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {/* Add Doctor Section */}
                            <div className="bg-gray-100 p-4 rounded-xl space-y-4">
                                <h3 className="font-semibold text-gray-900">Add Treating Doctor</h3>
                                <div className="flex w-full gap-3">
                                    <div className="flex-1">
                                        <Select
                                            value={selectedDoctorId}
                                            onValueChange={setSelectedDoctorId}
                                        >
                                            <SelectTrigger className="h-10 w-full bg-white border-0 text-gray-900 rounded-lg">
                                                <SelectValue placeholder="Select doctor from clinic" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60">
                                                {filteredClinicMembers.length > 0 ? (
                                                    filteredClinicMembers.map(member => (
                                                        <SelectItem key={member.userId} value={member.userId}>
                                                            <div className="flex items-center gap-2">
                                                                <span>{member.firstName} {member.lastName}</span>
                                                                <span className="text-gray-400 text-xs">({member.email})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-sm text-gray-500 text-center">No available doctors</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={handleAddDoctor}
                                        disabled={loading || !selectedDoctorId}
                                        className="bg-[#7564ed] hover:bg-[#6353d6]"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add
                                    </Button>
                                </div>
                            </div>

                            {/* Doctors List */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900">Current Treating Doctors</h3>
                                {doctorsLoading ? (
                                    <p className="text-gray-500">Loading...</p>
                                ) : doctors.length === 0 ? (
                                    <p className="text-gray-500">No treating doctors assigned.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {doctors.map((doctor) => (
                                            <div key={doctor.user_id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={doctor.profilePhotoUrl} />
                                                        <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                                                            {getInitials(doctor.firstName, doctor.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {doctor.firstName} {doctor.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {doctor.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleRemoveDoctor(doctor.user_id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Remove doctor"
                                                >
                                                    <UserMinus className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

