import React, { useState, useEffect } from 'react';
import { useOrderReport } from '../hooks/useOrderReport';
import CreateAIReportDialog from './CreateAIReportDialog';
import { Scan, Circle, Box, Upload, Loader2 } from 'lucide-react';
import useUserStore from "@/components/features/profile/store/userStore";
import { fetchWithAuth } from '@/utils/utils/fetchWithAuth';
import { toast } from 'sonner';
import UploadToast, { useUploadToast } from './UploadToast';
import GenericUploadDialog from './GenericUploadDialog';
import axios from 'axios';
const reportTypes = [
  { id: 'cbct', name: 'CBCT', icon: Scan, description: 'Cone Beam Computed Tomography' },
  { id: 'pano', name: 'Pano', icon: Circle, description: 'Panoramic X-ray' },
  { id: 'upload_files', name: 'Upload Files', icon: Upload, description: 'Upload generic files' },
];

const OrderAIReport = ({ patient, onReportCreated }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenericUploadOpen, setIsGenericUploadOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [existingReports, setExistingReports] = useState([]);
  const user = useUserStore(state => state.user);

  const {
    uploads,
    isToastVisible,
    addUpload,
    updateProgress,
    setUploadError,
    cancelUpload,
    closeToast
  } = useUploadToast();

  const { handleOrderReport } = useOrderReport(patient, onReportCreated);

  useEffect(() => {
    if (patient && patient.reports) setExistingReports(patient.reports);
  }, [patient]);

  const getExistingReport = (reportType) =>
    existingReports.find((report) => report.raport_type === reportType);

  const handleGenericFileUpload = async (file) => {
    if (!file) return;

    if (!patient?.id || !patient?.clinic?.id) {
      toast.error("Missing patient or clinic information");
      return;
    }

    const uploadId = addUpload({
      fileName: file.name,
      reportType: 'Generic Upload',
      onCancel: () => console.log('Upload cancelled')
    });

    // Track upload start time for speed calculation
    let lastLoaded = 0;
    let lastTime = Date.now();

    try {
      // Step 1: Get upload URL
      const fileType = file.type || '.' + file.name.split('.').pop().toLowerCase();

      const urlRes = await fetchWithAuth({
        method: 'POST',
        url: 'http://localhost:5000/api/files/generate-upload-url',
        data: {
          clinic_id: patient.clinic.id,
          patient_id: patient.id,
          file_name: file.name,
          file_type: fileType
        },
        withCredentials: true
      });

      const { uploadUrl, file: fileInfo } = urlRes.data;

      // Step 2: Upload directly to Supabase
      // Using axios directly for the PUT request to support progress tracking
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type, // Supabase requires matching content-type
          'x-upsert': 'false'
        },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          const currentTime = Date.now();
          const timeDiff = (currentTime - lastTime) / 1000; // seconds
          const bytesDiff = e.loaded - lastLoaded;

          let speed = 0;
          if (timeDiff > 0) {
            speed = (bytesDiff / 1024 / 1024) / timeDiff;
          }

          lastLoaded = e.loaded;
          lastTime = currentTime;

          updateProgress(uploadId, percent, Math.max(speed, 0));
        }
      });

      // Step 3: Confirm upload
      await fetchWithAuth({
        method: 'POST',
        url: 'http://localhost:5000/api/files/confirm-upload',
        data: fileInfo,
        withCredentials: true
      });

      // Clear input (if it was an input, but now it's passed from dialog)
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(uploadId);
    }
  };

  return (
    <>
      <div className="bg-white py-4 rounded-2xl shadow-sm border border-gray-100 p-4">
        {/* Header */}
        <h3 className="text-2xl font-bold text-gray-950 mb-4 ">Order AI Report</h3>

        {/* Content */}
        <div>
          <div className="">
            <div className="grid grid-cols-3 gap-2">
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  onClick={() => {
                    if (report.id === 'upload_files') {
                      setIsGenericUploadOpen(true);
                    } else {
                      setSelectedReport(report);
                      setIsDialogOpen(true);
                    }
                  }}
                  className={`relative cursor-pointer flex items-center justify-center aspect-[1/1] bg-[#7464ed23] rounded-md  transition-all duration-200 border-3 ${selectedReport?.id === report.id
                    ? 'border-[#7564ed] bg-purple-50'
                    : 'border-white'
                    } hover:border-[#7564ed]`}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {React.createElement(report.icon, {
                      strokeWidth: 1.3,
                      className: `w-18 h-18 text-[#7564ed]`,
                    })}
                    <span className="text-lg font-[600] text-[#7564ed]">
                      {report.name}
                    </span>
                  </div>
                </div>
              ))}
              {/* Hidden input removed in favor of GenericUploadDialog */}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <CreateAIReportDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedReport(null);
          }}
          patient={patient}
          selectedReport={selectedReport}
          onReportCreated={onReportCreated}
        />

        <GenericUploadDialog
          isOpen={isGenericUploadOpen}
          onClose={() => setIsGenericUploadOpen(false)}
          onUpload={handleGenericFileUpload}
        />
      </div>
      <UploadToast
        isVisible={isToastVisible}
        uploads={uploads}
        onClose={closeToast}
        onCancelUpload={cancelUpload}
      />
    </>
  );
};

export default OrderAIReport;
