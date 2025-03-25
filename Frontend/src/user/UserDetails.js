import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserDetails.css';

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      setMessage('Failed to fetch users');
    }
  };

  const handleEdit = (userId) => {
    navigate(`/user-edit/${userId}`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/users/${userId}`);
        setMessage(response.data.message);
        fetchUsers();
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="user-details-container">
      <h2>User Details</h2>
      {message && <div className="message">{message}</div>}
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.role}</td>
              <td className="action-buttons"> 
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(user._id)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(user._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserDetails;