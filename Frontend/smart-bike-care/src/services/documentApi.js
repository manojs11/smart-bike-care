import api from "./api";

export const getDocuments = (bikeId) => {
    return api.get(`/bikes/${bikeId}/documents`);
};

export const saveDocument = (bikeId, data) => {
    return api.post(`/bikes/${bikeId}/documents`, data);
};

export const deleteDocument = (bikeId, documentType) => {
    return api.delete(
        `/bikes/${bikeId}/documents/${encodeURIComponent(documentType)}`
    );
};