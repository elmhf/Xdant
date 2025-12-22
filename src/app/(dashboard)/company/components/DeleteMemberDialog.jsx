import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import useUserStore from "@/components/features/profile/store/userStore";
import ClinicPasswordVerifyStep from "@/components/features/clinic-profile/ClinicPasswordVerifyStep";

export const DeleteMemberDialog = ({
  open,
  onOpenChange,
  member,
  onConfirm,
  loading,
  message
}) => {
  const { userInfo } = useUserStore();
  const [step, setStep] = useState(1);

  if (!member) return null;

  // Extract first and last name from member
  const firstName = member.firstName || member.name?.split(' ')[0] || '';
  const lastName = member.lastName || member.name?.split(' ').slice(1).join(' ') || '';
  const fullName = `${firstName} ${lastName}`.trim() || member.name || 'Unknown';

  // Avatar image URL
  const avatarUrl = member.profilePhotoUrl
    ? useUserStore.getState().getImageFromCache(member.profilePhotoUrl)?.src || member.profilePhotoUrl
    : `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`;

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setStep(1);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white border-2 border-gray-200 shadow-2xl max-w-[500px]">
        {step === 1 ? (
          <ClinicPasswordVerifyStep
            userEmail={userInfo?.email}
            onSuccess={() => setStep(2)}
            onBack={() => handleOpenChange(false)}
            title="Security Check"
            description="Please verify your password to delete this member."
          />
        ) : (
          <>
            <DialogHeader className="pb-2">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-gray-900 text-xl font-bold opacity-0">
                  Remove Member
                </DialogTitle>
                <button
                  onClick={() => handleOpenChange(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </DialogHeader>

            {/* Member Profile */}
            <div className="flex flex-col items-center pb-4">
              <Avatar className="h-40 w-40 mb-3 border-2 border-gray-200">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-semibold">
                  {fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Description */}
            <div className="text-center pb-6">
              <h2 className="text-2xl font-bold text-gray-900 ">
                Remove Member?
              </h2>
              <p className="text-gray-500 text-base">
                Are you sure you want to remove{' '}
                <span className="text-[#5b9bff] font-medium">{firstName} {lastName}</span>
                {' '}from your workspace
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-2xl text-sm font-medium mb-4 ${message.includes('succès')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
                }`}>
                {message}
              </div>
            )}

            <DialogFooter className="pt-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
                className="flex-1 h-12 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 h-12 text-base font-medium bg-[#FF254E] hover:bg-[#ff4a5f] text-white border-0"
              >
                {loading ? "Removing..." : "Yes, remove"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}; 