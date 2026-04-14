import React, { useState } from 'react';
import axios from 'axios';

const FeedbackModal = ({ student, onClose, apiUrl }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(4);
  const [status, setStatus] = useState({ text: '', type: 'error' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setStatus({ text: 'Please enter feedback before submitting.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const mentorEmail = localStorage.getItem('mentorEmail') || 'mentor@example.com';
      await axios.post(`${apiUrl}/api/feedback`, {
        mentorEmail,
        studentName: student?.name || 'General feedback',
        rollNo: student?.rollNo || 'N/A',
        feedbackText,
        rating,
      });
      setStatus({ text: 'Feedback submitted successfully.', type: 'success' });
      setFeedbackText('');
      setTimeout(onClose, 700);
    } catch (err) {
      setStatus({ text: err.response?.data?.message || 'Unable to submit feedback.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="card card-pad modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Share Feedback</h3>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>

        {student && (
          <p style={{ color: '#637188', marginTop: 8 }}>
            Student: <strong>{student.name}</strong> ({student.rollNo})
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div className="field">
            <label>Rating (1-5)</label>
            <input type="range" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
            <small>Selected: {rating}</small>
          </div>
          <div className="field">
            <label>Feedback</label>
            <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
          </div>
          <div className="inline-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>

        {status.text && <p className={`status ${status.type}`}>{status.text}</p>}
      </div>
    </div>
  );
};

export default FeedbackModal;
