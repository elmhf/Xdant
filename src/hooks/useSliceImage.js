import { useState, useEffect, useMemo } from 'react';
import { useReportData } from '@/app/(dashboard)/patient/[patientId]/hook/useReportData';
import { useImageStore } from '@/stores/medicalImageStore';

export function useSliceImage(reportId) {
    const {
        data: reportData,
        loading: reportLoading,
        error: reportError,
        fetchData,
        hasData
    } = useReportData();

    const { basePath, sliceCounts } = useImageStore();
    const [data, setData] = useState({ axial: [], sagittal: [], coronal: [] });

    // Fetch report data if not already loaded
    useEffect(() => {
        if (reportId && !hasData) {
            fetchData(reportId);
        }
    }, [reportId, hasData, fetchData]);

    // Generate URLs when data/store is ready
    useEffect(() => {
        if (!basePath) return;

        const generateUrls = (view, count) => {
            return Array.from({ length: count }, (_, i) => `${basePath}/${view}/${i}.jpg`);
        };

        const newData = {
            axial: generateUrls('axial', sliceCounts.axial),
            sagittal: generateUrls('sagittal', sliceCounts.sagittal),
            coronal: generateUrls('coronal', sliceCounts.coronal),
        };

        // Only update if data actually changed to avoid infinite loops/re-renders with useMemo downstream
        if (
            newData.axial.length !== data.axial.length ||
            newData.sagittal.length !== data.sagittal.length ||
            newData.coronal.length !== data.coronal.length
        ) {
            setData(newData);
        }

    }, [basePath, sliceCounts, data.axial.length, data.sagittal.length, data.coronal.length]);


    return {
        data,
        isLoading: reportLoading,
        error: reportError,
    };
}
