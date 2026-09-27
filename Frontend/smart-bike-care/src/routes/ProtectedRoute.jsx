import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
    const location = useLocation();

    const getLoginStatus = () => {
        return (
            localStorage.getItem("smartBikeCare_loggedIn") === "true" &&
            !!localStorage.getItem("smartBikeCare_token")
        );
    };

    const [isLoggedIn, setIsLoggedIn] = useState(getLoginStatus);

    useEffect(() => {
        const handleAuthChange = () => {
            setIsLoggedIn(getLoginStatus());
        };

        window.addEventListener(
            "smartBikeCareAuthChange",
            handleAuthChange
        );

        window.addEventListener(
            "storage",
            handleAuthChange
        );

        return () => {
            window.removeEventListener(
                "smartBikeCareAuthChange",
                handleAuthChange
            );

            window.removeEventListener(
                "storage",
                handleAuthChange
            );
        };
    }, []);

    if (!isLoggedIn) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }

    return children;
}

export default ProtectedRoute;