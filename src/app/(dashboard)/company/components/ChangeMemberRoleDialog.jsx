import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import useUserStore from "@/components/features/profile/store/userStore";
import { useTranslation } from "react-i18next";
import ClinicPasswordVerifyStep from "@/components/features/clinic-profile/ClinicPasswordVerifyStep";

export const ChangeMemberRoleDialog = ({
  open,
  onOpenChange,
  member,
  newRole,
  setNewRole,
  onConfirm,
  loading,
  message
}) => {
  const { t } = useTranslation();
  const { userInfo, mapRoleToAPI } = useUserStore();
  const [step, setStep] = useState(1);

  if (!member) return null;

  const roleOptions = [
    { value: 'limited_access', label: t('company.roles.limited_access') },
    { value: 'clinic_access', label: t('company.roles.clinic_access') },
    { value: 'assistant_access', label: t('company.roles.assistant_access') },
    { value: 'full_access', label: t('company.roles.full_access') }
  ];

  // Extract first and last name from member
  const firstName = member.firstName || member.name?.split(' ')[0] || '';
  const lastName = member.lastName || member.name?.split(' ').slice(1).join(' ') || '';

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setStep(1);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white border-2 border-gray-200 shadow-2xl max-w-xl">
        {step === 1 ? (
          <ClinicPasswordVerifyStep
            userEmail={userInfo?.email}
            onSuccess={() => setStep(2)}
            onBack={() => handleOpenChange(false)}
            title={t('company.securityCheck')}
            description={t('company.securityCheckEditRole')}
          />
        ) : (
          <>
            <DialogHeader className="pb-2">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-gray-900 text-3xl font-bold">
                  {t('company.editMemberTitle')}
                </DialogTitle>
                <button
                  onClick={() => handleOpenChange(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* First Name and Last Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('profile.firstName')}
                  </label>
                  <Input
                    value={firstName}
                    disabled
                    className="h-11 text-base bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('profile.lastName')}
                  </label>
                  <Input
                    value={lastName}
                    disabled
                    className="h-11 text-base bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('company.inviteEmail')} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={member.email}
                  disabled
                  className="h-11 text-base bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Clinical Access */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('company.clinicalAccessLabel')}
                </label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="h-11 w-full text-base border-1 bg-white border-gray-300 focus:border-[#7564ed] ">
                    <SelectValue placeholder={t('company.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              {message && (
                <div className={`p-3 rounded-2xl text-sm font-medium ${message.includes('succès')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
                  }`}>
                  {message}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
                className="text-lg font-semibold border text-gray-600 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
              >
                {t('company.cancel')}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={loading || !newRole || newRole === mapRoleToAPI(member.role)}
                className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
              >
                {loading ? t('company.updating') : t('company.saveChanges')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}; 