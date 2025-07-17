import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./index.css";
import LoginPage from "./pages/Login_page";
import AI_Chat_Assistant_page from "./pages/AI_Chat_Assistant_page";
import Layout from "./components/Layout";
import OperationsDashboardPage from "./pages/Operations_Dashboard_page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OperationsDashboardPage />} />
          <Route path="ai" element={<AI_Chat_Assistant_page />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);