import i18next from 'i18next';

// Patient utility functions
export const formatPatientName = (patient) => {
  return `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
};

export const formatPatientId = (patient) => {
  return String(patient.id || '');
};

export const formatPatientEmail = (patient) => {
  return String(patient.email || '');
};

export const formatDateOfBirth = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString(i18next.language || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getPatientAvatarInitials = (patient) => {
  const firstName = patient.first_name || '';
  const lastName = patient.last_name || '';
  return (firstName.slice(0, 1) + lastName.slice(0, 2)).toUpperCase();
};

export const getGenderAvatarInitials = (gender) => {
  return gender ? gender.charAt(0).toUpperCase() : "U";
};

export const filterPatientsBySearch = (patients, searchQuery) => {
  if (!searchQuery.trim()) return patients;

  return patients.filter(patient => {
    const fullName = formatPatientName(patient);
    const patientEmail = formatPatientEmail(patient);
    const searchLower = searchQuery.toLowerCase();
    return fullName.toLowerCase().includes(searchLower) ||
      patientEmail.toLowerCase().includes(searchLower);
  });
};

export const filterPatientsByTab = (patients, activeTab) => {
  switch (activeTab) {
    case "my":
      return patients.filter(patient => patient.is_treating_doctor === true);
    case "all":
      return patients;
    case "favorites":
      return patients.filter(patient => patient.isFavorite === true);
    default:
      return patients;
  }
};

export const sortPatients = (patients, sorting) => {
  if (!sorting.column) return patients;

  return [...patients].sort((a, b) => {
    let aValue, bValue;

    switch (sorting.column) {
      case 'name':
        aValue = formatPatientName(a);
        bValue = formatPatientName(b);
        break;
      case 'id':
        aValue = formatPatientId(a);
        bValue = formatPatientId(b);
        break;
      case 'dateOfBirth':
        aValue = a.date_of_birth || '';
        bValue = b.date_of_birth || '';
        break;
      case 'gender':
        aValue = String(a.gender || '');
        bValue = String(b.gender || '');
        break;
      case 'email':
        aValue = formatPatientEmail(a);
        bValue = formatPatientEmail(b);
        break;
      default:
        return 0;
    }

    // Convert to string for comparison
    aValue = String(aValue);
    bValue = String(bValue);

    if (sorting.direction === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });
};

export const getTabCounts = (patients) => {
  return {
    my: patients.filter(p => p.is_treating_doctor === true).length,
    all: patients.length,
    favorites: patients.filter(p => p.isFavorite === true).length
  };
}; 