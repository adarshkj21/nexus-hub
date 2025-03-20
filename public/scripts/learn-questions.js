/****************************************************************************
  learn-questions.js - Updated to load data from the backend API
  This file now fetches chapter data from the backend instead of using static data.
  
  Expected Backend API endpoint: GET /api/chapters
  (You can filter on the backend if desired; here we fetch all and filter on the client.)
  
  The page will read localStorage for "diversion" and "section" (set via learn.html)
  and then look for the chapter that matches. The matching chapter’s subChapters 
  will be used to populate the sub-chapter dropdown and to load questions.
  
  All other features (notebook, status panel, search, quiz mode, PDF generation, etc.)
  remain the same.
****************************************************************************/

let topKey = "";  // will be built from fetched data (e.g. "cat_quant")
let currentChapterData = null; // the chapter object fetched from backend that matches
let currentSubChapter = ""; // e.g., "percentage"
let subChapterData = null;  // array of questions for the chosen sub-chapter
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

/** On page load, fetch chapter data from the backend **/
window.addEventListener("DOMContentLoaded", async () => {
  // Apply dark mode if user preference exists
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  // Read diversion and section from localStorage (set from learn.html)
  const diversion = (localStorage.getItem("diversion") || "cat").toLowerCase();
  const section = (localStorage.getItem("section") || "quant").toLowerCase();
  topKey = `${diversion}_${section}`;  // e.g. "cat_quant"

  // Fetch all chapters from the backend
  try {
    const res = await fetch("https://nexus-hub-q9hx.onrender.com/api/chapters");
    const chapters = await res.json();
    // Filter chapters by diversion and section (case-insensitive)
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

  // Build brand title using the fetched chapter data
  // Expected fields: currentChapterData.diversion, .section, and subChapters
  const brandDiv = currentChapterData.diversion.toUpperCase();
  const brandSec = currentChapterData.section.toUpperCase();
  const brandTitleEl = document.getElementById("brandTitleEl");
  // "NexusHub" is always clickable to index.html; the diversion and section link back to learn.html with query parameters.
  brandTitleEl.innerHTML = `
    <a href="index.html" style="color: #ffcc00; text-decoration: none;">NexusHub</a>
    / <a href="learn.html?diversion=${diversion}" style="color: #ffcc00; text-decoration: none;">${brandDiv}</a>
    / <a href="learn.html?diversion=${diversion}&section=${section}" style="color: #ffcc00; text-decoration: none;">${brandSec}</a>
  `;

  // Populate the sub-chapter dropdown using currentChapterData.subChapters.
  fillSubChapterDropdown();
  // Load the first sub-chapter by default
  const firstSub = Object.keys(currentChapterData.subChapters)[0];
  loadSubChapter(firstSub);
  loadNotebookForSubChapter(firstSub);

  // Save notebook on input changes
  document.getElementById("notebookArea").addEventListener("input", () => {
    saveNotebookForSubChapter(currentSubChapter);
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

/** onSubChapterChange: Save old notebook, load new sub-chapter and its notebook */
function onSubChapterChange(newSub) {
  saveNotebookForSubChapter(currentSubChapter);
  loadSubChapter(newSub);
  loadNotebookForSubChapter(newSub);
}

/** loadSubChapter: Build question cards for the selected sub-chapter */
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
    // Save searchable text
    card.setAttribute("data-search", (item.q + " " + (item.a || "")).toLowerCase());

    // Left side: question info
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
    // AskStriderChat button
    const askBtn = document.createElement("button");
    askBtn.classList.add("ask-btn");
    askBtn.textContent = "AskStriderChat";
    askBtn.addEventListener("click", () => {
      askStriderChat(item.q);
    });
    ansSection.appendChild(input);
    ansSection.appendChild(verifyBtn);
    ansSection.appendChild(revealBtn);
    ansSection.appendChild(askBtn);
    ansSection.appendChild(ansResult);
    ansSection.appendChild(ansDisplay);

    qInfo.appendChild(qNum);
    qInfo.appendChild(qText);
    qInfo.appendChild(ansSection);

    // Right side: status panel with clickable emoji boxes
    const statusPanel = document.createElement("div");
    statusPanel.classList.add("status-panel");
    const stTitle = document.createElement("h4");
    stTitle.textContent = "Status";
    statusPanel.appendChild(stTitle);
    const stOptions = document.createElement("div");
    stOptions.classList.add("status-options");
    const statuses = [
      { key: "solved", emoji: "✅", bgClass: "solved" },
      { key: "unsolved", emoji: "❌", bgClass: "unsolved" },
      { key: "revisit", emoji: "⚠️", bgClass: "revisit" }
    ];
    statuses.forEach(st => {
      const box = document.createElement("div");
      box.classList.add("status-box", st.bgClass);
      box.textContent = st.emoji;
      // Unique key: "status-{topKey}-{subKey}-{index}"
      const storeKey = `status-${topKey}-${subKey}-${index}`;
      if (localStorage.getItem(storeKey) === st.key) {
        box.classList.add("active");
      }
      box.addEventListener("click", () => {
        localStorage.setItem(storeKey, st.key);
        stOptions.querySelectorAll(".status-box").forEach(b => b.classList.remove("active"));
        box.classList.add("active");
      });
      stOptions.appendChild(box);
    });
    statusPanel.appendChild(stOptions);

    card.appendChild(qInfo);
    card.appendChild(statusPanel);
    container.appendChild(card);
  });
}

/** AskStriderChat placeholder function */
function askStriderChat(questionText) {
  console.log(`Pretend opening StriderChat with:
"${questionText}
Please give answer."`);
}

/** Save and load notebook per sub-chapter (key: notebook-{topKey}-{subKey}-guest) */
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

/** Search functionality: Filter question cards by keyword */
function searchQuestions() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".question-card");
  cards.forEach(card => {
    const dataSearch = card.getAttribute("data-search") || "";
    card.style.display = (query === "" || dataSearch.includes(query)) ? "flex" : "none";
  });
}

