import React from "react";
import { useNavigate } from "react-router-dom";


import logo from "../assets/logo.jpg";

export default function Home() {

  const navigate = useNavigate();

  return (
    <React.Fragment>
      <div className="container">

        <div className="card">
          <div className="logo-container">
            <img src={logo} alt="OTP logo" className="app-logo" />
          </div>

        <h1>OTP Authentication System</h1>

        <p>
          Secure access with one-time passcodes
        </p>

        <button
          className="signin-btn"
          onClick={() => navigate("/login")}
        >
          Sign In
        </button>

        <button
          className="google-btn"
          onClick={() =>
            window.location.href =
              `${import.meta.env.VITE_BACKEND_URL}/auth/google`
          }
        >
          Sign in with Google
        </button>

        <p className="bottom-text">
          Don't have an account?{" "}

          <span
            onClick={() => navigate("/register")}
          >
            Create one
          </span>
        </p>

      </div>
    </div>
    </React.Fragment>
  );
}
