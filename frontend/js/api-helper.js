async function apiCall(method, endpoint, body = null, needsAuth = true) {
  try {
    const fullUrl = window.MS_CONFIG.baseUrl + endpoint;
    const headers = { "Content-Type": "application/json" };
    if (needsAuth) {
      const token = getToken();
      if (!token) {
        return { success: false, error: "Please login first" };
      }
      headers["Authorization"] = `Bearer ${token}`;
    }
    const options = { method: method, headers: headers };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(fullUrl, options);
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.detail || "Request failed" };
    }
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: "Network error" };
  }
}
async function apiGet(endpoint, needsAuth = true) {
  return apiCall("GET", endpoint, null, needsAuth);
}
async function apiPost(endpoint, body, needsAuth = true) {
  return apiCall("POST", endpoint, body, needsAuth);
}
async function apiPut(endpoint, body, needsAuth = true) {
  return apiCall("PUT", endpoint, body, needsAuth);
}
async function apiDelete(endpoint, needsAuth = true) {
  return apiCall("DELETE", endpoint, null, needsAuth);
}
async function apiLoginFormData(endpoint, username, password) {
  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    const response = await fetch(window.MS_CONFIG.baseUrl + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.detail || "Login failed" };
    }
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "Network error" };
  }
}
window.API_HELPER = {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiLoginFormData,
};
