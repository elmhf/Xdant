import React from 'react';
import ClinicProfile from "@/components/features/clinic-profile/ClinicProfile";

export const ClinicProfileTab = ({ currentClinic, userRole, canEditClinic }) => {
  return (
    <div>
      <ClinicProfile canEditClinic={canEditClinic} />
    </div>
  );
}; 