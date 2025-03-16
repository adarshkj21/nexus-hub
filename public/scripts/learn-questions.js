/****************************************************************************
  learn-questions.js
  * Data structure: "cat_quant" => subChapters => "percentage", "ratio", etc.
  * Brand Title => "NexusHub / CAT / QUANT" with clickable links
  * Sub-chapter dropdown => only for the chosen "cat_quant" or "bank_bank_quant"
  * Notebook => stored per "cat_quant_percentage" or "bank_bank_quant_ratio"
  * Status panel => clickable boxes (✅, ❌, ⚠️)
  * Scroll buttons => scroll container or quiz
****************************************************************************/

/** Example top-level data. Each key = "cat_quant", "cat_lrdi", etc.
    Inside each, we have brandDiversion, brandSection, and subChapters. 
*/
const data = {
    cat_quant: {
      brandDiversion: "CAT",
      brandSection: "QUANT",
      subChapters: {
        percentage: {
          name: "Percentage",
          questions: [
            { q: "Pct Q1: Some percentage question #1", a: "42" },
            { q: "Pct Q2: Another percentage question #2", a: "99" }
          ]
        },
        ratio: {
          name: "Ratio",
          questions: [
            { q: "Ratio Q1: Some ratio question #1", a: "1500" }
          ]
        }
      }
    },
    cat_lrdi: {
      brandDiversion: "CAT",
      brandSection: "LRDI",
      subChapters: {
        sets: {
          name: "Sets",
          questions: [
            { q: "LRDI sets Q1", a: "X" }
          ]
        }
      }
    },
    cat_varc: {
      brandDiversion: "CAT",
      brandSection: "VARC",
      subChapters: {
        reading: {
          name: "Reading",
          questions: [
            { q: "VARC Q1: Reading question #1", a: "Ok" }
          ]
        }
      }
    },
    bank_bank_quant: {
      brandDiversion: "BANK",
      brandSection: "BANK-QUANT",
      subChapters: {
        percentage: {
          name: "Bank Pct",
          questions: [
            { q: "Bank Pct Q1", a: "501" }
          ]
        },
        ratio: {
          name: "Bank Ratio",
          questions: [
            { q: "Bank Ratio Q1", a: "999" }
          ]
        }
      }
    },
    bank_bank_reasoning: {
      brandDiversion: "BANK",
      brandSection: "BANK-REASONING",
      subChapters: {
        puzzle: {
          name: "Puzzle",
          questions: [
            { q: "Puzzle Q1", a: "No" }
          ]
        }
      }
    },
    bank_bank_english: {
      brandDiversion: "BANK",
      brandSection: "BANK-ENGLISH",
      subChapters: {
        grammar: {
          name: "Grammar",
          questions: [
            { q: "Grammar Q1", a: "Yes" }
          ]
        }
      }
    },
    mlai_mlfoundation: {
      brandDiversion: "MLAI",
      brandSection: "MLFOUNDATION",
      subChapters: {
        basics: {
          name: "Basics",
          questions: [
            { q: "ML Basics Q1", a: "Answer" }
          ]
        }
      }
    },
    mlai_advancedai: {
      brandDiversion: "MLAI",
      brandSection: "ADVANCEDAI",
      subChapters: {
        dl: {
          name: "Deep Learning",
          questions: [
            { q: "DL Q1: Some advanced AI question #1", a: "Neural Net" }
          ]
        }
      }
    }
  };
  
  /** 
   * We read localStorage "diversion" & "section", e.g. "cat", "quant".
   * Build top-level key => "cat_quant".
   * Then we only show subChapters for that key (like "percentage", "ratio").
   */
  let topKey = "cat_quant"; // fallback
  let currentSubChapter = ""; // e.g. "percentage"
  let subChapterData = null; // actual question array we are displaying
  let notebookVisible = false;
  
  /** Dark mode, quiz variables, etc. */
  let quizData = [];
  let quizIndex = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let overallTimer = 0;
  let questionTimer = 0;
  let quizInterval = null;
  let questionInterval = null;
  
  /** On page load => read diversion & section, build brand title, fill subChapterSelect, load first sub-chapter by default. */
  window.addEventListener("DOMContentLoaded", () => {
    // Dark mode preference
    const darkPref = localStorage.getItem("darkMode");
    if (darkPref === "true") {
      document.body.classList.add("dark-mode");
    }
  
    let diversion = localStorage.getItem("diversion") || "cat";
    let section = localStorage.getItem("section") || "quant";
    topKey = `${diversion}_${section}`.toLowerCase(); // e.g. "cat_quant"
  
    // If no data found, we fallback
    if (!data[topKey]) {
      // fallback if needed
      topKey = "cat_quant";
    }
  
    // Build brand title => "NexusHub / CAT / QUANT"
    let brandTitleEl = document.getElementById("brandTitleEl");
    let brandDiv = data[topKey].brandDiversion.toUpperCase();
    let brandSec = data[topKey].brandSection.toUpperCase();
    brandTitleEl.innerHTML = `
      <a href="index.html" style="color: #ffcc00; text-decoration: none;">NexusHub</a>
      / <a href="learn.html?diversion=${diversion}" style="color: #ffcc00; text-decoration: none;">${brandDiv}</a>
      / <a href="learn.html?diversion=${diversion}&section=${section}" style="color: #ffcc00; text-decoration: none;">${brandSec}</a>
    `;
  
    fillSubChapterDropdown();
    // pick first sub-chapter by default
    let firstSub = Object.keys(data[topKey].subChapters)[0];
    loadSubChapter(firstSub);
    loadNotebookForSubChapter(firstSub);
  
    // Notebook
    document.getElementById("notebookArea").addEventListener("input", () => {
      saveNotebookForSubChapter(currentSubChapter);
    });
  });
  
  /** Toggle dark mode => localStorage */
  function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark ? "true" : "false");
  }
  
  /** Fill subChapter dropdown => e.g. "percentage (2 Questions), ratio (1 Questions)..." */
  function fillSubChapterDropdown() {
    const subChSelect = document.getElementById("subChapterSelect");
    subChSelect.innerHTML = "";
    let subChs = data[topKey].subChapters; // e.g. { percentage: { name: "Percentage", questions: [...] }, ratio: {...} }
    for (let subKey in subChs) {
      let subObj = subChs[subKey];
      let count = subObj.questions.length;
      let opt = document.createElement("option");
      opt.value = subKey;
      opt.textContent = `${subObj.name} (${count} Questions)`;
      subChSelect.appendChild(opt);
    }
  }
  
  /** Called when user picks a new sub-chapter from the dropdown. */
  function onSubChapterChange(newSub) {
    // save old notebook
    saveNotebookForSubChapter(currentSubChapter);
    // load new sub-chapter
    loadSubChapter(newSub);
    loadNotebookForSubChapter(newSub);
  }
  
  /** Load sub-chapter => build question cards, e.g. data[topKey].subChapters[newSub].questions */
  function loadSubChapter(subKey) {
    currentSubChapter = subKey;
  
    const container = document.getElementById("questionsContainer");
    container.innerHTML = "";
  
    let subObj = data[topKey].subChapters[subKey];
    if (!subObj) {
      container.innerHTML = `<p>No data found for sub-chapter: ${subKey}</p>`;
      return;
    }
    subChapterData = subObj.questions; // the array we display
  
    subChapterData.forEach((item, index) => {
      // Card
      const card = document.createElement("div");
      card.classList.add("question-card");
  
      // left => question-info
      const qInfo = document.createElement("div");
      qInfo.classList.add("question-info");
  
      const qNum = document.createElement("div");
      qNum.classList.add("question-number");
      qNum.textContent = `Question ${index + 1}`;
  
      const qText = document.createElement("div");
      qText.classList.add("question-text");
      qText.textContent = item.q;
  
      // answer section
      const ansSection = document.createElement("div");
      ansSection.classList.add("answer-section");
  
      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("answer-input");
      input.placeholder = "Type your answer here...";
      // Press enter => verify
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          verifyBtn.click();
        }
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
      ansDisplay.textContent = item.a
        ? `Answer: ${item.a}`
        : "Answer not provided";
  
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
  
      // Right => status panel => clickable boxes
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
  
        // localStorage key => "status-cat_quant_percentage-index" for example
        let storeKey = `status-${topKey}-${subKey}-${index}`;
        let storedVal = localStorage.getItem(storeKey) || "";
        if (storedVal === st.key) {
          // highlight
          box.style.transform = "scale(1.15)";
          box.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";
        }
  
        box.addEventListener("click", () => {
          // store
          localStorage.setItem(storeKey, st.key);
          // un-highlight siblings
          stOptions.querySelectorAll(".status-box").forEach(b => {
            b.style.transform = "scale(1.0)";
            b.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
          });
          // highlight this
          box.style.transform = "scale(1.15)";
          box.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";
        });
  
        stOptions.appendChild(box);
      });
  
      statusPanel.appendChild(stOptions);
  
      card.appendChild(qInfo);
      card.appendChild(statusPanel);
  
      container.appendChild(card);
    });
  }
  
  /** 
   * We'll store the sub-chapter notebook as "notebook-cat_quant_percentage-guest"
   * So each sub-chapter has a separate notebook
   */
  function saveNotebookForSubChapter(subKey) {
    if (!subKey) return;
    let text = document.getElementById("notebookArea").value;
    localStorage.setItem(`notebook-${topKey}-${subKey}-guest`, text);
  }
  function loadNotebookForSubChapter(subKey) {
    if (!subKey) return;
    let saved = localStorage.getItem(`notebook-${topKey}-${subKey}-guest`);
    document.getElementById("notebookArea").value = saved || "";
  }
  
  /** 
   * When user picks a new sub-chapter from the dropdown 
   * => we save old notebook 
   * => load new sub-chapter 
   * => load new notebook 
   */
  function onSubChapterChange(newSub) {
    // save old sub-chapter
    saveNotebookForSubChapter(currentSubChapter);
    loadSubChapter(newSub);
    loadNotebookForSubChapter(newSub);
  }
  
  /** Notebook toggle */
  function toggleNotebook() {
    notebookVisible = !notebookVisible;
    let panel = document.getElementById("notebookPanel");
    panel.style.display = notebookVisible ? "block" : "none";
  }
  
  /** Scroll Up/Down => container or quiz */
  function scrollToTop() {
    let container = document.getElementById("questionsContainer");
    let quiz = document.getElementById("quizContainer");
    if (quiz.style.display !== "none") {
      quiz.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function scrollToBottom() {
    let container = document.getElementById("questionsContainer");
    let quiz = document.getElementById("quizContainer");
    if (quiz.style.display !== "none") {
      quiz.scrollTo({ top: quiz.scrollHeight, behavior: "smooth" });
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }
  
  /** PDF Generation => doc.splitTextToSize for sub-chapter questions */
  function generatePDF() {
    const { jsPDF } = window.jspdf; // from CDN
    const doc = new jsPDF("p", "mm", "a4");
  
    doc.setFillColor(230, 245, 255);
    doc.rect(0, 0, 210, 297, "F");
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 0, 0);
  
    // brand text from the header
    let brandText = document.getElementById("brandTitleEl").textContent || "NexusHub / ???";
    doc.text(`${brandText} - ${currentSubChapter.toUpperCase()}`, 10, 15);
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
  
    let yPos = 30;
    let container = document.getElementById("questionsContainer");
    let cards = container.querySelectorAll(".question-card");
  
    cards.forEach((card, index) => {
      const qNumEl = card.querySelector(".question-number");
      const qTextEl = card.querySelector(".question-text");
      const ansEl = card.querySelector(".answer-display");
  
      let qNum = qNumEl ? qNumEl.textContent : `Question ${index+1}`;
      let qText = qTextEl ? qTextEl.textContent : "";
      let ansText = ansEl ? ansEl.textContent : "Answer not provided";
  
      let questionLines = doc.splitTextToSize(`${qNum}: ${qText}`, 180);
      doc.text(questionLines, 15, yPos);
      yPos += questionLines.length * 5 + 3;
  
      doc.setTextColor(0, 100, 0);
      doc.setFont("helvetica", "bold");
      let answerLines = doc.splitTextToSize(ansText, 180);
      doc.text(answerLines, 15, yPos);
      yPos += answerLines.length * 5 + 8;
  
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
  
      if (yPos > 270) {
        doc.addPage();
        doc.setFillColor(230, 245, 255);
        doc.rect(0, 0, 210, 297, "F");
        yPos = 30;
      }
    });
  
    doc.save(`${brandText}_${currentSubChapter.toUpperCase()}.pdf`);
  }
  
  /** QUIZ Mode => we shuffle the sub-chapter data only */
  function startQuiz() {
    document.getElementById("questionsContainer").style.display = "none";
    document.getElementById("quizContainer").style.display = "block";
  
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
  
  function updateQuizStats() {
    document.getElementById("quizProgress").textContent = `Question ${quizIndex+1}/${quizData.length}`;
    document.getElementById("quizCorrect").textContent = `Correct: ${correctCount}`;
    document.getElementById("quizIncorrect").textContent = `Incorrect: ${incorrectCount}`;
    document.getElementById("quizSkipped").textContent = `Skipped: ${skippedCount}`;
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
      return;
    }
  
    let qData = quizData[idx];
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
      ansCorrectEl.textContent = qData.a
        ? `Answer: ${qData.a}`
        : "Answer not provided";
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
  