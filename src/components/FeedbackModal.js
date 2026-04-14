import React, { useState } from 'react';
import axios from 'axios';

const FeedbackModal = ({ student, onClose, apiUrl }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      setMessage('Please enter feedback text');
      return;
    }

    setIsSubmitting(true);

    try {
      const mentorEmail = localStorage.getItem('mentorEmail') || 'mentor@example.com';
      
      await axios.post(`${apiUrl}/api/feedback`, {
        mentorEmail,
        studentName: student?.name || 'N/A',
        rollNo: student?.rollNo || 'N/A',
        feedbackText,
        rating,
      });

      setMessage('✅ Feedback submitted successfully!');
      setFeedbackText('');
      setRating(5);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setMessage('❌ Error submitting feedback. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-teal-700">Provide Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {student && (
          <div className="bg-teal-50 p-4 rounded-md mb-4 border border-teal-200">
            <p className="text-sm font-medium text-gray-700">
              <span className="text-teal-700 font-semibold">Student:</span> {student.name}
            </p>
            <p className="text-sm font-medium text-gray-700">
              <span className="text-teal-700 font-semibold">Roll No:</span> {student.rollNo}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (1-5) *
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xl font-bold text-teal-600">{rating}</span>
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback *
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter your feedback here..."
              className="w-full px-3 py-2 border-2 border-teal-300 rounded-md focus:outline-none focus:border-teal-600 resize-none"
              rows="4"
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-md text-sm font-medium ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-md hover:from-teal-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
