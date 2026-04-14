const PROD_BACKEND_URL = 'https://full-stack-my-study-life-1.onrender.com';

const baseUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : PROD_BACKEND_URL;

  window.MS_CONFIG = {
  baseUrl
};