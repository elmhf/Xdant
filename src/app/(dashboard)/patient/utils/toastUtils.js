import { notification } from "@/components/shared/jsFiles/NotificationProvider";

// File selection toast
export const showFileSelectedToast = (fileName, reportType) => {
  return notification.success(
    `File selected: ${fileName}. Ready to upload ${reportType} report`
  );
};

// Upload start toast
export const showUploadStartToast = (reportType) => {
  const id = Date.now();
  notification.loading(
    `Uploading ${reportType} report... Please wait while we process your file`,
    { id, persistent: true }
  );
  return id;
};

// Upload progress toast
export const showUploadProgressToast = (reportType, percent, uploadedMB, totalMB, toastId) => {
  return notification.loading(
    `Uploading ${reportType} report... ${percent}% (${uploadedMB} MB / ${totalMB} MB)`,
    { id: toastId, persistent: true }
  );
};

// Upload success toast
export const showUploadSuccessToast = (reportType, toastId) => {
  return notification.success(
    `${reportType} report uploaded successfully! Your AI report is being processed`,
    { id: toastId }
  );
};

// Upload error toast
export const showUploadErrorToast = (reportType, errorMessage, toastId) => {
  return notification.error(
    `Failed to upload ${reportType} report: ${errorMessage}`,
    { id: toastId }
  );
};

// Generic success toast
export const showSuccessToast = (title, description) => {
  return notification.success(description ? `${title}: ${description}` : title);
};

// Generic error toast
export const showErrorToast = (title, description) => {
  return notification.error(description ? `${title}: ${description}` : title);
};

// Generic loading toast
export const showLoadingToast = (title, description) => {
  const id = Date.now();
  notification.loading(description ? `${title}: ${description}` : title, { id, persistent: true });
  return id;
};

// Update existing toast
export const updateToast = (toastId, title, description, type = 'loading') => {
  const content = description ? `${title}: ${description}` : title;

  if (type === 'success') {
    return notification.success(content, { id: toastId });
  } else if (type === 'error') {
    return notification.error(content, { id: toastId });
  } else {
    return notification.loading(content, { id: toastId, persistent: true });
  }
}; 
