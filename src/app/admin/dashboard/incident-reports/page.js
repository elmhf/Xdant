"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';
import IncidentReportsTable from '@/components/admin/IncidentReportsTable';

export default function IncidentReportsPage() {
    // Mock data for now, ideally fetched from API
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const response = await apiClient('/api/admin/incident-reports');
            if (response && response.data) {
                setReports(response.data);
            } else if (Array.isArray(response)) {
                setReports(response);
            }
        } catch (error) {
            console.error('Failed to fetch incident reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="w-full mx-auto space-y-6">
            <IncidentReportsTable reports={reports} loading={loading} onUpdate={fetchReports} />
        </div>
    );
}
