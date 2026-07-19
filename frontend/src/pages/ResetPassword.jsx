import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import logo from "../assets/logo.jpg";

export default function ResetPassword() {
  const navigate = useNavigate();
  const email = localStorage.getItem("reset_email");
  
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const resetPassword = async () => {
    if (!email) {
      toast.error("Email not found. Please start the reset process again.");
      navigate("/forgot-password");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/reset-password`,
        { email, otp, newPassword },
        { withCredentials: true }
      );

      localStorage.removeItem("reset_email");
      toast.success("Password reset successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="top-left-nav">
          <Link to="/forgot-password" className="back-arrow">
            ← Back
          </Link>
        </div>

        <div className="card">
          <img src={logo} alt="Logo" className="app-logo" style={{ marginBottom: "20px" }} />
          
          <h1>Reset Password</h1>
          <p className="subtitle">Enter the OTP and your new password.</p>

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

          <div className="input-group">
            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button
            className="signin-btn"
            onClick={resetPassword}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Set New Password"}
          </button>
        </div>
      </div>
    </>
  );
}
