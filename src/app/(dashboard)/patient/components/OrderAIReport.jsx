import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, X, Upload, FileText } from "lucide-react";
import { useOrderReport } from '../hooks/useOrderReport';
import { getReportIcon, getReportName, getReportDescription } from '../utils/reportUtils';
import CreateAIReportDialog from './CreateAIReportDialog';
import { Scan, Circle, Zap, Box, Wrench, AlignJustify } from 'lucide-react';
const reportTypes = [
  {
    id: 'cbct',
    name: 'CBCT',
    icon: Scan,
    description: 'Cone Beam Computed Tomography',
    color: 'text-[#7c5cff] '
  },
  {
    id: 'pano',
    name: 'Pano',
    icon: Circle,
    description: 'Panoramic X-ray',
    color: 'text-[#7c5cff] '
  },
  {
    id: '3dmodel',
    name: '3D model',
    icon: Box,
    description: 'Three-dimensional model',
    color: 'text-[#7c5cff] '
  },
];

const OrderAIReport = ({ patient, onReportCreated, addReportToState }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  const {
    handleOrderReport,
    handleCloseOrder
  } = useOrderReport(patient, onReportCreated);
  
  const [existingReports, setExistingReports] = useState([]);

  // Initialize reports state from patient object
  useEffect(() => {
    if (patient && patient.reports) {
      setExistingReports(patient.reports);
    }
  }, [patient]);

  // Check if a report type already exists
  const getExistingReport = (reportType) => {
    return existingReports.find(report => report.raport_type === reportType);
  };

  // Get report status
  const getReportStatus = (reportType) => {
    const existingReport = getExistingReport(reportType);
    return existingReport ? existingReport.status : null;
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Order AI report</h2>
        
        <div className="grid grid-cols-3 gap-2">
          {reportTypes.map((report) => {
            const existingReport = getExistingReport(report.id);
            const reportStatus = getReportStatus(report.id);
            return (
              <div
                key={report.id}
                onClick={() => {
                  setSelectedReport(report);
                  setIsDialogOpen(true);
                }}
                className={`relative cursor-pointer flex items-center justify-center aspect-[1/1] bg-[#7464ed23] rounded-md p-4 transition-all duration-200 border-3 ${
                  selectedReport?.id === report.id
                    ? 'border-[#7564ed]  bg-purple-50'
                    : 'border-white'
                } hover:border-[#7564ed]`}
              >
                <div className="flex w-full h-full flex-col items-center justify-center space-y-2">
                  <div className="flex items-center justify-center w-20 h-20">
                    {React.createElement(report.icon, { strokeWidth: 1, className: `w-15 h-15 ${report.color}` })}
                  </div>
                  <span className={`text-lg font-medium ${report.color}`}>
                    {report.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create AI Report Dialog */}
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
    </>
  );
};

export default OrderAIReport;