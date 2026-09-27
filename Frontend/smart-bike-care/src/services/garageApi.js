import api from "./api";

export const getGarages = () => {
    return api.get("/garages");
};

export const getGarageById = (garageId) => {
    return api.get(`/garages/${garageId}`);
};