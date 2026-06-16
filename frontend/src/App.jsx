import React from "react";

import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout.jsx";

import AuthLayout from "./layouts/AuthLayout.jsx";

import LoginPage from "./pages/LoginPage.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";

import RequestsPage from "./pages/RequestsPage.jsx";

import RequestDetailsPage from "./pages/RequestDetailsPage.jsx";

import DirectoriesPage from "./pages/DirectoriesPage.jsx";

import UsersPage from "./pages/UsersPage.jsx";



function RequireAuth({ children }) {

  const token = localStorage.getItem("access_token");

  if (!token) return <Navigate to="/login" replace />;

  return children;

}



export default function App() {

  return (

    <Routes>

      <Route element={<AuthLayout />}>

        <Route path="/login" element={<LoginPage />} />

      </Route>



      <Route

        element={

          <RequireAuth>

            <AppLayout />

          </RequireAuth>

        }

      >

        <Route path="/" element={<DashboardPage />} />

        <Route path="/requests" element={<RequestsPage />} />

        <Route path="/requests/:id" element={<RequestDetailsPage />} />

        <Route path="/directories" element={<DirectoriesPage />} />

        <Route path="/users" element={<UsersPage />} />

      </Route>



      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );

}


