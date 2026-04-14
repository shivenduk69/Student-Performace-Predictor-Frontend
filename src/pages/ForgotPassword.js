import React, { useState } from 'react';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedStudent(null);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage('OTP sent to your email');
      setStep(2);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      setMessage('OTP verified');
      setStep(3);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
      setMessage('Password reset successful');
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <main className="flex-grow flex items-center justify-center p-8">
        <div className="bg-white/70 backdrop-blur-md border border-white/20 p-10 rounded-2xl shadow-2xl w-full max-w-md hover:shadow-3xl transition-all duration-300">
        {step === 1 && (
          <>
            <h2 className="text-3xl font-bold mb-8 text-center text-black">Forgot Password</h2>
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-black">University Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                  placeholder="your@university.edu"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                style={{ backgroundColor: 'rgb(224, 242, 241)', color: 'black' }}
              >
                Send OTP
              </button>
            </form>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-3xl font-bold mb-8 text-center text-black">Enter OTP</h2>
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-black">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                  placeholder="000000"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                style={{ backgroundColor: 'rgb(224, 242, 241)', color: 'black' }}
              >
                Verify OTP
              </button>
            </form>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-3xl font-bold mb-8 text-center text-black">Reset Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-black">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-black">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                style={{ backgroundColor: 'rgb(224, 242, 241)', color: 'black' }}
              >
                Reset Password
              </button>
            </form>
          </>
        )}
        {message && <p className="mt-6 text-center text-red-600 font-medium">{message}</p>}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-300 py-10" style={{ backgroundColor: 'rgb(243, 246, 248)' }}>
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {/* Contact Admin */}
            <div>
              <h3 className="font-bold text-black mb-3 text-lg">Contact Admin</h3>
              <p className="text-sm text-black">Email: admin@ispp.edu</p>
              <p className="text-sm text-black">Phone: +91-XXXX-XXXX-XX</p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-black mb-3 text-lg">Quick Links</h3>
              <ul className="text-sm space-y-2">
                <li>
                  <button 
                    onClick={() => setShowFeedbackModal(true)}
                    className="text-black hover:text-teal-700 hover:underline font-medium transition-colors"
                  >
                    📋 Feedback
                  </button>
                </li>
                <li><button className="text-black hover:text-teal-700 hover:underline font-medium bg-none border-none cursor-pointer text-left transition-colors">📋 System Manual</button></li>
                <li><button className="text-black hover:text-teal-700 hover:underline font-medium bg-none border-none cursor-pointer text-left transition-colors">🔒 Privacy Policy</button></li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="font-bold text-black mb-3 text-lg">About</h3>
              <p className="text-sm text-black">
                Intelligent Student Performance Predictor - Empowering educators with data-driven insights.
              </p>
            </div>
          </div>

          <hr className="border-gray-400 mb-4" />
          <div className="text-center text-sm text-black">
            <p>&copy; 2026 Intelligent Student Performance Predictor. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal 
          student={selectedStudent} 
          onClose={handleCloseFeedbackModal}
          apiUrl={API_URL}
        />
      )}
    </div>
  );
};

export default ForgotPassword;