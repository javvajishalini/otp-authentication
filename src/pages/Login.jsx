import { useState } from "react";

import { useNavigate } from "react-router-dom";

import axios from "axios";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");


  const sendOTP = async () => {

    try {

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/send-otp`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      localStorage.setItem("email", email);

      alert("OTP sent successfully");

      navigate("/verify");

    } catch (err) {

      alert(err.response?.data?.message || "Failed to send OTP. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="card">

        <button
          className="back"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

        <h1>Sign in to your account</h1>

        <p>
          We'll email you a 6-digit code
        </p>

        <input
          type="email"
          placeholder="you@example.com"
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="password"
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="signin-btn"
          onClick={sendOTP}
        >
          Send Code
        </button>

      </div>
    </div>
  );
}