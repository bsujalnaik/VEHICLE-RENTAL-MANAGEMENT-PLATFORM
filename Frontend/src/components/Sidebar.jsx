import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

// SVG Primitives
const IconDash = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconVehicles = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconBookings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
const IconPricing = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconUsers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconAvailability = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconMaintenance = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const IconStatus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconBack = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

const adminNav = [
  { to: '/admin',          icon: <IconDash />, label: 'Dashboard' },
  { to: '/admin/vehicles', icon: <IconVehicles />, label: 'Manage Vehicles' },
  { to: '/admin/bookings', icon: <IconBookings />, label: 'All Bookings' },
  { to: '/admin/pricing',  icon: <IconPricing />, label: 'Pricing Rules' },
  { to: '/admin/users',    icon: <IconUsers />, label: 'Users' },
];

const fleetNav = [
  { to: '/fleet',               icon: <IconDash />, label: 'Overview' },
  { to: '/fleet/availability',  icon: <IconAvailability />, label: 'Availability' },
  { to: '/fleet/maintenance',   icon: <IconMaintenance />, label: 'Maintenance' },
  { to: '/fleet/status',        icon: <IconStatus />, label: 'Vehicle Status' },
];

const Sidebar = ({ role = 'admin' }) => {
  const location = useLocation();
  const navItems = role === 'fleet' ? fleetNav : adminNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-role-badge">
          {role === 'admin' ? 'Admin Panel' : 'Fleet Manager'}
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const isActive = location.pathname === item.to ||
            (item.to !== '/admin' && item.to !== '/fleet' && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">
                {item.icon}
              </span>
              <span className="sidebar-label">{item.label}</span>
              {isActive && <span className="sidebar-active-dot" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link to="/vehicles" className="sidebar-link-back">
          <span className="sidebar-icon">
            <IconBack />
          </span>
          <span>Back to Site</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
