import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import './UserRegistration.css';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'student',
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
      if (value.length > 10) {
        newErrors.phone = 'Phone number cannot exceed 10 digits';
      } else {
        delete newErrors.phone;
      }
    } else if (name === 'email') {
      setFormData({ ...formData, [name]: value });
      const digitCount = (value.match(/\d/g) || []).length;
      if (digitCount > 10) {
        newErrors.email = 'Email cannot contain more than 10 digits';
      } else {
        delete newErrors.email;
      }
    } else if (name === 'password') {
      setFormData({ ...formData, [name]: value });
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
      if (!passwordRegex.test(value)) {
        newErrors.password = 'Password must be at least 6 characters and include one uppercase, one lowercase, one number, and one special character';
      } else {
        delete newErrors.password;
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0) {
      setMessage('Please fix the errors before submitting');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setMessage(response.data.message);
      setFormData({ name: '', email: '', phone: '', password: '', role: 'student' });
      setErrors({});
      setTimeout(() => navigate('/login'), 2000); 
    } catch (error) {
      const errorData = error.response?.data;
      console.error('Registration error:', errorData);
      if (errorData?.errors) {
        const errorMessages = errorData.errors.map(err => err.msg).join(', ');
        setMessage(`Registration failed: ${errorMessages}`);
      } else {
        setMessage(errorData?.message || 'Registration failed');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '', password: '', role: 'student' });
    setErrors({});
    setMessage('');
    navigate('/login'); 
  };

  return (
    <div className="user-registration-container">
      <h2>Register</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>
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
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
            maxLength="10"
          />
          {errors.phone && <span className="error">{errors.phone}</span>}
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
        <div className="form-group">
          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="button-group">
          <button type="submit" disabled={Object.keys(errors).length > 0}>
            Register
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserRegistration;