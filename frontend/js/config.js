// Configuration and base URL setup
const PROD_BACKEND_URL = 'https://your-app-name.onrender.com'; // REPLACE THIS with your Render URL after deployment

const baseUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : PROD_BACKEND_URL;

// Export for use in other modules
window.MS_CONFIG = {
  baseUrl
};
