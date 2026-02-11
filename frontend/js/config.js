// Configuration and base URL setup
const baseUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : window.location.origin;

// Export for use in other modules
window.MS_CONFIG = {
  baseUrl
};
