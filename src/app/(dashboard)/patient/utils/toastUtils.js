import { toast } from "sonner";

// File selection toast
export const showFileSelectedToast = (fileName, reportType) => {
  return toast.success(
    `File selected: ${fileName}`,
    {
      description: `Ready to upload ${reportType} report`,
    }
  );
};

// Upload start toast
export const showUploadStartToast = (reportType) => {
  return toast.loading(
    `Uploading ${reportType} report...`,
    {
      description: "Please wait while we process your file",
    }
  );
};

// Upload progress toast
export const showUploadProgressToast = (reportType, percent, uploadedMB, totalMB, toastId) => {
  return toast.loading(
    `Uploading ${reportType} report... ${percent}%`,
    {
      id: toastId,
      description: `${uploadedMB} MB / ${totalMB} MB`,
    }
  );
};

// Upload success toast
export const showUploadSuccessToast = (reportType, toastId) => {
  return toast.success(
    `${reportType} report uploaded successfully!`,
    {
      description: "Your AI report is being processed",
      id: toastId,
    }
  );
};

// Upload error toast
export const showUploadErrorToast = (reportType, errorMessage, toastId) => {
  return toast.error(
    `Failed to upload ${reportType} report`,
    {
      description: errorMessage,
      id: toastId,
    }
  );
};

// Generic success toast
export const showSuccessToast = (title, description) => {
  return toast.success(title, {
    description: description,
  });
};

// Generic error toast
export const showErrorToast = (title, description) => {
  return toast.error(title, {
    description: description,
  });
};

// Generic loading toast
export const showLoadingToast = (title, description) => {
  return toast.loading(title, {
    description: description,
  });
};

// Update existing toast
export const updateToast = (toastId, title, description, type = 'loading') => {
  if (type === 'success') {
    return toast.success(title, {
      id: toastId,
      description: description,
    });
  } else if (type === 'error') {
    return toast.error(title, {
      id: toastId,
      description: description,
    });
  } else {
    return toast.loading(title, {
      id: toastId,
      description: description,
    });
  }
}; 