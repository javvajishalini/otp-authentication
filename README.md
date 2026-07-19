# OTP Authentication System

A full-stack web application that provides secure OTP (One-Time Password) based authentication along with Google OAuth integration and a premium, modern glassmorphism UI.

## Features

- **User Registration** — Secure account creation with password hashing (bcryptjs).
- **OTP-based Login** — Users authenticate by receiving a One-Time Password via email.
- **Password Reset Flow** — Complete "Forgot Password" feature allowing users to securely reset their passwords via OTP.
- **Email Delivery** — Integrated with **EmailJS** to reliably deliver OTPs to user email addresses.
- **Google OAuth Login** — Alternative sign-in option using Google accounts (Passport.js).
- **Premium UI/UX** — Fully responsive glassmorphism design with modern typography, smooth animations, and interactive elements.
- **Light/Dark Mode** — Seamless theme toggle on the frontend.

## Tech Stack

### Frontend (`frontend/`)
- **React 19** + **Vite**
- **React Router DOM** (navigation)
- **Axios** (API requests)
- **Vanilla CSS** (light/dark theme via CSS variables, glassmorphism)

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
│   │   ├── components/
│   │   │   └── Header.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Profile.jsx
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
├── .gitignore
├── README.md
└── vercel.json
```

*(Note: If you see duplicate React files like `src`, `public`, `package.json` in the root folder, they can be safely deleted. The app strictly runs from `frontend/` and `backend/`.)*

---

## ⚡ Steps to Run

### Prerequisites
- **Node.js** v18+ installed → https://nodejs.org
- A **MongoDB Atlas** account → https://mongodb.com/atlas
- An **EmailJS** account → https://emailjs.com
- A **Google Cloud** project with OAuth credentials → https://console.cloud.google.com

---

### Step 1 — Set up the Backend

**1a. Open a terminal in the `backend/` folder:**
```bash
cd backend
```

**1b. Create the `.env` file:**
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

**1c. Install dependencies:**
```bash
npm install
```

**1d. Start the backend:**
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

## Deployment

- **Frontend** → Deploy `frontend/` to **Vercel**
  - Set `VITE_BACKEND_URL=https://your-backend.onrender.com` in Vercel env vars
- **Backend** → Deploy `backend/` to **Render**
  - Set all `.env` variables in Render's environment settings
  - Set `FRONTEND_URL=https://your-app.vercel.app`
  - Set `BACKEND_URL=https://your-backend.onrender.com`
  - Set `NODE_ENV=production`