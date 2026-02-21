import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Building2, Trash2, UserCog, Check, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useUserStore from '@/components/features/profile/store/userStore';
import { useTranslation } from "react-i18next";

export const LeaveClinicDialog = ({
  open,
  onOpenChange,
  clinic,
  onConfirm,
  loading,
  message
}) => {
  const { t } = useTranslation();
  console.log("leave clinic", clinic);
  const [action, setAction] = useState('delete'); // 'delete' or 'transfer'
  const [newOwnerId, setNewOwnerId] = useState('');
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [confirmUnderstand, setConfirmUnderstand] = useState(false);
  const [confirmLoseAccess, setConfirmLoseAccess] = useState(false);
  const user = useUserStore(state => state.userInfo);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setAction('delete');
      setNewOwnerId('');
      setMembers([]);
    }
  }, [open]);

  // Fetch members when transfer is selected
  useEffect(() => {
    if (open && clinic && action === 'transfer' && members.length === 0) {
      const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
          // Pass null/empty for pagination/search to get all if possible, or simple list
          // Using the store's fetchClinicMembers. 
          // Note: fetchClinicMembers usually updates store, we might want just data.
          // Let's assume fetchClinicMembers returns { success, members } as seen in useClinicMembers
          const result = await useUserStore.getState().fetchClinicMembers(clinic.id);
          console.log("result*****", result, useUserStore.getState().userInfo);
          if (result.success) {
            // Filter out self and non-active members
            const validMembers = result.members.filter(m =>
              m.user_id != useUserStore.getState().userInfo?.user_id
            );
            console.log("validMembers", validMembers);
            setMembers(validMembers);
          }
        } catch (error) {
          console.error("Failed to fetch members", error);
        } finally {
          setLoadingMembers(false);
        }
      };
      fetchMembers();
    }
  }, [open, clinic, action]);

  if (!clinic) return null;

  const isOwner = clinic.created_by === user?.user_id; // Check created_by against current user id
  console.log("isOwner", isOwner, clinic.created_by, user?.user_id);
  const handleConfirm = () => {
    console.log("action", action);
    console.log("newOwnerId", newOwnerId);
    if (isOwner) {
      if (action === 'transfer' && !newOwnerId) return;
      onConfirm(action, newOwnerId);
    } else {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-2 border-gray-200 rounded-2xl max-w-2xl">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-3 text-gray-900 text-3xl font-bold">
            {t('company.leaveClinic')}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            {isOwner ? (
              <>
                {t('company.leaveClinicDescriptionOwner', { name: clinic.clinic_name || clinic.clinicName || clinic.name })}
              </>
            ) : (
              <>
                {t('company.leaveClinicDescriptionMember', { name: clinic.clinic_name || clinic.clinicName || clinic.name })}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className=" space-y-6">


          {isOwner && (
            <div className="space-y-4">
              <Label className="text-base text-gray-900 font-semibold">{t('company.whatDoYouWantToDo')}</Label>
              <RadioGroup value={action} onValueChange={setAction} className="grid grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="delete" id="delete" className="peer sr-only" />
                  <Label
                    htmlFor="delete"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50 cursor-pointer transition-all"
                  >
                    <Trash2 className="mb-3 h-6 w-6 text-red-500" />
                    <span className="font-semibold text-gray-900">{t('company.deleteClinic')}</span>
                    <span className="text-xs text-center text-gray-500 mt-1">{t('company.deleteClinicDesc', { name: clinic.clinic_name || clinic.clinicName || clinic.name })}</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="transfer" id="transfer" className="peer sr-only" />
                  <Label
                    htmlFor="transfer"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all"
                  >
                    <UserCog className="mb-3 h-6 w-6 text-blue-500" />
                    <span className="font-semibold text-gray-900">{t('company.transferClinic')}</span>
                    <span className="text-xs text-center text-gray-500 mt-1">{t('company.transferClinicDesc')}</span>
                  </Label>
                </div>
              </RadioGroup>

              {action === 'transfer' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-base font-semibold text-gray-700">{t('company.newOwner')}</Label>
                  <Select value={newOwnerId} onValueChange={setNewOwnerId}>
                    <SelectTrigger className="h-12 rounded-xl text-base border-2 border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder={t('company.selectMember')} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingMembers ? (
                        <div className="flex justify-center p-2"><Loader2 className="w-4 h-4 animate-spin" /></div>
                      ) : members.length > 0 ? (
                        members.map((member) => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.user?.firstName} {member.user?.lastName} ({member.user?.email})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500 text-center">{t('company.noEligibleMembers')}</div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{t('company.newOwnerAdminAccess')}</p>
                </div>
              )}

              {action === 'delete' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-800">
                  {t('company.irreversibleAction')}
                </div>
              )}
            </div>
          )}

          {!isOwner && (
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-2">{t('company.aboutToLeaveClinic')}</p>
                  <ul className="space-y-1.5 text-sm">
                    <li>• {t('company.loseAccessPatients')}</li>
                    <li>• {t('company.cannotSeeAppointments')}</li>
                    <li>• {t('company.mustBeReinvited')}</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3 pl-1">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="confirm-understand"
                    checked={confirmUnderstand}
                    onCheckedChange={setConfirmUnderstand}
                    className="mt-0.5"
                  />
                  <label htmlFor="confirm-understand" className="text-sm text-gray-700 cursor-pointer">
                    {t('company.confirmUnderstandConsequences')}
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="confirm-lose-access"
                    checked={confirmLoseAccess}
                    onCheckedChange={setConfirmLoseAccess}
                    className="mt-0.5"
                  />
                  <label htmlFor="confirm-lose-access" className="text-sm text-gray-700 cursor-pointer">
                    {t('company.confirmLoseDataAccess')}
                  </label>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-3 p-3 rounded-2xl text-sm ${message.includes('succès') || message.includes('success')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
              {message}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-lg font-semibold border text-gray-600 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
          >
            {t('company.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || (isOwner && action === 'transfer' && !newOwnerId) || (!isOwner && (!confirmUnderstand || !confirmLoseAccess))}
            className="text-lg font-bold bg-[#FF254E] hover:bg-[#ff4a5f] text-white border-0 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
          >
            {loading
              ? t('company.processing')
              : isOwner
                ? (action === 'delete' ? t('company.deleteClinicAction') : t('company.transferAndLeave'))
                : t('company.leaveClinic')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
