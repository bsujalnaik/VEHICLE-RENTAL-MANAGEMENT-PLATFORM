import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import './AuthPage.css';

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
        // Send selected role — backend will reject if account role doesn't match
        result = await api.login({ email: form.email, password: form.password, role: form.role });
      } else {
        // Registration always creates a customer account
        result = await api.register({ name: form.name, email: form.email, password: form.password, role: 'customer' });
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

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=100&q=80" alt="DriveHub" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            DriveHub
          </Link>
          <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Sign in to access your dashboard'
              : 'Join DriveHub and start your first rental'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Role selection is only shown for Login — signup is always customer */}
          {isLogin && (
          <div className="form-group mb-16">
            <label className="form-label">I am a...</label>
            <div className="role-selector">
              {[
                { value: 'customer', label: 'Customer', desc: 'Rent vehicles', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
                { value: 'fleet',    label: 'Fleet Mgr', desc: 'Manage fleet', img: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=100&q=80' },
                { value: 'admin',    label: 'Admin',     desc: 'Full control', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  className={`role-card ${form.role === r.value ? 'active' : ''}`}
                  onClick={() => handleChange('role', r.value)}
                >
                  <img src={r.img} alt={r.label} style={{ width: '28px', height: '28px', borderRadius: '50%', marginBottom: '6px' }} />
                  <span className="role-icon-lbl">{r.label}</span>
                  <span className="role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                id="auth-name"
                type="text"
                className={`form-control ${errors.name ? 'error' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="auth-email"
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="auth-password"
              type="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                id="auth-confirm"
                type="password"
                className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
          )}

          <button id="auth-submit" type="submit" className="btn btn-primary btn-full btn-lg mt-8" disabled={loading}>
            {loading
              ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</>
              : isLogin ? ' Sign In to Dashboard' : ' Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <Link to={isLogin ? '/signup' : '/login'} className="auth-switch-link">
            {isLogin ? 'Sign up free' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
