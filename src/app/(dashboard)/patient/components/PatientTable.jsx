import React from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from "@/components/features/profile/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Filter, Edit, Trash2, Heart, Loader2, Folder, Info } from "lucide-react";
import {
  formatPatientName,
  formatPatientId,
  formatDateOfBirth,
  getPatientAvatarInitials,
  getGenderAvatarInitials
} from '../utils/patientUtils';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useTranslation } from 'react-i18next';

const PatientTable = ({
  patients,
  sorting,
  onSort,
  searchQuery,
  filterDoctor,
  activeTab,
  onEditPatient,
  onDeletePatient,
  onToggleFavorite,
  onViewInfo,
  favoriteLoadingStates = {}
}) => {
  const { t } = useTranslation('patient');
  const router = useRouter();
  console.log(patients, "patients")
  // Get user info and current clinic from store
  const user = useUserStore(state => state.userInfo);
  const currentClinic = useUserStore(state => state.currentClinicId);

  // Get user role for the current clinic from rolesByClinic
  const userRole = currentClinic && user?.rolesByClinic?.[currentClinic];

  // Check if user can edit/delete (admin or full_access)
  console.log(userRole, user, currentClinic, "userRole***");
  const canEditDelete = userRole === 'admin' || userRole === 'full_access';

  const handlePatientClick = (patient) => {
    router.push(`/patient/${patient.id}`);
  };

  const handleEditClick = (e, patient) => {
    e.stopPropagation();
    onEditPatient(patient);
  };

  const handleDeleteClick = (e, patient) => {
    e.stopPropagation();
    onDeletePatient(patient);
  };

  const handleFavoriteClick = (e, patient) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(patient);
    }
  };

  const handleInfoClick = (e, patient) => {
    e.stopPropagation();
    if (onViewInfo) {
      onViewInfo(patient);
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-x-auto">
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th
                className="min-w-56 text-left py-4 px-4 text-gray-700 font-semibold cursor-pointer hover:bg-gray-100 whitespace-nowrap text-lg bg-white"
                onClick={() => onSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('table.patientName')}</span>
                  <div className="flex flex-col">
                    <ChevronUp className="w-3 h-3 text-gray-400" />
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </th>

              <th
                className="min-w-44 text-left py-4 px-4 text-gray-700 font-semibold cursor-pointer hover:bg-gray-100 whitespace-nowrap text-lg hidden lg:table-cell bg-white"
                onClick={() => onSort('dateOfBirth')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('table.dateOfBirth')}</span>
                  <div className="flex flex-col">
                    <ChevronUp className="w-3 h-3 text-gray-400" />
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </th>

              <th className="min-w-80 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg hidden md:table-cell bg-white">
                <div className="flex items-center space-x-1">
                  <span>{t('table.doctorsTreating')}</span>
                </div>
              </th>
              <th className="min-w-70 text-right py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg hidden lg:table-cell bg-white">
                <div className="flex items-center space-x-1 justify-start">
                  <span className="truncate max-w-60">{t('table.email')}</span>

                </div>
              </th>
              <th className="min-w-32 text-center py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">
                {t('table.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((patient, index) => (
                <tr
                  key={patient.id || index}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handlePatientClick(patient)}
                >
                  <td className="min-w-56 py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-18 rounded-3xl">
                        <AvatarImage src={patient.lastReportImageUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-[#A196F3] to-[#7564ED] text-white text-sm font-semibold">
                          {getPatientAvatarInitials(patient)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-base font-medium text-gray-900 truncate">
                        {formatPatientName(patient)}
                      </span>
                    </div>
                  </td>

                  <td className="min-w-44 py-4 px-4 hidden lg:table-cell">
                    <span className="text-base font-medium text-gray-400">
                      {formatDateOfBirth(patient.date_of_birth)}
                    </span>
                  </td>

                  <td className="min-w-80 py-4 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      {patient.treating_doctors && patient.treating_doctors.length > 0 ? (
                        patient.treating_doctors.length === 1 ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 shadow-lg">
                              <AvatarImage src={patient.treating_doctors[0].profilePhotoUrl} />
                              <AvatarFallback className="bg-gradient-to-br from-[#4f46e5] to-[#] text-white text-sm font-semibold">
                                {((patient.treating_doctors[0].first_name || '').slice(0, 1) +
                                  (patient.treating_doctors[0].last_name || '').slice(0, 2)).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-base font-medium text-gray-700 whitespace-nowrap">
                              {patient.treating_doctors[0].first_name || ""} {patient.treating_doctors[0].last_name || ""}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center -space-x-3 overflow-hidden">
                            {patient.treating_doctors.map((doctor, index) => (
                              <Avatar key={doctor.id || index} className="h-10 w-10 border-3 border-white">
                                <AvatarImage src={doctor.profilePhotoUrl} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white text-sm font-semibold">
                                  {((doctor.first_name || '').slice(0, 1) +
                                    (doctor.last_name || '').slice(0, 2)).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        )
                      ) : (
                        <span className="text-base text-gray-500">{t('table.noDoctorAssigned')}</span>
                      )}
                    </div>
                  </td>
                  <td className="min-w-70 py-4 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2 justify-start">
                      <span className="text-base font-light text-gray-400 truncate max-w-50" title={patient.email || "-"}>
                        {patient.email || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="min-w-32 py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFavoriteClick(e, patient)}
                        className={`h-8 w-8 p-0 ${patient.isFavorite
                          ? 'text-[#ff254e] hover:bg-gray-100'
                          : 'text-gray-400 hover:text-[#ff254e] hover:bg-gray-100'
                          }`}
                        title={patient.isFavorite ? t('table.removeFromFavorites') : t('table.addToFavorites')}
                        disabled={favoriteLoadingStates[patient.id] || false}
                      >
                        {favoriteLoadingStates[patient.id] ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Heart className={`h-5 w-5 ${patient.isFavorite ? 'fill-current' : ''}`} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleInfoClick(e, patient)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-[#7564ed] hover:bg-gray-100"
                        title={t('table.viewInfo')}
                      >
                        <Info className="h-5 w-5" />
                      </Button>
                      {canEditDelete && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditClick(e, patient)}
                            className="h-8 w-8 p-0 stroke-[2.5] text-gray-400 hover:text-[#7564ed] hover:bg-gray-100"
                          >
                            <Edit className="h-5 w-5  stroke-[2.5] hover:text-[#7564ed] hover:bg-gray-100" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteClick(e, patient)}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <Trash2 className="h-5 w-5 text-gray-400  hover:text-[#ff254e]" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Folder className="h-10 w-10 text-gray-400" />
                      </EmptyMedia>

                      <EmptyTitle className="text-xl font-semibold">
                        {t('table.noPatientsFound')}
                      </EmptyTitle>

                      <EmptyDescription className="text-gray-600 text-base">
                        {t('table.noPatientsDesc')}
                      </EmptyDescription>
                    </EmptyHeader>

                  </Empty>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientTable;