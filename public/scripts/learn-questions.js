let topKey = "";            // e.g. "cat_quant"
let currentChapterData = null; 
let currentSubChapter = ""; // e.g. "percentage"
let subChapterData = null;  // array of questions
let notebookVisible = false;

/** Quiz Variables **/
let quizData = [];
let quizIndex = 0;
let correctCount = 0;
let incorrectCount = 0;
let skippedCount = 0;
let overallTimer = 0;
let questionTimer = 0;
let quizInterval = null;
let questionInterval = null;

/** On page load => fetch from backend **/
window.addEventListener("DOMContentLoaded", async () => {
  // Dark mode
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  // Diversion & section from localStorage
  const diversion = (localStorage.getItem("diversion") || "cat").toLowerCase();
  const section = (localStorage.getItem("section") || "quant").toLowerCase();
  topKey = `${diversion}_${section}`;

  // Fetch chapters from backend
  try {
    const res = await fetch("https://nexus-hub-q9hx.onrender.com/api/chapters");
    const chapters = await res.json();
    currentChapterData = chapters.find(ch =>
      ch.diversion.toLowerCase() === diversion && ch.section.toLowerCase() === section
    );
    if (!currentChapterData) {
      alert("No chapter data found for the selected diversion/section.");
      return;
    }
  } catch (error) {
    console.error("Error fetching chapters:", error);
    alert("Error fetching chapter data from the backend.");
    return;
  }

  // Build brand title
  const brandDiv = currentChapterData.diversion.toUpperCase();
  const brandSec = currentChapterData.section.toUpperCase();
  const brandTitleEl = document.getElementById("brandTitleEl");
  brandTitleEl.innerHTML = `
    <a href="index.html" style="color: #ffcc00; text-decoration: none;">NexusHub</a>
    / <a href="learn.html?diversion=${diversion}" style="color: #ffcc00; text-decoration: none;">${brandDiv}</a>
    / <a href="learn.html?diversion=${diversion}§ion=${section}" style="color: #ffcc00; text-decoration: none;">${brandSec}</a>
  `;

  // Fill sub-chapter dropdown
  fillSubChapterDropdown();

  // Load first sub-chapter by default
  const firstSub = Object.keys(currentChapterData.subChapters)[0];
  loadSubChapter(firstSub);
  loadNotebookForSubChapter(firstSub);

  // Save notebook on input changes
  document.getElementById("notebookArea").addEventListener("input", () => {
    saveNotebookForSubChapter(currentSubChapter);
  });

  // Press Enter in search => trigger search
  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchQuestions();
    }
  });
});

/** Toggle dark mode */
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "true" : "false");
}

/** Fill sub-chapter dropdown from currentChapterData */
function fillSubChapterDropdown() {
  const subChSelect = document.getElementById("subChapterSelect");
  subChSelect.innerHTML = "";
  const subChs = currentChapterData.subChapters;
  for (let subKey in subChs) {
    const obj = subChs[subKey];
    const count = obj.questions.length;
    const opt = document.createElement("option");
    opt.value = subKey;
    opt.textContent = `${obj.name} (${count} Questions)`;
    subChSelect.appendChild(opt);
  }
}

/** On sub-chapter change => load new, save old notebook */
function onSubChapterChange(newSub) {
  saveNotebookForSubChapter(currentSubChapter);
  document.getElementById("searchInput").value = "";
  document.getElementById("statusFilter").value = "all";
  loadSubChapter(newSub);
  loadNotebookForSubChapter(newSub);
}

/** Build question cards for the selected sub-chapter */
function loadSubChapter(subKey) {
  currentSubChapter = subKey;
  const container = document.getElementById("questionsContainer");
  container.innerHTML = "";
  const subObj = currentChapterData.subChapters[subKey];
  if (!subObj) {
    container.innerHTML = `<p>No data found for sub-chapter: ${subKey}</p>`;
    return;
  }
  subChapterData = subObj.questions;

  subChapterData.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("question-card");
    card.setAttribute("data-search", (item.q + " " + (item.a || "")).toLowerCase());

    // Question info
    const qInfo = document.createElement("div");
    qInfo.classList.add("question-info");
    const qNum = document.createElement("div");
    qNum.classList.add("question-number");
    qNum.textContent = `Question ${index + 1}`;
    const qText = document.createElement("div");
    qText.classList.add("question-text");
    qText.textContent = item.q;

    // Answer section
    const ansSection = document.createElement("div");
    ansSection.classList.add("answer-section");

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("answer-input");
    input.placeholder = "Type your answer here...";
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") verifyBtn.click();
    });

    const ansResult = document.createElement("div");
    ansResult.classList.add("answer-result");

    const verifyBtn = document.createElement("button");
    verifyBtn.classList.add("check-btn");
    verifyBtn.textContent = "Verify";
    verifyBtn.addEventListener("click", () => {
      const userAns = input.value.trim();
      ansResult.style.display = "block";
      if (!userAns) {
        ansResult.className = "answer-result incorrect";
        ansResult.textContent = "😞 Please type an answer!";
        return;
      }
      if (!item.a) {
        ansResult.className = "answer-result incorrect";
        ansResult.textContent = "❔ Answer not provided";
      } else if (userAns.toLowerCase() === item.a.toLowerCase()) {
        ansResult.className = "answer-result correct";
        ansResult.textContent = "😊 Correct!";
      } else {
        ansResult.className = "answer-result incorrect";
        ansResult.textContent = "😞 Incorrect!";
      }
    });

    const revealBtn = document.createElement("button");
    revealBtn.classList.add("reveal-btn");
    revealBtn.textContent = "🤔 Reveal Answer";
    const ansDisplay = document.createElement("div");
    ansDisplay.classList.add("answer-display");
    ansDisplay.style.display = "none";
    ansDisplay.textContent = item.a ? `Answer: ${item.a}` : "Answer not provided";

    revealBtn.addEventListener("click", () => {
      if (ansDisplay.style.display === "none" || ansDisplay.style.display === "") {
        ansDisplay.style.display = "block";
        revealBtn.textContent = "😮 Hide Answer";
      } else {
        ansDisplay.style.display = "none";
        revealBtn.textContent = "🤔 Reveal Answer";
      }
    });

    ansSection.appendChild(input);
    ansSection.appendChild(verifyBtn);
    ansSection.appendChild(revealBtn);
    ansSection.appendChild(ansResult);
    ansSection.appendChild(ansDisplay);

    qInfo.appendChild(qNum);
    qInfo.appendChild(qText);
    qInfo.appendChild(ansSection);

    // Status panel (with favorite and StriderChat)
    const statusPanel = document.createElement("div");
    statusPanel.classList.add("status-panel");

    const statusSelect = document.createElement("select");
    statusSelect.classList.add("question-status");
    statusSelect.setAttribute("data-index", index);
    const statuses = ["unsolved", "solved", "revisit"];
    statuses.forEach(status => {
      const opt = document.createElement("option");
      opt.value = status;
      opt.textContent = status.charAt(0).toUpperCase() + status.slice(1);
      statusSelect.appendChild(opt);
    });
    const storedStatus = localStorage.getItem(`status-${topKey}-${subKey}-${index}`) || "unsolved";
    statusSelect.value = storedStatus;
    statusSelect.addEventListener("change", () => updateQuestionStatus(statusSelect));

    const favoriteBtn = document.createElement("button");
    favoriteBtn.classList.add("favorite-btn");
    favoriteBtn.setAttribute("data-index", index);
    const favorites = JSON.parse(localStorage.getItem(`favorites-${topKey}-${subKey}`) || "[]");
    if (favorites.includes(index)) {
      favoriteBtn.setAttribute("data-favorited", "true");
      favoriteBtn.textContent = "★";
    } else {
      favoriteBtn.setAttribute("data-favorited", "false");
      favoriteBtn.textContent = "☆";
    }
    favoriteBtn.addEventListener("click", () => toggleFavorite(favoriteBtn));

    const striderChatLink = document.createElement("a");
    striderChatLink.href = "striderchat.html";
    striderChatLink.classList.add("striderchat-btn");
    striderChatLink.textContent = "StriderChat";

    statusPanel.appendChild(statusSelect);
    statusPanel.appendChild(favoriteBtn);
    statusPanel.appendChild(striderChatLink);

    card.appendChild(qInfo);
    card.appendChild(statusPanel);
    container.appendChild(card);
  });
}

