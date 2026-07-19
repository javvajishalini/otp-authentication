import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpg";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useAuth();
  const password = state?.password || "";

  useEffect(() => {
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
    setVerifying(true);
    try {
      const email = localStorage.getItem("email");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      login(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP or network error");
    } finally {
      setVerifying(false);
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
      toast.success("OTP sent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="top-left-nav">
          <Link to="/login" className="back-arrow">
            ← Back
          </Link>
        </div>

        <div className="card">
          <img src={logo} alt="Logo" className="app-logo" style={{ marginBottom: "20px" }} />
          
          <h1>Verify OTP</h1>
          <p className="subtitle">Enter the 6-digit code sent to your email.</p>

          <div className="input-group">
            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <button
            className="signin-btn"
            onClick={verifyOTP}
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            {canResend ? (
              <button 
                onClick={resendOTP} 
                disabled={resending}
                className="bottom-text"
                style={{ background: "none", border: "none", color: "var(--text-color)", cursor: "pointer", fontSize: "14px", padding: "0" }}
              >
                <span>{resending ? "Sending..." : "Resend OTP"}</span>
              </button>
            ) : (
              <p style={{ fontSize: "14px", opacity: "0.8", margin: "0" }}>
                Resend OTP in {timer}s
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
