import { useState } from 'react';
import { getReportName, getReportDescription } from '../utils/reportUtils';

export const useOrderReport = (patient, onReportCreated) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);

  const handleReportSelect = (report) => {
    setSelectedReport({
      id: report.id,
      name: report.name,
      description: report.description
    });
  };

  const handleOrderReport = async (orderFunction) => {
    if (!selectedReport) return;

    setIsOrdering(true);
    try {
      await orderFunction();
      // Reset selection after successful order
      setSelectedReport(null);
    } catch (error) {
      // يمكنك استخدام alert أو أي إشعار آخر بدل console.error إذا أردت
    } finally {
      setIsOrdering(false);
    }
  };

  const handleCloseOrder = () => {
    setSelectedReport(null);
  };

  return {
    selectedReport,
    isOrdering,
    handleReportSelect,
    handleOrderReport,
    handleCloseOrder
  };
};