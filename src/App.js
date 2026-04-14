import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SelectionDashboard from './pages/SelectionDashboard';
import StudentDetailsDashboard from './pages/StudentDetailsDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<SelectionDashboard />} />
        <Route path="/student/:rollNo" element={<StudentDetailsDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;