/** Update question status */
function updateQuestionStatus(select) {
  const index = parseInt(select.getAttribute("data-index"));
  const status = select.value;
  localStorage.setItem(`status-${topKey}-${currentSubChapter}-${index}`, status);
}

/** Toggle favorite status */
function toggleFavorite(btn) {
  const index = parseInt(btn.getAttribute("data-index"));
  const favoritesKey = `favorites-${topKey}-${currentSubChapter}`;
  let favorites = JSON.parse(localStorage.getItem(favoritesKey) || "[]");

  if (favorites.includes(index)) {
    favorites = favorites.filter(i => i !== index);
    btn.setAttribute("data-favorited", "false");
    btn.textContent = "☆";
  } else {
    favorites.push(index);
    btn.setAttribute("data-favorited", "true");
    btn.textContent = "★";
  }

  localStorage.setItem(favoritesKey, JSON.stringify(favorites));
  if (document.getElementById("statusFilter").value === "favorite") {
    updateQuestionVisibility();
  }
}

/** Update question visibility based on search and filter */
function updateQuestionVisibility() {
  const searchQuery = document.getElementById("searchInput").value.toLowerCase();
  const filter = document.getElementById("statusFilter").value;
  const cards = document.querySelectorAll(".question-card");
  cards.forEach((card, index) => {
    const dataSearch = card.getAttribute("data-search") || "";
    const statusKey = `status-${topKey}-${currentSubChapter}-${index}`;
    const status = localStorage.getItem(statusKey) || "unsolved";
    const favorites = JSON.parse(localStorage.getItem(`favorites-${topKey}-${currentSubChapter}`) || "[]");
    const isFavorited = favorites.includes(index);

    const passesSearch = searchQuery === "" || dataSearch.includes(searchQuery);
    let passesFilter = true;
    if (filter === "solved") {
      passesFilter = status === "solved";
    } else if (filter === "unsolved") {
      passesFilter = status === "unsolved";
    } else if (filter === "revisit") {
      passesFilter = status === "revisit";
    } else if (filter === "favorite") {
      passesFilter = isFavorited;
    }

    card.style.display = passesSearch && passesFilter ? "flex" : "none";
  });
}

/** Search questions */
function searchQuestions() {
  updateQuestionVisibility();
}

/** Clear search */
function clearSearch() {
  document.getElementById("searchInput").value = "";
  updateQuestionVisibility();
}

/** Filter questions by status */
function filterQuestionsByStatus(value) {
  updateQuestionVisibility();
}

/** Toggle Notebook */
function toggleNotebook() {
  notebookVisible = !notebookVisible;
  document.getElementById("notebookPanel").style.display = notebookVisible ? "block" : "none";
}

/** Save/Load notebook per sub-chapter */
function saveNotebookForSubChapter(subKey) {
  if (!subKey) return;
  const text = document.getElementById("notebookArea").value;
  localStorage.setItem(`notebook-${topKey}-${subKey}-guest`, text);
}
function loadNotebookForSubChapter(subKey) {
  if (!subKey) return;
  const saved = localStorage.getItem(`notebook-${topKey}-${subKey}-guest`);
  document.getElementById("notebookArea").value = saved || "";
}

