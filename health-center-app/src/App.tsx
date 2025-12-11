import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ShoppingCartProvider } from './services/CartContext';
import { AuthProvider } from './services/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageLayout from './components/layout/PageLayout';

// Route Configurations
import { publicRoutes, protectedRoutes, adminRoutes, staffRoutes } from './routes';

// Styles
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ShoppingCartProvider>
          <Router>
            <PageLayout>
              <Header />
              <main className="flex-grow">
                <AppRoutes />
              </main>
              <Footer />
            </PageLayout>
          </Router>
        </ShoppingCartProvider>
      </AuthProvider>
    </Provider>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* Admin Routes */}
      {adminRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute allowedRoles={route.allowedRoles}>
              {route.element}
            </ProtectedRoute>
          }
        />
      ))}

      {/* Staff Routes */}
      {staffRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute allowedRoles={route.allowedRoles}>
              {route.element}
            </ProtectedRoute>
          }
        />
      ))}

      {/* Protected Routes (Any authenticated user) */}
      {protectedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute allowedRoles={route.allowedRoles}>
              {route.element}
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
};

export default App;