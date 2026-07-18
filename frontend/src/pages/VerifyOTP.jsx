import { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import axios from "axios";

export default function VerifyOTP() {

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();
  const password = state?.password || "";

  useEffect(() => {
    // If they reloaded the page, send them back to login to get their password
    if (!password) {
      navigate("/");
      return;
    }

    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, password, navigate]);

  const verifyOTP = async () => {

    try {

      const email =
        localStorage.getItem("email");

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/verify-otp`,
        {
          email,
          otp,
        },
        { withCredentials: true }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      navigate("/dashboard");

    } catch (err) {

      alert(err.response?.data?.message || "Invalid OTP or network error");
    }
  };

  const resendOTP = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      const email = localStorage.getItem("email");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/send-otp`,
        { email, password },
        { withCredentials: true }
      );
      setTimer(60);
      setCanResend(false);
      alert("OTP Resent Successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container">
      <div className="card">

        <h1>Verify OTP</h1>

        <input
          type="text"
          placeholder="Enter OTP"
          onChange={(e) =>
            setOtp(e.target.value)
          }
        />

        <button
          className="signin-btn"
          onClick={verifyOTP}
        >
          Verify OTP
        </button>

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          {canResend ? (
            <button 
              onClick={resendOTP} 
              disabled={resending}
              style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "14px", textDecoration: "underline", padding: "0" }}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          ) : (
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>
              Resend OTP in {timer}s
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