/** Scroll to top */
function scrollToTop() {
  const quizC = document.getElementById("quizContainer");
  const mainC = document.getElementById("questionsContainer");
  if (quizC.style.display !== "none") {
    quizC.scroll({ top: 0, behavior: "smooth" });
  } else {
    mainC.scroll({ top: 0, behavior: "smooth" });
  }
}

/** Scroll to bottom */
function scrollToBottom() {
  const quizC = document.getElementById("quizContainer");
  const mainC = document.getElementById("questionsContainer");
  if (quizC.style.display !== "none") {
    quizC.scroll({ top: quizC.scrollHeight, behavior: "smooth" });
  } else {
    mainC.scroll({ top: mainC.scrollHeight, behavior: "smooth" });
  }
}

/** PDF generation with notebook */
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFillColor(230, 245, 255);
  doc.rect(0, 0, 210, 297, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 0, 0);
  const brandText = document.getElementById("brandTitleEl").textContent || "NexusHub / ???";
  doc.text(brandText, 10, 15);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 255);
  const subChTitle = currentSubChapter ? currentSubChapter.toUpperCase() : "SUBCHAPTER";
  doc.text(`- ${subChTitle}`, 10, 30);

  let yPos = 45;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);

  const cards = document.querySelectorAll(".question-card");
  cards.forEach((card, index) => {
    const qNumEl = card.querySelector(".question-number");
    const qTextEl = card.querySelector(".question-text");
    const ansEl = card.querySelector(".answer-display");

    const qNum = qNumEl ? qNumEl.textContent : `Question ${index+1}`;
    const qText = qTextEl ? qTextEl.textContent : "";
    const ansText = ansEl ? ansEl.textContent : "Answer not provided";

    const questionLines = doc.splitTextToSize(`${qNum}: ${qText}`, 180);
    doc.text(questionLines, 15, yPos);
    yPos += questionLines.length * 6 + 3;

    doc.setTextColor(0, 128, 0);
    doc.setFont("helvetica", "bold");
    const answerLines = doc.splitTextToSize(ansText, 180);
    doc.text(answerLines, 15, yPos);
    yPos += answerLines.length * 6 + 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);

    if (yPos > 270) {
      doc.addPage();
      yPos = 45;
    }
  });

  doc.addPage();
  doc.setFontSize(16);
  doc.text("Notebook", 10, 15);
  doc.setFontSize(12);
  const notebookText = document.getElementById("notebookArea").value;
  const splitText = doc.splitTextToSize(notebookText, 180);
  doc.text(splitText, 10, 25);

  doc.save(`${brandText}_${subChTitle}.pdf`);
}

/** Start Quiz */
function startQuiz() {
  document.getElementById("questionsContainer").style.display = "none";
  document.getElementById("quizContainer").style.display = "block";
  document.getElementById("quizSummary").style.display = "none";
  document.querySelector(".quiz-question-card").style.display = "block";

  if (!subChapterData) {
    alert("No sub-chapter data found. Please pick a valid sub-chapter first.");
    return;
  }
  quizData = JSON.parse(JSON.stringify(subChapterData)).map(q => ({
    ...q,
    userAnswer: "",
    status: "unanswered",
    timeSpent: 0
  }));
  shuffleArray(quizData);
  quizIndex = 0;
  correctCount = 0;
  incorrectCount = 0;
  skippedCount = 0;
  overallTimer = 0;
  questionTimer = 0;

  if (quizInterval) clearInterval(quizInterval);
  quizInterval = setInterval(() => {
    overallTimer++;
    document.getElementById("overallTimer").textContent = `Overall Time: ${overallTimer}s`;
  }, 1000);

  if (questionInterval) clearInterval(questionInterval);
  questionInterval = setInterval(() => {
    questionTimer++;
    document.getElementById("questionTimer").textContent = `Question Time: ${questionTimer}s`;
  }, 1000);

  loadQuizQuestion(quizIndex);
  updateQuizStats();
  updateQuizProgressBar();
}

