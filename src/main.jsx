import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./AppShell.jsx";
import UserDashboard from "./user/UserDashboard.jsx";
import AdminPanel from "./admin/AdminPanel.jsx";
import HowItWorks from "./overview/HowItWorks.jsx";
import "./styles.css";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><AppRouter /></React.StrictMode>);
