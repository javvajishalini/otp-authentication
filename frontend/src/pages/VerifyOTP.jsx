import { useState } from "react";

import { useNavigate } from "react-router-dom";

import axios from "axios";

export default function VerifyOTP() {

  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  const verifyOTP = async () => {

    try {

      const email =
        localStorage.getItem("email");

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/verify-otp`,
        {
          email,
          otp,
        },
        { withCredentials: true }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      navigate("/dashboard");

    } catch (err) {

      alert(err.response?.data?.message || "Invalid OTP or network error");
    }
  };

  return (
    <div className="container">
      <div className="card">

        <h1>Verify OTP</h1>

        <input
          type="text"
          placeholder="Enter OTP"
          onChange={(e) =>
            setOtp(e.target.value)
          }
        />

        <button
          className="signin-btn"
          onClick={verifyOTP}
        >
          Verify OTP
        </button>

      </div>
    </div>
  );
}
