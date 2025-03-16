// learn.js - Handles diversion and section selection for the Learn Module

window.addEventListener('DOMContentLoaded', function() {
  // Get references to elements
  const diversionButtons = document.querySelectorAll('.diversion-btn');
  const sectionSection = document.getElementById('sectionSection');
  const sectionOptionsContainer = document.getElementById('sectionOptions');
  const backToDiversionBtn = document.getElementById('backToDiversion');
  const proceedSection = document.getElementById('proceedSection');
  const proceedBtn = document.getElementById('proceedBtn');

  let selectedDiversion = '';
  let selectedSection = '';

  // Mapping for sections by diversion
  const sectionsMapping = {
    cat: ['Quant', 'LRDI', 'VARC'],
    bank: ['Bank Quant', 'Bank Reasoning', 'Bank English'],
    mlai: ['ML Foundation', 'Advanced AI']
  };

  // When a diversion button is clicked:
  diversionButtons.forEach(button => {
    button.addEventListener('click', function() {
      selectedDiversion = this.getAttribute('data-diversion');
      // Save chosen diversion to localStorage for later use
      localStorage.setItem('diversion', selectedDiversion);
      // Populate section options based on chosen diversion
      populateSectionOptions(selectedDiversion);
      // Hide the diversion selection and show section selection
      document.querySelector('.diversion-section').style.display = 'none';
      sectionSection.style.display = 'block';
    });
  });

  // Populate section options dynamically based on the chosen diversion
  function populateSectionOptions(diversion) {
    sectionOptionsContainer.innerHTML = ''; // Clear previous options
    if (sectionsMapping[diversion]) {
      sectionsMapping[diversion].forEach(section => {
        const btn = document.createElement('button');
        btn.classList.add('section-btn');
        btn.textContent = section;
        // Use a normalized value for storage (e.g., lowercase, underscores)
        btn.setAttribute('data-section', section.toLowerCase().replace(/\s/g, '_'));
        btn.addEventListener('click', function() {
          selectedSection = this.getAttribute('data-section');
          // Save chosen section to localStorage
          localStorage.setItem('section', selectedSection);
          // Provide visual feedback by marking this button as active
          document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          // Show the Proceed button section
          proceedSection.style.display = 'block';
        });
        sectionOptionsContainer.appendChild(btn);
      });
    }
  }

  // "Back" button: return to diversion selection
  backToDiversionBtn.addEventListener('click', function() {
    sectionSection.style.display = 'none';
    proceedSection.style.display = 'none';
    document.querySelector('.diversion-section').style.display = 'block';
  });

  // "Proceed to Questions" button: redirect to learn-questions.html
  proceedBtn.addEventListener('click', function() {
    if (!selectedSection) {
      alert("Please select a section before proceeding.");
      return;
    }
    // Now the learn-questions.html page can read the stored "diversion" and "section" values
    window.location.href = "learn-questions.html";
  });
});
