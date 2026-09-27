import api from "./api";

export const getBikeReminders = (bikeId) => {
    return api.get(`/reminders/${bikeId}`);
};