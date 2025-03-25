import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../style/QuizDisplay.css';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-error">
          Something went wrong. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

const QuizDisplay = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`);
        setQuiz(response.data);
      } catch (err) {
        setError('Error loading quiz: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId, answer) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!quiz) {
      setError('Quiz not loaded');
      return;
    }
    if (Object.keys(selectedAnswers).length !== quiz.questionIds.length) {
      setError('Please answer all questions');
      return;
    }
    try {
      setError('');
      const answers = Object.entries(selectedAnswers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      }));
      const response = await axios.post(`http://localhost:5000/api/quizzes/${quizId}/submit`, { 
        userId: 'anonymous', // Use a placeholder userId
        answers 
      });
      setScore(response.data.score);
    } catch (err) {
      setError('Error submitting quiz: ' + (err.response?.data?.message || err.message));
    }
  };

  const sanitizeOption = (option) => option.replace(/⚫/g, '').trim();

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!quiz) return <div className="alert alert-info">Loading...</div>;

  return (
    <ErrorBoundary>
      <div className="quiz-display">
        <h2 className="quiz-display-title">Quiz</h2>
        {quiz.questionIds.map((question, index) => (
          <div key={question._id} className="quiz-display-question">
            <p className="quiz-display-question-text">
              {index + 1}. {question.questionText}
            </p>
            {question.options.map((option, optIndex) => (
              <div key={`${question._id}-${optIndex}`} className="quiz-display-option">
                <input
                  type="radio"
                  name={question._id}
                  value={option}
                  onChange={() => handleAnswerChange(question._id, option)}
                  checked={selectedAnswers[question._id] === option}
                  className="quiz-display-radio"
                />
                <label className="quiz-display-label">{sanitizeOption(option)}</label>
              </div>
            ))}
          </div>
        ))}
        <button onClick={handleSubmit} className="quiz-display-button">
          Submit Quiz
        </button>
        {score !== null && (
          <div className="alert alert-success">
            Your score: {score} out of {quiz.questionIds.length}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default QuizDisplay;