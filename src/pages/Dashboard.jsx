import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try to fetch session from backend (for Google OAuth)
        const res = await axios.get("https://otp-authentication-3.onrender.com/auth/login/success", {
          withCredentials: true,
        });
        
        if (res.data.success) {
          setUser(res.data.user);
          setLoading(false);
          return;
        }
      } catch (err) {
        // If API session fails, fallback to localStorage (for OTP login)
        const localUser = JSON.parse(localStorage.getItem("user"));
        if (localUser) {
          setUser(localUser);
          setLoading(false);
        } else {
          // Not logged in, redirect to login
          navigate("/login");
        }
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Welcome Back</h1>
        <h2>{user?.name}</h2>
        <div className="verified">
          ✅ Verified Successfully
        </div>
      </div>
    </div>
  );
}