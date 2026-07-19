import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

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
      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('picture', file);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/profile/picture`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile picture updated');
      // Update local user state to reflect new picture URL
      setUser(prev => ({ ...prev, profilePic: res.data.url }));
    } catch (err) {
      toast.error('Failed to upload picture');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Profile Settings</h1>
        {user?.profilePic && (
          <img
            src={
              user.profilePic.startsWith('http')
                ? user.profilePic
                : `${import.meta.env.VITE_BACKEND_URL}${user.profilePic}`
            }
            alt="Profile"
            style={{ width: '150px', borderRadius: '50%', marginBottom: '1rem' }}
          />
        )}
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
          <label>Profile Picture</label>
          <input type="file" accept="image/*" onChange={handlePictureChange} />
          <button className="signin-btn" type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
}