/** End Quiz */
function endQuiz() {
  if (quizInterval) clearInterval(quizInterval);
  if (questionInterval) clearInterval(questionInterval);
  document.querySelector(".quiz-question-card").style.display = "none";
  document.getElementById("quizSummary").style.display = "block";
  populateQuizSummary();
  renderSummaryChart();
}

/** Back to Questions */
function backToQuestions() {
  document.getElementById("quizContainer").style.display = "none";
  document.getElementById("questionsContainer").style.display = "block";
}

/** Load Quiz Question */
function loadQuizQuestion(idx) {
  const questionEl = document.getElementById("quizQuestion");
  const ansInput = document.getElementById("quizAnswerInput");
  const ansStatus = document.getElementById("quizAnswerStatus");
  const ansCorrectEl = document.getElementById("quizCorrectAnswer");
  const revealBtn = document.getElementById("revealBtn");
  const verifyBtn = document.getElementById("verifyBtn");
  const skipBtn = document.getElementById("skipBtn");
  const nextBtn = document.getElementById("nextBtn");

  questionTimer = 0;
  document.getElementById("questionTimer").textContent = `Question Time: 0s`;

  if (idx >= quizData.length) {
    questionEl.textContent = "No more questions!";
    ansInput.style.display = "none";
    ansStatus.style.display = "block";
    ansStatus.className = "answer-status correct";
    ansStatus.textContent = "All done!";
    ansCorrectEl.style.display = "none";
    revealBtn.style.display = "none";
    verifyBtn.style.display = "none";
    skipBtn.style.display = "none";
    nextBtn.style.display = "none";
    endQuiz();
    return;
  }

  let qData = quizData[idx];
  questionEl.textContent = qData.q;
  ansInput.style.display = "inline-block";
  ansInput.value = "";
  ansStatus.style.display = "none";
  ansCorrectEl.style.display = "none";
  revealBtn.style.display = "none";
  verifyBtn.style.display = "inline-block";
  skipBtn.style.display = "inline-block";
  nextBtn.style.display = "none";
  updateQuizProgressBar();
}

/** Update Quiz Stats */
function updateQuizStats() {
  document.getElementById("quizProgress").textContent = `Question ${quizIndex+1}/${quizData.length}`;
  document.getElementById("quizCorrect").textContent = `Correct: ${correctCount}`;
  document.getElementById("quizIncorrect").textContent = `Incorrect: ${incorrectCount}`;
  document.getElementById("quizSkipped").textContent = `Skipped: ${skippedCount}`;
}

/** Update Quiz Progress Bar */
function updateQuizProgressBar() {
  const progressFill = document.getElementById("quizProgressFill");
  const progress = (quizIndex / quizData.length) * 100;
  progressFill.style.width = `${progress}%`;
}

/** Verify Quiz Answer */
function verifyQuizAnswer() {
  if (quizIndex >= quizData.length) return;
  const ansInput = document.getElementById("quizAnswerInput");
  const ansStatus = document.getElementById("quizAnswerStatus");
  const revealBtn = document.getElementById("revealBtn");
  const verifyBtn = document.getElementById("verifyBtn");
  const skipBtn = document.getElementById("skipBtn");
  const nextBtn = document.getElementById("nextBtn");

  let userAns = ansInput.value.trim();
  let qData = quizData[quizIndex];

  ansStatus.style.display = "block";
  ansStatus.className = "answer-status";

  if (qData.status !== "unanswered") {
    ansStatus.classList.add("incorrect");
    ansStatus.textContent = "This question was already answered or skipped.";
    return;
  }

  if (!userAns) {
    ansStatus.classList.add("incorrect");
    ansStatus.textContent = "😞 Please type an answer!";
    return;
  }

  qData.userAnswer = userAns;
  qData.timeSpent = questionTimer;

  if (!qData.a) {
    ansStatus.classList.add("incorrect");
    ansStatus.textContent = "❔ Answer not provided by system";
    qData.status = "noanswer";
    incorrectCount++;
  } else if (userAns.toLowerCase() === qData.a.toLowerCase()) {
    ansStatus.classList.add("correct");
    ansStatus.textContent = "😊 Correct!";
    qData.status = "correct";
    correctCount++;
  } else {
    ansStatus.classList.add("incorrect");
    ansStatus.textContent = "😞 Incorrect!";
    qData.status = "incorrect";
    incorrectCount++;
  }

  revealBtn.style.display = "inline-block";
  verifyBtn.style.display = "none";
  skipBtn.style.display = "none";
  nextBtn.style.display = "inline-block";
  updateQuizStats();
}

