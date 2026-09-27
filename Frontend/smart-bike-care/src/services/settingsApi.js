import api from "./api";

export const getSettings = () => {
    return api.get("/settings");
};

export const updateSettings = (data) => {
    return api.put("/settings", data);
};