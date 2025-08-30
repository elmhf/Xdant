import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, X, ChevronDown } from "lucide-react";
import { useClinicMembers } from "@/app/(dashboard)/company/hooks";
import useUserStore from "@/app/component/profile/store/userStore";
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
    email: member.email || ''
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
      
      const response = await fetch('http://localhost:5000/api/patients/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(patientData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add patient');
      }

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
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
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
                className={`h-12 w-full text-base border-2 ${
                  !formData.first_name && formError ? 'border-red-500' : 'border-gray-200'
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
                className={`h-12 w-full text-base border-2 ${
                  !formData.last_name && formError ? 'border-red-500' : 'border-gray-200'
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
              placeholder="Enter email address (optional)"
              className="h-12 w-full text-base border-2 border-gray-200 focus:border-[#7564ed] rounded-lg"
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
                placeholder="Enter phone number (optional)"
                className="h-12 w-full text-base border-2 border-gray-200 focus:border-[#7564ed] rounded-lg"
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
                placeholder="Enter address (optional)"
                className="h-12 w-full text-base border-2 border-gray-200 focus:border-[#7564ed] rounded-lg"
              />
            </div>
          </div>

          {/* Date of Birth and Patient ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className={`h-12 w-full text-base border-2 ${
                    !formData.date_of_birth && formError ? 'border-red-500' : 'border-gray-200'
                  } focus:border-[#7564ed] rounded-lg`}
                />
              </div>
              {!formData.date_of_birth && formError && (
                <p className="text-red-500 text-sm">Field is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patient_id" className="text-sm text-gray-600">
                Patient ID
              </Label>
              <Input
                id="patient_id"
                type="text"
                className="h-12 w-full text-base border-2 border-gray-200 focus:border-[#7564ed] rounded-lg"
                placeholder="Auto-generated"
                disabled
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">
              Gender <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              {['Male', 'Female', 'Other'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => handleInputChange('gender', gender.toLowerCase())}
                  className={`px-6 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    formData.gender === gender.toLowerCase()
                      ? 'bg-[#7564ed] text-white border-[#7564ed]'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-[#7564ed]'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
            {!formData.gender && formError && (
              <p className="text-red-500 text-sm">Field is required</p>
            )}
          </div>

          {/* Treating Doctors */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">
              Treating doctor <span className="text-red-500">*</span>
            </Label>
            
            <div className="relative">
              {/* Dropdown for selecting doctors with selected ones shown as tags */}
              <div className="relative">
                                 <Select onValueChange={addTreatingDoctor}>
                   <SelectTrigger className={`h-fit w-full text-base border-2 ${
                     formData.treating_doctors.length === 0 && formError ? 'border-red-500' : 'border-purple-200'
                   } focus:border-[#7564ed] rounded-lg bg-white p-2`}>
                     <div className="flex flex-wrap gap-2 items-center w-full">
                      {formData.treating_doctors.length > 0 ? (
                        formData.treating_doctors.map((doctor) => (
                          <div
                            key={doctor.id}
                            className="flex items-center gap-2 bg-purple-50 text-purple-900 px-3 py-1.5 rounded-full border border-purple-200"
                          >
                                                         <Avatar className="h-5 w-5">
                               <AvatarFallback className="bg-[#7564ed] text-white text-xs">
                                 {((doctor.first_name || '').slice(0, 1) + 
                                   (doctor.last_name || '').slice(0, 2)).toUpperCase()}
                               </AvatarFallback>
                             </Avatar>
                                                         <span className="text-sm font-medium">
                               {doctor.first_name || ""} {doctor.last_name || ""}
                             </span>
                                                         <div
                            onPointerDown ={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeTreatingDoctor(doctor.id);
                              }}
                               className="text-purple-600 hover:text-purple-800 ml-1 cursor-pointer p-1 rounded-full hover:bg-purple-100 transition-colors"
                             >
                               <X className="w-3 h-3" />
                             </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-base">Select doctor</span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 ml-2 flex-shrink-0" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableDoctors
                      .filter(doctor => !formData.treating_doctors.find(d => d.id === doctor.id))
                      .length > 0 ? (
                      availableDoctors
                        .filter(doctor => !formData.treating_doctors.find(d => d.id === doctor.id))
                        .map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                                                           <Avatar className="h-6 w-6">
                               <AvatarFallback className="bg-[#7564ed] text-white text-xs">
                                 {((doctor.first_name || '').slice(0, 1) + 
                                   (doctor.last_name || '').slice(0, 2)).toUpperCase()}
                               </AvatarFallback>
                             </Avatar>
                              <div>
                                                                 <div className="font-medium text-sm">
                                   {doctor.first_name || ""} {doctor.last_name || ""}
                                 </div>
                                <div className="text-xs text-gray-500">{doctor.email}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        All doctors have been selected
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.treating_doctors.length === 0 && formError && (
              <p className="text-red-500 text-sm">Field is required</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 text-base border-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg"
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
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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