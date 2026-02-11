// Progress API functions
async function getProgress() {
  const token = window.MS_AUTH.getToken();
  if (!token) return { success: false, data: [] };
  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/progress/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) return { success: false, data: [] };
    const data = await res.json();
    return { success: true, data: data };
  } catch (err) {
    console.error('Error fetching progress:', err);
    return { success: false, data: [] };
  }
}

async function getUserStats() {
  const token = window.MS_AUTH.getToken();
  if (!token) return { success: false, data: null };
  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/progress/stats`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return { success: false, data: null };
    const data = await res.json();
    return { success: true, data: data };
  } catch (err) {
    console.error('Error fetching stats:', err);
    return { success: false, data: null };
  }
}

// Export progress functions
window.MS_PROGRESS = {
  getProgress,
  getUserStats
};
