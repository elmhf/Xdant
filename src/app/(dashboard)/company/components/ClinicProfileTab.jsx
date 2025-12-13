import React from 'react';
import ClinicProfile from "@/components/features/clinic-profile/ClinicProfile";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const ClinicProfileTab = ({ currentClinic, userRole, canEditClinic, openLeaveDialog }) => {
  return (
    <div className="space-y-4">
      <ClinicProfile canEditClinic={canEditClinic} userRole={userRole} />

      {/* Leave Clinic Button */}
      {currentClinic && openLeaveDialog && (
        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            className="px-6 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-xl font-medium text-[#ff254e] border-2 border-[#ff254e] hover:bg-[#ff254e] hover:text-white transition-all duration-200"
            onClick={() => openLeaveDialog(currentClinic)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Quitter la clinique
          </Button>
        </div>
      )}
    </div>
  );
}; 