import api from "./api";

export const getEmergencyContacts = () => {
    return api.get("/emergency-contacts");
};

export const addEmergencyContact = (data) => {
    return api.post("/emergency-contacts", data);
};

export const updateEmergencyContact = (id, data) => {
    return api.put(`/emergency-contacts/${id}`, data);
};

export const deleteEmergencyContact = (id) => {
    return api.delete(`/emergency-contacts/${id}`);
};