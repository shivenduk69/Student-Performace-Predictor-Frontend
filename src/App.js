import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-black">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
        <footer className="bg-primary-light p-4 text-center">
          <p>&copy; 2023 Intelligent Student Performance Predictor</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;