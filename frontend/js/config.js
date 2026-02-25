// Configuration and base URL setup
const PROD_BACKEND_URL = 'https://full-stack-my-study-life.onrender.com';

const baseUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : PROD_BACKEND_URL;

// Export for use in other modules
window.MS_CONFIG = {
  baseUrl
};