/** Reveal Quiz Answer */
function revealQuizAnswer() {
  if (quizIndex >= quizData.length) return;
  const ansCorrectEl = document.getElementById("quizCorrectAnswer");
  const revealBtn = document.getElementById("revealBtn");
  let qData = quizData[quizIndex];

  if (ansCorrectEl.style.display === "none" || ansCorrectEl.style.display === "") {
    ansCorrectEl.style.display = "block";
    revealBtn.textContent = "😮 Hide Answer";
    ansCorrectEl.textContent = qData.a ? `Answer: ${qData.a}` : "Answer not provided";
  } else {
    ansCorrectEl.style.display = "none";
    revealBtn.textContent = "Reveal";
  }
}

/** Skip Quiz Question */
function skipQuizQuestion() {
  if (quizIndex >= quizData.length) return;
  const ansStatus = document.getElementById("quizAnswerStatus");
  let qData = quizData[quizIndex];

  if (qData.status === "unanswered") {
    skippedCount++;
    qData.status = "skipped";
    qData.timeSpent = questionTimer;
    qData.userAnswer = "";
    ansStatus.style.display = "block";
    ansStatus.className = "answer-status incorrect";
    ansStatus.textContent = "You skipped this question.";
  }
  nextQuizQuestion();
}

/** Next Quiz Question */
function nextQuizQuestion() {
  quizIndex++;
  loadQuizQuestion(quizIndex);
  updateQuizStats();
}

/** Populate Quiz Summary */
function populateQuizSummary() {
  document.getElementById("summaryTotalTime").textContent = `Total Time: ${overallTimer}s`;
  document.getElementById("summaryCorrect").textContent = `Correct: ${correctCount}`;
  document.getElementById("summaryIncorrect").textContent = `Incorrect: ${incorrectCount}`;
  document.getElementById("summarySkipped").textContent = `Skipped: ${skippedCount}`;
  const attempted = correctCount + incorrectCount;
  const accuracy = attempted > 0 ? (correctCount / attempted * 100).toFixed(2) : 0;
  document.getElementById("summaryAccuracy").textContent = `Accuracy: ${accuracy}%`;

  const summaryQuestions = document.querySelector(".summary-questions");
  summaryQuestions.innerHTML = "";
  quizData.forEach((q, index) => {
    const qDiv = document.createElement("div");
    qDiv.classList.add("summary-question");
    if (q.status === "correct") {
      qDiv.classList.add("correct");
    } else if (q.status === "incorrect") {
      qDiv.classList.add("incorrect");
    } else if (q.status === "skipped") {
      qDiv.classList.add("skipped");
    }
    qDiv.innerHTML = `
      <p><strong>Question ${index+1}:</strong> ${q.q}</p>
      <p><strong>Your Answer:</strong> ${q.userAnswer || "N/A"}</p>
      <p><strong>Correct Answer:</strong> ${q.a || "N/A"}</p>
      <p><strong>Status:</strong> ${q.status}</p>
      <p><strong>Time Spent:</strong> ${q.timeSpent}s</p>
    `;
    summaryQuestions.appendChild(qDiv);
  });
}

/** Render Summary Chart */
function renderSummaryChart() {
  const ctx = document.getElementById('summaryChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Correct', 'Incorrect', 'Skipped'],
      datasets: [{
        label: 'Quiz Results',
        data: [correctCount, incorrectCount, skippedCount],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/** Utility => shuffle array in place */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}