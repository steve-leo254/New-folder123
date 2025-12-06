import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ShoppingCartProvider } from './services/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
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
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/superadmindashboard" element={<SuperAdminDashboard />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/prescriptions" element={<PrescriptionPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/video-chat/:id" element={<VideoChatPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/medications" element={<MedicationPage />} />
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