/** Clear search */
function clearSearch() {
  document.getElementById("searchInput").value = "";
  const cards = document.querySelectorAll(".question-card");
  cards.forEach(card => {
    card.style.display = "flex";
  });
}

/** Toggle notebook visibility */
function toggleNotebook() {
  notebookVisible = !notebookVisible;
  document.getElementById("notebookPanel").style.display = notebookVisible ? "block" : "none";
}

/** Scroll buttons: Scroll visible container (questions or quiz) */
function scrollToTop() {
  const quizC = document.getElementById("quizContainer");
  const mainC = document.getElementById("questionsContainer");
  if (quizC.style.display !== "none") {
    quizC.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    mainC.scrollTo({ top: 0, behavior: "smooth" });
  }
}
function scrollToBottom() {
  const quizC = document.getElementById("quizContainer");
  const mainC = document.getElementById("questionsContainer");
  if (quizC.style.display !== "none") {
    quizC.scrollTo({ top: quizC.scrollHeight, behavior: "smooth" });
  } else {
    mainC.scrollTo({ top: mainC.scrollHeight, behavior: "smooth" });
  }
}

/** PDF generation: Improved layout with spacing and lines */
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
  doc.text(`- ${subChTitle}`, 10, 25);

  let yPos = 35;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  
  const container = document.getElementById("questionsContainer");
  const cards = container.querySelectorAll(".question-card");
  cards.forEach((card, index) => {
    const qNumEl = card.querySelector(".question-number");
    const qTextEl = card.querySelector(".question-text");
    const ansEl = card.querySelector(".answer-display");
    const qNum = qNumEl ? qNumEl.textContent : `Question ${index+1}`;
    const qText = qTextEl ? qTextEl.textContent : "";
    const ansText = ansEl ? ansEl.textContent : "Answer not provided";
    
    // Draw separator line
    doc.setDrawColor(150, 150, 150);
    doc.line(10, yPos - 2, 200, yPos - 2);
    
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
      doc.setFillColor(230, 245, 255);
      doc.rect(0, 0, 210, 297, "F");
      yPos = 35;
    }
  });
  doc.save(`${brandText}_${subChTitle}.pdf`);
}

/** QUIZ Mode: Use subChapterData to build quiz questions */
function startQuiz() {
  document.getElementById("questionsContainer").style.display = "none";
  document.getElementById("quizContainer").style.display = "block";
  document.getElementById("quizRestartContainer").style.display = "none";
  
  if (!subChapterData) {
    alert("No sub-chapter data found. Please pick a valid sub-chapter first.");
    return;
  }
  quizData = JSON.parse(JSON.stringify(subChapterData));
  shuffleArray(quizData);
  quizData.forEach(q => { q.finalState = "unanswered"; });
  
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
}

function endQuiz() {
  document.getElementById("quizContainer").style.display = "none";
  document.getElementById("questionsContainer").style.display = "block";
  if (quizInterval) clearInterval(quizInterval);
  if (questionInterval) clearInterval(questionInterval);
}

