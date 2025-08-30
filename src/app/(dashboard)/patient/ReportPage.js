"use client";
import { useParams } from "next/navigation";
import Dashboard from '@/app/component/dashboard/dashboard';
import { useReportData } from '@/app/hooks/useReportData';

export default function ReportPage({ reportType }) {
  const params = useParams();
  const patientId = params.patientId;
  let reportId;
  let type;

  switch (reportType) {
    case "cbct ai":
      reportId = params.cbctReportid;
      type = "cbct ai";
      break;
    case "pano ai":
      reportId = params.panoReportid;
      type = "pano ai";
      break;
    case "3d model ai":
      reportId = params.threeDModelReportid;
      type = "3d model ai";
      break;
    default:
      reportId = null;
      type = null;
  }

  const {
    data,
    loading,
    error,
    isRetrying,
    retryCount,
    refetch,
    cancel,
    isSuccess
  } = useReportData(reportId, type, {
    autoFetch: true,
    retryAttempts: 3,
    retryDelay: 1000,
    onSuccess: (data) => {
      console.log('Report loaded successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to load report:', error);
    }
  });

  if (loading) return <div>Loading report...</div>;
  if (isRetrying) return <div>Retrying... ({retryCount}/3)</div>;
  if (error) return (
    <div>
      <p>Error: {error}</p>
      <button onClick={() => refetch()}>Retry</button>
      <button onClick={cancel}>Cancel</button>
    </div>
  );
  if (isSuccess) return (
    <div className="w-full max-h-full mx-auto max-w-[90%] sm:w-full">
      <Dashboard reportType={type} reportData={data} />
    </div>
  );

  return <div>No data</div>;
}
