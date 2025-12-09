import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
import DoctorsProfilePage from './pages/DoctorsProfilePage';
import PatientPage from './pages/PatientPage';
import PharmacyPage from './pages/PharmacyPage';
import DoctorsPage1 from './pages/DoctorsPage1';
import { useStaff } from './services/useStaff';
import { Doctor } from './types';
import DoctorPrescriptionPage from './pages/DoctorPrescriptionPage';
import NotFoundPage from './pages/NotFoundPage';
import Signup from './pages/RegisterPage';
import './styles/globals.css';
import LoginPage from './pages/LoginPage';

function App() {
  // Wrapper component for DoctorsPage1 that provides required props
  const DoctorsPage1Wrapper = () => {
    const { staff, loading, fetchStaff } = useStaff();
    const navigate = useNavigate();
    
    React.useEffect(() => {
      fetchStaff();
    }, []);

    // Convert staff to Doctor format
    const doctors: Doctor[] = React.useMemo(() => {
      return staff
        .filter((staffMember) => staffMember.role === 'doctor' && staffMember.doctor)
        .map((staffMember) => {
          const nameParts = staffMember.fullName.split(' ');
          const doctor = staffMember.doctor!;
          return {
            id: staffMember.id.toString(),
            firstName: nameParts[0] || 'Dr',
            lastName: nameParts.slice(1).join(' ') || '',
            name: staffMember.fullName,
            specialization: doctor.specialization,
            specialty: doctor.specialization,
            experience: 5, // Default experience since it's not in the doctor object
            rating: doctor.rating,
            avatar: staffMember.avatar || '/images/doctor-default.jpg',
            bio: doctor.bio || 'Professional healthcare provider',
            availability: [], // Empty array since availability data isn't available
            consultationFee: doctor.consultationFee,
            available: doctor.isAvailable || false,
          };
        });
    }, [staff]);

    const handleSelectDoctor = (doctor: Doctor) => {
      navigate(`/doctor-profile/${doctor.id}`);
    };

    if (loading) {
      return <div>Loading...</div>;
    }

    return <DoctorsPage1 doctors={doctors} onSelectDoctor={handleSelectDoctor} />;
  };

  // Wrapper component for DoctorsProfilePage that provides required props
  const DoctorsProfilePageWrapper = () => {
    const { staff, loading, fetchStaff } = useStaff();
    
    React.useEffect(() => {
      fetchStaff();
    }, []);

    // Convert staff to Doctor format
    const doctors: Doctor[] = React.useMemo(() => {
      return staff
        .filter((staffMember) => staffMember.role === 'doctor' && staffMember.doctor)
        .map((staffMember) => {
          const nameParts = staffMember.fullName.split(' ');
          const doctor = staffMember.doctor!;
          return {
            id: staffMember.id.toString(),
            firstName: nameParts[0] || 'Dr',
            lastName: nameParts.slice(1).join(' ') || '',
            name: staffMember.fullName,
            specialization: doctor.specialization,
            specialty: doctor.specialization,
            experience: 5, // Default experience since it's not in the doctor object
            rating: doctor.rating,
            avatar: staffMember.avatar || '/images/doctor-default.jpg',
            bio: doctor.bio || 'Professional healthcare provider',
            availability: [], // Empty array since availability data isn't available
            consultationFee: doctor.consultationFee,
            available: doctor.isAvailable || false,
          };
        });
    }, [staff]);

    if (loading) {
      return <div>Loading...</div>;
    }

    return <DoctorsProfilePage doctors={doctors} />;
  };

  return (
    <Provider store={store}>
      <ShoppingCartProvider>
        <Router>
          <div className="min-h-screen flex flex-col page-bg">
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
                <Route 
                  path="/patient" 
                  element={
                    <ProtectedRoute>
                      <PatientPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/pharmacy" 
                  element={
                    <ProtectedRoute>
                      <PharmacyPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/doctors1" 
                  element={
                    <ProtectedRoute>
                      <DoctorsPage1Wrapper />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/doctor-prescriptions" 
                  element={
                    <ProtectedRoute>
                      <DoctorPrescriptionPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/doctors-profile" 
                  element={
                    <ProtectedRoute>
                      <DoctorsProfilePageWrapper />
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