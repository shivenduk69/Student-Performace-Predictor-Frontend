import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';
import AnimatedLogo from '../components/AnimatedLogo';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const StudentDetailsDashboard = () => {
  const { rollNo } = useParams();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [classmates, setClassmates] = useState([]);
  const chartColors = {
    primary: '#4a67ff',
    secondary: '#2ccfa2',
    tertiary: '#8b5cf6',
    neutral: '#94a3b8',
    grid: 'rgba(58, 82, 136, 0.2)',
  };

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/student/${rollNo}`);
        const currentStudent = res.data;
        setStudent(currentStudent);

        if (currentStudent?.course && currentStudent?.year && currentStudent?.section) {
          const peerRes = await axios.get(
            `${API_URL}/api/students?course=${currentStudent.course}&year=${currentStudent.year}&section=${currentStudent.section}`
          );
          setClassmates(peerRes.data || []);
        }
      } catch (err) {
        setError('Unable to load student details.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [API_URL, rollNo]);

  const performance = student?.performance?.computerNetworks;
  const attendance = performance?.attendance || [];
  const assignments = performance?.assignments || [];
  const midsem = performance?.midsem ?? 0;
  const endsem = performance?.endsem ?? 0;

  const presentCount = attendance.filter((entry) => entry.status === 'Present').length;
  const attendancePct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  const validAssignments = assignments.filter((item) => item.marks !== 'Not Attempted');
  const assignmentAvg = validAssignments.length
    ? Math.round(validAssignments.reduce((sum, item) => sum + Number(item.marks), 0) / validAssignments.length)
    : 0;
  const riskLevel =
    attendancePct < 65 || midsem < 20 ? 'High' : attendancePct < 75 || assignmentAvg < 14 ? 'Medium' : 'Low';
  const attendanceTrendData = attendance.map((entry, index) => ({
    index: `C${index + 1}`,
    status: entry.status === 'Present' ? 1 : 0,
    date: entry.date,
  }));
  const attendanceSplit = [
    { name: 'Present', value: presentCount, color: chartColors.primary },
    { name: 'Absent', value: Math.max(attendance.length - presentCount, 0), color: chartColors.neutral },
  ];
  const assignmentChartData = assignments.map((item) => ({
    unit: item.unit,
    marks: item.marks === 'Not Attempted' ? 0 : Number(item.marks),
  }));
  const examComparisonData = [
    { exam: 'Midsem', marks: midsem, max: 50, normalized: Math.round((midsem / 50) * 100) },
    { exam: 'Endsem', marks: endsem, max: 100, normalized: Math.round((endsem / 100) * 100) },
  ];
  const competencyRadarData = [
    { metric: 'Attendance', score: attendancePct },
    { metric: 'Assignments', score: Math.round((assignmentAvg / 25) * 100) },
    { metric: 'Midsem', score: Math.round((midsem / 50) * 100) },
    { metric: 'Endsem', score: Math.round((endsem / 100) * 100) },
    { metric: 'Consistency', score: Math.round((attendancePct + Math.round((assignmentAvg / 25) * 100)) / 2) },
  ];
  const peerPerformance = classmates
    .map((peer) => {
      const cn = peer?.performance?.computerNetworks;
      const peerAttendance = cn?.attendance || [];
      const peerPresent = peerAttendance.filter((entry) => entry.status === 'Present').length;
      const peerAttendancePct = peerAttendance.length ? Math.round((peerPresent / peerAttendance.length) * 100) : 0;
      const peerAssignments = cn?.assignments || [];
      const peerValid = peerAssignments.filter((item) => item.marks !== 'Not Attempted');
      const peerAssignmentAvg = peerValid.length
        ? Math.round(peerValid.reduce((sum, item) => sum + Number(item.marks), 0) / peerValid.length)
        : 0;

      return {
        rollNo: peer.rollNo,
        name: peer.name,
        attendancePct: peerAttendancePct,
        assignmentAvg: peerAssignmentAvg,
        midsem: cn?.midsem || 0,
      };
    })
    .sort((a, b) => b.midsem - a.midsem);
  const classAverages = peerPerformance.length
    ? {
        attendance: Math.round(peerPerformance.reduce((sum, p) => sum + p.attendancePct, 0) / peerPerformance.length),
        assignments: Math.round(peerPerformance.reduce((sum, p) => sum + p.assignmentAvg, 0) / peerPerformance.length),
        midsem: Math.round(peerPerformance.reduce((sum, p) => sum + p.midsem, 0) / peerPerformance.length),
      }
    : { attendance: 0, assignments: 0, midsem: 0 };
  const studentRank = Math.max(
    peerPerformance.findIndex((peer) => peer.rollNo === student.rollNo) + 1,
    0
  );
  const comparisonChartData = [
    { metric: 'Attendance %', student: attendancePct, classAvg: classAverages.attendance },
    { metric: 'Assignment Avg', student: assignmentAvg, classAvg: classAverages.assignments },
    { metric: 'Midsem', student: midsem, classAvg: classAverages.midsem },
  ];

  if (loading) return <div className="auth-wrap"><div className="card auth-card">Loading student details...</div></div>;
  if (error) return <div className="auth-wrap"><div className="card auth-card">{error}</div></div>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div>
            <AnimatedLogo compact />
            <div className="topbar-subtext">Roll: {student.rollNo}</div>
          </div>
          <div className="inline-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Back</button>
            <button className="btn btn-ghost" onClick={() => setShowFeedbackModal(true)}>Give Feedback</button>
          </div>
        </div>
      </header>

      <main className="page-wrap">
        <section className="hero">
          <h1>{student.name}</h1>
          <p>{student.course} • Year {student.year} • Section {student.section}</p>
        </section>

        <section className="card card-pad">
          <div className="metrics">
            <article className="metric"><h4>Attendance</h4><strong>{attendancePct}%</strong></article>
            <article className="metric"><h4>Assignment Average</h4><strong>{assignmentAvg}/25</strong></article>
            <article className="metric"><h4>Midsem</h4><strong>{midsem}/50</strong></article>
            <article className="metric"><h4>Endsem</h4><strong>{endsem}/100</strong></article>
            <article className="metric"><h4>Risk</h4><strong>{riskLevel}</strong></article>
          </div>
        </section>

        <section className="card card-pad" style={{ marginTop: 16 }}>
          <div className="tabs">
            <button className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('attendance')}>Attendance</button>
            <button className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('assignments')}>Assignments</button>
            <button className={`btn ${activeTab === 'exams' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('exams')}>Exams</button>
            <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
          </div>

          {activeTab === 'overview' && (
            <div style={{ marginTop: 14 }}>
              <h3>Intervention Suggestion</h3>
              {riskLevel === 'High' && <p className="status error">Immediate mentor intervention recommended this week.</p>}
              {riskLevel === 'Medium' && <p className="warning-text">Schedule regular check-ins and track assignment completion.</p>}
              {riskLevel === 'Low' && <p className="status success">Student is stable. Keep current progression plan.</p>}

              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                <div className="card card-pad">
                  <h4 style={{ marginTop: 0 }}>Class Comparison</h4>
                  <p style={{ margin: 0 }} className="muted-text">
                    Rank in class (by midsem):{' '}
                    <strong className="strong-text">
                      {studentRank > 0 ? `${studentRank} / ${peerPerformance.length}` : 'N/A'}
                    </strong>
                  </p>
                  <p style={{ marginBottom: 0 }} className="muted-text">
                    Midsem gap from class average:{' '}
                    <strong className="strong-text">
                      {midsem - classAverages.midsem >= 0 ? '+' : ''}
                      {midsem - classAverages.midsem}
                    </strong>
                  </p>
                </div>
                <div className="card card-pad">
                  <h4 style={{ marginTop: 0 }}>Student vs Class Average</h4>
                  <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                      <BarChart data={comparisonChartData}>
                        <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="student" fill={chartColors.primary} name="Selected Student" />
                        <Bar dataKey="classAvg" fill={chartColors.neutral} name="Class Average" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                <div className="card card-pad">
                  <h3 style={{ marginTop: 0 }}>Attendance Trend</h3>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <LineChart data={attendanceTrendData}>
                        <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => (v === 1 ? 'P' : 'A')} />
                        <Tooltip
                          formatter={(value) => [value === 1 ? 'Present' : 'Absent', 'Status']}
                          labelFormatter={(label, payload) => `${label} (${payload?.[0]?.payload?.date || ''})`}
                        />
                        <Line type="monotone" dataKey="status" stroke={chartColors.primary} strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card card-pad">
                  <h3 style={{ marginTop: 0 }}>Attendance Distribution</h3>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={attendanceSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                          {attendanceSplit.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="table-wrap" style={{ marginTop: 14 }}>
                <table className="table">
                  <thead><tr><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {attendance.map((entry, idx) => (
                      <tr key={`${entry.date}-${idx}`}>
                        <td>{entry.date}</td>
                        <td>{entry.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div style={{ marginTop: 14 }}>
              <div className="card card-pad">
                <h3 style={{ marginTop: 0 }}>Unit-wise Assignment Scores</h3>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={assignmentChartData}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="unit" />
                      <YAxis domain={[0, 25]} />
                      <Tooltip formatter={(value) => [`${value}/25`, 'Marks']} />
                      <Bar dataKey="marks" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="table-wrap" style={{ marginTop: 14 }}>
                <table className="table">
                  <thead><tr><th>Unit</th><th>Marks</th></tr></thead>
                  <tbody>
                    {assignments.map((item, idx) => (
                      <tr key={`${item.unit}-${idx}`}>
                        <td>{item.unit}</td>
                        <td>{item.marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'exams' && (
            <div style={{ marginTop: 14 }}>
              <div className="card card-pad">
                <h3 style={{ marginTop: 0 }}>Exam Performance Comparison</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={examComparisonData}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="exam" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Normalized Score']} />
                      <Bar dataKey="normalized" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="table-wrap" style={{ marginTop: 14 }}>
                <table className="table">
                  <thead><tr><th>Exam</th><th>Marks</th><th>Normalized</th></tr></thead>
                  <tbody>
                    {examComparisonData.map((item) => (
                      <tr key={item.exam}>
                        <td>{item.exam}</td>
                        <td>{item.marks}/{item.max}</td>
                        <td>{item.normalized}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              <div className="card card-pad">
                <h3 style={{ marginTop: 0 }}>Competency Radar</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <RadarChart data={competencyRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Score" dataKey="score" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.35} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card card-pad">
                <h3 style={{ marginTop: 0 }}>Mentor Summary</h3>
                <p className="muted-text">
                  This analytics module combines attendance consistency, assignment engagement, and exam output
                  for a quick mentorship snapshot.
                </p>
                <ul className="muted-text" style={{ lineHeight: 1.8, paddingLeft: 18 }}>
                  <li>Risk Level: <strong className="strong-text">{riskLevel}</strong></li>
                  <li>Attendance Reliability: <strong className="strong-text">{attendancePct}%</strong></li>
                  <li>Academic Throughput: <strong className="strong-text">{assignmentAvg}/25</strong></li>
                </ul>
                <div className="inline-actions">
                  <button className="btn btn-primary" onClick={() => window.print()}>Export Student Report</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} student={student} apiUrl={API_URL} />
      )}
    </div>
  );
};

export default StudentDetailsDashboard;
