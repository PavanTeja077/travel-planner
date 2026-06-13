import { create } from 'zustand';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Add axios interceptor to attach token automatically
axios.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('travel_user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

const useUserStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('travel_user')) || null,
  
  login: async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('travel_user', JSON.stringify(res.data));
      set({ user: res.data });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },

  register: async (name, email, password) => {
    try {
      const res = await axios.post('/auth/register', { name, email, password });
      localStorage.setItem('travel_user', JSON.stringify(res.data));
      set({ user: res.data });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('travel_user');
    set({ user: null });
  }
}));

export default useUserStore;
