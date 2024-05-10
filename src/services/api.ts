import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

api.interceptors.response.use((response) => {
  console.log('INTERCEPTOR => ', response);
  return response;
}, (error) => {
  console.log('INTERCEPTOR => ', error);
  return Promise.reject(error);
});

export { api };