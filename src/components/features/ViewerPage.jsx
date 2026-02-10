import React, { useMemo } from 'react';
import MPRViewer from './MPRViewer';
import { useSliceImage } from '@/hooks/useSliceImage';

const ViewerPage = ({ reportId }) => {
    const { data, isLoading, error } = useSliceImage(reportId);

    const formattedImageIds = useMemo(() => {
        // Transform URLs to be compatible with cornerstoneWebImageLoader (or similar)
        // If you implemented a custom loader for "web:", this prefix is correct.
        // Otherwise, for standard cornerstoneWebImageLoader, you might need to register it.
        // Assuming "web:" prefix is desired based on previous context.
        return data.axial.map(url => `web:${url}`);
    }, [data.axial]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-black text-white">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <p>Loading 3D Volume...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-black text-red-500">
                <p>Error loading viewer: {error}</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <MPRViewer imageIds={formattedImageIds} />
        </div>
    );
};

export default ViewerPage;
