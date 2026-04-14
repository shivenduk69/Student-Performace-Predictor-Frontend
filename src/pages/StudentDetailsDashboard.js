import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, ComposedChart } from 'recharts';

const StudentDetailsDashboard = () => {
  const { rollNo } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudyPlanModal, setShowStudyPlanModal] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedStudent(null);
  };

  const handleCloseStudyPlanModal = () => {
    setShowStudyPlanModal(false);
  };

  const generateStudyPlan = () => {
    setShowStudyPlanModal(true);
  };

  const analyzePerformance = () => {
    if (!student?.performance?.computerNetworks) return null;

    const { attendance, assignments, midsem } = student.performance.computerNetworks;
    const attendancePercent = (attendance?.filter(a => a.status === 'Present').length / attendance?.length) * 100;

    // Check for weak areas
    const weakAssignments = assignments?.filter(a => a.marks === 'Not Attempted' || parseInt(a.marks) < 15) || [];
    const lowAttendance = attendancePercent < 75;
    const lowMidsem = midsem < 50;

    // Check if student is performing well
    const highAttendance = attendancePercent > 85;
    const goodAssignments = assignments?.every(a => a.marks !== 'Not Attempted' && parseInt(a.marks) > 20);
    const goodMidsem = midsem > 40;

    const isPerformingWell = highAttendance && goodAssignments && goodMidsem;

    return {
      isPerformingWell,
      weakAssignments,
      lowAttendance,
      lowMidsem,
      attendancePercent
    };
  };

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
        <div className="text-center bg-white/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg">
          <p className="text-red-600 text-lg mb-4 font-semibold">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md" style={{ backgroundColor: 'rgb(224, 242, 241)', color: 'black' }}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <nav className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: 'rgb(29, 32, 42)' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-gray-300 transition-colors">← Back</button>
              <div>
                <h1 className="font-bold text-white text-lg">{student?.name}</h1>
                <p className="text-sm text-gray-400">Roll: {student?.rollNo}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['home', 'attendance', 'assignment', 'midsem', 'endsem'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${ 
                    activeTab === tab ? 'bg-white text-black' : 'text-white hover:bg-white/20'
                  }`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow p-8">
        {activeTab === 'home' && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Student Header */}
            <div className="bg-white/70 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-black">{student?.name}</h1>
                  <p className="text-gray-600 text-lg">Roll: {student?.rollNo}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-md">
                  <span className="text-black font-semibold">📚 Subject: Computer Networks</span>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Attendance Card */}
              <div className="bg-white/70 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg text-center">
                <h3 className="text-lg font-bold text-black mb-4">Attendance</h3>
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e0f2f1" strokeWidth="3"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1d202a" strokeWidth="3" strokeDasharray={`${(student?.performance?.computerNetworks?.attendance?.filter(a => a.status === 'Present').length / student?.performance?.computerNetworks?.attendance?.length) * 100}, 100`}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">{Math.round((student?.performance?.computerNetworks?.attendance?.filter(a => a.status === 'Present').length / student?.performance?.computerNetworks?.attendance?.length) * 100)}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Total Classes</p>
              </div>

              {/* Assignment Avg Card */}
              <div className="bg-white/70 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg text-center">
                <h3 className="text-lg font-bold text-black mb-4">Assignment Avg</h3>
                <div className="text-4xl font-bold text-black mb-2">
                  {student?.performance?.computerNetworks?.assignments?.filter(a => a.marks !== 'Not Attempted').length > 0
                    ? Math.round(student?.performance?.computerNetworks?.assignments?.filter(a => a.marks !== 'Not Attempted').reduce((sum, a) => sum + parseInt(a.marks), 0) / student?.performance?.computerNetworks?.assignments?.filter(a => a.marks !== 'Not Attempted').length)
                    : 0}/25
                </div>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>

              {/* Exam Status Card */}
              <div className="bg-white/70 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg text-center">
                <h3 className="text-lg font-bold text-black mb-4">Exam Status</h3>
                <div className="text-4xl font-bold text-black mb-2">{student?.performance?.computerNetworks?.midsem}/50</div>
                <p className="text-sm text-gray-600">Midsem Score</p>
              </div>
            </div>

            {/* AI Insight Card */}
            <div className="bg-white/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg" style={{boxShadow: '0 0 20px rgba(29, 32, 42, 0.1)'}}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-black">🤖 AI Insight</h3>
                {(() => {
                  const attendancePercent = (student?.performance?.computerNetworks?.attendance?.filter(a => a.status === 'Present').length / student?.performance?.computerNetworks?.attendance?.length) * 100;
                  const midsemScore = student?.performance?.computerNetworks?.midsem;
                  const missedAssignments = student?.performance?.computerNetworks?.assignments?.filter(a => a.marks === 'Not Attempted').length;

                  let riskLevel = 'Low Risk';
                  let riskColor = 'bg-green-100 text-green-800';
                  let reason = '';

                  if (attendancePercent < 60 || midsemScore < 20) {
                    riskLevel = 'High Risk';
                    riskColor = 'bg-red-100 text-red-800';
                    reason = attendancePercent < 60 ? 'High Risk due to irregular attendance' : 'High Risk due to low midsem performance';
                    if (missedAssignments > 0) reason += ' and missed assignments';
                  } else if (attendancePercent < 75 || missedAssignments > 0) {
                    riskLevel = 'Medium Risk';
                    riskColor = 'bg-yellow-100 text-yellow-800';
                    reason = attendancePercent < 75 ? 'Medium Risk due to moderate attendance' : 'Medium Risk due to missed assignments';
                  } else if (attendancePercent > 75 && midsemScore > 30) {
                    riskLevel = 'Low Risk';
                    riskColor = 'bg-green-100 text-green-800';
                    reason = 'Low Risk - Good attendance and performance';
                  }

                  return (
                    <span className={`px-4 py-2 rounded-full font-semibold ${riskColor}`}>
                      {riskLevel}
                    </span>
                  );
                })()}
              </div>
              <div className="mb-6">
                <p className="text-black font-medium">
                  {(() => {
                    const attendancePercent = (student?.performance?.computerNetworks?.attendance?.filter(a => a.status === 'Present').length / student?.performance?.computerNetworks?.attendance?.length) * 100;
                    const midsemScore = student?.performance?.computerNetworks?.midsem;
                    const missedAssignments = student?.performance?.computerNetworks?.assignments?.filter(a => a.marks === 'Not Attempted').length;

                    if (attendancePercent < 60 || midsemScore < 20) {
                      return attendancePercent < 60 ? 'High Risk due to irregular attendance and missed Unit 3 assignment' : 'High Risk due to low midsem performance';
                    } else if (attendancePercent < 75 || missedAssignments > 0) {
                      return attendancePercent < 75 ? 'Medium Risk due to moderate attendance' : 'Medium Risk due to missed assignments';
                    } else {
                      return 'Low Risk - Good attendance and performance';
                    }
                  })()}
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={generateStudyPlan}
                  className="flex-1 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md" 
                  style={{ backgroundColor: 'rgb(224, 242, 241)', color: 'black' }}
                >
                  📚 Generate Study Plan
                </button>
                <button className="flex-1 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md" style={{ backgroundColor: 'rgb(224, 242, 241)', color: 'black' }}>
                  🚨 Send Alert to Student
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'attendance' && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Attendance vs Time Line Chart */}
              <div className="bg-white/70 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-black mb-6 text-center">Attendance vs Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={student?.performance?.computerNetworks?.attendance?.map(record => ({
                      date: record.date,
                      status: record.status === 'Present' ? 1 : 0,
                      statusText: record.status
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="date"
                      stroke="#000"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="#000"
                      domain={[0, 1]}
                      ticks={[0, 1]}
                      tickFormatter={(value) => value === 1 ? 'Present' : 'Absent'}
                    />
                    <Tooltip
                      formatter={(value, name) => [value === 1 ? 'Present' : 'Absent', 'Status']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="status"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Attendance Distribution Pie Chart */}
              <div className="bg-white/70 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-black mb-6 text-center">Attendance Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Present',
                          value: student?.performance?.computerNetworks?.attendance?.filter(r => r.status === 'Present').length || 0,
                          color: 'rgb(5, 23, 62)'
                        },
                        {
                          name: 'Absent',
                          value: student?.performance?.computerNetworks?.attendance?.filter(r => r.status === 'Absent').length || 0,
                          color: 'rgb(153, 51, 102)'
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Present', color: 'rgb(5, 23, 62)' },
                        { name: 'Absent', color: 'rgb(153, 51, 102)' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} days`, 'Count']} />
                    <Legend />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-2xl font-bold fill-black"
                    >
                      {student?.performance?.computerNetworks?.attendance ?
                        Math.round((student.performance.computerNetworks.attendance.filter(r => r.status === 'Present').length /
                          student.performance.computerNetworks.attendance.length) * 100) : 0}%
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Attendance Table */}
            <div className="bg-white/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-black mb-6">Detailed Attendance</h2>
              <table className="w-full text-sm">
                <thead style={{backgroundColor: 'rgb(29, 32, 42)', color: 'white'}}>
                  <tr>
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {student?.performance?.computerNetworks?.attendance?.map((record, i) => (
                    <tr key={i} className={`${i % 2 ? 'bg-white/50' : 'bg-white/30'} border-b border-gray-200 text-black hover:bg-white/70 transition-colors duration-200`}>
                      <td className="p-3">{record.date}</td>
                      <td className="p-3">
                        <span
                          className="text-white font-medium"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: record.status === 'Present' ? 'rgb(5, 23, 62)' : 'rgb(153, 51, 102)'
                          }}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'assignment' && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Correlation Chart */}
            <div className="bg-white/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-black mb-6 text-center">Attendance vs Assignment Performance Correlation</h2>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                  data={(() => {
                    const attendance = student?.performance?.computerNetworks?.attendance || [];
                    const assignments = student?.performance?.computerNetworks?.assignments || [];

                    // Group attendance into units of 2 classes each
                    const unitData = [];
                    for (let i = 0; i < 5; i++) {
                      const startIdx = i * 2;
                      const endIdx = startIdx + 2;
                      const unitAttendance = attendance.slice(startIdx, endIdx);

                      // Calculate attendance percentage for this unit
                      const presentCount = unitAttendance.filter(a => a.status === 'Present').length;
                      const attendancePercent = unitAttendance.length > 0 ? (presentCount / unitAttendance.length) * 100 : 0;

                      // Get assignment score for this unit
                      const assignment = assignments.find(a => a.unit === `Unit ${i + 1}`);
                      const score = assignment && assignment.marks !== 'Not Attempted' ? parseInt(assignment.marks) : 0;

                      unitData.push({
                        unit: `Unit ${i + 1}`,
                        attendance: Math.round(attendancePercent),
                        score: score,
                        unitName: `Unit ${i + 1}: ${[
                          'Introduction to Computer Networks',
                          'Network Models & Protocols',
                          'Data Link Layer',
                          'Network Layer',
                          'Transport & Application Layer'
                        ][i]}`
                      });
                    }
                    return unitData;
                  })()}
                  margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="unit"
                    stroke="#000"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#3B82F6"
                    domain={[0, 25]}
                    label={{ value: 'Assignment Score', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#3B82F6' } }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="rgb(5, 23, 62)"
                    domain={[0, 100]}
                    label={{ value: 'Attendance %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: 'rgb(5, 23, 62)' } }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'Assignment Score' ? `${value}/25` : `${value}%`,
                      name
                    ]}
                    labelFormatter={(label) => `${label} Performance`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="score"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Assignment Score"
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="attendance"
                    stroke="rgb(5, 23, 62)"
                    strokeWidth={3}
                    name="Attendance %"
                    dot={{ fill: 'rgb(5, 23, 62)', strokeWidth: 2, r: 6, strokeDasharray: '' }}
                    activeDot={{ r: 8, stroke: 'rgb(5, 23, 62)', strokeWidth: 2, fill: '#fff' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Unit Wise Assignment Table */}
            <div className="bg-white/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-black mb-6">Unit Wise Assignments</h2>
              <table className="w-full text-sm">
                <thead style={{backgroundColor: 'rgb(29, 32, 42)', color: 'white'}}>
                  <tr>
                    <th className="text-left p-4 font-semibold">Unit Name</th>
                    <th className="text-center p-4 font-semibold">Score</th>
                    <th className="text-center p-4 font-semibold">Status</th>
                    <th className="text-center p-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const unitNames = [
                      'Introduction to Computer Networks',
                      'Network Models & Protocols',
                      'Data Link Layer',
                      'Network Layer',
                      'Transport & Application Layer'
                    ];

                    return student?.performance?.computerNetworks?.assignments?.map((assignment, i) => {
                      const score = assignment.marks === 'Not Attempted' ? 0 : parseInt(assignment.marks);
                      const status = assignment.marks === 'Not Attempted' ? 'Not Attempted' :
                                   score >= 15 ? 'Pass' : 'Fail';

                      return (
                        <tr key={i} className={`${i % 2 ? 'bg-white/50' : 'bg-white/30'} border-b border-gray-200 text-black hover:bg-white/70 transition-colors duration-200`}>
                          <td className="p-4 font-medium">
                            <div>
                              <div className="font-semibold">{assignment.unit}</div>
                              <div className="text-sm text-gray-600">{unitNames[i]}</div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-lg font-bold">
                              {assignment.marks === 'Not Attempted' ? '-' : `${assignment.marks}/25`}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className="text-white font-medium px-3 py-1 rounded-full text-sm"
                              style={{
                                backgroundColor: status === 'Pass' ? 'rgb(5, 23, 62)' :
                                               status === 'Fail' ? 'rgb(153, 51, 102)' :
                                               '#6b7280'
                              }}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={generateStudyPlan}
                              className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                              style={{ backgroundColor: 'rgb(224, 242, 241)', color: 'black' }}
                            >
                              📚 Review
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'midsem' && <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg text-center"><h2 className="text-2xl font-bold text-black mb-6">Midsem</h2><div className="text-6xl font-bold text-black mb-4">{student?.performance?.computerNetworks?.midsem}</div><div className="text-gray-600">out of 50</div><div className="w-full bg-gray-300 rounded-full h-3 mt-4"><div className="h-3 rounded-full" style={{backgroundColor: 'rgb(29, 32, 42)', width: `${(student?.performance?.computerNetworks?.midsem / 50) * 100}%`}}></div></div></div>}
        
        {activeTab === 'endsem' && <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg text-center"><h2 className="text-2xl font-bold text-black mb-6">Endsem</h2><div className="text-6xl font-bold text-black mb-4">{student?.performance?.computerNetworks?.endsem}</div><div className="text-gray-600">out of 100</div><div className="w-full bg-gray-300 rounded-full h-3 mt-4"><div className="h-3 rounded-full" style={{backgroundColor: 'rgb(29, 32, 42)', width: `${(student?.performance?.computerNetworks?.endsem / 100) * 100}%`}}></div></div></div>}
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

      {/* Study Plan Modal */}
      {showStudyPlanModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold" style={{ color: 'rgb(29, 32, 42)' }}>
                  Personalized Intervention Plan
                </h2>
                <button
                  onClick={handleCloseStudyPlanModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {(() => {
                const analysis = analyzePerformance();
                if (!analysis) return null;

                const { isPerformingWell, weakAssignments, lowAttendance, lowMidsem } = analysis;

                if (isPerformingWell) {
                  return (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-2xl font-bold text-green-700 mb-4">Status: Student is performing excellently</h3>
                      <p className="text-black text-lg">
                        Recommendation: No intervention required; continue following the current study pattern.
                      </p>
                    </div>
                  );
                }

                return (
                  <div>
                    <h3 className="text-xl font-bold text-black mb-6">Focus Areas for Improvement</h3>
                    <div className="space-y-4 mb-8">
                      {weakAssignments.map((assignment, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-red-500 text-xl">⚠️</div>
                          <div>
                            <h4 className="font-semibold text-black">{assignment.unit}</h4>
                            <p className="text-sm text-gray-600">
                              Score: {assignment.marks === 'Not Attempted' ? 'Not Attempted' : `${assignment.marks}/25`}
                            </p>
                          </div>
                        </div>
                      ))}

                      {lowAttendance && (
                        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-red-500 text-xl">⚠️</div>
                          <div>
                            <h4 className="font-semibold text-black">General Consistency</h4>
                            <p className="text-sm text-gray-600">Attendance below 75% - Focus on regular class attendance</p>
                          </div>
                        </div>
                      )}

                      {lowMidsem && (
                        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-red-500 text-xl">⚠️</div>
                          <div>
                            <h4 className="font-semibold text-black">Unit 1 & Unit 2</h4>
                            <p className="text-sm text-gray-600">Midsem score below 50% - Prioritize revision of foundational concepts</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">💡 Action Required</h4>
                      <p className="text-blue-700">
                        Prioritize revision and re-attempt practice quizzes for these modules. Schedule additional study sessions and seek help from mentors if needed.
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                  style={{ backgroundColor: 'rgb(224, 242, 241)', color: 'black' }}
                >
                  🖨️ Print Plan
                </button>
                <button
                  onClick={handleCloseStudyPlanModal}
                  className="flex-1 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                  style={{ backgroundColor: 'rgb(224, 242, 241)', color: 'black' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default StudentDetailsDashboard;
