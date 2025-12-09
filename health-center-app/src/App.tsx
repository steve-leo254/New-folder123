import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ShoppingCartProvider } from './services/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import AppointmentsPage from './pages/AppointmentsPage';
import DashboardPage from './pages/DashboardPage';
import PrescriptionPage from './pages/PrescriptionPage';
import ProfilePage from './pages/ProfilePage';
import DoctorsPage from './pages/DoctorsPage';
import VideoChatPage from './pages/VideoChatPage';
import CheckoutPage from './pages/CheckoutPage';
import CartPage from './pages/CartPage';
import MedicationPage from './pages/MedicationPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import DoctorProfilePage from './pages/DoctorProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import Signup from './pages/RegisterPage';
import './styles/globals.css';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Provider store={store}>
      <ShoppingCartProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/login" element={<LoginPage />} />
                {/* Admin-only routes */}
                <Route 
                  path="/superadmindashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['super_admin', 'clinician_admin']}>
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Authenticated user routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/appointments" 
                  element={
                    <ProtectedRoute>
                      <AppointmentsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/prescriptions" 
                  element={
                    <ProtectedRoute>
                      <PrescriptionPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/doctors" 
                  element={
                    <ProtectedRoute>
                      <DoctorsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/doctor-profile/:doctorId" 
                  element={
                    <ProtectedRoute>
                      <DoctorProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/video-chat/:id" 
                  element={
                    <ProtectedRoute>
                      <VideoChatPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/medications" 
                  element={
                    <ProtectedRoute>
                      <MedicationPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ShoppingCartProvider>
    </Provider>
  );
}

export default App;