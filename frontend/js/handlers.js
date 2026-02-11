// UI Utilities
function showError(msg) {
  const el = document.getElementById('errorMsg');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = msg;
}

// Attach auth form handlers
function attachAuthHandlers() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', window.MS_AUTH.handleLogin || handleLogin);

  const signupForm = document.getElementById('signupForm');
  if (signupForm) signupForm.addEventListener('submit', window.MS_AUTH.handleSignup || handleSignup);

  const logoutLinks = document.querySelectorAll('a[href*="logout"], .logout-btn');
  logoutLinks.forEach(a => a.addEventListener('click', (e) => {
    window.MS_AUTH.clearToken();
  }));

  if (window.location.pathname.includes('logout.html')) {
    window.MS_AUTH.clearToken();
    setTimeout(() => window.location.href = '../../index.html', 800);
  }
}

// Global API object for backward compatibility
function initializeGlobalAPI() {
  window.MS_API = {
    // Config
    baseUrl: window.MS_CONFIG.baseUrl,
    
    // Auth
    getToken: window.MS_AUTH.getToken,
    setToken: window.MS_AUTH.setToken,
    clearToken: window.MS_AUTH.clearToken,
    isLoggedIn: window.MS_AUTH.isLoggedIn,
    getCurrentUser: window.MS_AUTH.getCurrentUser,
    updateProfile: window.MS_AUTH.updateProfile,
    changePassword: window.MS_AUTH.changePassword,
    deleteAccount: window.MS_AUTH.deleteAccount,
    loadCourseNav: window.MS_AUTH.loadCourseNav,
    
    // Quiz
    getQuizzesAll: window.MS_QUIZ.getQuizzesAll,
    getQuizWithQuestions: window.MS_QUIZ.getQuizWithQuestions,
    submitQuiz: window.MS_QUIZ.submitQuiz,
    loadAndDisplayQuizzes: window.MS_QUIZ.loadAndDisplayQuizzes,
    
    // Notes
    getNotes: window.MS_NOTES.getNotes,
    createNote: window.MS_NOTES.createNote,
    updateNote: window.MS_NOTES.updateNote,
    toggleStar: window.MS_NOTES.toggleStar,
    deleteNote: window.MS_NOTES.deleteNote,
    loadAndRenderNotes: window.MS_NOTES.loadAndRenderNotes,
    
    // Progress
    getProgress: window.MS_PROGRESS.getProgress,
    getUserStats: window.MS_PROGRESS.getUserStats
  };
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  attachAuthHandlers();
  window.MS_AUTH.loadCourseNav();
  if (window.location.pathname.includes('my_notes.html')) {
    window.MS_NOTES.attachNotesPageHandlers();
    window.MS_NOTES.loadAndRenderNotes();
  }
  initializeGlobalAPI();
});

// Export handlers
window.MS_HANDLERS = {
  showError,
  attachAuthHandlers,
  initializeGlobalAPI
};
