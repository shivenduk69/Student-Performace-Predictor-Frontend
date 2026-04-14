import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: 'error' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage({ text: 'OTP sent to your email.', type: 'success' });
      setStep(2);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Unable to send OTP', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
      setMessage({ text: 'OTP verified. Set a new password.', type: 'success' });
      setStep(3);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Invalid OTP', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp, newPassword });
      setMessage({ text: 'Password reset successful. You can sign in now.', type: 'success' });
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Password reset failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h2 style={{ marginTop: 0 }}>Lumora Password Reset</h2>
        <p style={{ marginTop: 0, color: '#637188' }}>Complete verification to update your account password.</p>
        <p style={{ color: '#637188', fontSize: 14 }}>Step {step} of 3</p>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} style={{ display: 'grid', gap: 12 }}>
            <div className="field">
              <label>Registered Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} style={{ display: 'grid', gap: 12 }}>
            <div className="field">
              <label>OTP</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: 12 }}>
            <div className="field">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="field">
              <label>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Reset Password'}
            </button>
          </form>
        )}

        {message.text && <p className={`status ${message.type}`}>{message.text}</p>}
        <p style={{ marginBottom: 0 }}><Link to="/">Back to Login</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
