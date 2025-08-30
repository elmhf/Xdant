// Patient Utils Index

// Patient utilities
export {
  formatPatientName,
  formatPatientId,
  formatPatientEmail,
  formatDateOfBirth,
  getPatientAvatarInitials,
  getGenderAvatarInitials,
  filterPatientsBySearch,
  filterPatientsByTab,
  sortPatients,
  getTabCounts
} from './patientUtils';

// Report utilities
export {
  getReportName,
  getReportDescription,
  getReportIcon,
  getAIReportName,
  getAIReportDescription,
  formatReportDate,
  getStatusBadgeConfig,
  convertReportsToOrders
} from './reportUtils';

// Form utilities
export {
  validatePatientForm,
  getInitialFormData,
  resetFormData,
  preparePatientDataForAPI
} from './formUtils';

// Toast utilities
export {
  showFileSelectedToast,
  showUploadStartToast,
  showUploadProgressToast,
  showUploadSuccessToast,
  showUploadErrorToast,
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  updateToast
} from './toastUtils'; 