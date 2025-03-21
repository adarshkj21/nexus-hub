document.addEventListener("DOMContentLoaded", function () {
  // ---------------------------
  // Preloader Removal
  // ---------------------------
  const preloader = document.getElementById("preloader");
  if (preloader) {
    window.addEventListener("load", function () {
      preloader.style.opacity = "0";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 500);
    });
  }

  // ---------------------------
  // Check if user is already logged in
  // ---------------------------
  // For guest login, we store token as "guest"
  const token = localStorage.getItem("token");
  const storedUsername = localStorage.getItem("username");
  if (token && storedUsername) {
    showDashboard(storedUsername);
  }

  // ---------------------------
  // Toggle between Login & Sign Up
  // ---------------------------
  const loginFormSection = document.getElementById("login-form-section");
  const signupFormSection = document.getElementById("signup-form-section");
  const showSignupLink = document.getElementById("show-signup-link");
  const backToLoginBtn = document.getElementById("back-to-login");

  if (showSignupLink) {
    showSignupLink.addEventListener("click", function (e) {
      e.preventDefault();
      loginFormSection.style.display = "none";
      signupFormSection.style.display = "block";
    });
  }
  if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", function () {
      signupFormSection.style.display = "none";
      loginFormSection.style.display = "block";
    });
  }

  // ---------------------------
  // Sign Up Form Submission
  // ---------------------------
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const username = document.getElementById("signup-username").value.trim();
      const password = document.getElementById("signup-password").value.trim();
      const confirmPass = document.getElementById("signup-confirm").value.trim();

      if (!username || !password || !confirmPass) {
        alert("Please fill all fields!");
        return;
      }
      if (password !== confirmPass) {
        alert("Passwords do not match!");
        return;
      }

      try {
        const res = await fetch("https://nexus-hub-q9hx.onrender.com/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          const errorText = await res.text();
          throw new Error(`Sign Up Failed: ${errorText}`);
        }
        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username);
        showDashboard(data.user.username);
      } catch (error) {
        console.error("Sign Up Error:", error);
        alert(`Sign Up Error: ${error.message}`);
      }
    });
  }

  // ---------------------------
  // Login Form Submission
  // ---------------------------
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const usernameInput = document.getElementById("username");
      const passwordInput = document.getElementById("password");
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        alert("Please enter both username and password.");
        return;
      }

      try {
        const res = await fetch("http://localhost:5004/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          const errorText = await res.text();
          throw new Error(`Login Failed: ${errorText}`);
        }
        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username);
        showDashboard(data.user.username);
      } catch (error) {
        console.error("Login Error:", error);
        alert(`Login Error: ${error.message}`);
      }
    });
  }

  // ---------------------------
  // Guest Login
  // ---------------------------
  const guestButton = document.getElementById("guest-login-button");
  if (guestButton) {
    guestButton.addEventListener("click", function () {
      // Set token as "guest" so that refreshing persists guest login
      localStorage.setItem("token", "guest");
      localStorage.setItem("username", "Guest");
      showDashboard("Guest");
    });
  }

  // ---------------------------
  // Show Dashboard Function
  // ---------------------------
  function showDashboard(user) {
    // Set dashboard username elements
    const userNameEl = document.getElementById("user-name");
    const dashNameEl = document.getElementById("dashboard-username");
    if (userNameEl) userNameEl.textContent = user;
    if (dashNameEl) dashNameEl.textContent = user;
    // Hide login container, show dashboard
    const loginContainer = document.getElementById("login-container");
    const dashboard = document.getElementById("dashboard");
    if (loginContainer) loginContainer.style.display = "none";
    if (dashboard) dashboard.style.display = "block";
  }

  // ---------------------------
  // Search Functionality
  // ---------------------------
  const searchButton = document.getElementById("search-button");
  if (searchButton) {
    searchButton.addEventListener("click", function () {
      const searchQuery = document.getElementById("search-input").value.trim();
      if (searchQuery !== "") {
        console.log(`Search query: ${searchQuery}`);
        alert(`Searching for: ${searchQuery}`);
        // Future: implement advanced search functionality here
      }
    });
  }

  // ---------------------------
  // Module Tile Navigation
  // ---------------------------
  const moduleTiles = document.querySelectorAll(".module-tile");
  moduleTiles.forEach((tile) => {
    tile.addEventListener("click", function () {
      const section = tile.getAttribute("data-section");
      switch (section) {
        case "learn":
          window.location.href = "learn.html";
          break;
        case "life":
          window.location.href = "life.html";
          break;
        case "striderchat":
          window.location.href = "striderchat.html";
          break;
        case "sandbox":
          alert("Entering Sandbox: Choose your tool (Scientific Calculator or Notebook)");
          break;
        default:
          console.log("Unknown module selected.");
      }
    });
  });

  // ---------------------------
  // Profile Dropdown Logout
  // ---------------------------
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.reload();
    });
  }

  // ---------------------------
  // Sandbox Tool Selection
  // ---------------------------
  const sandboxOptions = document.querySelectorAll(".sandbox-option");
  sandboxOptions.forEach((option) => {
    option.addEventListener("click", function (e) {
      e.preventDefault();
      const tool = option.getAttribute("data-tool");
      if (tool === "calculator") {
        alert("Launching Scientific Calculator...");
      } else if (tool === "notebook") {
        alert("Launching Notebook...");
      }
    });
  });
});
