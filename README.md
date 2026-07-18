# OTP Authentication System

A full-stack web application that provides secure OTP (One-Time Password) based authentication along with Google OAuth integration.

## Features

- **User Registration** — Secure account creation with password hashing (bcryptjs)
- **OTP-based Login** — Users authenticate by receiving a One-Time Password via email
- **Email Delivery** — Integrated with **EmailJS** to reliably deliver OTPs to user email addresses
- **Google OAuth Login** — Alternative sign-in option using Google accounts (Passport.js)
- **Light/Dark Mode** — Seamless theme toggle on the frontend

## Tech Stack

### Frontend (`frontend/`)
- **React 19** + **Vite**
- **React Router DOM** (navigation)
- **Axios** (API requests)
- **Vanilla CSS** (light/dark theme via CSS variables)

### Backend (`backend/`)
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **EmailJS REST API** (email delivery)
- **bcryptjs** (password hashing)
- **Passport.js** + **passport-google-oauth20** (Google OAuth)
- **express-session**, **helmet**, **express-rate-limit**

## Project Structure

```
otp-authentication-1/
├── frontend/                  ← React + Vite (run on port 5173)
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── logo.jpg
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.jpg
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── eslint.config.js
│   ├── .env                   ← Copy from .env.example and fill in
│   └── .env.example
│
├── backend/                   ← Node.js + Express (run on port 5000)
│   ├── server.js
│   ├── package.json
│   ├── eslint.config.js
│   ├── .env                   ← Copy from .env.example and fill in
│   └── .env.example
│
└── README.md
```

---

## ⚡ Steps to Run

### Prerequisites
- **Node.js** v18+ installed → https://nodejs.org
- A **MongoDB Atlas** account → https://mongodb.com/atlas
- An **EmailJS** account → https://emailjs.com
- A **Google Cloud** project with OAuth credentials → https://console.cloud.google.com

---

### Step 1 — Set up the Backend

**1a. Copy assets from old directories to frontend (one-time step):**
> If you're running for the first time, copy image assets manually:
> - Copy everything from `src/assets/` → `frontend/src/assets/`
> - Copy everything from `public/` → `frontend/public/`

**1b. Open a terminal in the `backend/` folder:**
```bash
cd backend
```

**1c. Create the `.env` file:**
```bash
# Copy the example file
copy .env.example .env
```
Then open `backend/.env` and fill in your real values:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/otp-auth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
SESSION_SECRET=any_random_long_string
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
NODE_ENV=development
```

**1d. Install dependencies:**
```bash
npm install
```

**1e. Start the backend:**
```bash
npm run dev        # development (hot-reload with nodemon)
# OR
npm start          # production
```
✅ Backend will run at: **http://localhost:5000**

---

### Step 2 — Set up the Frontend

**2a. Open a NEW terminal in the `frontend/` folder:**
```bash
cd frontend
```

**2b. The `.env` file is pre-filled for local development:**
```env
VITE_BACKEND_URL=http://localhost:5000
```
> For production, change this to your deployed backend URL.

**2c. Install dependencies:**
```bash
npm install
```

**2d. Start the frontend:**
```bash
npm run dev
```
✅ Frontend will run at: **http://localhost:5173**

---

### Step 3 — Open the App

Visit **http://localhost:5173** in your browser.

---

## Errors Fixed

| Error | Fix |
|-------|-----|
| Missing `vite.config.js` | Created — frontend now starts correctly |
| Duplicate React frontend inside `backend/` | Removed — clean separation |
| `backend/package.json` had unused `nodemailer`, `resend`, `mongodb` | Removed — cleaner deps |
| Google OAuth `callbackURL` was relative | Fixed — now uses `BACKEND_URL` env var |
| Logout crash if `FRONTEND_URL` was undefined | Fixed — falls back to `localhost:5173` |
| No input validation on `/send-otp` and `/verify-otp` | Added validation |
| `MONGO_URI` undefined caused confusing crash | Added startup check with clear error message |

## Deployment

- **Frontend** → Deploy `frontend/` to **Vercel**
  - Set `VITE_BACKEND_URL=https://your-backend.onrender.com` in Vercel env vars
- **Backend** → Deploy `backend/` to **Render**
  - Set all `.env` variables in Render's environment settings
  - Set `FRONTEND_URL=https://your-app.vercel.app`
  - Set `BACKEND_URL=https://your-backend.onrender.com`
  - Set `NODE_ENV=production`