import axios from 'axios';

// Create an instance targeting your backend server URL
const api = axios.create({
  baseURL: 'http://localhost:4000', // Replace with your backend port/URL
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
