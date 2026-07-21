import axios from 'axios';

const baseURL =
  typeof window === 'undefined'
    ? process.env.BACKEND_URL || 'http://localhost:4000'
    : process.env.NEXT_PUBLIC_API_BASE_URL || '';

const api = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
