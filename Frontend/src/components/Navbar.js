import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaPlus,
  FaFileAlt,
  FaUserPlus,
  FaArrowRight,
  FaUsers,
  FaSignOutAlt,
  FaAngleDown,
  FaQuestion,
  FaQuestionCircle,
  FaRegistered,
  FaUser,
  FaCashRegister,
} from 'react-icons/fa';
import '../style/Navbar.css';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isQuizOpen, setIsQuizOpen] = useState(false);


  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">LearnX</div>

      <ul className="sidebar-menu">
        {/* Home */}
        <li>
          <Link to="/" className="sidebar-link">
            <FaHome className="icon" /> Home
          </Link>
        </li>

        {/* Quiz Dropdown */}
        <li className="sidebar-item">
          <div
            className="sidebar-link dropdown"
            onClick={() => setIsQuizOpen(!isQuizOpen)}
          >
            <FaQuestionCircle className="icon" /> Quiz
            <FaAngleDown className={`dropdown-icon ${isQuizOpen ? 'rotate' : ''}`} />
          </div>
          {isQuizOpen && (
            <ul className="submenu">
              <li>
                 <Link to="/course-upload" className="sidebar-link">
                 <FaFileAlt className="icon" /> Upload Course
                 </Link>
              </li>
              <li>
                 <Link to="/generate" className="sidebar-link">
                 <FaPlus className="icon" /> Generate Quiz
                 </Link>
              </li>
            </ul>
          )}
        </li>

        {/* User Register */}
        <li>
          <Link to="/register" className="sidebar-link">
            <FaUserPlus className="icon" /> User Register
          </Link>
        </li>

         {/* User Login */}
         <li>
          <Link to="/login" className="sidebar-link">
            <FaUser className="icon" /> User Login
          </Link>
        </li>
       
        {/* User Details */}
        <li>
          <Link to="/user-details" className="sidebar-link">
            <FaUsers className="icon" /> User Details
          </Link>
        </li>

        {/* Payment */}
        <li>
          <Link to="/Payment" className="sidebar-link">
            <FaCashRegister className="icon" />Payment
          </Link>
        </li>

        {/* Logout (only if user is logged in) */}
        {user && (
          <li>
            <button onClick={handleLogout} className="sidebar-link logout-btn">
              <FaSignOutAlt className="icon" /> Logout
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Navbar;