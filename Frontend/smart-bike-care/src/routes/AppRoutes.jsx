import React from "react";

import {
    Route,
    Routes,
} from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Contact from "../pages/Contact/Contact";
import Help from "../pages/Help/Help";

import Dashboard from "../pages/Dashboard/Dashboard";
import MyBikes from "../pages/MyBikes/MyBikes";
import AddBike from "../pages/AddBike/AddBike";
import BikeDetails from "../pages/BikeDetails/BikeDetails";
import EditBike from "../pages/EditBike/EditBike";

import Service from "../pages/Service/Service";
import Reminders from "../pages/Reminders/Reminders";
import ServiceHistory from "../pages/ServiceHistory/ServiceHistory";
import EditService from "../pages/Editservice/EditService";

import Garage from "../pages/Garage/Garage";
import Health from "../pages/Health/Health";
import Documents from "../pages/Documents/Documents";
import Emergency from "../pages/Emergency/Emergency";

import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";

function ProtectedPage({ children }) {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function AppRoutes() {
    return (
        <Routes>

            {/* =========================
                PUBLIC LANDING PAGE
            ========================= */}

            <Route
                path="/"
                element={
                    <PublicLayout>
                        <Home />
                    </PublicLayout>
                }
            />

            {/* =========================
                AUTHENTICATION
            ========================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            {/* =========================
                PUBLIC INFORMATION
            ========================= */}

            <Route
                path="/contact"
                element={
                    <PublicLayout>
                        <Contact />
                    </PublicLayout>
                }
            />

            <Route
                path="/help"
                element={
                    <PublicLayout>
                        <Help />
                    </PublicLayout>
                }
            />

            {/* =========================
                DASHBOARD
            ========================= */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedPage>
                        <Dashboard />
                    </ProtectedPage>
                }
            />

            {/* =========================
                BIKE MANAGEMENT
            ========================= */}

            <Route
                path="/bikes"
                element={
                    <ProtectedPage>
                        <MyBikes />
                    </ProtectedPage>
                }
            />

            <Route
                path="/bikes/add"
                element={
                    <ProtectedPage>
                        <AddBike />
                    </ProtectedPage>
                }
            />

            <Route
                path="/bikes/:id"
                element={
                    <ProtectedPage>
                        <BikeDetails />
                    </ProtectedPage>
                }
            />

            <Route
                path="/bikes/:id/edit"
                element={
                    <ProtectedPage>
                        <EditBike />
                    </ProtectedPage>
                }
            />

            {/* =========================
                SERVICE
            ========================= */}

            <Route
                path="/service"
                element={
                    <ProtectedPage>
                        <Service />
                    </ProtectedPage>
                }
            />

            <Route
                path="/service-history"
                element={
                    <ProtectedPage>
                        <ServiceHistory />
                    </ProtectedPage>
                }
            />

            <Route
                path="/reminders"
                element={
                    <ProtectedPage>
                        <Reminders />
                    </ProtectedPage>
                }
            />

            <Route
                path="/service/edit/:serviceId"
                element={
                    <ProtectedPage>
                        <EditService />
                    </ProtectedPage>
                }
            />

            {/* =========================
                BIKE CARE
            ========================= */}

            <Route
                path="/health"
                element={
                    <ProtectedPage>
                        <Health />
                    </ProtectedPage>
                }
            />

            <Route
                path="/documents"
                element={
                    <ProtectedPage>
                        <Documents />
                    </ProtectedPage>
                }
            />

            <Route
                path="/emergency"
                element={
                    <ProtectedPage>
                        <Emergency />
                    </ProtectedPage>
                }
            />

            {/* =========================
                GARAGE
            ========================= */}

            <Route
                path="/garage"
                element={
                    <ProtectedPage>
                        <Garage />
                    </ProtectedPage>
                }
            />

            {/* =========================
                ACCOUNT
            ========================= */}

            <Route
                path="/profile"
                element={
                    <ProtectedPage>
                        <Profile />
                    </ProtectedPage>
                }
            />

            <Route
                path="/settings"
                element={
                    <ProtectedPage>
                        <Settings />
                    </ProtectedPage>
                }
            />

        </Routes>
    );
}

export default AppRoutes;