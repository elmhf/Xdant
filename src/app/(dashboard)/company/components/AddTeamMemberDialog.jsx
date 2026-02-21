
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import ClinicPasswordVerifyStep from "@/components/features/clinic-profile/ClinicPasswordVerifyStep";
import useUserStore from "@/components/features/profile/store/userStore";
import { useTranslation } from "react-i18next";

export const AddTeamMemberDialog = ({
    open,
    onOpenChange,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviteLoading,
    inviteMessage,
    handleInviteMember
}) => {
    const { t } = useTranslation();
    const { userInfo } = useUserStore();
    const [step, setStep] = useState(1);

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            setStep(1);
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="px-4 h-12 flex items-center justify-center rounded-xl text-xl font-medium bg-[#6a4fd8] text-white transition-all duration-200">
                    <UserPlus className="mr-2 h-5 w-5" />
                    {t('company.addTeamMember')}
                </Button>
            </DialogTrigger>
            <DialogContent className=" bg-white border-2 border-gray-200 rounded-2xl max-w-2xl">
                {step === 1 ? (
                    <ClinicPasswordVerifyStep
                        userEmail={userInfo?.email}
                        onSuccess={() => setStep(2)}
                        onBack={() => handleOpenChange(false)}
                        title={t('company.securityCheck')}
                        description={t('company.securityCheckDesc')}
                    />
                ) : (
                    <>
                        <DialogHeader className="pb-4 border-b border-gray-100">
                            <DialogTitle className="text-3xl font-bold text-gray-900">
                                {t('company.addTeamMember')}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="block text-base font-medium text-gray-500">
                                    {t('company.inviteEmail')} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="dr.ivarShohov@"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full h-12 text-base rounded-xl focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="Access level" className="block text-base font-medium text-gray-500">
                                    {t('company.inviteRole')} <span className="text-red-500">*</span>
                                </Label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger className="h-12 text-base rounded-xl w-full border-1 border-gray-300  focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20">
                                        <SelectValue placeholder={t('company.selectRole')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full_access">{t('company.roles.full_access')}</SelectItem>
                                        <SelectItem value="clinic_access">{t('company.roles.clinic_access')}</SelectItem>
                                        <SelectItem value="limited_access">{t('company.roles.limited_access')}</SelectItem>
                                        <SelectItem value="assistant_access">{t('company.roles.assistant_access')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {inviteMessage && (
                                <div className={`p-4 rounded-xl text-base font-medium border-2 bg-blue-50 border-blue-100 text-blue-600`}>
                                    {inviteMessage}
                                </div>
                            )}
                        </div>
                        <DialogFooter className="pt-6 flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleOpenChange(false)}
                                className="text-lg font-semibold border text-gray-600 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                            >
                                {t('company.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                onClick={handleInviteMember}
                                disabled={inviteLoading}
                                className="text-lg font-bold bg-[#EBE8FC]  text-[#7564ed] hover:outline-[#7564ed] hover:outline-4   transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                            >
                                {inviteLoading ? t('company.sending') : t('company.send')}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
