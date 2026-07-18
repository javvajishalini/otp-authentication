import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch profile from backend using session
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/profile`, {
        withCredentials: true,
      })
      .then((res) => {
        const fetchedUser = res.data.user;
        setUser(fetchedUser);
        setName(fetchedUser.name || "");
        setLoading(false);
      })
      .catch(() => {
        // If not authenticated, redirect to login
        navigate("/login");
      });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/profile`,
        { name, password },
        { withCredentials: true }
      );
      alert("Profile updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <div className="card">
        <h1>Profile Settings</h1>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
          />
          <label>Password (change not persisted in demo)</label>
          <input
            type="password"
            value={password}
            placeholder="New password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="signin-btn" type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
}
