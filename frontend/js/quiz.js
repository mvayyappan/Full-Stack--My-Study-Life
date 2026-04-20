async function getQuizzesAll() {
  let result = await window.API_HELPER.apiGet("/api/quiz/all", false);
  if (!result.success) {
    console.error("Error fetching quizzes:", result.error);
    return { success: false, data: [] };
  }
  return { success: true, data: result.data };
}

async function getQuizWithQuestions(quizId) {
  let result = await window.API_HELPER.apiGet(`/api/quiz/${quizId}`, false);
  if (!result.success) {
    console.error("Error fetching quiz:", result.error);
    return { success: false, data: null };
  }
  return { success: true, data: result.data };
}

async function submitQuiz(quizId, answers) {
  let payload = { quiz_id: parseInt(quizId), answers };
  let result = await window.API_HELPER.apiPost(`/api/quiz/submit/${quizId}`, payload, true);
  if (!result.success) {
    console.error("Error submitting quiz:", result.error);
    return { success: false, data: null };
  }
  return { success: true, data: result.data };
}

async function loadAndDisplayQuizzes() {
  let res = await getQuizzesAll();
  if (!res.success) {
    console.error("Failed to load quizzes");
    return [];
  }
  return res.data;
}

window.MS_QUIZ = { getQuizzesAll, getQuizWithQuestions, submitQuiz, loadAndDisplayQuizzes };
