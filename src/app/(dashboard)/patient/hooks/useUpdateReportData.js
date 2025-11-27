import { useState } from 'react';

/**
 * Custom hook to update report data to the server
 * @returns {Object} - { updateReportData, loading, error, success }
 */
export const useUpdateReportData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    /**
     * Update report data
     * @param {string} reportId - The ID of the report to update
     * @param {Object} data - The report data to update
     * @returns {Promise<Object>} - The response from the server
     */
    const updateReportData = async (reportId, data) => {
        console.log('Updating report data:', reportId, data);
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('http://localhost:5000/api/reports/update-data', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    report_id:reportId,
                    report_data:data,
                }),
            });

            if (!response.ok) {
                console.log('Failed to update report data',response.json());    
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update report data');
            }

            const result = await response.json();
            setSuccess(true);
            setLoading(false);
            return { success: true, data: result };
        } catch (err) {
            console.error('Error updating report data:', err);
            setError(err.message || 'An error occurred while updating report data');
            setLoading(false);
            return { success: false, error: err.message };
        }
    };

    /**
     * Reset the hook state
     */
    const reset = () => {
        setLoading(false);
        setError(null);
        setSuccess(false);
    };

    return {
        updateReportData,
        loading,
        error,
        success,
        reset,
    };
};

export default useUpdateReportData;
