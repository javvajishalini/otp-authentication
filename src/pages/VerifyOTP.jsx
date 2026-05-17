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
        "https://otp-authentication-3.onrender.com/verify-otp",
        {
          email,
          otp,
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      navigate("/dashboard");

    } catch (err) {

      alert("Invalid OTP");
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