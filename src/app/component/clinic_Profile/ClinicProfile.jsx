"use client"
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import useUserStore from "../profile/store/userStore";

export default function ClinicProfile({ canEditClinic }) {
  const { userInfo, getCurrentClinic } = useUserStore();
  const currentClinic = getCurrentClinic();
  const [clinicInfo, setClinicInfo] = useState(currentClinic || {});
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [step, setStep] = useState(1); // 1: password, 2: edit
  const [loading, setLoading] = useState(true);
  const getUserInfo = useUserStore(state => state.getUserInfo);


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
  const handleBackToMain = () => {
    setSelectedOption(null);
    setStep(1);
  };
  const handleClose = () => {
    setSelectedOption(null);
    setOpen(false);
    setStep(1);
  };

  let content = null;
  let title = "";
  if (selectedOption === "name") {
    if (step === 1) {
      content = <ClinicPasswordVerifyStep userEmail={userInfo.email} onSuccess={() => setStep(2)} onBack={handleBackToMain} />;
      title = "Vérification du mot de passe";
    } else {
      content = <ClinicInfoForm values={clinicInfo} onSave={handleInfoSave} onBack={handleBackToMain} />;
      title = "Informations de la clinique";
    }
  } else if (selectedOption === "email") {
    if (step === 1) {
      content = <ClinicPasswordVerifyStep userEmail={userInfo.email} onSuccess={() => setStep(2)} onBack={handleBackToMain} />;
      title = "Vérification du mot de passe";
    } else {
      content = <ClinicEmailForm value={clinicInfo.email} onSave={handleEmailSave} onBack={handleBackToMain} />;
      title = "E-mail";
    }
  } else if (selectedOption === "phone") {
    if (step === 1) {
      content = <ClinicPasswordVerifyStep userEmail={userInfo.email} onSuccess={() => setStep(2)} onBack={handleBackToMain} />;
      title = "Vérification du mot de passe";
    } else {
      content = <ClinicPhoneForm value={clinicInfo.phone} onSave={handlePhoneSave} onBack={handleBackToMain} />;
      title = "Téléphone";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7c5cff]"></div>
      </div>
    );
  }

  // Helper to display '-' if value is null, undefined, or empty string
  function displayField(value) {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 font-medium">Non spécifié</span>;
    }
    return <span className="font-semibold text-gray-900">{value}</span>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full items-start justify-center py-0">
      <Card className="w-full rounded-xl py-0  border-2 border-gray-200 bg-white">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-[900] text-gray-900">Informations de la clinique</h2>
            {canEditClinic && (
              <Button 
                variant="outline" 
                className="px-6 h-12 text-base font-semibold border-2 border-[#7c5cff] text-[#7c5cff] hover:bg-[#7c5cff] hover:text-white transition-all duration-200" 
                onClick={() => setOpen(true)}
              >
              Modifier
            </Button>
            )}
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center ">
                <span className="w-68 text-lg font-medium text-gray-600">Nom</span>
                <span className="text-lg font-semibold text-gray-900">{displayField(clinicInfo.clinic_name)}</span>
            </div>
              <div className="flex items-center ">
                <span className="w-68 text-lg font-medium text-gray-600">E-mail</span>
                <span className="text-lg font-semibold text-gray-900">{displayField(clinicInfo.email)}</span>
            </div>
              <div className="flex items-center ">
                <span className="w-68 text-lg font-medium text-gray-600">Téléphone</span>
                <span className="text-lg font-semibold text-gray-900">{displayField(clinicInfo.phone)}</span>
            </div>
              <div className="flex items-center ">
                <span className="w-68 text-lg font-medium text-gray-600">Pays</span>
                <span className="text-lg font-semibold text-gray-900">{displayField(clinicInfo.country)}</span>
            </div>
              <div className="flex items-center ">
                <span className="w-68 text-lg font-medium text-gray-600">Région</span>
                <span className="text-lg font-semibold text-gray-900">{displayField(clinicInfo.neighbourhood)}</span>
            </div>
              <div className="flex items-center ">
                <span className="w-68 text-lg font-medium text-gray-600">Ville</span>
                <span className="text-lg font-semibold text-gray-900">{displayField(clinicInfo.city)}</span>
            </div>
              <div className="flex items-center ">
                <span className="w-68 text-lg font-medium text-gray-600">Adresse</span>
                <span className="text-lg font-semibold text-gray-900">{displayField(clinicInfo.street_address)}</span>
            </div>
              <div className="flex items-center ">
                <span className="w-68 text-lg font-medium text-gray-600">Code postal</span>
                <span className="text-lg font-semibold text-gray-900">{displayField(clinicInfo.postal_code)}</span>
            </div>
              <div className="flex items-center ">
                <span className="w-68 text-lg font-medium text-gray-600">Site web</span>
            <div className="flex items-center gap-2">
              {clinicInfo.website ? (
                    <a 
                      href={clinicInfo.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-lg font-semibold text-[#7c5cff] hover:text-[#6a4fd8] hover:underline transition-colors"
                    >
                  {clinicInfo.website}
                </a>
              ) : (
                    <span className="text-lg font-semibold text-gray-400">Non spécifié</span>
              )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ClinicImagesCard canEditClinic={canEditClinic} />
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-0 border-2 border-gray-200 shadow-2xl">
          {!selectedOption ? (
            <div className="p-8">
              <DialogTitle className="mb-6 text-2xl font-bold text-gray-900">Modifier les informations de la clinique</DialogTitle>
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-14 text-lg font-medium text-gray-700 hover:bg-gray-50 hover:text-[#7c5cff] transition-all duration-200" 
                  onClick={() => { setSelectedOption("name"); setStep(1); }}
                >
                  Informations générales 
                  <span className="text-gray-400">&gt;</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-14 text-lg font-medium text-gray-700 hover:bg-gray-50 hover:text-[#7c5cff] transition-all duration-200" 
                  onClick={() => { setSelectedOption("email"); setStep(1); }}
                >
                  E-mail 
                  <span className="text-gray-400">&gt;</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-14 text-lg font-medium text-gray-700 hover:bg-gray-50 hover:text-[#7c5cff] transition-all duration-200" 
                  onClick={() => { setSelectedOption("phone"); setStep(1); }}
                >
                  Téléphone 
                  <span className="text-gray-400">&gt;</span>
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between px-8 pt-8 pb-6">
                <button 
                  onClick={handleBackToMain} 
                  className="text-2xl text-gray-700 hover:text-[#7c5cff] transition-colors" 
                  aria-label="Back"
                >
                  &#8592;
                </button>
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <h3 className="text-xl font-bold flex-1 text-center text-gray-900">{title}</h3>
                <button 
                  onClick={handleClose} 
                  className="text-2xl text-gray-700 hover:text-[#7c5cff] transition-colors" 
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              {content}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 