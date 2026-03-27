import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const adminNav = [
  { to: '/admin',          icon: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&q=80', label: 'Dashboard' },
  { to: '/admin/vehicles', icon: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&q=80', label: 'Manage Vehicles' },
  { to: '/admin/bookings', icon: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=100&q=80', label: 'All Bookings' },
  { to: '/admin/pricing',  icon: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&q=80', label: 'Pricing Rules' },
  { to: '/admin/users',    icon: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', label: 'Users' },
];

const fleetNav = [
  { to: '/fleet',               icon: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&q=80', label: 'Overview' },
  { to: '/fleet/availability',  icon: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&q=80', label: 'Availability' },
  { to: '/fleet/maintenance',   icon: 'https://images.unsplash.com/photo-1549416878-b9ca35c2d47b?w=100&q=80', label: 'Maintenance' },
  { to: '/fleet/status',        icon: 'https://images.unsplash.com/photo-1562141989-c5c79ac8f576?w=100&q=80', label: 'Vehicle Status' },
];

const Sidebar = ({ role = 'admin' }) => {
  const location = useLocation();
  const navItems = role === 'fleet' ? fleetNav : adminNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-role-badge">
          {role === 'admin' ? ' Admin Panel' : ' Fleet Manager'}
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
                <img src={item.icon} alt={item.label} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />
              </span>
              <span className="sidebar-label">{item.label}</span>
              {isActive && <span className="sidebar-active-dot" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link to="/vehicles" className="sidebar-link sidebar-link-back">
          <span className="sidebar-icon">
            <img src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=100&q=80" alt="Back" style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />
          </span>
          <span>Back to Site</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
