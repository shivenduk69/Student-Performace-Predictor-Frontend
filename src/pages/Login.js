import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('mentorEmail', email);
      setMessage('Login successful');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-md border border-white/20 p-10 rounded-2xl shadow-2xl w-full max-w-md hover:shadow-3xl transition-all duration-300">
        <h2 className="text-3xl font-bold mb-8 text-center text-black">Educator Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-black">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="text-teal-600 hover:text-teal-800 font-medium transition-colors">Forgot Password?</Link>
        </div>
        {message && <p className="mt-4 text-center text-red-600 font-medium">{message}</p>}
      </div>
    </div>
  );
};

export default Login;