import axios from 'axios';

const http = axios.create({ 
  baseURL: 'http://localhost:4000' // Đảm bảo đúng port backend của bạn
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // Key này phải khớp với lúc lưu ở Login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { http };