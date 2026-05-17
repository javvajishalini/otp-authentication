import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

export default function Home() {

  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="card">

        <img src={logo} alt="OTP Authentication Logo" className="logo" style={{ width: '80px', marginBottom: '10px' }} />

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
              "https://otp-authentication-3.onrender.com/auth/google"
          }
        >
          Sign in with Google
        </button>

        <p className="bottom-text">
          Don’t have an account?{" "}

          <span
            onClick={() => navigate("/register")}
          >
            Create one
          </span>
        </p>

      </div>
    </div>
  );
}
