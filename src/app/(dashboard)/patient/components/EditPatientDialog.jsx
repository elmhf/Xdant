import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, X, ChevronDown } from "lucide-react";
import { useClinicMembers } from "@/app/(dashboard)/company/hooks";
import useUserStore from "@/app/component/profile/store/userStore";
import { validatePatientForm, getInitialFormData, resetFormData } from '../utils/formUtils';

const EditPatientDialog = ({ isOpen, onClose, onPatientUpdated, patient, hideTreatingDoctors = false }) => {
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
        throw new Error(data.error || 'Failed to update patient');
      }

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
      <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-5xl mb-2 font-[800] text-gray-900">
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
              <Label htmlFor="first_name" className="text-sm text-gray-300">
                First Name  <span className="text-red-500">*</span>
              </Label>
                             <Input
                 id="first_name"
                 type="text"
                 value={formData.first_name|| ''}
                 onChange={(e) => handleInputChange('first_name', e.target.value)}
                 className={`h-12 w-full text-base border-2 text-gray-300 hover:border-[#7564ed] transition-colors ${
                   !formData.first_name && formError ? 'border-red-500' : 'border-[#7564ed]'
                 } focus:border-[#7564ed] rounded-lg`}
               />
              {!formData.first_name && formError && (
                <p className="text-red-500 text-sm">Field is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm text-gray-300">
                Last Name <span className="text-red-500">*</span>
              </Label>
                             <Input
                 id="last_name"
                 type="text"
                 value={formData.last_name|| ''}
                 onChange={(e) => handleInputChange('last_name', e.target.value)}
                 className={`h-12 w-full text-base border-2 text-gray-300 hover:border-[#7564ed] transition-colors ${
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
            <Label htmlFor="email" className="text-sm text-gray-300">
              Email 
            </Label>
                         <Input
               id="email"
               type="email"
               value={formData.email|| ''}
               onChange={(e) => handleInputChange('email', e.target.value)}
               placeholder="Enter email address (optional)"
               className="h-12 w-full text-base border-2 border-gray-200 hover:border-[#7564ed] focus:border-[#7564ed] rounded-lg text-gray-300 transition-colors"
             />
          </div>

          {/* Phone and Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm text-gray-300">
                Phone Number 
              </Label>
                             <Input
                 id="phone"
                 type="tel"
                 value={formData.phone|| ''}
                 onChange={(e) => handleInputChange('phone', e.target.value)}
                 placeholder="Enter phone number (optional)"
                 className="h-12 w-full text-base border-2 border-gray-200 hover:border-[#7564ed] focus:border-[#7564ed] rounded-lg text-gray-300 transition-colors"
               />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm text-gray-300">
                Address 
              </Label>
                             <Input
                 id="address"
                 type="text"
                 value={formData.address|| ''}
                 onChange={(e) => handleInputChange('address', e.target.value)}
                 placeholder="Enter address (optional)"
                 className="h-12 w-full text-base border-2 border-gray-200 hover:border-[#7564ed] focus:border-[#7564ed] rounded-lg text-gray-300 transition-colors"
               />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="date_of_birth" className="text-sm text-gray-300">
              Date of birth <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
                                               <Input
                   id="date_of_birth"
                   type="date"
                   value={formData.date_of_birth|| ''}
                   onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                   max={new Date().toISOString().split('T')[0]}
                   className={`h-12 w-full text-base border-2 text-gray-300 hover:border-[#7564ed] transition-colors ${
                     !formData.date_of_birth && formError ? 'border-red-500' : 'border-gray-200'
                   } focus:border-[#7564ed] rounded-lg`}
                 />
            </div>
            {!formData.date_of_birth && formError && (
              <p className="text-red-500 text-sm">Field is required</p>
            )}
          </div>

                     {/* Gender */}
           <div className="space-y-2">
             <Label className="text-sm text-gray-300">
               Gender <span className="text-red-500">*</span>
             </Label>
             <div className="flex gap-2">
               {['Male', 'Female'].map((gender) => (
                 <button
                   key={gender}
                   type="button"
                   onClick={() => handleInputChange('gender', gender.toLowerCase())}
                   className={`px-6 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                     formData.gender === gender.toLowerCase()
                       ? 'bg-[#7564ed] text-white border-[#7564ed]'
                       : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-[#7564ed] hover:bg-[#6a4fd8] hover:text-white'
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
          {!hideTreatingDoctors && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">
                Treating doctor <span className="text-red-500">*</span>
              </Label>
              
              <div className="relative">
                {/* Dropdown for selecting doctors with selected ones shown as tags */}
                <div className="relative">
                  <Select onValueChange={addTreatingDoctor}>
                                           <SelectTrigger className={`h-fit w-full text-base border-2 ${
                        formData.treating_doctors.length === 0 && formError ? 'border-red-500' : 'border-[#7564ed]'
                      } focus:border-[#7564ed] rounded-lg bg-white p-2`}>
                       <div className="flex flex-wrap gap-2 items-center w-full">
                        {formData.treating_doctors.length > 0 ? (
                          formData.treating_doctors.map((doctor) => (
                                                         <div
                               key={doctor.id}
                               className="flex items-center gap-2 bg-[#7564ed]/10 text-[#7564ed] px-3 py-1.5 rounded-full border border-[#7564ed]/30"
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
                                 className="text-[#7564ed] hover:text-[#6a4fd8] ml-1 cursor-pointer p-1 rounded-full hover:bg-[#7564ed]/10 transition-colors"
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
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
                         <Button
               type="button"
               onClick={onClose}
               variant="outline"
               className="flex-1 h-12 text-base border-2 border-gray-200 text-[#7564ed] hover:bg-[#7564ed]/10 rounded-lg"
             >
               Cancel
             </Button>
             <Button
               type="button"
               onClick={handleSubmit}
               disabled={isSubmitting}
               className="flex-1 bg-[#7564ed] hover:bg-[#6a4fd8] disabled:bg-[#7564ed]/50 text-white h-12 text-base font-medium rounded-lg transition-colors"
             >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientDialog;