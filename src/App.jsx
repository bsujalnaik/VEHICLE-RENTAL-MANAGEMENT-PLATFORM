import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import VehicleListPage from './pages/VehicleListPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import RentalTrackingPage from './pages/RentalTrackingPage';
import AdminDashboard from './pages/AdminDashboard';
import FleetDashboard from './pages/FleetDashboard';

import { useApp } from './context/AppContext';
import './App.css';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user } = useApp();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Toast />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          
          <Route path="/vehicles" element={<VehicleListPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
          
          <Route path="/book/:id" element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } />
          
          <Route path="/payment" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
          
          <Route path="/rentals" element={
            <ProtectedRoute>
              <RentalTrackingPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Fleet Routes */}
          <Route path="/fleet/*" element={
            <ProtectedRoute roles={['fleet', 'admin']}>
              <FleetDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
