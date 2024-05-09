import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://172.20.113.110:3333',
});