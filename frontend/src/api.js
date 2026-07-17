import axios from 'axios';

// Create an instance targeting your backend server URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
