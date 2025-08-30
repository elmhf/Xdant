import React from 'react';
import ClinicProfile from "../../../component/clinic_Profile/ClinicProfile";

export const ClinicProfileTab = ({ currentClinic, userRole, canEditClinic }) => {
  return (
    <div>
      <ClinicProfile canEditClinic={canEditClinic} />
    </div>
  );
}; 