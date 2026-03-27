import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import VehicleDetail from './pages/VehicleDetail';
import AdminDashboard from './pages/AdminDashboard';
import BookingConfirmation from './pages/BookingConfirmation';
import MyRentals from './pages/MyRentals';
import FleetDashboard from './pages/FleetDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen pb-20">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/fleet" element={<FleetDashboard />} />
          <Route path="/confirm" element={<BookingConfirmation />} />
          <Route path="/my-rentals" element={<MyRentals />} />
        </Routes>
      </div>
    </Router>
  );
}

const AppWrapper = () => (
  <RoleProvider>
    <App />
  </RoleProvider>
);

export default AppWrapper;
