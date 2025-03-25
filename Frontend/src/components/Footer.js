import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section">
          <h3 className="footer-heading">About LearnX</h3>
          <p className="footer-text">
            LearnX is a modern quiz platform designed to help students and instructors engage in
            interactive learning experiences.
          </p>
        </div>
        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/" className="footer-link">Home</Link></li>
            <li><Link to="/login" className="footer-link">Login</Link></li>
            <li><Link to="/register" className="footer-link">Register</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="footer-heading">Contact Us</h3>
          <p className="footer-text">Email: support@learnx.com</p>
          <p className="footer-text">Phone: +1 (123) 456-7890</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-text">
          © {new Date().getFullYear()} LearnX. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;