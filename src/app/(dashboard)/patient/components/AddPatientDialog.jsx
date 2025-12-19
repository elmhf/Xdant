import React, { useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, X, ChevronDown, Trash2, UserPlus } from "lucide-react";
import { useClinicMembers } from "@/app/(dashboard)/company/hooks";
import useUserStore from "@/components/features/profile/store/userStore";
import { validatePatientForm, getInitialFormData, resetFormData, preparePatientDataForAPI } from '../utils/formUtils';

const AddPatientDialog = ({ isOpen, onClose, onPatientAdded }) => {
  const [formData, setFormData] = useState(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setFormData(prev => {
      const updated = {
        ...prev,
        treating_doctors: prev.treating_doctors.filter(d => d.id !== doctorId)
      };
      return updated;
    });
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
      const patientData = preparePatientDataForAPI(formData, currentClinic, currentUser);

      const data = await apiClient('/api/patients/add', {
        method: 'POST',
        body: JSON.stringify(patientData)
      });

      setFormSuccess("Patient added successfully!");

      // Reset form
      resetFormData(setFormData, setFormError, setFormSuccess);

      onClose();
      if (onPatientAdded) {
        onPatientAdded();
      }

    } catch (error) {
      console.error('Error adding patient:', error);
      setFormError(error.message || 'Failed to add patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    resetFormData(setFormData, setFormError, setFormSuccess);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-3xl sm:max-w-3xl max-h-[90vh]  overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            New patient
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
                value={formData.first_name}
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
                value={formData.last_name}
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
              value={formData.email}
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
                value={formData.phone}
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
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="h-12 w-full text-base border-1 border-gray-300 focus:border-[#7564ed] rounded-lg"
              />
            </div>
          </div>

          {/* Date of Birth and Patient ID */}
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
                  value={formData.date_of_birth}
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
          <div className="space-y-3">
            <Label className="text-sm text-gray-600 font-medium">
              Treating doctor <span className="text-red-500">*</span>
            </Label>

            {/* Selected Doctors List */}
            {formData.treating_doctors.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 border-1 border-gray-300 rounded-xl p-2 max-h-[180px] overflow-y-auto pr-1">
                {formData.treating_doctors.map((doctor, index) => {
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
                    <div
                      key={doctor.id}
                      onClick={() => removeTreatingDoctor(doctor.id)}
                      className="flex items-center justify-between p-2 rounded-xl border-1 border-gray-200 bg-gray-100 cursor-pointer transition-all group"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTreatingDoctor(doctor.id);
                        }}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all"
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

          {/* Action Buttons */}
          <div className="flex gap-3 w-72 items-end">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 w-10 h-12 text-base   text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-[#7564ed] hover:bg-[#7553db] disabled:bg-purple-300 text-white h-12 text-base font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-1 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientDialog;