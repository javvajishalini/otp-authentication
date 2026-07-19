import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import logo from "../assets/logo.jpg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendResetOTP = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/forgot-password-otp`,
        { email },
        { withCredentials: true }
      );

      localStorage.setItem("reset_email", email);
      toast.success("Reset OTP sent successfully");
      navigate("/reset-password");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset OTP.");
    } finally {
      setLoading(false);
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
          
          <h1>Forgot Password</h1>
          <p className="subtitle">Enter your email to receive a reset code.</p>

          <div className="input-group">
            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            className="signin-btn"
            onClick={sendResetOTP}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </div>
      </div>
    </>
  );
}
