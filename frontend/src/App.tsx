import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { AppShell } from './components/layouts';
import { ProtectedRoute } from './components/routing';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  OtpVerifyPage,
  VerifyEmailPage,
  ProfilePage,
} from './pages/auth';
import { TestResetPasswordPage } from './pages/auth/TestResetPassword';
import {
  SettingsPage,
  EditProfilePage,
  SecurityPage,
  AppearancePage,
} from './pages/settings';
import {
  HomePage,
  ProductsPage,
  CartPage,
  FavoritesPage,
  ProductDetailsPage,
  StoresPage,
  StoreDetailsPage,
  CheckoutPage,
  TermsPage,
  PrivacyPage,
} from './pages/app';
import { AdminDashboard, StoreManagement } from './pages/admin';
import { AdminStoreDetail } from './pages/admin/AdminStoreDetail';

function App() {
  const { checkAuth } = useAuthStore();

  // Check auth status on app load
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No AppShell */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/otp-verify" element={<OtpVerifyPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/test-reset" element={<TestResetPasswordPage />} />

        {/* Protected Routes - With AppShell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell>
                <Navigate to="/home" />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AppShell>
                <HomePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProductsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProductDetailsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <AppShell>
                <CartPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <AppShell>
                <CheckoutPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <AppShell>
                <FavoritesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <ProtectedRoute>
              <AppShell>
                <StoresPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores/:slug"
          element={
            <ProtectedRoute>
              <AppShell>
                <StoreDetailsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProfilePage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Settings Routes */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppShell>
                <SettingsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <AppShell>
                <EditProfilePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/security"
          element={
            <ProtectedRoute>
              <AppShell>
                <SecurityPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/appearance"
          element={
            <ProtectedRoute>
              <AppShell>
                <AppearancePage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Public Legal Pages */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Admin Route - Separate Layout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Store Management Route */}
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute>
              <StoreManagement />
            </ProtectedRoute>
          }
        />

        {/* Admin Store Detail Route */}
        <Route
          path="/admin/stores/:storeId"
          element={
            <ProtectedRoute>
              <AdminStoreDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
