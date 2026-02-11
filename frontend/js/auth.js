// Token management functions
function getToken() {
  return localStorage.getItem('mst_token');
}

function setToken(token) {
  localStorage.setItem('mst_token', token);
}

function clearToken() {
  localStorage.removeItem('mst_token');
}

function isLoggedIn() {
  return !!getToken();
}

// Authentication API calls
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);

  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    });
    if (!res.ok) {
      const errorData = await res.json();
      showError(errorData.detail || 'Login failed');
      return;
    }
    const data = await res.json();
    setToken(data.access_token);

    // Get user course and redirect to course page
    const userRes = await getCurrentUser();
    if (userRes.success && userRes.data) {
      const course = userRes.data.course;
      const courseLinks = {
        'TNPSC': '../courses/tnpsc/tnpsc.html',
        'SSC': '../courses/ssc/ssc.html',
        'Railway': '../courses/railway/railway.html',
        'Banking': '../courses/bank/bank.html'
      };
      const courseUrl = courseLinks[course] || '../general/dashboard.html';
      window.location.href = courseUrl;
    } else {
      window.location.href = '../general/dashboard.html';
    }
  } catch (err) {
    showError('Network error');
    console.error(err);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const fullName = document.getElementById('fullName').value;
  const course = document.getElementById('courseSelect').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const payload = {
    email: email,
    full_name: fullName,
    course: course,
    password: password
  };

  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json();
      showError(errorData.detail || 'Signup failed');
      return;
    }
    window.location.href = 'login.html';
  } catch (err) {
    showError('Network error');
    console.error(err);
  }
}

async function getCurrentUser() {
  const token = getToken();
  if (!token) return { success: false, data: null };
  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) return { success: false, data: null };
    const data = await res.json();
    return { success: true, data: data };
  } catch (err) {
    console.error('Error fetching profile:', err);
    return { success: false, data: null };
  }
}

async function updateProfile(fullName, course) {
  const token = getToken();
  if (!token) return { success: false };
  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ full_name: fullName, course: course })
    });
    if (!res.ok) return { success: false };
    const data = await res.json();
    return { success: true, data: data };
  } catch (err) {
    console.error('Error updating profile:', err);
    return { success: false };
  }
}

async function changePassword(currentPassword, newPassword) {
  const token = getToken();
  if (!token) return { success: false };
  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
    const data = await res.json();
    return { success: res.ok, detail: data.detail || data.message };
  } catch (err) {
    console.error('Error changing password:', err);
    return { success: false };
  }
}

async function deleteAccount() {
  const token = getToken();
  if (!token) return { success: false };
  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/auth/delete-account`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { success: res.ok };
  } catch (err) {
    console.error('Error deleting account:', err);
    return { success: false };
  }
}

async function loadCourseNav() {
  const courseNavElement = document.getElementById('course-nav');
  if (!courseNavElement) return;

  try {
    const res = await getCurrentUser();
    if (!res.success || !res.data) return;

    const course = res.data.course;
    if (!course) return;

    const courseLinks = {
      'TNPSC': 'tnpsc/tnpsc.html',
      'SSC': 'ssc/ssc.html',
      'Railway': 'railway/railway.html',
      'Banking': 'bank/bank.html'
    };

    const coursePath = courseLinks[course];
    if (coursePath) {
      // Determine base path based on current location
      const isInsideCourseFolder = window.location.pathname.includes('/pages/courses/');
      const prefix = isInsideCourseFolder ? '../' : '../courses/';

      courseNavElement.innerHTML = `<a href="${prefix}${coursePath}">${course}</a>`;
      courseNavElement.style.display = 'block';
    }
  } catch (error) {
    console.error('Error loading course nav:', error);
  }
}

// Export auth functions
window.MS_AUTH = {
  getToken,
  setToken,
  clearToken,
  isLoggedIn,
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
  loadCourseNav
};
