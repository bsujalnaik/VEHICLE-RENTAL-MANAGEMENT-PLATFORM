import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  // Only show Browse Vehicles and My Rentals for customers (not for admin/fleet)
  const isAdminOrFleet = user && (user.role === 'admin' || user.role === 'fleet');
  const navLinks = isAdminOrFleet ? [] : [
    { to: '/vehicles', label: 'Browse Vehicles', icon: '🚘' },
    { to: '/rentals', label: 'My Rentals', icon: '📋', requireAuth: true },
  ];

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin')  return { to: '/admin',  label: 'Admin Panel', icon: '⚙️' };
    if (user.role === 'fleet')  return { to: '/fleet',  label: 'Fleet Dashboard', icon: '🚛' };
    return null;
  };
  const dashLink = getDashboardLink();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon" />
          <div className="logo-text">
            <span className="logo-main">DriveHub</span>
            <span className="logo-sub">Vehicle Rentals</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          {navLinks.map(link => (
            (!link.requireAuth || user) && (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname.startsWith(link.to) ? 'active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                {link.label}
              </Link>
            )
          ))}
          {dashLink && (
            <Link
              to={dashLink.to}
              className={`nav-link nav-link-dashboard ${location.pathname.startsWith(dashLink.to) ? 'active' : ''}`}
            >
              <span className="nav-icon">{dashLink.icon}</span>
              {dashLink.label}
            </Link>
          )}
        </div>

        {/* Auth Section */}
        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <button className="user-avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <div className="user-info-mini">
                  <span className="user-name-mini">{user.name.split(' ')[0]}</span>
                  <span className={`role-badge role-${user.role}`}>{user.role}</span>
                </div>
                <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
              </button>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  {!isAdminOrFleet && (
                  <Link to="/rentals" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    📋 My Rentals
                  </Link>
                  )}
                  {dashLink && (
                    <Link to={dashLink.to} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      {dashLink.icon} {dashLink.label}
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            (!link.requireAuth || user) && (
              <Link
                key={link.to}
                to={link.to}
                className="mobile-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.icon} {link.label}
              </Link>
            )
          ))}
          {dashLink && (
            <Link to={dashLink.to} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              {dashLink.icon} {dashLink.label}
            </Link>
          )}
          {!user && (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/signup" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
          {user && (
            <button className="mobile-nav-link mobile-logout" onClick={handleLogout}>🚪 Sign Out</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
