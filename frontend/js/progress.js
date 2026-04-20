async function getProgress() {
  let result = await window.API_HELPER.apiGet("/api/progress/", true);
  if (!result.success) {
    console.error("Error fetching progress:", result.error);
    return { success: false, data: [] };
  }
  return { success: true, data: result.data };
}

async function getUserStats() {
  let result = await window.API_HELPER.apiGet("/api/progress/stats", true);
  if (!result.success) {
    console.error("Error fetching stats:", result.error);
    return { success: false, data: null };
  }
  return { success: true, data: result.data };
}

window.MS_PROGRESS = { getProgress, getUserStats };
