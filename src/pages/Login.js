import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import AnimatedLogo from '../components/AnimatedLogo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: 'error' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const hasGoogleClient = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('mentorEmail', email);
      setMessage({ text: 'Login successful. Redirecting...', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 350);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Login failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setMessage({ text: 'Google login failed. Please try again.', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/google-login`, {
        credential: credentialResponse.credential,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('mentorEmail', res.data.email);
      setMessage({ text: 'Google login successful. Redirecting...', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 350);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Google login failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div style={{ marginBottom: 18, display: 'grid', gap: 8, justifyItems: 'center' }}>
          <AnimatedLogo />
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)', textAlign: 'center' }}>
            Predict risk early. Act before marks drop.
          </p>
        </div>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Lumora Mentor Login</h2>
        <p style={{ color: 'var(--muted)', marginTop: 0, textAlign: 'center' }}>
          Access predictive student insights and intervention recommendations.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mentor@college.edu"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: 12, marginBottom: 2, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <p className="muted-text" style={{ margin: 0, fontSize: '0.84rem' }}>or continue with</p>
          {hasGoogleClient ? (
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setMessage({ text: 'Google login failed. Please retry.', type: 'error' })}
              useOneTap
            />
          ) : (
            <p className="warning-text" style={{ margin: 0, fontSize: '0.82rem' }}>
              Google Sign-In unavailable: set REACT_APP_GOOGLE_CLIENT_ID
            </p>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        {message.text && <p className={`status ${message.type}`}>{message.text}</p>}
      </div>
    </div>
  );
};

export default Login;