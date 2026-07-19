import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";

export default function Header() {
  return (
    <header className="app-header">
      <Link to="/" title="Go to Home">
        <img src={logo} alt="OTP logo" className="app-logo" />
      </Link>
    </header>
  );
}
