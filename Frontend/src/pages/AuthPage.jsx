import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Logo from '../components/Logo';
import './AuthPage.css';

/* -------- SVG Role Icons -------- */
const IconCustomer = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.3">
    <circle cx="11" cy="7" r="4"/>
    <path d="M3 19c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
  </svg>
);
const IconFleet = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.3">
    <rect x="2" y="8" width="12" height="9" rx="1"/>
    <path d="M14 11h2.5l3.5 4v3h-6V11z"/>
    <circle cx="6" cy="19" r="1.5"/>
    <circle cx="16" cy="19" r="1.5"/>
  </svg>
);
const IconAdmin = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.3">
    <circle cx="11" cy="11" r="3"/>
    <path d="M11 2v2M11 18v2M2 11h2M18 11h2M4.9 4.9l1.4 1.4M15.7 15.7l1.4 1.4M4.9 17.1l1.4-1.4M15.7 6.3l1.4-1.4"/>
  </svg>
);

const AuthPage = ({ mode = 'login' }) => {
  const { login, addToast } = useApp();
  const navigate = useNavigate();
  const isLogin = mode === 'login';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    licenseFile: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!isLogin && !form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!isLogin && form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!isLogin && form.role === 'admin' && !form.licenseFile) errs.licenseFile = 'License document is required for admin accounts';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await api.login({ email: form.email, password: form.password, role: form.role });
      } else {
        result = await api.register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          licenseFile: form.licenseFile
        });
      }
      login(result.user);
      addToast(`Welcome, ${result.user.name}!`, 'success');
      const dashMap = { admin: '/admin', fleet: '/fleet', customer: '/vehicles' };
      navigate(dashMap[result.user.role] || '/vehicles');
    } catch (err) {
      addToast(err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const roles = [
    { value: 'customer', label: 'Customer',     desc: 'Rent vehicles',   icon: <IconCustomer /> },
    { value: 'fleet',    label: 'Fleet Manager', desc: 'Manage the fleet', icon: <IconFleet /> },
    { value: 'admin',    label: 'Admin',         desc: 'Full control',    icon: <IconAdmin /> },
  ];

  const visibleRoles = isLogin ? roles : roles.filter(r => r.value !== 'fleet');

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-bg-grid" />
        <div className="auth-bg-glow" />
        <div className="auth-bg-text" aria-hidden="true">
          {isLogin ? 'ACCESS' : 'JOIN'}
        </div>
      </div>

      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-card-top">
            <Link to="/" className="auth-logo-link">
              <Logo size={28} showWordmark={true} />
            </Link>
          </div>

          <div className="auth-header">
            <div className="auth-eyebrow">
              {isLogin ? 'Secure Access' : 'New Account'}
            </div>
            <h1 className="auth-title">
              {isLogin ? 'Welcome back.' : 'Join DriveHub.'}
            </h1>
            <p className="auth-subtitle">
              {isLogin
                ? 'Sign in to access your dashboard and rentals.'
                : 'Create your account and start your first rental today.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* Role selector — available on both login and signup */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">{isLogin ? 'I am signing in as' : 'Account Type'}</label>
              <div className="role-selector">
                {visibleRoles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    className={`role-card ${form.role === r.value ? 'active' : ''}`}
                    onClick={() => handleChange('role', r.value)}
                    id={`role-${r.value}`}
                  >
                    <span className="role-icon">{r.icon}</span>
                    <span className="role-label">{r.label}</span>
                    <span className="role-desc">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-name">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  autoComplete="name"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-confirm">Confirm Password</label>
                <input
                  id="auth-confirm"
                  type="password"
                  className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            )}

            {!isLogin && form.role === 'admin' && (
              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="form-label" htmlFor="auth-license">Admin Verification License</label>
                <div style={{ padding: '4px 0' }}>
                  <input
                    id="auth-license"
                    type="file"
                    accept="image/*,.pdf"
                    className={`form-control ${errors.licenseFile ? 'error' : ''}`}
                    onChange={e => handleChange('licenseFile', e.target.files[0])}
                    required
                    style={{ padding: '10px' }}
                  />
                  <p className="form-hint" style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-gray)' }}>
                    Official ID or proof of authorization required.
                  </p>
                  {errors.licenseFile && <span className="form-error" style={{ display: 'block', marginTop: '4px' }}>{errors.licenseFile}</span>}
                </div>
              </div>
            )}

            <button
              id="auth-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg auth-submit"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: '2px' }} />Processing</>
                : isLogin ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link to={isLogin ? '/signup' : '/login'} className="auth-switch-link">
              {isLogin ? 'Sign up free' : 'Sign in instead'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
