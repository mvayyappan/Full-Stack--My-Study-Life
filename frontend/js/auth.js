function getToken() {
  return localStorage.getItem("mst_token");
}

function setToken(token) {
  localStorage.setItem("mst_token", token);
}

function clearToken() {
  localStorage.removeItem("mst_token");
}

function isLoggedIn() {
  return !!getToken();
}

async function handleLogin(e) {
  e.preventDefault();
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  
  let result = await window.API_HELPER.apiLoginFormData("/api/auth/login", email, password);
  if (!result.success) {
    showError(result.error);
    return;
  }
  
  setToken(result.data.access_token);
  let userRes = await getCurrentUser();
  
  let url = "../general/dashboard.html";
  if (userRes.success && userRes.data) {
    let courseLinks = {
      TNPSC: "../courses/tnpsc/tnpsc.html",
      SSC: "../courses/ssc/ssc.html",
      Railway: "../courses/railway/railway.html",
      Banking: "../courses/bank/bank.html",
    };
    url = courseLinks[userRes.data.course] || url;
  }
  window.location.href = url;
}

async function handleSignup(e) {
  e.preventDefault();
  let fullName = document.getElementById("fullName").value;
  let course = document.getElementById("courseSelect").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  
  let data = { email, full_name: fullName, course, password };
  let result = await window.API_HELPER.apiPost("/api/auth/signup", data, false);
  
  if (!result.success) {
    showError(result.error);
    return;
  }
  window.location.href = "login.html";
}

async function getCurrentUser() {
  let token = getToken();
  if (!token) return { success: false, data: null };
  return await window.API_HELPER.apiGet("/api/auth/me", true);
}

async function updateProfile(fullName, course) {
  let token = getToken();
  if (!token) return { success: false };
  
  try {
    let res = await fetch(`${window.MS_CONFIG.baseUrl}/api/auth/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ full_name: fullName, course }),
    });
    
    if (!res.ok) return { success: false };
    let data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error updating profile:", err);
    return { success: false };
  }
}

async function changePassword(currentPassword, newPassword) {
  let token = getToken();
  if (!token) return { success: false };
  
  try {
    let res = await fetch(`${window.MS_CONFIG.baseUrl}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    
    let data = await res.json();
    return { success: res.ok, detail: data.detail || data.message };
  } catch (err) {
    console.error("Error changing password:", err);
    return { success: false };
  }
}

async function deleteAccount() {
  let token = getToken();
  if (!token) return { success: false };
  
  try {
    let res = await fetch(`${window.MS_CONFIG.baseUrl}/api/auth/delete-account`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: res.ok };
  } catch (err) {
    console.error("Error deleting account:", err);
    return { success: false };
  }
}

async function loadCourseNav() {
  let el = document.getElementById("course-nav");
  if (!el) return;
  
  try {
    let res = await getCurrentUser();
    if (!res.success || !res.data) return;
    
    let course = res.data.course;
    if (!course) return;
    
    let courseLinks = {
      TNPSC: "tnpsc/tnpsc.html",
      SSC: "ssc/ssc.html",
      Railway: "railway/railway.html",
      Banking: "bank/bank.html",
    };
    
    let path = courseLinks[course];
    if (!path) return;
    
    let prefix = window.location.pathname.includes("/pages/courses/") ? "../" : "../courses/";
    el.innerHTML = `<a href="${prefix}${path}">${course}</a>`;
    el.style.display = "block";
  } catch (err) {
    console.error("Error loading course nav:", err);
  }
}

window.MS_AUTH = { getToken, setToken, clearToken, isLoggedIn, getCurrentUser, updateProfile, changePassword, deleteAccount, loadCourseNav };
  