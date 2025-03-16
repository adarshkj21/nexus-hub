/****************************************************************************
  learn-questions.js (Updated to fix your requests)
  - 1) PDF: uses doc.splitTextToSize, includes answers, colorful layout
  - 2) Quiz mode uses the currently loaded chapter data, shuffles them
  - 3) One final outcome per question (correct/incorrect/skipped) in quiz
  - 4) Dark mode preference saved in localStorage
  - 5) On-page correctness messages (with emojis), no console pop-ups
****************************************************************************/

/** The chapter data remains the same as before, except we remove any separate quiz array. **/
const chapters = {
    percentage: {
      name: "Percentage",
      questions: [
        {
          q: "Q1: AB is a 2-digit prime number where A!=B. Reversed is prime. Sum of all such numbers? This question is quite long to test multiline splitting in PDF. We want to ensure it does not get cut off in the PDF. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          a: "50400"
        },
        {
          q: "Q2: If m is the # of prime numbers between 0 and 50, and n is the # of prime numbers between 50 and 100, what's (m-n)? Another line of text to ensure multiline wrap in PDF.",
          a: ""
        }
      ]
    },
    weighted_avg: {
      name: "Weighted Average & Allegation",
      questions: [
        { q: "WA Q1: Sample Weighted Average question? Possibly a multiline question here as well.", a: "42" },
        { q: "WA Q2: Another Weighted Average question, bigger text to test PDF wrapping.", a: "100" }
      ]
    },
    ratio_prop: {
      name: "Ratio & Proportion",
      questions: [
        {
          q: "RP Q1: A man divided a sum among four sons in ratio 5:7:8:3... Another line of text for testing PDF wrap.",
          a: "1500"
        }
      ]
    },
    essentials: {
      name: "Essentials",
      questions: [
        { q: "Essentials Q1: Some essential question, but with no official answer provided.", a: "" }
      ]
    }
  };
  
  /** Global variable to remember which chapter is currently loaded. **/
  let currentChapterKey = "percentage"; // default
  
  /** 
   * Dark mode + localStorage 
   * - If user chooses dark mode, we store "darkMode" = "true" in localStorage
   * - On page load, we read it and apply if needed
   */
  function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark ? "true" : "false");
  }
  
  /** 
   * PDF generation:
   * - Uses doc.splitTextToSize so no text is cut off
   * - Also includes "Answer: xyz" if provided
   * - Adds some color 
   */
  function generatePDF() {
    const { jsPDF } = window.jspdf; // from a valid CDN or local file
    const doc = new jsPDF("p", "mm", "a4");
  
    // A subtle background rectangle for color
    doc.setFillColor(230, 245, 255); 
    doc.rect(0, 0, 210, 297, "F"); // fill entire A4 page with a light color
  
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 0, 0); // bright red for the title
    doc.text("CAT/Quant - Questions with Answers", 10, 15);
  
    // Start listing questions
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
  
    let yPos = 30; // vertical position
    const container = document.getElementById("questionsContainer");
    const cards = container.querySelectorAll(".question-card");
  
    cards.forEach((card, index) => {
      // Grab question text
      const qNumEl = card.querySelector(".question-number");
      const qTextEl = card.querySelector(".question-text");
      const revealEl = card.querySelector(".answer-display"); // "Answer: xyz" or "Answer not provided"
  
      let qNum = qNumEl ? qNumEl.textContent : `Question ${index + 1}`;
      let qText = qTextEl ? qTextEl.textContent : "";
      let ansText = revealEl ? revealEl.textContent : "Answer not provided";
  
      // Prepare multiline
      let questionLines = doc.splitTextToSize(`${qNum}: ${qText}`, 180);
      doc.text(questionLines, 15, yPos);
      yPos += questionLines.length * 5 + 3; // some spacing
  
      // color for answer
      doc.setTextColor(0, 100, 0); // dark green
      doc.setFont("helvetica", "bold");
      let answerLines = doc.splitTextToSize(ansText, 180);
      doc.text(answerLines, 15, yPos);
      yPos += answerLines.length * 5 + 8;
  
      // revert text color
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
  
      // if we go near bottom, add new page
      if (yPos > 270) {
        doc.addPage();
        doc.setFillColor(230, 245, 255);
        doc.rect(0, 0, 210, 297, "F");
        yPos = 30;
      }
    });
  
    doc.save("CAT_Quant_Questions.pdf");
  }
  
  /** Scroll up/down */
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }
  
  /** Notebook logic */
  let notebookVisible = false;
  function toggleNotebook() {
    const panel = document.getElementById("notebookPanel");
    notebookVisible = !notebookVisible;
    panel.style.display = notebookVisible ? "block" : "none";
  }
  function saveNotebook() {
    const text = document.getElementById("notebookArea").value;
    localStorage.setItem("notebook-guest", text);
  }
  function loadNotebook() {
    const saved = localStorage.getItem("notebook-guest");
    if (saved) {
      document.getElementById("notebookArea").value = saved;
    }
  }
  
  /** Fill the chapter dropdown with "ChapterName (#Questions)" **/
  function fillChapterDropdown() {
    const chapterSelect = document.getElementById("chapterSelect");
    chapterSelect.innerHTML = "";
    for (const key in chapters) {
      const data = chapters[key];
      const count = data.questions.length;
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = `${data.name} (${count} Questions)`;
      chapterSelect.appendChild(opt);
    }
  }
  
  /** Load a chapter => build question cards (Normal Mode) **/
  function loadChapter(chapterKey) {
    currentChapterKey = chapterKey; // store globally so quiz can use same data
    const container = document.getElementById("questionsContainer");
    container.innerHTML = ""; // clear old
  
    if (!chapters[chapterKey]) {
      container.innerHTML = `<p>No data found for chapter: ${chapterKey}</p>`;
      return;
    }
    const data = chapters[chapterKey].questions;
  
    data.forEach((item, index) => {
      // Card
      const card = document.createElement("div");
      card.classList.add("question-card");
  
      // left side => question-info
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
  
      // input
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
  
      // On-page correctness display
      const ansResult = document.createElement("div");
      ansResult.classList.add("answer-result");
  
      // verify button
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
  
      // reveal button
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
  
      // right side => status panel
      const statusPanel = document.createElement("div");
      statusPanel.classList.add("status-panel");
  
      const stTitle = document.createElement("h4");
      stTitle.textContent = "Status";
      statusPanel.appendChild(stTitle);
  
      const stOptions = document.createElement("div");
      stOptions.classList.add("status-options");
  
      ["solved","unsolved","revisit"].forEach((val) => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `status-${chapterKey}-${index}`;
        radio.value = val;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(val));
        stOptions.appendChild(label);
  
        // load from localStorage
        const storedVal = localStorage.getItem(`status-${chapterKey}-${index}`) || "";
        if (storedVal === val) {
          radio.checked = true;
        }
        // save on change
        radio.addEventListener("change", () => {
          localStorage.setItem(`status-${chapterKey}-${index}`, val);
        });
      });
  
      statusPanel.appendChild(stOptions);
  
      // assemble card
      card.appendChild(qInfo);
      card.appendChild(statusPanel);
  
      container.appendChild(card);
    });
  }
  
  /** Shuffle an array in place (Fisher-Yates) */
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  /** QUIZ MODE data and logic, now uses the currently loaded chapter data */
  let quizData = []; // the shuffled array
  let quizIndex = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let overallTimer = 0;
  let questionTimer = 0;
  let quizInterval = null;
  let questionInterval = null;
  
  /** Start quiz => shuffle the currently loaded chapter's questions, use them */
  function startQuiz() {
    document.getElementById("questionsContainer").style.display = "none";
    document.getElementById("quizContainer").style.display = "block";
  
    // Grab the data from the current chapter
    if (!chapters[currentChapterKey]) {
      alert("No chapter data found. Please select a valid chapter first.");
      return;
    }
    // clone & shuffle
    quizData = JSON.parse(JSON.stringify(chapters[currentChapterKey].questions));
    shuffleArray(quizData);
  
    // add finalState = "unanswered" to each
    quizData.forEach(q => { q.finalState = "unanswered"; });
  
    // reset counters
    quizIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    skippedCount = 0;
    overallTimer = 0;
    questionTimer = 0;
  
    // start timers
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
    const ansCorrect = document.getElementById("quizCorrectAnswer");
    const revealBtn = document.getElementById("revealBtn");
    const verifyBtn = document.getElementById("verifyBtn");
    const skipBtn = document.getElementById("skipBtn");
    const nextBtn = document.getElementById("nextBtn");
  
    // reset question timer
    questionTimer = 0;
    document.getElementById("questionTimer").textContent = `Question Time: 0s`;
  
    if (idx >= quizData.length) {
      // no more questions
      questionEl.textContent = "No more questions!";
      ansInput.style.display = "none";
      ansStatus.style.display = "block";
      ansStatus.className = "answer-status correct";
      ansStatus.textContent = "All done!";
      ansCorrect.style.display = "none";
      revealBtn.style.display = "none";
      verifyBtn.style.display = "none";
      skipBtn.style.display = "none";
      nextBtn.style.display = "none";
      return;
    }
  
    // load question
    const qData = quizData[idx];
    questionEl.textContent = qData.q;
    ansInput.style.display = "inline-block";
    ansInput.value = "";
    ansStatus.style.display = "none";
    ansStatus.textContent = "";
    ansCorrect.style.display = "none";
    ansCorrect.textContent = "";
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
  
    const userAns = ansInput.value.trim();
    const qData = quizData[quizIndex];
  
    ansStatus.style.display = "block";
    ansStatus.className = "answer-status"; // reset classes
  
    // if finalState is not "unanswered", do not re-check
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
  
    // check correctness
    if (!qData.a) {
      ansStatus.classList.add("incorrect");
      ansStatus.textContent = "❔ Answer not provided by system";
      qData.finalState = "noanswer"; // we won't increment correct/incorrect
    } else if (userAns.toLowerCase() === qData.a.toLowerCase()) {
      ansStatus.classList.add("correct");
      ansStatus.textContent = "😊 Correct!";
      correctCount++;
      qData.finalState = "correct";
      skipBtn.style.display = "none"; // can't skip if correct
    } else {
      ansStatus.classList.add("incorrect");
      ansStatus.textContent = "😞 Incorrect!";
      incorrectCount++;
      qData.finalState = "incorrect";
      skipBtn.style.display = "none";
    }
  
    // show reveal button
    revealBtn.style.display = "inline-block";
    // hide verify
    verifyBtn.style.display = "none";
    // show next
    nextBtn.style.display = "inline-block";
  
    updateQuizStats();
  }
  
  function revealQuizAnswer() {
    if (quizIndex >= quizData.length) return;
    const ansCorrectEl = document.getElementById("quizCorrectAnswer");
    const revealBtn = document.getElementById("revealBtn");
    const qData = quizData[quizIndex];
  
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
    const qData = quizData[quizIndex];
  
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
  
  /** On page load => 
   * 1) read darkMode preference from localStorage
   * 2) fill chapters
   * 3) load default
   * 4) load notebook
   */
  window.addEventListener("DOMContentLoaded", () => {
    // apply dark mode if user had chosen it
    const darkPref = localStorage.getItem("darkMode");
    if (darkPref === "true") {
      document.body.classList.add("dark-mode");
    }
  
    fillChapterDropdown();
    loadChapter("percentage"); // default
    loadNotebook();
    document.getElementById("notebookArea").addEventListener("input", saveNotebook);
  });
  