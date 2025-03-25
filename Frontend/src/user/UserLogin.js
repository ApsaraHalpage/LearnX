import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserLogin.css';

const UserLogin = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (name === 'email') {
      setFormData({ ...formData, [name]: value });
      const digitCount = (value.match(/\d/g) || []).length;
      if (digitCount > 10) {
        newErrors.email = 'Email cannot contain more than 10 digits';
      } else {
        delete newErrors.email;
      }
    } else if (name === 'password') {
      setFormData({ ...formData, [name]: value });
      if (value.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0 || !formData.email || formData.password.length < 6) {
      setMessage('Please fix the errors before submitting');
      if (!formData.email) {
        setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      }
      if (formData.password.length < 6) {
        setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters' }));
      }
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formData);
      setMessage(response.data.message);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setFormData({ email: '', password: '' });
      setErrors({});
      setTimeout(() => navigate('/'), 2000); 
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  const handleCancel = () => {
    setFormData({ email: '', password: '' });
    setErrors({});
    setMessage('');
    navigate('/'); 
  };

  return (
    <div className="user-login-container">
      <h2>Login</h2>
      {message && (
        <div className={`message ${message.includes('failed') ? 'error' : ''}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        <div className="button-group">
          <button type="submit" disabled={Object.keys(errors).length > 0}>
            Login
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserLogin;