import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/QuizGenerator.css';

const QuizGenerator = () => {
  const [courseId, setCourseId] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [quizId, setQuizId] = useState(null);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        console.log('Fetching courses with token:', token);
        const response = await axios.get('http://localhost:5000/api/quizzes/courses', {
          headers: { 'x-auth-token': token },
        });
        setCourses(response.data);
      } catch (err) {
        console.error('Fetch courses error:', err);
        setError('Error fetching courses: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchCourses();
  }, []);

  const handleGenerate = async () => {
    if (!courseId) {
      setError('Please select a course');
      return;
    }
    try {
      setError('');
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      console.log('Generating quiz with:', { courseId, difficulty, token });
      const response = await axios.post('http://localhost:5000/api/quizzes/generate', 
        { courseId, difficulty }, 
        {
          headers: { 'x-auth-token': token },
        }
      );
      setQuizId(response.data.quizId);
      navigate(`/quiz/${response.data.quizId}`);
    } catch (err) {
      console.error('Generate quiz error:', err);
      setError(err.response?.data?.message || `Error generating quiz: ${err.message}`);
    }
  };

  return (
    <div className="quiz-generator-card">
      <h2>Generate Quiz</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {quizId && (
        <div className="alert alert-success">
          Quiz generated with ID: <a href={`/quiz/${quizId}`}>{quizId}</a>
        </div>
      )}
      <div className="quiz-generator-form-group">
        <label>Course</label>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>
      <div className="quiz-generator-form-group">
        <label>Difficulty</label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <button className="btn quiz-generator-btn" onClick={handleGenerate}>
        Generate Quiz
      </button>
    </div>
  );
};

export default QuizGenerator;