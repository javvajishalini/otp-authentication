import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/send-otp`,
        { email, password },
        { withCredentials: true }
      );

      localStorage.setItem("email", email);
      toast.success("OTP sent successfully");
      navigate("/verify", { state: { password } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="top-left-nav">
          <Link to="/" className="back-arrow">
            ← Back
          </Link>
        </div>

        <div className="card">
          <h1>Sign In</h1>
          <p className="subtitle">Sign in to receive a secure OTP.</p>

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

          <div className="input-group">
            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="signin-btn"
            onClick={sendOTP}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <Link to="/forgot-password" style={{ color: "var(--text-color)", fontSize: "14px", textDecoration: "underline", opacity: "0.8" }}>
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
