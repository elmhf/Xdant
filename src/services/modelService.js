import axios from 'axios';

const MODEL_API_URL = 'http://localhost:5030/api/models';

export const modelService = {
    // List All Models
    getAllModels: async () => {
        const response = await axios.get(MODEL_API_URL);
        return response.data;
    },

    // Register (Add) a New Model
    // If file is provided, use FormData for file upload.
    // If path is provided, use JSON.
    registerModel: async (data, file = null) => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', data.name);
            formData.append('type', data.type);
            formData.append('threshold', data.threshold);

            const response = await axios.post(MODEL_API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } else {
            const response = await axios.post(MODEL_API_URL, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
    },

    // Set Active Model
    setActiveModel: async (modelId) => {
        const response = await axios.post(`${MODEL_API_URL}/active`, { model_id: modelId }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    },

    // Delete Model
    deleteModel: async (modelId) => {
        const response = await axios.delete(`${MODEL_API_URL}/${modelId}`);
        return response.data;
    },

    // Deactivate Model Type
    deactivateModelType: async (type) => {
        const response = await axios.post(`${MODEL_API_URL}/deactivate`, { type }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    },
};
