import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import QuizDisplay from './components/QuizDisplay';
import QuizGenerator from './components/QuizGenerator';
import CourseUpload from './components/CourseUpload';
import UserLogin from './user/UserLogin';
import UserRegistration from './user/UserRegistration';
import UserDetails from './user/UserDetails';
import UserEdit from './user/UserEdit';
import Payment from './Payment/Payment';
import './App.css';

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <Navbar user={user} setUser={setUser} />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz/:quizId" element={<QuizDisplay />} />
            <Route path="/generate" element={<QuizGenerator />} />
            <Route path="/course-upload" element={<CourseUpload />} />
            <Route path="/login" element={<UserLogin setUser={setUser} />} />
            <Route path="/register" element={<UserRegistration />} />
            <Route path="/user-details" element={<UserDetails />} />
            <Route path="/user-edit/:id" element={<UserEdit />} />
            <Route path="/payment" element={<Payment />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;