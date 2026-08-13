import axios from 'axios';

const http = axios.create({ baseURL: 'http://localhost:4000' });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { http };