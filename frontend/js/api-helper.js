async function apiCall(method, endpoint, body = null, needsAuth = true) {
  let url = window.MS_CONFIG.baseUrl + endpoint;
  let headers = { "Content-Type": "application/json" };
  
  if (needsAuth) {
    let token = getToken();
    if (!token) return { success: false, error: "Please login first" };
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  let options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  try {
    let response = await fetch(url, options);
    if (!response.ok) {
      let error = await response.json();
      return { success: false, error: error.detail || "Request failed" };
    }
    let data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("API Error:", err);
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
  let url = window.MS_CONFIG.baseUrl + endpoint;
  let formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);
  
  try {
    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    });
    
    if (!response.ok) {
      let error = await response.json();
      return { success: false, error: error.detail || "Login failed" };
    }
    
    let data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Login Error:", err);
    return { success: false, error: "Network error" };
  }
}

window.API_HELPER = { apiCall, apiGet, apiPost, apiPut, apiDelete, apiLoginFormData };