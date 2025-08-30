import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Filter, Edit, Trash2, Heart, Loader2 } from "lucide-react";
import {
  formatPatientName,
  formatPatientId,
  formatDateOfBirth,
  getPatientAvatarInitials,
  getGenderAvatarInitials
} from '../utils/patientUtils';

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
  favoriteLoadingStates = {}
}) => {
  const router = useRouter();

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

  return (
    <div className="border border-gray-200 rounded-lg overflow-x-auto">
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th
                className="min-w-56 text-left py-4 px-4 text-gray-700 font-semibold cursor-pointer hover:bg-gray-100 whitespace-nowrap text-lg bg-white"
                onClick={() => onSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Nombre del paciente</span>
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
                  <span>Fecha de nacimiento</span>
                  <div className="flex flex-col">
                    <ChevronUp className="w-3 h-3 text-gray-400" />
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </th>
              
              <th className="min-w-80 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg hidden md:table-cell bg-white">
                <div className="flex items-center space-x-1">
                  <span>Doctors treating</span>
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th className="min-w-70 text-right py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg hidden lg:table-cell bg-white">
                <div className="flex items-center space-x-1 justify-start">
                  <span className="truncate max-w-60">Email</span>
                  <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              </th>
              <th className="min-w-32 text-center py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">
                Actions
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
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-sm">
                          {getPatientAvatarInitials(patient)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-base font-medium text-gray-900 truncate">
                        {formatPatientName(patient)}
                      </span>
                    </div>
                  </td>

                  <td className="min-w-44 py-4 px-4 hidden lg:table-cell">
                    <span className="text-base text-gray-600">
                      {formatDateOfBirth(patient.date_of_birth)}
                    </span>
                  </td>
                  
                  <td className="min-w-80 py-4 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      {patient.treating_doctors && patient.treating_doctors.length > 0 ? (
                        patient.treating_doctors.length === 1 ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 shadow-lg">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-semibold">
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
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-semibold">
                                  {((doctor.first_name || '').slice(0, 1) + 
                                    (doctor.last_name || '').slice(0, 2)).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        )
                      ) : (
                        <span className="text-base text-gray-500">Aucun médecin assigné</span>
                      )}
                    </div>
                  </td>
                  <td className="min-w-70 py-4 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2 justify-start">
                      <span className="text-base text-gray-600 truncate max-w-50" title={patient.email || "-"}>
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
                        className={`h-8 w-8 p-0 ${
                          patient.isFavorite 
                            ? 'text-red-500 hover:bg-red-100' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={patient.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        disabled={favoriteLoadingStates[patient.id] || false}
                      >
                        {favoriteLoadingStates[patient.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className={`h-4 w-4 ${patient.isFavorite ? 'fill-current' : ''}`} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditClick(e, patient)}
                        className="h-8 w-8 p-0 hover:bg-purple-100"
                      >
                        <Edit className="h-4 w-4 text-purple-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(e, patient)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="w-full">
                <td colSpan="5" className="text-center py-8 text-gray-500 text-lg">
                  Aucun patient trouvé.
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