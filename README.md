# OTP Authentication System

A full-stack web application that provides a secure OTP (One-Time Password) based authentication system along with Google OAuth integration.

## Features

- **User Registration:** Secure account creation with password hashing (bcryptjs).
- **OTP-based Login:** Users authenticate by receiving a One-Time Password via email.
- **Email Delivery:** Integrated with **EmailJS** (replacing Nodemailer) to reliably deliver OTPs to user email addresses, bypassing strict cloud port restrictions.
- **Google OAuth Login:** Alternative sign-in option using Google accounts (Passport.js).
- **Light/Dark Mode Theme:** The frontend UI includes a seamless theme toggle for better user experience.

## Tech Stack

### Frontend
- **React 19**
- **Vite**
- **React Router DOM** (for navigation)
- **Axios** (for API requests)
- **CSS** (with CSS variables for light/dark theme)

### Backend
- **Node.js & Express.js**
- **MongoDB** & **Mongoose** (Database and ODM)
- **EmailJS API** (Email sending service via REST)
- **bcryptjs** (Password hashing)
- **Passport.js & passport-google-oauth20** (Google OAuth support)
- **Express-session**
- **Security:** `helmet` for HTTP headers, `express-rate-limit` for DDoS protection, and secure cookies.

## Project Structure

```
otp-authentication/
├── backend/               # Node.js Express backend
│   ├── .env               # Environment variables
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main Express server, database connection, and API routes
├── src/                   # React frontend
│   ├── App.jsx            # Application routing and Theme toggle
│   ├── index.css          # Global styles including light/dark theme variables
│   ├── main.jsx           # React entry point
│   └── ...components/pages
├── package.json           # Frontend dependencies
└── vite.config.js         # Vite configuration
```

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
SESSION_SECRET=your_session_secret
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
```

Start the backend server:
```bash
npm start
```

### 2. Frontend Setup

Open a new terminal and navigate to the project root directory:
```bash
npm install
```

Start the React development server:
```bash
npm run dev
```

## Recent Updates
- Migrated email delivery from Nodemailer to the **EmailJS REST API** to ensure reliable delivery in production environments (Render).
- Hardened backend security using `helmet`, `express-rate-limit`, and production-grade secure cookies.
- Deployed Frontend to **Vercel** and Backend to **Render**.
- Implemented Dark Mode / Light Mode theme toggle on the frontend.
- Added OTP email delivery and verification endpoints.
- Integrated MongoDB database for user management.
- Configured Google OAuth login strategy.