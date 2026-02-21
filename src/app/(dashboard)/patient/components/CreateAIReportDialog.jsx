import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, File, Trash2 } from "lucide-react";
import UploadToast, { useUploadToast } from './UploadToast';
import { useRouter } from 'next/navigation';
import { apiUploadClient } from '@/utils/apiClient';
import { useTranslation } from 'react-i18next';

const CreateAIReportDialog = ({
  isOpen,
  onClose,
  patient,
  selectedReport,
  onReportCreated
}) => {
  const { t } = useTranslation('patient');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Store AbortControllers for active uploads
  const abortControllersRef = useRef(new Map());

  // Enhanced upload toast hook
  const {
    uploads,
    isToastVisible,
    addUpload,
    updateProgress,
    setUploadError,
    cancelUpload,
    closeToast
  } = useUploadToast();

  // Get accepted file types for each report type
  const getAcceptedFileTypes = (reportType) => {
    const fileTypes = {
      'cbct': '.dcm, .dicom, .nii, .nii.gz',
      'pano': '.png, .jpg, .jpeg, .tiff, .tif',
      'ioxray': '.dcm, .dicom, .nii, .nii.gz, .png, .jpg, .jpeg, .tiff, .tif',
      '3dmodel': '.stl, .obj, .ply, .fbx, .dae',
      'implant': '.dcm, .dicom, .nii, .nii.gz',
      'ortho': '.dcm, .dicom, .nii, .nii.gz'
    };
    return fileTypes[reportType] || '.dcm, .dicom, .nii, .nii.gz, .png, .jpg, .jpeg, .tiff, .tif';
  };

  // Get accepted file extensions for input accept attribute
  const getAcceptedExtensions = (reportType) => {
    const extensions = {
      'cbct': '.dcm,.dicom,.nii,.nii.gz',
      'pano': '.png,.jpg,.jpeg,.tiff,.tif',
      'ioxray': '.dcm,.dicom,.nii,.nii.gz,.png,.jpg,.jpeg,.tiff,.tif',
      '3dmodel': '.stl,.obj,.ply,.fbx,.dae',
      'implant': '.dcm,.dicom,.nii,.nii.gz',
      'ortho': '.dcm,.dicom,.nii,.nii.gz'
    };
    return extensions[reportType] || '.dcm,.dicom,.nii,.nii.gz,.png,.jpg,.jpeg,.tiff,.tif';
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    setError(null);
    const files = Array.from(event.target.files || event.dataTransfer.files);

    if (files.length > 0) {
      const file = files[0];
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      const reportType = selectedReport?.id || 'cbct';
      const validExtensions = getAcceptedExtensions(reportType).split(',');

      if (!validExtensions.includes(extension)) {
        setError(t('createReport.invalidType', {
          name: selectedReport?.name,
          types: getAcceptedFileTypes(reportType)
        }));
        return;
      }

      setUploadedFiles([file]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Reset dialog state when closing
  const handleClose = () => {
    setUploadedFiles([]);
    setError(null);
    setUploadProgress(0);
    setIsOrdering(false);
    onClose();
  };

  const router = useRouter();

  const handleOrderReportWithState = async () => {
    if (!selectedReport || uploadedFiles.length === 0) return;

    const abortController = new AbortController();

    const uploadId = addUpload({
      fileName: uploadedFiles[0].name,
      reportType: selectedReport?.name,
      onCancel: () => {
        abortController.abort();
        abortControllersRef.current.delete(uploadId);
      }
    });

    abortControllersRef.current.set(uploadId, abortController);

    handleClose();

    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    try {
      const formData = new FormData();
      formData.append('patient_id', patient.id);
      formData.append('report_type', selectedReport.id);
      formData.append('file', uploadedFiles[0]);
      console.log('file+++++', uploadedFiles[0]);
      const response = await apiUploadClient(
        '/api/reports/create',
        formData,
        (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          const currentTime = Date.now();
          const timeDiff = (currentTime - lastTime) / 1000;
          const bytesDiff = e.loaded - lastLoaded;

          let speed = 0;
          if (timeDiff > 0) {
            speed = (bytesDiff / 1024 / 1024) / timeDiff;
          }

          lastLoaded = e.loaded;
          lastTime = currentTime;

          updateProgress(uploadId, percent, Math.max(speed, 0));
        },
        { signal: abortController.signal }
      );

      if (onReportCreated) {
        onReportCreated();
      }

    } catch (error) {
      console.error('Error creating AI report:', error);

      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        console.log('Upload cancelled by user');
        return;
      }

      let errorMessage = t('createReport.reportError');

      if (error.response) {
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 413) {
          errorMessage = t('createReport.fileTooLarge');
        } else if (error.response.status === 400) {
          errorMessage = t('createReport.invalidFileType');
        } else if (error.response.status === 500) {
          errorMessage = t('createReport.serverError');
        } else {
          errorMessage = t('createReport.serverErrorWithStatus', { status: error.response.status });
        }
      } else if (error.request) {
        errorMessage = t('createReport.networkError');
      } else {
        errorMessage = error.message || t('createReport.reportError');
      }

      setUploadError(uploadId);
    } finally {
      abortControllersRef.current.delete(uploadId);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-white rounded-2xl border-0 shadow-xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {t('createReport.title', { name: selectedReport?.name || 'CBCT' })}
          </DialogTitle>
          {/* Header */}
          <div className="bg-white px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold text-gray-900">
                {t('createReport.title', { name: selectedReport?.name || 'CBCT' })}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5 text-[1.25rem]">
            {/* Error Message */}
            {error && (
              <div className="border border-red-200 bg-red-50 rounded-xl p-3 flex items-center gap-2">
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Upload Section */}
            <div>
              <Label className="text-lg font-bold text-gray-700 mb-3 block">
                {t('createReport.upload', { name: selectedReport?.name || 'CBCT' })}
              </Label>

              {/* File Upload Area */}
              {uploadedFiles.length === 0 ? (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#7564ed] hover:bg-purple-50/30 transition-all duration-200"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="flex justify-center gap-4">
                    <div className="relative">
                      <Input
                        id="file-upload"
                        type="file"
                        accept={getAcceptedExtensions(selectedReport?.id || 'cbct')}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Label
                        htmlFor="file-upload"
                        className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-white text-[#7564ed] hover:bg-gray-50 hover:border-[#7564ed] transition-colors"
                      >
                        <File className="w-7 h-7" />
                        {t('createReport.uploadFiles')}
                      </Label>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">
                    {t('createReport.dragAndDrop')}
                  </p>
                </div>
              ) : (
                /* Uploaded File Display */
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 text-[#7564ed] rounded-2xl flex items-center justify-center">
                        <File className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900 truncate max-w-[200px]">
                          {uploadedFiles[0].name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(uploadedFiles[0].size / 1024).toFixed(1)} KB  {(uploadedFiles[0].type)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(0)}
                      className="h-10 w-10 p-0 text-gray-400 hover:text-red-600 rounded-full"
                    >
                      <Trash2 className="w-7 h-7" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isOrdering}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 px-6"
            >
              {t('createReport.cancel')}
            </Button>
            <Button
              onClick={handleOrderReportWithState}
              disabled={isOrdering || uploadedFiles.length === 0}
              className="bg-[#7564ed] hover:bg-[#6d28d9] text-white px-8 rounded-2xl font-medium shadow-sm"
            >
              {isOrdering ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('createReport.uploading')}
                </div>
              ) : (
                t('createReport.order')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateAIReportDialog;