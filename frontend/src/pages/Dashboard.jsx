import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try to fetch session from backend (Google OAuth)
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/login/success`, {
          withCredentials: true,
        });
        if (res.data.success) {
          login(res.data.user);
          setLoading(false);
          return;
        }
        // Fallback to local storage (OTP flow)
        const localUser = JSON.parse(localStorage.getItem("user"));
        if (localUser) {
          login(localUser);
          setLoading(false);
        } else {
          navigate("/login");
        }
      } catch (err) {
        // Network or auth error, fallback to local storage
        const localUser = JSON.parse(localStorage.getItem("user"));
        if (localUser) {
          login(localUser);
          setLoading(false);
        } else {
          navigate("/login");
        }
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  // Fallback UI if user is not loaded
  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <h1>Welcome</h1>
          <p>No user data available. Please log in.</p>
          <button className="signin-btn" onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header />
      <div className="card">
        <h1>Welcome Back</h1>
        <h2>{user?.name ? user.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : ""}</h2>
        <div className="verified">
          ✅ Verified Successfully
        </div>
        <button className="signin-btn" onClick={() => {
            // Call backend logout route then navigate home
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, { withCredentials: true })
              .then(() => navigate('/'))
              .catch(() => navigate('/'));
          }}>
            Sign Out
          </button>
      </div>
    </div>
  );
}
