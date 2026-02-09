const baseUrl = 'http://127.0.0.1:8000';

function getToken() {
  return localStorage.getItem('mst_token');
}

function setToken(token) {
  localStorage.setItem('mst_token', token);
}

function clearToken() {
  localStorage.removeItem('mst_token');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);

  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
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
    window.location.href = '../general/dashboard.html';
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
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
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

function showError(msg) {
  const el = document.getElementById('errorMsg');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = msg;
}

function attachAuthHandlers() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const signupForm = document.getElementById('signupForm');
  if (signupForm) signupForm.addEventListener('submit', handleSignup);

  const logoutLinks = document.querySelectorAll('a[href*="logout"], .logout-btn');
  logoutLinks.forEach(a => a.addEventListener('click', (e) => {
    clearToken();
  }));

  if (window.location.pathname.includes('logout.html')) {
    clearToken();
    setTimeout(() => window.location.href = '../../index.html', 800);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  attachAuthHandlers();
  if (window.location.pathname.includes('my_notes.html')) {
    attachNotesPageHandlers();
    loadAndRenderNotes();
  }
});

window.MS_API = {
  getToken,
  setToken,
  clearToken,
  baseUrl
};

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// ===== QUIZ FUNCTIONS =====
// ===== QUIZ FUNCTIONS =====
async function getQuizzesAll() {
  try {
    const res = await fetch(`${baseUrl}/api/quiz/all`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return { success: false, data: [] };
    const data = await res.json();
    return { success: true, data: data };
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    return { success: false, data: [] };
  }
}

async function getQuizWithQuestions(quizId) {
  try {
    const res = await fetch(`${baseUrl}/api/quiz/${quizId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return { success: false, data: null };
    const data = await res.json();
    return { success: true, data: data };
  } catch (err) {
    console.error('Error fetching quiz:', err);
    return { success: false, data: null };
  }
}

async function submitQuiz(quizId, answers) {
  const token = getToken();
  if (!token) {
    alert('Please login first');
    return { success: false, data: null };
  }
  try {
    const payload = {
      quiz_id: parseInt(quizId),
      answers: answers
    };
    const res = await fetch(`${baseUrl}/api/quiz/submit/${quizId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error submitting quiz:', errorData.detail || 'Unknown error');
      return { success: false, data: null };
    }
    const data = await res.json();
    return { success: true, data: data };
  } catch (err) {
    console.error('Error submitting quiz:', err);
    return { success: false, data: null };
  }
}

// ===== NOTES FUNCTIONS =====
async function getNotes() {
  const token = getToken();
  if (!token) return { success: false, data: [] };
  try {
    const res = await fetch(`${baseUrl}/api/notes/`, {
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
    console.error('Error fetching notes:', err);
    return { success: false, data: [] };
  }
}

async function createNote(title, description, color = '#ffffff') {
  const token = getToken();
  if (!token) {
    alert('Please login first');
    return { success: false, data: null };
  }
  try {
    const payload = { title: title, description: description, color: color };
    const res = await fetch(`${baseUrl}/api/notes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error creating note:', errorData.detail || 'Unknown error');
      return { success: false, data: null };
    }
    const data = await res.json();
    return { success: true, data: data };
  } catch (err) {
    console.error('Error creating note:', err);
    return { success: false, data: null };
  }
}

// ===== PROGRESS FUNCTIONS =====
async function getProgress() {
  const token = getToken();
  if (!token) return { success: false, data: [] };
  try {
    const res = await fetch(`${baseUrl}/api/progress/`, {
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

// ===== PROFILE FUNCTIONS =====
async function getCurrentUser() {
  const token = getToken();
  if (!token) return { success: false, data: null };
  try {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
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
    const res = await fetch(`${baseUrl}/api/auth/update-profile`, {
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
    const res = await fetch(`${baseUrl}/api/auth/change-password`, {
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
    const res = await fetch(`${baseUrl}/api/auth/delete-account`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { success: res.ok };
  } catch (err) {
    console.error('Error deleting account:', err);
    return { success: false };
  }
}

async function getUserStats() {
  const token = getToken();
  if (!token) return { success: false, data: null };
  try {
    const res = await fetch(`${baseUrl}/api/progress/stats`, {
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

window.MS_API = {
  getToken,
  setToken,
  clearToken,
  isLoggedIn,
  baseUrl,
  getQuizzesAll,
  getQuizWithQuestions,
  submitQuiz,
  getNotes,
  createNote,
  updateNote,
  toggleStar,
  deleteNote,
  getProgress,
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
  getUserStats
};

// ===== QUIZ PAGE HANDLERS =====
async function loadAndDisplayQuizzes() {
  const res = await getQuizzesAll();
  if (!res.success) {
    console.error('Failed to load quizzes');
    return [];
  }
  return res.data;
}

// ===== NOTES PAGE HANDLERS =====
async function loadNotes() {
  const res = await getNotes();
  if (!res.success) {
    console.error('Failed to load notes');
    return [];
  }
  return res.data;
}

async function handleCreateNote(title, description, color) {
  if (!title.trim()) {
    alert('Please enter a note title');
    return;
  }
  const res = await createNote(title, description, color);
  if (res.success) {
    console.log('Note created:', res.data);
    return res.data;
  } else {
    alert('Failed to create note');
  }
}

async function updateNote(noteId, title, description, color) {
  const token = getToken();
  if (!token) return { success: false };
  try {
    const payload = { title, description, color };
    const res = await fetch(`${baseUrl}/api/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.error('Error updating note:', err);
    return { success: false };
  }
}

async function toggleStar(noteId) {
  const token = getToken();
  if (!token) return { success: false };
  try {
    const res = await fetch(`${baseUrl}/api/notes/${noteId}/star`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.error('Error toggling star:', err);
    return { success: false };
  }
}

async function deleteNote(noteId) {
  const token = getToken();
  if (!token) return { success: false };
  try {
    const res = await fetch(`${baseUrl}/api/notes/${noteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { success: res.ok };
  } catch (err) {
    console.error('Error deleting note:', err);
    return { success: false };
  }
}

async function handleAndRenderDelete(noteId) {
  if (confirm('Are you sure you want to delete this note?')) {
    const res = await deleteNote(noteId);
    if (res.success) {
      loadAndRenderNotes();
    } else {
      alert('Failed to delete note');
    }
  }
}

let allNotes = []; // Local cache for search/sort
let currentlyEditingId = null;

function attachNotesPageHandlers() {
  const saveBtn = document.getElementById('save-note-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const title = document.getElementById('note-title-input').value;
      const description = document.getElementById('note-description-input').value;
      const color = document.getElementById('note-color-picker').value;
      const note = await handleCreateNote(title, description, color);
      if (note) {
        document.getElementById('note-title-input').value = '';
        document.getElementById('note-description-input').value = '';
        loadAndRenderNotes();
      }
    });
  }

  // Search and Sort Listeners
  const searchInput = document.getElementById('search-notes');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderNotesToGrid(filterAndSortNotes());
    });
  }

  const sortFilter = document.getElementById('sort-filter');
  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      renderNotesToGrid(filterAndSortNotes());
    });
  }

  // Handle Update button in Modal
  const updateBtn = document.querySelector('.btn-update');
  if (updateBtn) {
    updateBtn.addEventListener('click', async () => {
      if (!currentlyEditingId) return;
      const title = document.getElementById('modal-note-title').value;
      const description = document.getElementById('modal-note-content').value;
      const color = document.getElementById('modal-note-color').value;

      const res = await updateNote(currentlyEditingId, title, description, color);
      if (res.success) {
        document.getElementById('update-modal').style.display = 'none';
        loadAndRenderNotes();
      } else {
        alert('Failed to update note');
      }
    });
  }

  // Close modal logic
  const closeBtns = document.querySelectorAll('.close-modal');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('update-modal').style.display = 'none';
    });
  });

  const grid = document.getElementById('notes-grid');
  if (grid) {
    grid.addEventListener('click', async (e) => {
      const card = e.target.closest('.note-card');
      if (!card) return;
      const noteId = card.dataset.id;

      if (e.target.closest('.delete-btn')) {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this note?')) {
          const res = await deleteNote(noteId);
          if (res.success) loadAndRenderNotes();
        }
      } else if (e.target.closest('.edit-btn')) {
        e.stopPropagation();
        currentlyEditingId = noteId;
        const note = allNotes.find(n => n.id == noteId);
        if (note) {
          document.getElementById('modal-note-title').value = note.title;
          document.getElementById('modal-note-content').value = note.description;
          document.getElementById('modal-note-color').value = note.color || '#fff7b1';
          document.getElementById('update-modal').style.display = 'flex';
        }
      } else if (e.target.closest('.starred-btn')) {
        e.stopPropagation();
        const res = await toggleStar(noteId);
        if (res.success) loadAndRenderNotes();
      } else {
        const note = allNotes.find(n => n.id == noteId);
        if (note) {
          document.getElementById('view-note-title').innerText = note.title;
          document.getElementById('view-note-description').innerText = note.description || '';
          document.getElementById('view-note-color').style.backgroundColor = note.color || '#fff7b1';
          document.getElementById('note-view-modal').classList.add('active');
        }
      }
    });
  }
}

// Global function for close view (referenced in HTML)
window.closeNoteView = function () {
  const modal = document.getElementById('note-view-modal');
  if (modal) modal.classList.remove('active');
}

function filterAndSortNotes() {
  const searchTerm = document.getElementById('search-notes')?.value.toLowerCase() || '';
  const sortBy = document.getElementById('sort-filter')?.value || 'newest';

  let filtered = allNotes.filter(n =>
    n.title.toLowerCase().includes(searchTerm) ||
    (n.description && n.description.toLowerCase().includes(searchTerm))
  );

  if (sortBy === 'newest') {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sortBy === 'starred') {
    filtered = filtered.filter(n => n.is_starred);
  } else if (sortBy === 'az') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  return filtered;
}

function renderNotesToGrid(notesList) {
  const grid = document.getElementById('notes-grid');
  if (!grid) return;
  grid.innerHTML = notesList.map(note => {
    const date = new Date(note.created_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    return `
    <div class="note-card" data-id="${note.id}" style="background-color: ${note.color || '#fff7b1'};">
      <div class="card-left-accent"></div>
      <div class="card-content">
        <div class="card-actions">
          <span class="starred-btn"><i class="${note.is_starred ? 'fa-solid' : 'fa-regular'} fa-star"></i></span>
          <span class="edit-btn"><i class="fa-solid fa-pen"></i></span>
          <span class="delete-btn"><i class="fa-solid fa-trash"></i></span>
        </div>
        <h3>${note.title}</h3>
        <p class="note-text">${note.description || ''}</p>
        <span class="note-date">${date}</span>
      </div>
    </div>
  `;
  }).join('');
}

async function loadAndRenderNotes() {
  const res = await getNotes();
  if (res.success) {
    allNotes = res.data;
    renderNotesToGrid(filterAndSortNotes());
  }
}
