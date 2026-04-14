import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';

const SelectionDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [errors, setErrors] = useState({});
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/students/distinct/course`);
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }, [API_URL]);

  // Fetch all courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Fetch years when course changes
  const handleCourseChange = async (e) => {
    const course = e.target.value;
    setSelectedCourse(course);
    setSelectedYear('');
    setSelectedSection('');
    setStudents([]);
    setErrors({});

    if (course) {
      try {
        const res = await axios.get(`${API_URL}/api/students/options?course=${course}`);
        setYears(res.data.years);
        setSections([]);
      } catch (err) {
        console.error('Error fetching years:', err);
      }
    }
  };

  // Fetch sections when year changes
  const handleYearChange = async (e) => {
    const year = e.target.value;
    
    if (!selectedCourse) {
      setErrors({ year: 'Please select Course first' });
      return;
    }

    setSelectedYear(year);
    setSelectedSection('');
    setStudents([]);
    setErrors({});

    if (year) {
      try {
        const res = await axios.get(
          `${API_URL}/api/students/options?course=${selectedCourse}&year=${year}`
        );
        setSections(res.data.sections);
      } catch (err) {
        console.error('Error fetching sections:', err);
      }
    }
  };

  // Fetch students when section changes
  const handleSectionChange = async (e) => {
    const section = e.target.value;
    
    if (!selectedCourse) {
      setErrors({ section: 'Please select Course first' });
      return;
    }
    
    if (!selectedYear) {
      setErrors({ section: 'Please select Year first' });
      return;
    }

    setSelectedSection(section);
    setErrors({});

    if (section) {
      try {
        const res = await axios.get(
          `${API_URL}/api/students?course=${selectedCourse}&year=${selectedYear}&section=${section}`
        );
        setStudents(res.data);
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    }
  };

  // Filter students based on search query
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSeeProgress = (student) => {
    // Navigate to student details dashboard using rollNo
    navigate(`/student/${student.rollNo}`);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedStudent(null);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: 'rgb(29, 32, 42)' }}>
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Student Performance Predictor</h1>
            <div className="text-gray-300 text-sm">Mentor Dashboard</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-black mb-2">Welcome, Mentor</h1>
          <p className="text-gray-600">Manage and monitor student progress</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg mb-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-6">Select Student</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Course Dropdown */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-black">
                Course *
              </label>
              <select
                value={selectedCourse}
                onChange={handleCourseChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/80 text-black font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 cursor-pointer hover:bg-white"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-black">
                Year {!selectedCourse && <span className="text-red-500">*</span>}
              </label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                disabled={!selectedCourse}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/80 text-black font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed hover:bg-white"
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
              {errors.year && <p className="text-red-600 text-sm mt-2 font-medium">{errors.year}</p>}
            </div>

            {/* Section Dropdown */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-black">
                Section {!selectedCourse || !selectedYear ? <span className="text-red-500">*</span> : ''}
              </label>
              <select
                value={selectedSection}
                onChange={handleSectionChange}
                disabled={!selectedCourse || !selectedYear}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/80 text-black font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed hover:bg-white"
              >
                <option value="">Select Section</option>
                {sections.map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
              {errors.section && <p className="text-red-600 text-sm mt-2 font-medium">{errors.section}</p>}
            </div>
          </div>

          {/* Search Bar */}
          {selectedSection && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-black">
                Search by Name or Roll Number
              </label>
              <input
                type="text"
                placeholder="Enter student name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
            </div>
          )}
        </div>

        {/* Students Table */}
        {selectedSection && students.length > 0 && (
          <div className="overflow-x-auto rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-md border border-white/20">
            <table className="w-full border-collapse">
              <thead style={{ backgroundColor: 'rgb(29, 32, 42)' }} className="text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Student Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Roll Number</th>
                  <th className="px-6 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr 
                    key={student._id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? 'bg-white/50' : 'bg-white/30'
                    } hover:bg-white/70 transition-colors`}>
                    <td className="px-6 py-4 text-black">{student.name}</td>
                    <td className="px-6 py-4 text-black">{student.rollNo}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleSeeProgress(student)}
                        className="px-5 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                        style={{ backgroundColor: 'rgb(224, 242, 241)', color: 'black' }}
                      >
                        See Progress
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No students message */}
        {selectedSection && filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No students match your search.' : 'No students found for this selection.'}
            </p>
          </div>
        )}

        {/* Initial state message */}
        {!selectedSection && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Please select Course, Year, and Section to view students.
            </p>
          </div>
        )}
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

export default SelectionDashboard;
