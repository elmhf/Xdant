import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Enhanced Upload Toast Component with Multiple Files Support
const UploadToast = ({
  isVisible,
  onClose,
  uploads,
  onCancelUpload
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedUploads = uploads.filter(upload => upload.status === 'success' || upload.status === 'error').length;
  const totalUploads = uploads.length;
  const allFinished = totalUploads > 0 && completedUploads === totalUploads;

  // Auto-hide after 5 seconds when all uploads are finished
  useEffect(() => {
    if (allFinished && isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [allFinished, isVisible, onClose]);

  if (!isVisible || uploads.length === 0) return null;

  const totalProgress = uploads.length > 0
    ? Math.round(uploads.reduce((sum, upload) => sum + upload.progress, 0) / uploads.length)
    : 0;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (allFinished) return 'Uploads Completed';
    const uploading = uploads.filter(upload => upload.status === 'uploading').length;
    if (uploading > 0) return `Uploading ${uploading} file${uploading > 1 ? 's' : ''}...`;
    return `${completedUploads}/${totalUploads} completed`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-[400px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500 ease-out font-sans">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 bg-white cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-xl text-gray-900">Uploads</h3>
          <div className="bg-[#5241cc] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {totalUploads}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Content */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 space-y-6">
          {uploads.map((upload) => (
            <div key={upload.id} className="space-y-2">
              {/* Custom Progress Bar */}
              <div className="relative h-10 w-full bg-gray-200 rounded-full overflow-hidden">
                {/* Background Layer (Text visible on Gray) */}
                <div className="absolute inset-0 flex items-center justify-end px-4 text-xs font-medium text-gray-500 gap-2">
                  <span>{upload.status === 'uploading' ? 'Uploading study...' : upload.status === 'success' ? 'Completed' : 'Failed'}</span>
                  {upload.status === 'uploading' && <Clock className="w-3.5 h-3.5" />}
                  {upload.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                </div>

                {/* Foreground Layer (Green Bar + Text visible on Green) */}
                <div
                  className="absolute top-0 left-0 h-full bg-[#10b981] overflow-hidden transition-all duration-300 ease-out"
                  style={{ width: `${upload.status === 'success' ? 100 : upload.progress}%` }}
                >
                  {/* Inner Container to keep text fixed relative to parent, not moving with bar width */}
                  <div className="w-[352px] h-full flex items-center justify-between px-4">
                    <span className="text-xs font-bold text-white whitespace-nowrap">
                      {Math.round(upload.progress)}% <span className="mx-1 opacity-80 font-normal">{upload.speed} MB/s</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Row */}
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-gray-700 truncate max-w-[250px]" title={upload.fileName}>
                  {upload.fileName}
                </span>
                {upload.status === 'uploading' && (
                  <button
                    onClick={() => onCancelUpload(upload.id)}
                    className="text-sm font-medium text-[#7564ed] hover:text-[#6354c9] transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Toast Manager Hook - Now uses Global Zustand Store
import useUploadStore from '@/stores/uploadStore';

export const useUploadToast = () => {
  const store = useUploadStore();

  return {
    uploads: store.uploads,
    isToastVisible: store.isToastVisible,
    addUpload: store.addUpload,
    updateProgress: store.updateProgress,
    setUploadError: store.setUploadError,
    cancelUpload: store.cancelUpload,
    removeUpload: store.removeUpload,
    closeToast: store.closeToast
  };
};

export default UploadToast;