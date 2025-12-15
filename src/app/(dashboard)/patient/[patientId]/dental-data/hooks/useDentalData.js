import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/utils/utils/fetchWithAuth';
import useUserStore from '@/components/features/profile/store/userStore';
import { format } from 'date-fns';

export const useDentalData = () => {
    const params = useParams();
    const patientId = params.patientId;
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentClinicId = useUserStore(state => state.currentClinicId);

    useEffect(() => {
        const fetchFiles = async () => {
            if (!patientId || !currentClinicId) {
                return;
            }

            try {
                setLoading(true);
                const response = await fetchWithAuth({
                    method: 'POST',
                    url: 'http://localhost:5000/api/files/list',
                    data: {
                        patient_id: patientId,
                        clinic_id: currentClinicId
                    },
                    withCredentials: true
                });

                if (response.data) {
                    const filesData = Array.isArray(response.data)
                        ? response.data
                        : (Array.isArray(response.data.files) ? response.data.files : (Array.isArray(response.data.data) ? response.data.data : []));

                    const finalFiles = Array.isArray(filesData) ? filesData : [];
                    setFiles(finalFiles);
                }
            } catch (err) {
                console.error("Error fetching files:", err);
                setError("Failed to load dental data.");
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [patientId, currentClinicId]);

    const deleteFile = async (fileId) => {
        try {
            await fetchWithAuth({
                method: 'POST',
                url: 'http://localhost:5000/api/files/delete',
                data: { fileId: fileId },
                withCredentials: true
            });

            setFiles(prev => prev.filter(f => f.id !== fileId));
            return true;
        } catch (err) {
            console.error("Error deleting file:", err);
            return false;
        }
    };

    // Helper functions
    const isImage = (file) => {
        const type = file.file_type || file.mime_type || '';
        return type.includes('image') || ['.png', '.jpg', '.jpeg', '.webp'].some(ext => file.name?.toLowerCase().endsWith(ext));
    };

    const isVideo = (file) => {
        const type = file.file_type || file.mime_type || '';
        return type.includes('video') || ['.mp4', '.webm', '.ogg', '.mov'].some(ext => file.name?.toLowerCase().endsWith(ext));
    };

    const shouldPreview = (file) => {
        const MAX_PREVIEW_SIZE = 50 * 1024 * 1024;
        return (isImage(file) || isVideo(file)) && (!file.size || file.size <= MAX_PREVIEW_SIZE);
    };

    const getFileDetails = (file) => {
        const size = file?.metadata?.size ? `${(file?.metadata?.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown Size';
        const ext = file?.name ? file?.name.split('.').pop().toUpperCase() : 'FILE';
        return { size, ext };
    };

    const handleDownload = async (file) => {
        if (!file) return;

        try {
            const response = await fetch(file.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = file.name || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(file.url, '_blank');
        }
    };

    // Group files
    const groupedFiles = Array.isArray(files) ? files.reduce((groups, file) => {
        const date = file.created_at ? format(new Date(file.created_at), 'MMMM d, yyyy') : 'Unknown Date';
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(file);
        return groups;
    }, {}) : {};

    const sortedDates = Object.keys(groupedFiles).sort((a, b) => new Date(b) - new Date(a));

    return {
        files,
        loading,
        error,
        groupedFiles,
        sortedDates,
        helpers: {
            isImage,
            isVideo,
            shouldPreview,
            getFileDetails,
            handleDownload
        },
        deleteFile
    };
};
