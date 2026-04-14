let allQuizzes = [];
let selectedGrade = null;
let selectedSubject = null;
let selectedDifficulty = null;
async function initPage() {
  if (!isLoggedIn()) {
    window.location.href = "auth/login.html";
    return;
  }
  await loadQuizzesFromAPI();
  setupFilterButtons();
  renderQuizzes();
}
async function loadQuizzesFromAPI() {
  try {
    const result = await window.API_HELPER.apiGet("/api/quiz/all", false);
    if (result.success) {
      allQuizzes = result.data.map((quiz) => ({
        id: quiz.id,
        grade: quiz.grade,
        subject: quiz.subject,
        difficulty: getDifficultyLevel(quiz.title),
        title: quiz.title,
        questions: quiz.total_questions,
        description: quiz.description,
      }));
      console.log("Loaded", allQuizzes.length, "quizzes");
    } else {
      console.error("Failed to load quizzes:", result.error);
      allQuizzes = [];
    }
  } catch (error) {
    console.error("Error loading quizzes:", error);
    allQuizzes = [];
  }
}
function getDifficultyLevel(title) {
  if (title.includes("Easy")) return "Easy";
  if (title.includes("Medium")) return "Medium";
  if (title.includes("Hard")) return "Hard";
  return "Easy";
}
function getActiveBtnValue(containerId) {
  const container = document.getElementById(containerId);
  const buttons = container.querySelectorAll(".btn-filter");
  let activeValue = null;
  buttons.forEach((btn) => {
    if (btn.classList.contains("active") && btn.textContent !== "All") {
      activeValue = btn.textContent;
    }
  });
  return activeValue;
}
function filterQuizzes() {
  selectedGrade = getActiveBtnValue("gradeFilters");
  selectedSubject = getActiveBtnValue("subjectFilters");
  selectedDifficulty = getActiveBtnValue("difficultyFilters");
  renderQuizzes();
}
function renderQuizzes() {
  let filtered = allQuizzes;
  if (selectedGrade)
    filtered = filtered.filter((q) => q.grade == selectedGrade);
  if (selectedSubject)
    filtered = filtered.filter((q) => q.subject === selectedSubject);
  if (selectedDifficulty)
    filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
  const subjectOrder = { Tamil: 1, English: 2, Maths: 3, Science: 4, SS: 5 };
  const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
  filtered.sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    if (a.subject !== b.subject)
      return (subjectOrder[a.subject] || 0) - (subjectOrder[b.subject] || 0);
    return (
      (difficultyOrder[a.difficulty] || 0) -
      (difficultyOrder[b.difficulty] || 0)
    );
  });
  const grid = document.getElementById("quizGrid");
  if (filtered.length === 0) {
    grid.innerHTML =
      '<div class="no-results">No quizzes found. Try different filters.</div>';
    return;
  }
  grid.innerHTML = filtered
    .map(
      (quiz, idx) =>
        `<div class="quiz-card"><h3>${quiz.title}</h3><div class="quiz-meta"><div><span class="badge badge-${quiz.difficulty.toLowerCase()}">${quiz.difficulty}</span></div><div>Grade ${quiz.grade}</div></div><div class="quiz-description">${quiz.subject}|${quiz.questions}Questions</div><div class="quiz-info"><span><i class="fa-solid fa-question"></i>${quiz.questions}Questions</span><span><i class="fa-solid fa-timer"></i>30 mins</span></div><button class="btn-start" onclick="startQuiz(${quiz.id},'${quiz.title}')"><i class="fa-solid fa-play"></i>Start Quiz</button></div>`,
    )
    .join("");
}
function setupFilterButtons() {
  document.querySelectorAll(".filter-buttons").forEach((container) => {
    const buttons = container.querySelectorAll(".btn-filter");
    buttons.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        buttons.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        filterQuizzes();
      });
    });
  });
}
function startQuiz(quizId, quizTitle) {
  localStorage.setItem("currentQuizId", quizId);
  localStorage.setItem("currentQuizTitle", quizTitle);
  window.location.href = "quiz.html?id=" + quizId;
}
document.addEventListener("DOMContentLoaded", initPage);
