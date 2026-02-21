import React from 'react';
import { useTranslation } from "react-i18next";
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

export const DeleteInvitationDialog = ({
  open,
  onOpenChange,
  invitation,
  onConfirm,
  loading,
  message
}) => {
  const { t } = useTranslation();
  if (!invitation) return null;

  // Get initials from email
  const emailInitials = invitation.email?.substring(0, 2).toUpperCase() || 'IN';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-2 border-gray-200 shadow-2xl max-w-[500px]">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-gray-900 text-xl font-bold opacity-0">
              {t('company.deleteInvitationTitle')}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Invitation Profile */}
        <div className="flex flex-col items-center pb-4">
          <Avatar className="h-40 w-40 mb-3 border-2 border-gray-200">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${invitation.email}`} />
            <AvatarFallback className="bg-purple-100 text-purple-600 text-4xl font-semibold">
              {emailInitials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Description */}
        <div className="text-center pb-6">
          <h2 className="text-2xl font-bold text-gray-900 ">
            {t('company.deleteInvitationConfirmTitle')}
          </h2>
          <p className="text-gray-500 text-base">
            {t('company.deleteInvitationConfirmDesc', { email: invitation.email })}
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
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 h-12 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {t('company.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-12 text-base font-medium bg-[#FF254E] hover:bg-[#ff4a5f] text-white border-0"
          >
            {loading ? t('company.removingMember') : t('company.removeMemberAction')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 