import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';
import AnimatedLogo from '../components/AnimatedLogo';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from 'recharts';

const InsightTooltip = ({ active, payload, label, insight }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry, index) => (
        <p key={`${entry.name}-${index}`} className="chart-tooltip-row">
          <span>{entry.name}:</span> <strong>{entry.value}</strong>
        </p>
      ))}
      <p className="chart-tooltip-insight">Insight: {insight}</p>
    </div>
  );
};

const SelectionDashboard = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [mentorNote, setMentorNote] = useState('');
  const chartColors = {
    primary: '#4a67ff',
    secondary: '#2ccfa2',
    tertiary: '#8b5cf6',
    neutral: '#94a3b8',
    grid: 'rgba(58, 82, 136, 0.2)',
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/students/distinct/course`);
        setCourses(res.data);
      } catch (err) {
        setError('Failed to load courses.');
      }
    };
    loadCourses();
  }, [API_URL]);

  const handleCourseChange = async (course) => {
    setSelectedCourse(course);
    setSelectedYear('');
    setSelectedSection('');
    setStudents([]);
    setSections([]);
    setError('');
    if (!course) return;

    try {
      const res = await axios.get(`${API_URL}/api/students/options?course=${course}`);
      setYears(res.data.years || []);
    } catch (err) {
      setError('Failed to load years.');
    }
  };

  const handleYearChange = async (year) => {
    setSelectedYear(year);
    setSelectedSection('');
    setStudents([]);
    if (!year || !selectedCourse) return;

    try {
      const res = await axios.get(`${API_URL}/api/students/options?course=${selectedCourse}&year=${year}`);
      setSections(res.data.sections || []);
    } catch (err) {
      setError('Failed to load sections.');
    }
  };

  const handleSectionChange = async (section) => {
    setSelectedSection(section);
    setStudents([]);
    if (!section || !selectedCourse || !selectedYear) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/students?course=${selectedCourse}&year=${selectedYear}&section=${section}`
      );
      setStudents(res.data || []);
    } catch (err) {
      setError('Failed to load students.');
    }
  };

  const filteredStudents = useMemo(() => {
    const key = searchQuery.toLowerCase().trim();
    if (!key) return students;
    return students.filter(
      (student) => student.name.toLowerCase().includes(key) || student.rollNo.toLowerCase().includes(key)
    );
  }, [students, searchQuery]);

  const dashboardStats = useMemo(() => {
    const withPerformance = filteredStudents.filter((student) => student.performance?.computerNetworks);
    const avgMidsem = withPerformance.length
      ? Math.round(
          withPerformance.reduce((sum, student) => sum + (student.performance.computerNetworks.midsem || 0), 0) /
            withPerformance.length
        )
      : 0;
    const atRisk = withPerformance.filter((student) => {
      const cn = student.performance.computerNetworks;
      const attendance = cn.attendance || [];
      const present = attendance.filter((entry) => entry.status === 'Present').length;
      const pct = attendance.length ? (present / attendance.length) * 100 : 0;
      return pct < 70 || (cn.midsem || 0) < 20;
    }).length;

    return {
      total: students.length,
      filtered: filteredStudents.length,
      avgMidsem,
      atRisk,
    };
  }, [students, filteredStudents]);

  const analyticsSource = filteredStudents.length ? filteredStudents : students;
  const hasSelectionData = Boolean(selectedSection && analyticsSource.length);
  const riskDistribution = useMemo(() => {
    let high = 0;
    let medium = 0;
    let low = 0;

    analyticsSource.forEach((student) => {
      const cn = student.performance?.computerNetworks;
      if (!cn) return;
      const attendance = cn.attendance || [];
      const present = attendance.filter((entry) => entry.status === 'Present').length;
      const pct = attendance.length ? (present / attendance.length) * 100 : 0;
      const midsem = cn.midsem || 0;
      const assignments = cn.assignments || [];
      const validAssignments = assignments.filter((item) => item.marks !== 'Not Attempted');
      const assignmentAvg = validAssignments.length
        ? validAssignments.reduce((sum, item) => sum + Number(item.marks), 0) / validAssignments.length
        : 0;

      if (pct < 65 || midsem < 20) {
        high += 1;
      } else if (pct < 75 || assignmentAvg < 14) {
        medium += 1;
      } else {
        low += 1;
      }
    });

    return [
      { name: 'Low', value: low, color: '#2ccfa2' },
      { name: 'Medium', value: medium, color: '#f59e0b' },
      { name: 'High', value: high, color: '#ef4444' },
    ];
  }, [analyticsSource]);

  const studentTrendData = useMemo(() => {
    return analyticsSource.slice(0, 12).map((student, index) => {
      const assignments = student.performance?.computerNetworks?.assignments || [];
      const first = assignments[0]?.marks === 'Not Attempted' ? 0 : Number(assignments[0]?.marks || 0);
      const lastItem = assignments[assignments.length - 1];
      const last = lastItem?.marks === 'Not Attempted' ? 0 : Number(lastItem?.marks || 0);
      return {
        student: `S${index + 1}`,
        start: Math.round((first / 25) * 100),
        end: Math.round((last / 25) * 100),
      };
    });
  }, [analyticsSource]);

  const scoreDeltaData = useMemo(() => {
    return studentTrendData.map((item) => ({
      student: item.student,
      delta: item.end - item.start,
    }));
  }, [studentTrendData]);
  const avgAttendance = useMemo(() => {
    if (!analyticsSource.length) return 0;
    const total = analyticsSource.reduce((sum, student) => {
      const attendance = student.performance?.computerNetworks?.attendance || [];
      const present = attendance.filter((entry) => entry.status === 'Present').length;
      const pct = attendance.length ? (present / attendance.length) * 100 : 0;
      return sum + pct;
    }, 0);
    return Math.round(total / analyticsSource.length);
  }, [analyticsSource]);
  const avgScore = useMemo(() => {
    if (!analyticsSource.length) return 0;
    const total = analyticsSource.reduce((sum, student) => {
      const cn = student.performance?.computerNetworks;
      if (!cn) return sum;
      const assignments = cn.assignments || [];
      const validAssignments = assignments.filter((item) => item.marks !== 'Not Attempted');
      const assignmentAvg = validAssignments.length
        ? validAssignments.reduce((inner, item) => inner + Number(item.marks), 0) / validAssignments.length
        : 0;
      const combined = ((cn.midsem || 0) / 50) * 60 + (assignmentAvg / 25) * 40;
      return sum + combined;
    }, 0);
    return Number((total / analyticsSource.length).toFixed(1));
  }, [analyticsSource]);
  const [kpiDisplay, setKpiDisplay] = useState({ total: 0, attendance: 0, score: 0 });

  useEffect(() => {
    const target = {
      total: dashboardStats.total,
      attendance: avgAttendance,
      score: avgScore,
    };
    let frame = 0;
    const totalFrames = 32;
    const timer = setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;
      setKpiDisplay({
        total: Math.round(target.total * progress),
        attendance: Math.round(target.attendance * progress),
        score: Number((target.score * progress).toFixed(1)),
      });
      if (frame >= totalFrames) clearInterval(timer);
    }, 22);

    return () => clearInterval(timer);
  }, [dashboardStats.total, avgAttendance, avgScore]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div>
            <AnimatedLogo compact />
            <p className="topbar-tagline">Predict risk early. Act before marks drop.</p>
          </div>
          <button className="btn btn-ghost" onClick={() => setShowFeedbackModal(true)}>Feedback</button>
        </div>
      </header>

      <main className="page-wrap">
        <section className="hero">
          <h1>Lumora</h1>
          <p>AI-powered decision dashboard for early intervention and student success.</p>
        </section>

        <section className="card card-pad" style={{ marginBottom: 16 }}>
          <h3 className="section-title">Select Class</h3>
          <div className="form-grid">
            <div className="field">
              <label>Course</label>
              <select value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)}>
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Year</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                disabled={!selectedCourse}
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Section</label>
              <select
                value={selectedSection}
                onChange={(e) => handleSectionChange(e.target.value)}
                disabled={!selectedYear}
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <label>Search Student</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or roll number"
              disabled={!selectedSection}
            />
          </div>
          {error && <p className="status error">{error}</p>}
        </section>

        <section className="metrics" style={{ marginBottom: 16 }}>
          <article className="metric">
            <h4>Total Students</h4>
            <strong>{kpiDisplay.total}</strong>
            {hasSelectionData && <p className="metric-trend up">↑ +8% from last review</p>}
          </article>
          <article className="metric">
            <h4>Avg Attendance</h4>
            <strong>{kpiDisplay.attendance}%</strong>
            {hasSelectionData && <p className="metric-trend up">↑ +3% this month</p>}
          </article>
          <article className="metric">
            <h4>Avg Score</h4>
            <strong>{kpiDisplay.score}%</strong>
            {hasSelectionData && <p className="metric-trend down">↓ -2% in weak clusters</p>}
          </article>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginBottom: 14 }}>
          <div className="card card-pad">
            <h3 className="section-title">Risk Distribution</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                    {riskDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={(props) => (
                      <InsightTooltip {...props} insight="Medium/High segments need immediate mentor focus." />
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card card-pad">
            <h3 className="section-title">Student Trend (Start vs End)</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={studentTrendData}>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="student" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    content={(props) => (
                      <InsightTooltip {...props} insight="End bars higher than start indicate positive learning momentum." />
                    )}
                  />
                  <Bar dataKey="start" fill={chartColors.primary} />
                  <Bar dataKey="end" fill={chartColors.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="card card-pad" style={{ marginBottom: 16 }}>
          <h3 className="section-title">Score Trend Delta</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={scoreDeltaData}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="student" />
                <YAxis />
                <Tooltip
                  content={(props) => (
                    <InsightTooltip {...props} insight="Negative deltas can indicate consistency or revision gaps." />
                  )}
                />
                <Line type="monotone" dataKey="delta" stroke={chartColors.tertiary} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card card-pad" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Students ({filteredStudents.length})</h3>
          {!selectedSection ? (
            <p className="muted-text">Select all filters to view students.</p>
          ) : filteredStudents.length === 0 ? (
            <p className="muted-text">No students found for current filters.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll Number</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.rollNo}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => navigate(`/student/${student.rollNo}`)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <div className="card card-pad">
            <h3 className="section-title">Quick Actions</h3>
            <div className="inline-actions">
              <button className="btn btn-primary" onClick={() => window.print()}>Print Dashboard</button>
              <button className="btn btn-ghost" onClick={() => setSearchQuery('')}>Clear Search</button>
              <button className="btn btn-ghost" onClick={() => setShowFeedbackModal(true)}>Send General Feedback</button>
            </div>
            <h4 style={{ marginTop: 20, marginBottom: 8 }}>Mentor Notes</h4>
            <div className="field">
              <textarea
                value={mentorNote}
                onChange={(e) => setMentorNote(e.target.value)}
                placeholder="Write quick mentoring notes for this class..."
              />
            </div>
          </div>

          <div className="card card-pad">
            <h3 className="section-title">Announcements</h3>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }} className="muted-text">
              <li>Weekly mentor meeting at 4 PM Friday.</li>
              <li>Midsem re-evaluation forms open this week.</li>
              <li>Assignment-4 deadline: next Monday.</li>
            </ul>
            <h4 style={{ marginTop: 16, marginBottom: 8 }}>System Status</h4>
            <p style={{ margin: 0 }} className="success-text">API: Online</p>
            <p style={{ margin: '6px 0 0' }} className="muted-text">Last sync: Just now</p>
          </div>
        </section>
      </main>

      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} student={null} apiUrl={API_URL} />
      )}
    </div>
  );
};

export default SelectionDashboard;
