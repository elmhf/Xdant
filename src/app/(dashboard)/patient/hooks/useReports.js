import { useState, useEffect } from 'react';
import { convertReportsToOrders } from '../utils/reportUtils';

export const useReports = (patient) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient && patient.reports) {
      setLoading(true);
      setTimeout(() => {
        const patientOrders = convertReportsToOrders(patient.reports);
        setOrders(patientOrders);
        setLoading(false);
      }, 500);
    }
  }, [patient]);

  return { orders, loading };
}; 