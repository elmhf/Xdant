import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, X, ChevronDown } from "lucide-react";
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
      email: member.email || ''
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
        throw new Error(data.error || 'Failed to add doctors');
      }

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
      <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
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
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">
              Select Doctors <span className="text-red-500">*</span>
            </Label>
            
            <div className="relative">
              <Select onValueChange={addDoctor} value={selectedDoctors.map(doctor => doctor.id).join(',')}>
                <SelectTrigger className={`h-fit w-full text-base border-2 ${
                  selectedDoctors.length === 0 && formError ? 'border-red-500' : 'border-[#7564ed]'
                } focus:border-[#7564ed] rounded-lg bg-white p-2`}>
                  <div className="flex flex-wrap gap-2 items-center w-full">
                    {selectedDoctors.length > 0 ? (
                      selectedDoctors.map((doctor) => (
                        <div
                          key={doctor.id}
                          className="flex items-center gap-2 bg-[#7564ed] text-white px-3 py-1.5 rounded-full border border-[#7564ed]"
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="bg-purple-500 text-white text-xs">
                              {((doctor.first_name || '').slice(0, 1) + 
                                (doctor.last_name || '').slice(0, 2)).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {doctor.first_name || ""} {doctor.last_name || ""}
                          </span>
                          <div
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeDoctor(doctor.id);
                            }}
                            className="text-[#7564ed] hover:text-purple-800 ml-1 cursor-pointer p-1 rounded-full hover:bg-purple-100 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500 text-base">Select doctors</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 ml-2 flex-shrink-0" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableDoctors.length > 0 ? (
                    availableDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-purple-500 text-white text-xs">
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
                      No available doctors to add
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedDoctors.length === 0 && formError && (
              <p className="text-red-500 text-sm">Please select at least one doctor</p>
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
              disabled={isSubmitting || selectedDoctors.length === 0}
              className="flex-1 bg-[#7564ed] hover:bg-[#7558db] disabled:bg-purple-300 text-white h-12 text-base font-medium rounded-lg transition-colors"
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