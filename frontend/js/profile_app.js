document.addEventListener("DOMContentLoaded", async function () {
  if (!MS_API.isLoggedIn()) {
    window.location.href = "../auth/login.html";
    return;
  }
  await loadProfileData();
});
function switchTab(tabName) {
  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => tab.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
  if (event && event.target) {
    event.target.classList.add("active");
  }
}
async function loadProfileData() {
  try {
    const res = await MS_API.getCurrentUser();
    if (!res.success) {
      alert("Session expired. Please login again.");
      window.location.href = "../auth/login.html";
      return;
    }
    const user = res.data;
    document.getElementById("userName").textContent = user.full_name || "User";
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("courseBadge").textContent =
      user.course || "General";
    const joinDate = new Date(user.created_at);
    document.getElementById("memberSince").textContent =
      joinDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    await loadUserStats();
    document.getElementById("editFullName").value = user.full_name || "";
    document.getElementById("editEmail").value = user.email;
    document.getElementById("editCourse").value = user.course || "TNPSC";
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}
async function loadUserStats() {
  try {
    const res = await MS_API.getUserStats();
    if (res.success) {
      const stats = res.data;
      document.getElementById("totalQuizzes").textContent =
        stats.total_quizzes || 0;
      document.getElementById("averageScore").textContent =
        Math.round(stats.average_score || 0) + "%";
      document.getElementById("accuracy").textContent =
        Math.round(stats.accuracy || 0) + "%";
      document.getElementById("streak").textContent = stats.current_streak || 0;
      document.getElementById("overviewQuizzes").textContent =
        stats.total_questions || 0;
      document.getElementById("correctAnswers").textContent =
        stats.correct_answers || 0;
      document.getElementById("studyHours").textContent = Math.round(
        stats.study_hours || 0,
      );
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}
async function saveProfile() {
  const fullName = document.getElementById("editFullName").value;
  const course = document.getElementById("editCourse").value;
  if (!fullName.trim()) {
    showMessage("messageBox", "Please enter your full name", "error");
    return;
  }
  const res = await MS_API.updateProfile(fullName, course);
  if (res.success) {
    showMessage("messageBox", "Profile updated successfully!", "success");
    setTimeout(() => {
      loadProfileData();
      switchTab("overview");
    }, 1500);
  } else {
    showMessage("messageBox", "Failed to update profile", "error");
  }
}
async function updatePassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  if (!currentPassword || !newPassword || !confirmPassword) {
    showMessage("settingsMessageBox", "All fields are required", "error");
    return;
  }
  if (newPassword !== confirmPassword) {
    showMessage("settingsMessageBox", "Passwords do not match", "error");
    return;
  }
  const res = await MS_API.changePassword(currentPassword, newPassword);
  if (res.success) {
    showMessage(
      "settingsMessageBox",
      "Password changed successfully!",
      "success",
    );
    document.getElementById("passwordForm").reset();
  } else {
    showMessage(
      "settingsMessageBox",
      res.detail || "Failed to change password",
      "error",
    );
  }
}
async function handleDeleteAccount() {
  if (
    confirm("Are you absolutely sure? This action cannot be undone.") &&
    confirm('Type "DELETE" in the next prompt to confirm.')
  ) {
    const promptVal = prompt("Please type DELETE to confirm:");
    if (promptVal === "DELETE") {
      const res = await MS_API.deleteAccount();
      if (res.success) {
        alert("Account deleted. Redirecting...");
        MS_API.clearToken();
        window.location.href = "../index.html";
      } else {
        alert("Failed to delete account");
      }
    }
  }
}
function showMessage(elementId, message, type) {
  const box = document.getElementById(elementId);
  box.textContent = message;
  box.className = "message " + type;
  setTimeout(() => {
    box.className = "message";
    box.textContent = "";
  }, 4000);
}
