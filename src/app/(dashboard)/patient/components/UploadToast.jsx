import React, { useState } from 'react';
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

  if (!isVisible || uploads.length === 0) return null;

  const totalProgress = uploads.length > 0 
    ? Math.round(uploads.reduce((sum, upload) => sum + upload.progress, 0) / uploads.length)
    : 0;

  const completedUploads = uploads.filter(upload => upload.status === 'success').length;
  const totalUploads = uploads.length;
  const allCompleted = completedUploads === totalUploads;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (allCompleted) return 'All Uploads Successful';
    const uploading = uploads.filter(upload => upload.status === 'uploading').length;
    if (uploading > 0) return `Uploading ${uploading} file${uploading > 1 ? 's' : ''}...`;
    return `${completedUploads}/${totalUploads} completed`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-96 bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-[#0d0c22] text-lg">Uploads</h3>
          <div className="bg-[#6366f1] text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-semibold">
            {totalUploads}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
          {allCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Overall Progress Section */}
          <div className="bg-gray-200 rounded-full relative overflow-hidden">
            <div 
              style={{ width: `${totalProgress}%` }} 
              className={`h-10 text-white px-4 py-2 rounded-full flex items-center justify-between font-semibold text-sm transition-all duration-300 ease-out ${
                allCompleted ? 'bg-[#10b981]' : 'bg-[#6366f1]'
              }`}
            >
              <span>{getStatusText()}</span>
              <span>{allCompleted ? '' : `${totalProgress}%`}</span>
            </div>
          </div>

          {/* Individual File Progress */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploads.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(upload.status)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {upload.fileName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {upload.reportType} • {upload.status === 'uploading' ? `${upload.speed} MB/s` : 
                       upload.status === 'success' ? 'Complete' : 
                       upload.status === 'error' ? 'Failed' : 'Waiting'}
                    </div>
                  </div>
                </div>

                {/* Individual Progress Bar */}
                {upload.status === 'uploading' && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#6366f1] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">
                      {Math.round(upload.progress)}%
                    </span>
                  </div>
                )}

                {/* Cancel Button */}
                {upload.status === 'uploading' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancelUpload(upload.id)}
                    className="text-[#8b5cf6] hover:text-[#7c3aed] hover:bg-purple-50 text-xs px-2 font-medium ml-2"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Toast Manager Hook
export const useUploadToast = () => {
  const [uploads, setUploads] = useState([]);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const addUpload = ({ fileName, reportType, onCancel }) => {
    const uploadId = Date.now() + Math.random(); // More unique ID
    const newUpload = {
      id: uploadId,
      fileName,
      reportType,
      progress: 0,
      speed: '0.00',
      status: 'uploading',
      onCancel
    };
    
    setUploads(prev => [...prev, newUpload]);
    setIsToastVisible(true);
    return uploadId;
  };

  const updateProgress = (uploadId, progress, speed) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.id === uploadId 
          ? { 
              ...upload, 
              progress, 
              speed: speed.toFixed(2), 
              status: progress >= 100 ? 'success' : 'uploading' 
            }
          : upload
      )
    );
  };

  const setUploadError = (uploadId) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, status: 'error' }
          : upload
      )
    );
  };

  const cancelUpload = (uploadId) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (upload && upload.onCancel) {
      upload.onCancel();
    }
    removeUpload(uploadId);
  };

  const removeUpload = (uploadId) => {
    setUploads(prev => {
      const newUploads = prev.filter(upload => upload.id !== uploadId);
      if (newUploads.length === 0) {
        setIsToastVisible(false);
      }
      return newUploads;
    });
  };

  const closeToast = () => {
    setIsToastVisible(false);
    setUploads([]);
  };

  const clearCompletedUploads = () => {
    setUploads(prev => {
      const remaining = prev.filter(upload => upload.status === 'uploading');
      if (remaining.length === 0) {
        setIsToastVisible(false);
      }
      return remaining;
    });
  };

  return {
    uploads,
    isToastVisible,
    addUpload,
    updateProgress,
    setUploadError,
    cancelUpload,
    removeUpload,
    closeToast,
    clearCompletedUploads
  };
};

export default UploadToast;