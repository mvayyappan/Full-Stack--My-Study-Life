const PROD_URL = 'https://full-stack-my-study-life-1.onrender.com';
const LOCAL_URL = 'http://127.0.0.1:8000';

let isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
let baseUrl = isLocal ? LOCAL_URL : PROD_URL;

window.MS_CONFIG = { baseUrl };