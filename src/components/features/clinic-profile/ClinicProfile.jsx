"use client"
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import ClinicInfoForm from "./ClinicInfoForm";
import ClinicEmailForm from "./ClinicEmailForm";
import ClinicPhoneForm from "./ClinicPhoneForm";
import ClinicPasswordVerifyStep from "./ClinicPasswordVerifyStep";
import ClinicImagesCard from "./ClinicImagesCard";
import useUserStore from "@/components/features/profile/store/userStore";
import { X } from "lucide-react";

export default function ClinicProfile({ canEditClinic, userRole }) {
  const { userInfo, getCurrentClinic } = useUserStore();
  const currentClinic = getCurrentClinic();
  const [clinicInfo, setClinicInfo] = useState(currentClinic || {});
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [step, setStep] = useState(1); // 1: password, 2: edit
  const [loading, setLoading] = useState(true);
  const getUserInfo = useUserStore(state => state.getUserInfo);

  // Check if user has permission to edit based on role
  const canEdit = canEditClinic && (userRole === 'full_access' || userRole === 'admin' || userRole === 'owner');


  useEffect(() => {
    setLoading(true);
    getUserInfo().then(res => {
      setLoading(false);
    });
  }, [getUserInfo]);

  // Update clinicInfo when currentClinic changes
  useEffect(() => {
    setClinicInfo(currentClinic || {});
  }, [currentClinic]);

  // Handlers for updating each field
  const handleInfoSave = (newInfo) => {
    setClinicInfo(info => ({ ...info, ...newInfo }));
    setSelectedOption(null);
    setStep(1);
  };
  const handleEmailSave = (newEmail) => {
    setClinicInfo(info => ({ ...info, email: newEmail }));
    setSelectedOption(null);
    setStep(1);
  };
  const handlePhoneSave = (newPhone) => {
    setClinicInfo(info => ({ ...info, phone: newPhone }));
    setSelectedOption(null);
    setStep(1);
  };

  // Dialog navigation
  const handleClose = () => {
    setSelectedOption(null);
    setOpen(false);
    setStep(1);
  };

  let content = null;
  let title = "";
  if (selectedOption === "name") {
    if (step === 1) {
      content = <ClinicPasswordVerifyStep userEmail={userInfo.email} onSuccess={() => setStep(2)} onBack={handleClose} />;
      title = "";
    } else {
      content = <ClinicInfoForm values={clinicInfo} onSave={handleInfoSave} onBack={handleClose} />;
      title = "General info";
    }
  } else if (selectedOption === "email") {
    if (step === 1) {
      content = <ClinicPasswordVerifyStep userEmail={userInfo.email} onSuccess={() => setStep(2)} onBack={handleClose} />;
      title = "";
    } else {
      content = <ClinicEmailForm value={clinicInfo.email} onSave={handleEmailSave} onBack={handleClose} />;
      title = "E-mail";
    }
  } else if (selectedOption === "phone") {
    if (step === 1) {
      content = <ClinicPasswordVerifyStep userEmail={userInfo.email} onSuccess={() => setStep(2)} onBack={handleClose} />;
      title = "";
    } else {
      content = <ClinicPhoneForm value={clinicInfo.phone} onSave={handlePhoneSave} onBack={handleClose} />;
      title = "Téléphone";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7564ed]"></div>
      </div>
    );
  }

  // Helper to display '-' if value is null, undefined, or empty string
  function displayField(value) {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 ">Non spécifié</span>;
    }
    return <span className=" text-gray-900">{value}</span>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full items-start justify-center py-0">
      <Card className="w-full rounded-xl py-0  border-2 border-gray-200 bg-white">
        <CardContent className="p-7">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">General info</h2>
          </div>

          {/* Company name */}
          <div className="space-y-2 mb-4">
            <label className="text-sm font-semibold text-gray-700">
              Company name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={clinicInfo.clinic_name || ""}
              disabled
              className="h-12 text-base  max-w-sm  rounded-2xl px-3 w-full text-gray-900"
            />
          </div>

          {/* Website */}
          <div className="space-y-2 mb-4">
            <label className="text-sm font-semibold text-gray-700">Website</label>
            <Input
              type="url"
              value={clinicInfo.website || ""}
              disabled
              className="h-12 text-base   rounded-2xl px-3 w-full text-gray-900"
            />
          </div>

          {/* Country & State/Region Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Country</label>
              <Input
                type="text"
                value={clinicInfo.country || ""}
                disabled
                className="h-12 text-base   rounded-2xl px-3 w-full text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">State/Region</label>
              <Input
                type="text"
                value={clinicInfo.neighbourhood || ""}
                disabled
                className="h-12 text-base   rounded-2xl px-3 w-full text-gray-900"
              />
            </div>
          </div>

          {/* City & Zip code Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">City</label>
              <Input
                type="text"
                value={clinicInfo.city || ""}
                disabled
                className="h-12 text-base   rounded-2xl px-3 w-full text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Zip code</label>
              <Input
                type="text"
                value={clinicInfo.postal_code || ""}
                disabled
                className="h-12 text-base   rounded-2xl px-3 w-full text-gray-900"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2 mb-6">
            <label className="text-sm font-semibold text-gray-700">Address</label>
            <Input
              type="text"
              value={clinicInfo.street_address || ""}
              disabled
              className="h-12 text-base   rounded-2xl px-3 w-full text-gray-900"
            />
          </div>

          {/* Edit clinic info button */}
          <div className="mb-6 w-full flex justify-end">
            <button
              onClick={() => { setSelectedOption("name"); setStep(1); setOpen(true); }}
              disabled={!canEdit}
              className="px-4 py-2 cursor-pointer text-lg text-[#7564ed] hover:bg-gray-100 rounded-2xl transition-colors font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              Edit clinic info
            </button>
          </div>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Clinic contact</h2>
          </div>
          {/* Email & Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <div className="flex gap-3">
                <Input
                  type="email"
                  value={clinicInfo.email || ""}
                  disabled
                  className="h-12    rounded-2xl px-3 flex-1 text-gray-900"
                />
                <button
                  onClick={() => { setSelectedOption("email"); setStep(1); setOpen(true); }}
                  disabled={!canEdit}
                  className="px-4 py-2 cursor-pointer text-lg text-[#7564ed] hover:bg-gray-100 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent font-medium whitespace-nowrap"
                >
                  Edit
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <div className="flex gap-3">
                <Input
                  type="tel"
                  value={clinicInfo.phone || ""}
                  disabled
                  className="h-12 text-base   rounded-2xl px-3 flex-1 text-gray-900"
                />
                <button
                  onClick={() => { setSelectedOption("phone"); setStep(1); setOpen(true); }}
                  disabled={!canEdit}
                  className="px-4 py-2 cursor-pointer text-lg text-[#7564ed] hover:bg-gray-100 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent font-medium whitespace-nowrap"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ClinicImagesCard canEditClinic={canEditClinic} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-2xl bg-white p-0 border-2 border-gray-200 shadow-2xl">
          <div>
            <div className="flex items-center justify-between px-8 pt-8 pb-6">
              <DialogTitle className="sr-only">{title}</DialogTitle>
              <h3 className="text-3xl font-bold flex-1 text-start text-gray-900">{title}</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 