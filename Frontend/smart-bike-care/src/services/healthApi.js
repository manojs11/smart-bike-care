import api from "./api";

export const getBikeHealth = (bikeId) => {
    return api.get(`/bikes/${bikeId}/health`);
};