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
    // Login Functionality
    // ---------------------------
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const usernameInput = document.getElementById("username");
        let username = usernameInput.value.trim();
        if (!username) {
          username = "User";
        }
        document.getElementById("user-name").textContent = username;
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
      });
    }
  
    // Guest Login
    const guestButton = document.getElementById("guest-login-button");
    if (guestButton) {
      guestButton.addEventListener("click", function () {
        document.getElementById("user-name").textContent = "Guest";
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
      });
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
            alert(
              "Entering Sandbox: Choose your tool (Scientific Calculator or Notebook)"
            );
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
        // Future: clear session data if needed
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
  