import { create } from 'zustand';

const useUploadStore = create((set, get) => ({
    uploads: [],
    isToastVisible: false,

    addUpload: ({ fileName, reportType, onCancel }) => {
        const uploadId = Date.now() + Math.random();
        const newUpload = {
            id: uploadId,
            fileName,
            reportType: reportType === 'Generic Upload' ? 'File' : reportType,
            progress: 0,
            speed: '0.00',
            status: 'uploading',
            onCancel
        };

        set(state => ({
            uploads: [...state.uploads, newUpload],
            isToastVisible: true
        }));
        return uploadId;
    },

    updateProgress: (uploadId, progress, speed) => {
        set(state => ({
            uploads: state.uploads.map(upload =>
                upload.id === uploadId
                    ? {
                        ...upload,
                        progress,
                        speed: typeof speed === 'number' ? speed.toFixed(2) : speed,
                        status: progress >= 100 ? 'success' : 'uploading'
                    }
                    : upload
            )
        }));
    },

    setUploadError: (uploadId) => {
        set(state => ({
            uploads: state.uploads.map(upload =>
                upload.id === uploadId
                    ? { ...upload, status: 'error' }
                    : upload
            )
        }));
    },

    cancelUpload: (uploadId) => {
        const state = get();
        const upload = state.uploads.find(u => u.id === uploadId);
        if (upload && upload.onCancel) {
            upload.onCancel();
        }
        get().removeUpload(uploadId);
    },

    removeUpload: (uploadId) => {
        set(state => {
            const newUploads = state.uploads.filter(upload => upload.id !== uploadId);
            const shouldClose = newUploads.length === 0;
            return {
                uploads: newUploads,
                isToastVisible: !shouldClose
            };
        });
    },

    closeToast: () => {
        set({
            isToastVisible: false,
            uploads: []
        });
    }
}));

export default useUploadStore;