function loadQuizQuestion(idx) {
  const questionEl = document.getElementById("quizQuestion");
  const ansInput = document.getElementById("quizAnswerInput");
  const ansStatus = document.getElementById("quizAnswerStatus");
  const ansCorrectEl = document.getElementById("quizCorrectAnswer");
  const revealBtn = document.getElementById("revealBtn");
  const verifyBtn = document.getElementById("verifyBtn");
  const skipBtn = document.getElementById("skipBtn");
  const nextBtn = document.getElementById("nextBtn");
  const restartContainer = document.getElementById("quizRestartContainer");
  
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
    if (quizInterval) clearInterval(quizInterval);
    if (questionInterval) clearInterval(questionInterval);
    restartContainer.style.display = "block";
    return;
  }
  
  restartContainer.style.display = "none";
  let qData = quizData[quizIndex];
  questionEl.textContent = qData.q;
  ansInput.style.display = "inline-block";
  ansInput.value = "";
  ansStatus.style.display = "none";
  ansStatus.textContent = "";
  ansCorrectEl.style.display = "none";
  ansCorrectEl.textContent = "";
  revealBtn.style.display = "none";
  verifyBtn.style.display = "inline-block";
  skipBtn.style.display = "inline-block";
  nextBtn.style.display = "none";
}

function updateQuizStats() {
  document.getElementById("quizProgress").textContent = `Question ${quizIndex+1}/${quizData.length}`;
  document.getElementById("quizCorrect").textContent = `Correct: ${correctCount}`;
  document.getElementById("quizIncorrect").textContent = `Incorrect: ${incorrectCount}`;
  document.getElementById("quizSkipped").textContent = `Skipped: ${skippedCount}`;
}

function verifyQuizAnswer() {
  if (quizIndex >= quizData.length) return;
  const ansInput = document.getElementById("quizAnswerInput");
  const ansStatus = document.getElementById("quizAnswerStatus");
  const ansCorrectEl = document.getElementById("quizCorrectAnswer");
  const revealBtn = document.getElementById("revealBtn");
  const verifyBtn = document.getElementById("verifyBtn");
  const skipBtn = document.getElementById("skipBtn");
  const nextBtn = document.getElementById("nextBtn");
  
  let userAns = ansInput.value.trim();
  let qData = quizData[quizIndex];
  
  ansStatus.style.display = "block";
  ansStatus.className = "answer-status";
  
  if (qData.finalState && qData.finalState !== "unanswered") {
    ansStatus.classList.add("incorrect");
    ansStatus.textContent = "This question was already answered or skipped.";
    return;
  }
  
  if (!userAns) {
    ansStatus.classList.add("incorrect");
    ansStatus.textContent = "😞 Please type an answer!";
    return;
  }
  
  if (!qData.a) {
    ansStatus.classList.add("incorrect");
    ansStatus.textContent = "❔ Answer not provided by system";
    qData.finalState = "noanswer";
  } else if (userAns.toLowerCase() === qData.a.toLowerCase()) {
    ansStatus.classList.add("correct");
    ansStatus.textContent = "😊 Correct!";
    correctCount++;
    qData.finalState = "correct";
    skipBtn.style.display = "none";
  } else {
    ansStatus.classList.add("incorrect");
    ansStatus.textContent = "😞 Incorrect!";
    incorrectCount++;
    qData.finalState = "incorrect";
    skipBtn.style.display = "none";
  }
  
  revealBtn.style.display = "inline-block";
  verifyBtn.style.display = "none";
  nextBtn.style.display = "inline-block";
  
  updateQuizStats();
}

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

function skipQuizQuestion() {
  if (quizIndex >= quizData.length) return;
  const ansStatus = document.getElementById("quizAnswerStatus");
  let qData = quizData[quizIndex];
  
  if (qData.finalState === "unanswered") {
    skippedCount++;
    qData.finalState = "skipped";
    ansStatus.style.display = "block";
    ansStatus.className = "answer-status incorrect";
    ansStatus.textContent = "You skipped this question.";
  } else {
    ansStatus.style.display = "block";
    ansStatus.className = "answer-status incorrect";
    ansStatus.textContent = "You already answered/skipped this question.";
  }
  nextQuizQuestion();
}

function nextQuizQuestion() {
  quizIndex++;
  loadQuizQuestion(quizIndex);
  updateQuizStats();
}

/** Restart Quiz button calls startQuiz() again */
function restartQuiz() {
  startQuiz();
}

/** Utility: Shuffle an array */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* End of file */
