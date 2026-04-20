let quizId = null;
let quizData = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let startTime = 0;
let timerInterval = null;

async function initQuiz() {
  if (!isLoggedIn()) {
    window.location.href = "auth/login.html";
    return;
  }
  
  let params = new URLSearchParams(window.location.search);
  quizId = params.get("id") || localStorage.getItem("currentQuizId");
  
  if (!quizId) {
    alert("No quiz selected");
    window.location.href = "quiz_selection.html";
    return;
  }
  
  let res = await getQuizWithQuestions(quizId);
  if (!res.success) {
    alert("Failed to load quiz");
    window.location.href = "quiz_selection.html";
    return;
  }
  
  quizData = res.data;
  startTime = Date.now();
  quizData.questions = quizData.questions || [];
  quizData.questions.forEach((_, i) => userAnswers[i] = null);
  
  renderQuestionList();
  displayQuestion(0);
  startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => {
    let totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    document.getElementById("timerDisplay").textContent = timeString;
  }, 1000);
}

function renderQuestionList() {
  let list = document.getElementById("questionList");
  if (!quizData) {
    list.innerHTML = "";
    return;
  }
  list.innerHTML = quizData.questions.map((q, i) =>
    `<div class="qbtn" id="qbtn-${i}" onclick="displayQuestion(${i})">${i + 1}</div>`
  ).join("");
  updateQuestionListState();
}

function updateQuestionListState() {
  if (!quizData) return;
  
  quizData.questions.forEach((q, i) => {
    let el = document.getElementById("qbtn-" + i);
    if (!el) return;
    el.classList.toggle("current", i === currentQuestionIndex);
    el.classList.toggle("answered", !!userAnswers[i]);
  });
  
  document.getElementById("progressText").textContent = `Question ${currentQuestionIndex + 1}of ${quizData.questions.length}`;
  document.getElementById("prevBtn").style.display = currentQuestionIndex === 0 ? "none" : "inline-flex";
  document.getElementById("nextBtn").style.display = currentQuestionIndex === quizData.questions.length - 1 ? "none" : "inline-flex";
  document.getElementById("submitBtn").style.display = currentQuestionIndex === quizData.questions.length - 1 ? "inline-flex" : "none";
}

function displayQuestion(index) {
  if (!quizData) return;
  if (index < 0 || index >= quizData.questions.length) return;
  
  currentQuestionIndex = index;
  let q = quizData.questions[index];
  
  document.getElementById("questionNumber").textContent = `Question ${index + 1}`;
  document.getElementById("questionText").textContent = q.question_text || "";
  
  let opts = [
    ["a", q.option_a],
    ["b", q.option_b],
    ["c", q.option_c],
    ["d", q.option_d],
  ];
  
  let grid = document.getElementById("optionsGrid");
  grid.innerHTML = opts.map(o => {
    let checked = userAnswers[index] === o[0] ? "checked" : "";
    return `<label class="option" id="opt-${o[0]}"><input type="radio" name="answer" value="${o[0]}" ${checked} onchange="selectAnswer('${o[0]}')"><div>${o[1] || ""}</div></label>`;
  }).join("");
  
  if (userAnswers[index]) {
    let sel = document.getElementById("opt-" + userAnswers[index]);
    if (sel) sel.classList.add("selected");
  }
  
  updateQuestionListState();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectAnswer(val) {
  userAnswers[currentQuestionIndex] = val;
  document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
  let el = document.getElementById("opt-" + val);
  if (el) el.classList.add("selected");
  updateQuestionListState();
}

function previousQuestion() {
  if (currentQuestionIndex > 0) displayQuestion(currentQuestionIndex - 1);
}

function nextQuestion() {
  if (currentQuestionIndex < quizData.questions.length - 1) displayQuestion(currentQuestionIndex + 1);
}

async function submitQuizHandler() {
  clearInterval(timerInterval);
  let answers = {};
  quizData.questions.forEach((q, i) => answers[q.id] = userAnswers[i] || "");
  let res = await submitQuiz(quizId, answers);
  if (res.success) {
    showResults(res.data);
  } else {
    alert("Submit failed:" + (res.data?.detail || "Check console for details"));
  }
}

function showResults(data) {
  document.getElementById("resScore").textContent = Math.round(data.score) + "%";
  document.getElementById("resTotal").textContent = data.total;
  document.getElementById("resCorrect").textContent = data.correct;
  document.getElementById("resWrong").textContent = data.wrong;
  document.getElementById("resAccuracy").textContent = Math.round((data.correct / data.total) * 100) + "%";
  document.getElementById("resultsOverlay").classList.add("active");
}

function clearAll() {
  if (!quizData) return;
  quizData.questions.forEach((_, i) => userAnswers[i] = null);
  document.querySelectorAll('input[name="answer"]').forEach(i => i.checked = false);
  document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
  updateQuestionListState();
}

document.addEventListener("DOMContentLoaded", initQuiz);
