// learn.js - Handles diversion and section selection for the Learn Module

window.addEventListener('DOMContentLoaded', function() {
  // references
  const diversionButtons = document.querySelectorAll('.diversion-btn');
  const sectionSection = document.getElementById('sectionSection');
  const sectionOptionsContainer = document.getElementById('sectionOptions');
  const backToDiversionBtn = document.getElementById('backToDiversion');
  const proceedSection = document.getElementById('proceedSection');
  const proceedBtn = document.getElementById('proceedBtn');

  let selectedDiversion = '';
  let selectedSection = '';

  // Mapping for sections by diversion
  // e.g. "cat" => ["quant", "lrdi", "varc"]
  // e.g. "bank" => ["bank_quant", "bank_reasoning", "bank_english"]
  // e.g. "mlai" => ["mlfoundation", "advancedai"]
  const sectionsMapping = {
    cat: [
      { display: "QUANT", value: "quant" },
      { display: "LRDI", value: "lrdi" },
      { display: "VARC", value: "varc" }
    ],
    bank: [
      { display: "BANK-QUANT", value: "bank_quant" },
      { display: "BANK-REASONING", value: "bank_reasoning" },
      { display: "BANK-ENGLISH", value: "bank_english" }
    ],
    mlai: [
      { display: "MLFOUNDATION", value: "mlfoundation" },
      { display: "ADVANCEDAI", value: "advancedai" }
    ]
  };

  // When a diversion button is clicked
  diversionButtons.forEach(button => {
    button.addEventListener('click', function() {
      selectedDiversion = this.getAttribute('data-diversion');
      // store chosen diversion
      localStorage.setItem('diversion', selectedDiversion);
      // populate section options
      populateSectionOptions(selectedDiversion);
      // hide diversion, show section
      document.querySelector('.diversion-section').style.display = 'none';
      sectionSection.style.display = 'block';
      proceedSection.style.display = 'none';
    });
  });

  function populateSectionOptions(diversion) {
    sectionOptionsContainer.innerHTML = '';
    if (sectionsMapping[diversion]) {
      sectionsMapping[diversion].forEach(sec => {
        const btn = document.createElement('button');
        btn.classList.add('section-btn');
        btn.textContent = sec.display;
        btn.setAttribute('data-section', sec.value);
        btn.addEventListener('click', function() {
          selectedSection = this.getAttribute('data-section');
          localStorage.setItem('section', selectedSection);
          // highlight
          document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          // show proceed
          proceedSection.style.display = 'block';
        });
        sectionOptionsContainer.appendChild(btn);
      });
    }
  }

  // Back to diversion
  backToDiversionBtn.addEventListener('click', function() {
    sectionSection.style.display = 'none';
    proceedSection.style.display = 'none';
    document.querySelector('.diversion-section').style.display = 'block';
  });

  // proceed
  proceedBtn.addEventListener('click', function() {
    if (!selectedSection) {
      alert("Please select a section before proceeding.");
      return;
    }
    // go to learn-questions
    window.location.href = "learn-questions.html";
  });
});
