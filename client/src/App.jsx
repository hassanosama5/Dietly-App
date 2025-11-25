import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MealProvider } from "./context/MealContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardUser from "./pages/DashboardUser";
import DashboardGuest from "./pages/DashboardGuest";
import ProfileSetup from "./pages/profile/ProfileSetup";
import Meals from "./pages/Meals";
import MealDetailPage from "./pages/MealDetailPage";
import Progress from "./pages/Progress";
import MealPlans from "./pages/MealPlans";
import MealPlanView from "./components/meal-plans/MealPlanView";
import LoadingSpinner from "./components/common/LoadingSpinner";
import DashboardLayout from "./components/layouts/DashboardLayout";

// Route for logged-in users
const ProtectedRoute = ({ children, allowJustRegistered = false }) => {
  const { isAuthenticated, loading, justRegistered } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    if (allowJustRegistered && justRegistered) return children;
    return <Navigate to="/" replace />;
  }

  return children;
};

// Route for guests
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, justRegistered } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (isAuthenticated) {
    if (justRegistered) return <Navigate to="/profile-setup" replace />;
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <MealProvider>
        <Router>
          <Routes>
            {/* Auth pages */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            {/* Profile Setup */}
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute allowJustRegistered={true}>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />

            {/* Guest Dashboard */}
            <Route
              path="/dashboard"
              element={
                <GuestRoute>
                  <DashboardGuest />
                </GuestRoute>
              }
            />

            {/* Logged-in Dashboard User */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute>
                  <DashboardUser />
                </ProtectedRoute>
              }
            />

            {/* Other protected pages */}
            <Route
              path="/meals"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Meals />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meals/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MealDetailPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Progress />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-plans"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MealPlans />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-plans/view/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MealPlanView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Redirect root */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="text-center text-2xl py-20">
                  404 - Page Not Found
                </div>
              }
            />
          </Routes>
        </Router>
      </MealProvider>
    </AuthProvider>
  );
}

export default App;
