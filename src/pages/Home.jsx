import { useNavigate } from "react-router-dom";

export default function Home() {

  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="card">

        <div className="icon">🔒</div>

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
              "http://localhost:5000/auth/google"
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
