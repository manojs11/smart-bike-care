import api from "./api";

export const getMyProfile = () => {
    return api.get("/users/me");
};

export const updateMyProfile = (data) => {
    return api.put("/users/me", data);
};

export const changePassword = (data) => {
    return api.put("/users/me/password", data);
};