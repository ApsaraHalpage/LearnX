import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './UserEdit.css';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student',
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${id}`);
      const user = response.data.user;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'student',
      });
    } catch (error) {
      setMessage('Failed to fetch user');
    }
  };

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
    } else if (name === 'name') {
      setFormData({ ...formData, [name]: value });
      if (!value.trim()) {
        newErrors.name = 'Name is required';
      } else {
        delete newErrors.name;
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0 || !formData.name.trim()) {
      setMessage('Please fix the errors before submitting');
      if (!formData.name.trim()) {
        setErrors((prev) => ({ ...prev, name: 'Name is required' }));
      }
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/users/${id}`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setMessage(response.data.message);
      setTimeout(() => navigate('/user-details'), 2000); // Redirect after success
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        const errorMessages = errorData.errors.map(err => err.msg).join(', ');
        setMessage(`Update failed: ${errorMessages}`);
      } else {
        setMessage(errorData?.message || 'Update failed');
      }
    }
  };

  const handleCancel = () => {
    navigate('/user-details'); 
  };

  return (
    <div className="user-edit-container">
      <h2>Edit User</h2>
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
          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="button-group">
          <button type="submit" disabled={Object.keys(errors).length > 0}>
            Update
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;