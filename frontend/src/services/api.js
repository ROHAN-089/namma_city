import axios from 'axios';

// Default timeout of 10 seconds
const TIMEOUT = 10000;
const MAX_RETRIES = 2;

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: TIMEOUT
});

// Request interceptor to add auth token and retry logic
api.interceptors.request.use(
  (config) => {
    // Add auth token if it exists
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add retry count to config if not present
    if (typeof config.retryCount === 'undefined') {
      config.retryCount = 0;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // If we haven't reached max retries and the error is due to timeout or network issues
    if (
      config.retryCount < MAX_RETRIES &&
      (error.code === 'ECONNABORTED' || !error.response)
    ) {
      config.retryCount += 1;

      // Exponential backoff delay
      const backoffDelay = Math.pow(2, config.retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffDelay));

      return api(config);
    }

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
