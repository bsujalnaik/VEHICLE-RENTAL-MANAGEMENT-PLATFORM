import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import FleetOverview from './fleet/FleetOverview';
import FleetAvailability from './fleet/FleetAvailability';
import FleetMaintenance from './fleet/FleetMaintenance';
import FleetStatus from './fleet/FleetStatus';

const FleetDashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar role="fleet" />
      <main className="dashboard-main flex-col gap-24">
        <Routes>
          <Route path="/" element={<FleetOverview />} />
          <Route path="/availability" element={<FleetAvailability />} />
          <Route path="/maintenance" element={<FleetMaintenance />} />
          <Route path="/status" element={<FleetStatus />} />
          <Route path="*" element={<FleetOverview />} />
        </Routes>
      </main>
    </div>
  );
};

export default FleetDashboard;
