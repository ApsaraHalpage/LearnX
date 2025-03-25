import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/Navbar.css'; // Fixed: Added closing quote and .css extension

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate(); // For redirecting after logout

  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data
    setUser(null); // Update state
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">LearnX</Link> {/* Added a logo/brand name */}
      </div>
      <div className="navbar-right">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/generate" className="navbar-link">Generate Quiz</Link>
        <Link to="/course-upload" className="navbar-link">Upload Course</Link>
        <Link to="/register" className="navbar-link">Register</Link>
        <Link to="/login" className="navbar-link">Login</Link>
        <Link to="/user-details" className="navbar-link">User Details</Link>
        
      </div>
    </nav>
  );
};

export default Navbar;