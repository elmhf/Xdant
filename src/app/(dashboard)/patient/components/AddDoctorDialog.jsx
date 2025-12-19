import React, { useState, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, X, ChevronDown, Trash2, UserPlus } from "lucide-react";
import { useClinicMembers } from "@/app/(dashboard)/company/hooks";

const AddDoctorDialog = ({ isOpen, onClose, onDoctorAdded, patient, currentTreatingDoctors = [] }) => {
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Get clinic members as available doctors
  const { clinicMembers } = useClinicMembers();

  const availableDoctors = clinicMembers
    .filter(member => !currentTreatingDoctors.find(d => d.id === (member.user_id || member.id)))
    .filter(member => !selectedDoctors.find(d => d.id === (member.user_id || member.id)))
    .map(member => ({
      id: member.user_id || member.id,
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
      name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
      email: member.email || '',
      profilePhotoUrl: member.profilePhotoUrl || null
    }));

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedDoctors([]);
      setFormError("");
      setFormSuccess("");
    }
  }, [isOpen]);

  const addDoctor = (doctorId) => {
    const doctor = availableDoctors.find(d => d.id === doctorId);
    if (doctor && !selectedDoctors.find(d => d.id === doctorId)) {
      setSelectedDoctors(prev => [...prev, doctor]);
    }
  };

  const removeDoctor = (doctorId) => {
    setSelectedDoctors(prev => prev.filter(d => d.id !== doctorId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedDoctors.length === 0) {
      setFormError("Please select at least one doctor");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      // Combine existing doctors with new selected doctors
      const existingDoctorIds = currentTreatingDoctors.map(doctor => doctor.id);
      const newDoctorIds = selectedDoctors.map(doctor => doctor.id);
      const treating_doctor_ids = [...existingDoctorIds, ...newDoctorIds];

      const patientData = {
        patientId: patient.id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        gender: patient.gender,
        date_of_birth: patient.date_of_birth,
        email: patient.email || "",
        phone: patient.phone || "",
        address: patient.address || "",
        treating_doctor_id: treating_doctor_ids
      };

      const data = await apiClient('/api/patients/update', {
        method: 'PUT',
        body: JSON.stringify(patientData)
      });

      setFormSuccess("Doctors added successfully!");

      // Close dialog after success
      setTimeout(() => {
        onClose();
        if (onDoctorAdded) {
          onDoctorAdded();
        }
      }, 1000);

    } catch (error) {
      console.error('Error adding doctors:', error);
      setFormError(error.message || 'Failed to add doctors');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-4xl font-bold text-gray-900">
            Add Treating Doctors
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

          {/* Patient Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Patient:</h3>
            <p className="text-gray-700">{patient.first_name} {patient.last_name}</p>
          </div>

          {/* Select Doctors */}
          <div className="space-y-3">
            <Label className="text-sm text-gray-600 font-medium">
              Select Doctors <span className="text-red-500">*</span>
            </Label>

            {/* Selected Doctors List */}
            {selectedDoctors.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 border border-gray-200 rounded-xl p-2 max-h-[160px] overflow-y-auto pr-1">
                {selectedDoctors.map((doctor, index) => {
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
                      onClick={() => removeDoctor(doctor.id)}
                      className="flex items-center justify-between p-2 rounded-xl border border-gray-200 bg-gray-100 hover:bg-red-50 hover:border-red-200 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
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
                          removeDoctor(doctor.id);
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

            <div className="relative">
              <Select onValueChange={addDoctor} value={selectedDoctors.map(doctor => doctor.id).join(',')}>
                <SelectTrigger className={`h-12 w-full text-base bg-white border-dashed border-2 ${selectedDoctors.length === 0 && formError ? 'border-red-300 bg-red-50/10' : 'border-gray-200 hover:border-[#7564ed] hover:bg-[#7564ed]/5'
                  } rounded-xl px-4 transition-all group text-gray-500 hover:text-[#7564ed]`}>
                  <div className="flex items-center gap-2 justify-center w-full font-medium">
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Add treating doctor</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60 p-1">
                  {availableDoctors.length > 0 ? (
                    availableDoctors.map((doctor, index) => {
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
                              <div className="font-medium text-sm">
                                Dr. {doctor.first_name || ""} {doctor.last_name || ""}
                              </div>
                              <div className="text-xs text-gray-500">{doctor.email}</div>
                            </div>
                          </div>
                        </SelectItem>
                      )
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
            {selectedDoctors.length === 0 && formError && (
              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">Please select at least one doctor</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 text-base"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedDoctors.length === 0}
              className="flex-1 bg-[#7564ed] hover:bg-[#7558db] disabled:bg-[#7558db] text-white h-12 text-base font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                "Add Doctors"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDoctorDialog;