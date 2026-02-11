// Quiz API functions
async function getQuizzesAll() {
  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/quiz/all`, {
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
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/quiz/${quizId}`, {
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
  const token = window.MS_AUTH.getToken();
  if (!token) {
    alert('Please login first');
    return { success: false, data: null };
  }
  try {
    const payload = {
      quiz_id: parseInt(quizId),
      answers: answers
    };
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/quiz/submit/${quizId}`, {
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

async function loadAndDisplayQuizzes() {
  const res = await getQuizzesAll();
  if (!res.success) {
    console.error('Failed to load quizzes');
    return [];
  }
  return res.data;
}

// Export quiz functions
window.MS_QUIZ = {
  getQuizzesAll,
  getQuizWithQuestions,
  submitQuiz,
  loadAndDisplayQuizzes
};
