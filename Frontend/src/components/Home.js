import React from 'react';
import '../style/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to LearnX</h1>
      <p>
        LearnX is your go-to platform for creating and taking quizzes based on course materials.
        Upload your PDFs, generate quizzes, and test your knowledge!
      </p>
      <div className="home-actions">
        <a href="/generate" className="btn home-btn">Generate a Quiz</a>
        <a href="/course-upload" className="btn home-btn">Upload a Course</a>
      </div>
    </div>
  );
};

export default Home;