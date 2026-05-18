import { useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

export default function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const registerUser = async () => {

    try {

      const response =
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/register`,
          form,
          { withCredentials: true }
        );

      alert(response.data.message);

      navigate("/login");

    } catch (err) {

      console.log(err);

      if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {

        alert(
          err.response.data.message
        );

      } else {

        alert("Registration failed");
      }
    }
  };

  return (

    <div className="container">

      <div className="card">

        <h1>Create Account</h1>

        <input
          type="text"
          placeholder="Name"

          value={form.name}

          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Email"

          value={form.email}

          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"

          value={form.password}

          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button
          className="signin-btn"
          onClick={registerUser}
        >
          Create Account
        </button>

      </div>

    </div>
  );
}