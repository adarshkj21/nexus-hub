# NexusHub - The Grand Integrated Platform

Welcome to NexusHub – a one-of-a-kind, all-in-one personal platform designed to integrate advanced educational tools, life management, creative exploration, and AI assistance. Initially built for CAT exam preparation, this platform is engineered to grow into a comprehensive personal hub and public resource for learning, tracking, and creativity.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [File Structure](#file-structure)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API & Backend](#api--backend)
- [Deployment](#deployment)
- [Future Roadmap](#future-roadmap)
- [License](#license)

---

## Overview

NexusHub is designed to be a robust, dynamic platform that evolves with its user’s needs. Initially focusing on CAT exam preparation, it includes an interactive question bank, a dynamic learning module, a life-tracking dashboard (VIBE), and an AI-powered assistant (StriderChat). The platform is built with a premium and visually appealing interface, and is fully responsive across desktop, tablet, and mobile devices.

---

## Features

### Frontend

- **Home (Nexus Hub):**  
  - Engaging landing page with login, tiles, and a sandbox dropdown.
  - Interactive UI with animations, dynamic navigation, and a customizable layout.

- **Learn Module:**  
  - **Learn Selection:** Users choose a diversion (e.g., CAT, ML/AI, Bank Exam) and then a section.
  - **Learn Questions:**  
    - Dynamically loads questions based on user selections.
    - Premium UI with dynamic brand title (e.g., "NexusHub / CAT / QUANT") where every element is clickable.
    - Sub-chapter dropdown (e.g., "Percentage," "Ratio") to filter questions.
    - Integrated notebook for each sub-chapter.
    - Status panel with clear, clickable emoji boxes (✅ solved, ❌ unsolved, ⚠️ revisit).
    - Search functionality with a clear button.
    - Quiz mode with timers, on-page feedback, and a restart option.
    - PDF generation with text wrapping, color-coded sections, and structured layout.

- **StriderChat (Placeholder):**  
  - Dedicated link in the navigation.
  - "AskStriderChat" button to copy and initiate a chat (to be integrated with an AI API in future).

### Backend

- **RESTful API:**  
  - CRUD operations to manage your question bank (diversions, sections, sub-chapters, questions, and answers).
  - Built with Node.js, Express, and MongoDB (using Mongoose).

- **Data Management:**  
  - An admin-friendly API that lets you add, update, and delete content easily via Postman or a future dashboard.

---

## Technology Stack

- **Frontend:**  
  - HTML, CSS, JavaScript
  - Responsive design with custom animations and premium visuals

- **Backend:**  
  - Node.js with Express
  - MongoDB Atlas (free tier) for data storage
  - Mongoose for data modeling

- **APIs & Libraries:**  
  - jsPDF for generating PDFs
  - Gemini API (planned for StriderChat integration)
  - CORS, dotenv, and other supporting libraries

---

## File Structure

nexus-project/
├── public/
│   ├── index.html                // Landing page (Nexus Hub home)
│   ├── learn.html                // Learn module: Diversion & Section selection
│   ├── learn-questions.html      // Learn Questions page (dynamic questions, quiz, notebook, PDF, etc.)
│   ├── striderchat.html          // (Placeholder) StriderChat page
│   ├── styles/
│   │   ├── main.css              // General styles for the entire project
│   │   ├── learn.css             // Styles specific to learn.html
│   │   └── learn-questions.css   // Premium, detailed styles for learn-questions.html
│   ├── scripts/
│   │   ├── main.js               // General JavaScript for the project
│   │   ├── learn.js              // Logic for diversion/section selection (learn.html)
│   │   ├── learn-questions.js    // Loads questions, handles quiz mode, search, PDF generation, etc.
│   │   ├── striderchat.js        // (Placeholder) For StriderChat integration
│   │   └── jspdf.umd.min.js      // jsPDF library (can also be loaded via CDN)
│   └── assets/
│       ├── images/               // Images (profile pics, icons, etc.)
│       ├── fonts/                // Additional fonts (if any)
│       └── audio/                // Audio assets (if used)
├── server/
│   ├── config/
│   │   └── db.js                 // Database connection configuration (MongoDB/Mongoose)
│   ├── models/
│   │   └── quest.js              // Mongoose schema for chapters, sub-chapters, questions, etc.
│   ├── routes/
│   │   └── quest.js              // Express routes for CRUD operations on chapters
│   ├── index.js                  // Main server file (Express app entry point)
│   └── package.json              // Backend dependencies and scripts
├── docs/
│   ├── README.md                 // Project documentation (overview, installation, usage, roadmap)
│   └── features.md               // Detailed feature list and future roadmap
└── package.json                 // (Optional) Root package.json for global configurations

---

## Installation & Setup

### Frontend

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd nexus-project/public
Backend
Navigate to the server folder:
cd nexus-project/server

Install dependencies:
npm install

Create a .env file in the server directory with:

PORT=5004
MONGO_URI=<your-mongodb-connection-string>

Start the server:

For development:
npm run dev

For production:
npm start
