import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDetailsDashboard = () => {
  const { rollNo } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchStudentDetails();
  }, [rollNo]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/student/${rollNo}`);
      setStudent(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load student details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="hover:text-teal-100">← Back</button>
              <div><h1 className="font-bold">{student?.name}</h1><p className="text-sm">Roll: {student?.rollNo}</p></div>
            </div>
            <div className="flex gap-2">
              {['home', 'attendance', 'assignment', 'midsem', 'endsem'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 rounded ${activeTab === tab ? 'bg-white text-teal-600' : 'hover:bg-teal-500'}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow p-8">
        {activeTab === 'home' && <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-lg"><h2 className="text-2xl font-bold text-teal-700 mb-6">Profile</h2><div className="grid grid-cols-2 gap-8"><div><h3 className="font-bold text-teal-700 mb-3">Info</h3><div className="text-sm space-y-1"><p><strong>Name:</strong> {student?.name}</p><p><strong>Roll:</strong> {student?.rollNo}</p><p><strong>Course:</strong> {student?.course}</p><p><strong>Year:</strong> {student?.year}</p><p><strong>Section:</strong> {student?.section}</p></div></div><div><h3 className="font-bold text-teal-700 mb-3">Scores</h3><div className="text-sm space-y-1"><p><strong>Midsem:</strong> {student?.performance?.computerNetworks?.midsem}/50</p><p><strong>Endsem:</strong> {student?.performance?.computerNetworks?.endsem}/100</p></div></div></div></div>}
        
        {activeTab === 'attendance' && <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-lg"><h2 className="text-2xl font-bold text-teal-700 mb-6">Attendance</h2><table className="w-full text-sm"><thead className="bg-teal-50"><tr><th className="text-left p-2">Date</th><th className="text-left p-2">Status</th></tr></thead><tbody>{student?.performance?.computerNetworks?.attendance?.map((r, i) => <tr key={i} className={i % 2 ? 'bg-white' : 'bg-gray-100'}><td className="p-2">{r.date}</td><td className="p-2"><span className={r.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} style={{padding: '2px 6px'}}>{r.status}</span></td></tr>)}</tbody></table></div>}
        
        {activeTab === 'assignment' && <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-lg"><h2 className="text-2xl font-bold text-teal-700 mb-6">Assignments</h2><table className="w-full text-sm"><thead className="bg-teal-50"><tr><th className="text-left p-2">Unit</th><th className="text-left p-2">Marks</th><th className="text-left p-2">Status</th></tr></thead><tbody>{student?.performance?.computerNetworks?.assignments?.map((a, i) => <tr key={i} className={i % 2 ? 'bg-white' : 'bg-gray-100'}><td className="p-2">{a.unit}</td><td className="p-2">{a.marks === 'Not Attempted' ? '-' : `${a.marks}/25`}</td><td className="p-2"><span className={a.marks === 'Not Attempted' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} style={{padding: '2px 6px'}}>{a.marks === 'Not Attempted' ? 'Not Attempted' : 'Completed'}</span></td></tr>)}</tbody></table></div>}
        
        {activeTab === 'midsem' && <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-lg text-center"><h2 className="text-2xl font-bold text-teal-700 mb-6">Midsem</h2><div className="text-6xl font-bold text-teal-600 mb-4">{student?.performance?.computerNetworks?.midsem}</div><div className="text-gray-600">out of 50</div><div className="w-full bg-gray-300 rounded-full h-3 mt-4"><div className="bg-teal-600 h-3 rounded-full" style={{width: `${(student?.performance?.computerNetworks?.midsem / 50) * 100}%`}}></div></div></div>}
        
        {activeTab === 'endsem' && <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-lg text-center"><h2 className="text-2xl font-bold text-teal-700 mb-6">Endsem</h2><div className="text-6xl font-bold text-teal-600 mb-4">{student?.performance?.computerNetworks?.endsem}</div><div className="text-gray-600">out of 100</div><div className="w-full bg-gray-300 rounded-full h-3 mt-4"><div className="bg-teal-600 h-3 rounded-full" style={{width: `${(student?.performance?.computerNetworks?.endsem / 100) * 100}%`}}></div></div></div>}
      </main>

      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-700" style={{ backgroundColor: 'rgb(224, 242, 241)' }}>
        <p>&copy; 2026 Student Performance Predictor</p>
      </footer>
    </div>
  );
};

export default StudentDetailsDashboard;
