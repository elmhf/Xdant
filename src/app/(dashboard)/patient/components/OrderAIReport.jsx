import React, { useState, useEffect } from 'react';
import { useOrderReport } from '../hooks/useOrderReport';
import CreateAIReportDialog from './CreateAIReportDialog';
import { Scan, Circle, Box } from 'lucide-react';

const reportTypes = [
  { id: 'cbct', name: 'CBCT', icon: Scan, description: 'Cone Beam Computed Tomography' },
  { id: 'pano', name: 'Pano', icon: Circle, description: 'Panoramic X-ray' },
  { id: '3dmodel', name: '3D model', icon: Box, description: 'Three-dimensional model' },
];

const OrderAIReport = ({ patient, onReportCreated }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [existingReports, setExistingReports] = useState([]);

  const { handleOrderReport } = useOrderReport(patient, onReportCreated);

  useEffect(() => {
    if (patient && patient.reports) setExistingReports(patient.reports);
  }, [patient]);

  const getExistingReport = (reportType) =>
    existingReports.find((report) => report.raport_type === reportType);

  return (
    <div className="bg-white py-4 rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <h3 className="text-2xl font-bold text-gray-950 mb-4 px-6">Order AI Report</h3>

      {/* Content */}
      <div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-2">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  setSelectedReport(report);
                  setIsDialogOpen(true);
                }}
                className={`relative cursor-pointer flex items-center justify-center aspect-[1/1] bg-[#7464ed23] rounded-md p-4 transition-all duration-200 border-3 ${selectedReport?.id === report.id
                    ? 'border-[#7564ed] bg-purple-50'
                    : 'border-white'
                  } hover:border-[#7564ed]`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  {React.createElement(report.icon, {
                    strokeWidth: 1,
                    className: `w-10 h-10 text-[#7564ed]`,
                  })}
                  <span className="text-lg font-medium text-[#7564ed]">
                    {report.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog */}
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
    </div>
  );
};

export default OrderAIReport;
