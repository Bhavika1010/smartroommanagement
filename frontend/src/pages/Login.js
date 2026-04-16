import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user }       = useAuth();
  const navigate              = useNavigate();

  if (user) { navigate('/dashboard'); return null; }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => {
    setForm({ email, password });
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">SR</div>
          <span className="login-brand-name">Smart<span>Room</span></span>
        </div>
        <h1 className="login-tagline">Manage college rooms<br />with ease.</h1>
        <p className="login-desc">
          Book rooms for classes, seminars, and events.
          Real-time availability, approval workflows, and
          complete booking management — all in one place.
        </p>
        <div className="login-features">
          {['Role-based access control', 'Conflict detection', 'Instant booking requests', 'Admin approval workflow'].map((f, i) => (
            <div key={i} className="login-feature-item">
              <span className="lfi-check">✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">Sign in to your account to continue</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@college.edu"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="demo-creds">
            <p className="demo-label">Demo accounts:</p>
            <div className="demo-grid">
              {[
                { label: 'Admin',   email: 'admin@college.edu',        pass: 'admin123' },
                { label: 'Faculty', email: 'prof.sharma@college.edu',  pass: 'faculty123' },
                { label: 'Student', email: 'alice@college.edu',        pass: 'student123' },
              ].map(d => (
                <button
                  key={d.label}
                  type="button"
                  className="demo-btn"
                  onClick={() => fillDemo(d.email, d.pass)}
                >
                  <span className="demo-role">{d.label}</span>
                  <span className="demo-email">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
