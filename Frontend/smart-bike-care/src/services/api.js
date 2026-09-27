import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(
            "smartBikeCare_token"
        );

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        const newToken =
            response.headers["x-new-token"];

        if (newToken) {
            localStorage.setItem(
                "smartBikeCare_token",
                newToken
            );
        }

        return response;
    },
    (error) => {
        const status =
            error.response?.status;

        const requestUrl =
            error.config?.url || "";

        const isAuthRequest =
            requestUrl.includes("/auth/login") ||
            requestUrl.includes("/auth/register");

        if (
            (status === 401 || status === 403) &&
            !isAuthRequest
        ) {
            localStorage.removeItem(
                "smartBikeCare_token"
            );

            localStorage.removeItem(
                "smartBikeCare_loggedIn"
            );

            window.dispatchEvent(
                new Event(
                    "smartBikeCareAuthChange"
                )
            );
        }

        return Promise.reject(error);
    }
);

export default api;