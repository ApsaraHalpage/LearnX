import React, { useState } from 'react';
import axios from 'axios';
import '../style/CourseUpload.css';

const CourseUpload = () => {
  const [name, setName] = useState('');
  const [pdf, setPdf] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setMessage('Course name is required');
      return;
    }
    if (!pdf) {
      setMessage('PDF file is required');
      return;
    }
    const formData = new FormData();
    formData.append('name', name);
    formData.append('pdf', pdf);
    console.log('Sending form data:', { name, pdf: pdf.name });
    try {
      const response = await axios.post('http://localhost:5000/api/quizzes/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(`Course uploaded successfully! ID: ${response.data.courseId}`);
      setName('');
      setPdf(null);
    } catch (err) {
      console.error('Upload error:', err);
      setMessage(err.response?.data?.message || `Error uploading course: ${err.message}`);
    }
  };

  return (
    <div className="course-upload-card">
      <h2>Upload Course PDF</h2>
      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="course-upload-form-group">
          <label>Course Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter course name"
          />
        </div>
        <div className="course-upload-form-group">
          <label>Upload PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setPdf(e.target.files[0])}
          />
        </div>
        <button type="submit" className="btn course-upload-btn">
          Upload Course
        </button>
      </form>
    </div>
  );
};

export default CourseUpload;