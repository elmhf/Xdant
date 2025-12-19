import React, { useState, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteTreatingDoctorDialog } from './DeleteTreatingDoctorDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Trash2, Loader2, Plus, UserPlus } from "lucide-react";
import { useClinicMembers } from "@/app/(dashboard)/company/hooks";
import useUserStore from "@/components/features/profile/store/userStore";
import { validatePatientForm, getInitialFormData, resetFormData } from '../utils/formUtils';

const EditPatientDialog = ({ isOpen, onClose, onPatientUpdated, onDelete, patient, hideTreatingDoctors = false }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    email: "",
    phone: "",
    address: "",
    treating_doctors: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete Doctor Dialog State
  const [isDeleteDoctorOpen, setIsDeleteDoctorOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Get clinic members as available doctors
  const { clinicMembers, currentClinic } = useClinicMembers();
  const { userInfo } = useUserStore();
  const currentUser = userInfo;

  const availableDoctors = clinicMembers.map(member => ({
    id: member.user_id || member.id,
    first_name: member.first_name || "",
    last_name: member.last_name || "",
    name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
    name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
    email: member.email || '',
    profilePhotoUrl: member.profilePhotoUrl || null
  }));

  // Load patient data when dialog opens
  useEffect(() => {
    if (patient && isOpen) {

      setFormData({
        first_name: String(patient.first_name || ""),
        last_name: String(patient.last_name || ""),
        gender: String(patient.gender || ""),
        date_of_birth: String(patient.date_of_birth || ""),
        email: String(patient.email || ""),
        phone: String(patient.phone || ""),
        address: String(patient.address || ""),
        treating_doctors: patient.treating_doctors || []
      });
      setFormError("");
      setFormSuccess("");
    }
  }, [patient, isOpen, hideTreatingDoctors]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (formError) setFormError("");
    if (formSuccess) setFormSuccess("");
  };



  const addTreatingDoctor = (doctorId) => {
    const doctor = availableDoctors.find(d => d.id === doctorId);
    if (doctor && !formData.treating_doctors.find(d => d.id === doctorId)) {
      setFormData(prev => ({
        ...prev,
        treating_doctors: [...prev.treating_doctors, doctor]
      }));
    }
  };

  const removeTreatingDoctor = (doctorId) => {
    const doctor = formData.treating_doctors.find(d => d.id === doctorId);
    if (doctor) {
      setDoctorToDelete(doctor);
      setIsDeleteDoctorOpen(true);
    }
  };

  const handleConfirmRemoveDoctor = () => {
    if (doctorToDelete) {
      setFormData(prev => ({
        ...prev,
        treating_doctors: prev.treating_doctors.filter(d => d.id !== doctorToDelete.id)
      }));
      setDoctorToDelete(null);
      setIsDeleteDoctorOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validatePatientForm(formData);
    if (!validation.isValid) {
      setFormError(validation.errors[0]);
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      // Convert treating_doctors array to treating_doctor_id array (always include)
      const treating_doctor_ids = (formData.treating_doctors || []).map(doctor => doctor.id);

      const patientData = {
        patientId: patient.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        email: formData.email || "",
        phone: formData.phone || "",
        address: formData.address || "",
        clinicId: currentClinic?.id,
        treating_doctor_id: treating_doctor_ids
      };

      const data = await apiClient('/api/patients/update', {
        method: 'PUT',
        body: JSON.stringify(patientData)
      });

      setFormSuccess("Patient updated successfully!");

      // Close dialog after success
      onClose();
      if (onPatientUpdated) {
        onPatientUpdated();
      }

    } catch (error) {
      console.error('Error updating patient:', error);
      setFormError(error.message || 'Failed to update patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (patient) {
      setFormData({
        first_name: String(patient.first_name || ""),
        last_name: String(patient.last_name || ""),
        gender: String(patient.gender || ""),
        date_of_birth: String(patient.date_of_birth || ""),
        email: String(patient.email || ""),
        phone: String(patient.phone || ""),
        address: String(patient.address || ""),
        treating_doctors: patient.treating_doctors || []
      });
    }
    setFormError("");
    setFormSuccess("");
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-4xl font-bold text-gray-900">
            Edit patient information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error/Success Messages */}
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {formSuccess}
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-sm text-gray-600">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name || ''}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className={`h-12 w-full text-base border-1 ${!formData.first_name && formError ? 'border-red-500' : 'border-gray-200'
                  } focus:border-[#7564ed] rounded-lg`}
              />
              {!formData.first_name && formError && (
                <p className="text-red-500 text-sm">Field is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm text-gray-600">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className={`h-12 w-full text-base border-1 ${!formData.last_name && formError ? 'border-red-500' : 'border-gray-200'
                  } focus:border-[#7564ed] rounded-lg`}
              />
              {!formData.last_name && formError && (
                <p className="text-red-500 text-sm">Field is required</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-gray-600">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="h-12 w-full text-base border-1 border-gray-300  rounded-lg"
            />
          </div>

          {/* Phone and Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm text-gray-600">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="h-12 w-full text-base border-1 border-gray-300 focus:border-[#7564ed] rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm text-gray-600">
                Address
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="h-12 w-full text-base border-1 border-gray-300 focus:border-[#7564ed] rounded-lg"
              />
            </div>
          </div>

          {/* Date of Birth and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">
                Gender <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map((gender) => (
                  <Button
                    key={gender}
                    type="button"
                    onClick={() => handleInputChange('gender', gender.toLowerCase())}
                    className={`px-6 py-2 rounded-lg text-sm font-[500] transition-colors ${formData.gender === gender.toLowerCase()
                      ? 'bg-[#7564ed] text-white border-[#7564ed]'
                      : 'bg-gray-100 text-gray-700 hover:border-[#7564ed]'
                      }`}
                  >
                    {gender}
                  </Button>
                ))}
              </div>
              {!formData.gender && formError && (
                <p className="text-red-500 text-sm">Field is required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth" className="text-sm text-gray-600">
                Date of birth <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`h-12 w-full text-base border-1 ${!formData.date_of_birth && formError ? 'border-red-500' : 'border-gray-200'
                    } focus:border-[#7564ed] rounded-lg`}
                />
              </div>
              {!formData.date_of_birth && formError && (
                <p className="text-red-500 text-sm">Field is required</p>
              )}
            </div>

          </div>

          {/* Treating Doctors */}
          {!hideTreatingDoctors && (
            <div className="space-y-3 ">
              <Label className="text-sm text-gray-600 font-medium">
                Treating doctor <span className="text-red-500">*</span>
              </Label>

              {/* Selected Doctors List */}
              {formData.treating_doctors.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 border-1 border-gray-300 rounded-xl p-2 max-h-[180px] overflow-y-auto pr-1">
                  {formData.treating_doctors.map((doctor, index) => {
                    const colors = [
                      'bg-[#a855f7]',

                    ];
                    const avatarColor = colors[index % colors.length];

                    return (
                      <div
                        key={doctor.id}
                        onClick={() => removeTreatingDoctor(doctor.id)}
                        className="flex items-center justify-between p-2 rounded-xl border-1 border-gray-200 bg-gray-100  cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src={doctor.profilePhotoUrl} />
                            <AvatarFallback className={`${avatarColor} text-white text-xs font-bold`}>
                              {((doctor.first_name || '').slice(0, 1) +
                                (doctor.last_name || '').slice(0, 1)).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              Dr. {doctor.first_name || ""} {doctor.last_name || ""}
                            </span>
                            <span className="text-xs text-gray-500">{doctor.email}</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTreatingDoctor(doctor.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600  rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Doctor Dropdown */}
              <div className="relative">
                <Select onValueChange={addTreatingDoctor}>
                  <SelectTrigger className={`h-12 w-full text-base bg-white border-dashed border-2 ${formData.treating_doctors.length === 0 && formError ? 'border-red-300 bg-red-50/10' : 'border-gray-200 hover:border-[#7564ed] hover:bg-[#7564ed]/5'
                    } rounded-xl px-4 transition-all group text-gray-500 hover:text-[#7564ed]`}>
                    <div className="flex items-center gap-2 justify-center w-full font-medium">
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Add treating doctor</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-60 p-1">
                    {availableDoctors
                      .filter(doctor => !formData.treating_doctors.find(d => d.id === doctor.id))
                      .length > 0 ? (
                      availableDoctors
                        .filter(doctor => !formData.treating_doctors.find(d => d.id === doctor.id))
                        .map((doctor, index) => {
                          const colors = [
                            'bg-[#a855f7]',
                            'bg-[#22c55e]',
                            'bg-[#3b82f6]',
                            'bg-[#f59e0b]',
                            'bg-[#ec4899]',
                            'bg-[#14b8a6]',
                          ];
                          const avatarColor = colors[index % colors.length];

                          return (
                            <SelectItem
                              key={doctor.id}
                              value={doctor.id}
                              className="rounded-lg cursor-pointer my-1 focus:bg-[#7564ed]/10 focus:text-[#7564ed]"
                            >
                              <div className="flex items-center gap-3 py-1">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={doctor.profilePhotoUrl} />
                                  <AvatarFallback className={`${avatarColor} text-white text-xs font-bold`}>
                                    {((doctor.first_name || '').slice(0, 1) +
                                      (doctor.last_name || '').slice(0, 1)).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-left">
                                  <span className="font-semibold text-sm text-gray-900">
                                    Dr. {doctor.first_name || ""} {doctor.last_name || ""}
                                  </span>
                                  <span className="text-xs text-gray-500">{doctor.email}</span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })
                    ) : (
                      <div className="p-4 text-sm text-gray-500 text-center flex flex-col items-center gap-2">
                        <UserPlus className="h-8 w-8 text-gray-300" />
                        <p>All available doctors added</p>
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {formData.treating_doctors.length === 0 && formError && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  At least one doctor is required
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 mt-6">
            {/* Remove Button */}
            <Button
              type="button"
              onClick={() => {
                if (onDelete) onDelete(patient);
              }}
              className="bg-red-50 hover:bg-red-100 text-red-600 hover:outline-red-600 hover:outline-2 h-12 px-6 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-semibold">Remove</span>
            </Button>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                className="h-12 px-6 text-base font-semibold text-gray-500 hover:text-gray-700 hover:bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="text-lg font-bold bg-[#EBE8FC] border-3 border-transparent hover:border-[#7564ed] cursor-pointer text-[#7564ed]  h-12 px-8 text-base font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      <DeleteTreatingDoctorDialog
        open={isDeleteDoctorOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteDoctorOpen(false);
            setDoctorToDelete(null);
          }
        }}
        doctor={doctorToDelete}
        patient={formData}
        onConfirm={handleConfirmRemoveDoctor}
      />
    </Dialog>
  );
};

export default EditPatientDialog;