import api from "./api";

export const createBike = (data) => {
    return api.post("/bikes", data);
};

export const getAllBikes = () => {
    return api.get("/bikes");
};

export const getBikeById = (bikeId) => {
    return api.get(`/bikes/${bikeId}`);
};

export const updateBike = (bikeId, data) => {
    return api.put(`/bikes/${bikeId}`, data);
};

export const deleteBike = (bikeId) => {
    return api.delete(`/bikes/${bikeId}`);
};

export const updateOdometer = (bikeId, odometer) => {
    return api.put(`/bikes/${bikeId}/odometer`, {
        odometer,
    });
};