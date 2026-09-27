import api from "./api";

export const getMaintenanceServices = () => {
    return api.get("/maintenance/services");
};

export const getSpareParts = () => {
    return api.get("/maintenance/spare-parts");
};

export const getRecommendations = (bikeId) => {
    return api.get(`/maintenance/recommendations/${bikeId}`);
};