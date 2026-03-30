import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Logo from './Logo';
import './Navbar.css';

/* -------- Inline SVG Icons (no library) -------- */
const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="1" y="1" width="5.5" height="5.5" rx="0.5"/>
    <rect x="8.5" y="1" width="5.5" height="5.5" rx="0.5"/>
    <rect x="1" y="8.5" width="5.5" height="5.5" rx="0.5"/>
    <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="0.5"/>
  </svg>
);

const IconBookmark = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M3 1.5h9v12l-4.5-3L3 13.5V1.5z"/>
  </svg>
);

const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="7.5" cy="7.5" r="2"/>
    <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.93 2.93l1.06 1.06M11.01 11.01l1.06 1.06M2.93 12.07l1.06-1.06M11.01 3.99l1.06-1.06"/>
  </svg>
);

const IconTruck = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="1" y="4" width="9" height="7" rx="0.5"/>
    <path d="M10 6h1.5l2.5 3V11h-4V6z"/>
    <circle cx="3.5" cy="12" r="1"/>
    <circle cx="11.5" cy="12" r="1"/>
  </svg>
);

const IconLogOut = () => (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M10 7.5H1M7 4l3.5 3.5L7 11M8 1h4.5a.5.5 0 01.5.5v12a.5.5 0 01-.5.5H8"/>
  </svg>
);

const IconChevron = ({ open }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
    <path d="M2 4l4 4 4-4"/>
  </svg>
);

/* -------- Navbar -------- */
const Navbar = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest('.user-menu')) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const isAdminOrFleet = user && (user.role === 'admin' || user.role === 'fleet');

  const navLinks = isAdminOrFleet ? [] : [
    { to: '/vehicles', label: 'Vehicles', icon: <IconGrid /> },
    { to: '/rentals',  label: 'My Rentals', icon: <IconBookmark />, requireAuth: true },
  ];

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin')  return { to: '/admin', label: 'Admin Panel',      icon: <IconSettings /> };
    if (user.role === 'fleet')  return { to: '/fleet', label: 'Fleet Dashboard',  icon: <IconTruck /> };
    return null;
  };
  const dashLink = getDashboardLink();

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo-link" onClick={() => setMenuOpen(false)}>
          <Logo size={32} showWordmark={true} />
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
                {link.icon}
                <span>{link.label}</span>
              </Link>
            )
          ))}
          {dashLink && (
            <Link
              to={dashLink.to}
              className={`nav-link nav-link-dash ${location.pathname.startsWith(dashLink.to) ? 'active' : ''}`}
            >
              {dashLink.icon}
              <span>{dashLink.label}</span>
            </Link>
          )}
        </div>

        {/* Auth Section */}
        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <button
                className="user-avatar-btn"
                onClick={() => setDropdownOpen(o => !o)}
                id="user-menu-btn"
                aria-expanded={dropdownOpen}
              >
                <div className="user-avatar-hex">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info-mini">
                  <span className="user-name-mini">{user.name.split(' ')[0]}</span>
                  <span className={`role-badge role-${user.role}`}>{user.role}</span>
                </div>
                <IconChevron open={dropdownOpen} />
              </button>

              {dropdownOpen && (
                <div className="user-dropdown" role="menu">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  {!isAdminOrFleet && (
                    <Link to="/rentals" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <IconBookmark /> My Rentals
                    </Link>
                  )}
                  {dashLink && (
                    <Link to={dashLink.to} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      {dashLink.icon} {dashLink.label}
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    <IconLogOut /> Sign Out
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
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className="ham-line" />
            <span className="ham-line" />
            <span className="ham-line" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-inner">
            {navLinks.map(link => (
              (!link.requireAuth || user) && (
                <Link
                  key={link.to}
                  to={link.to}
                  className="mobile-nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              )
            ))}
            {dashLink && (
              <Link to={dashLink.to} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                {dashLink.icon} <span>{dashLink.label}</span>
              </Link>
            )}
            {!user && (
              <>
                <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/signup" className="mobile-nav-link mobile-nav-cta" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
            {user && (
              <button className="mobile-nav-link mobile-logout" onClick={handleLogout}>
                <IconLogOut /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
