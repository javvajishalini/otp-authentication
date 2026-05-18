const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

/* FORCE IPV4 */
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");

dotenv.config();

const app = express();
app.set("trust proxy", 1);

/* =========================
   MIDDLEWARE
========================= */

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "secretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/* =========================
   MONGODB
========================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* =========================
   USER MODEL
========================= */

const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  otp: String
}));

/* =========================
   GOOGLE AUTH
========================= */

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
  async (accessToken, refreshToken, profile, done) => {
    try {

      let user = await User.findOne({
        email: profile.emails[0].value
      });

      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value
        });
      }

      return done(null, user);

    } catch (err) {
      console.log(err);
    }
  }));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

/* =========================
   GOOGLE ROUTES
========================= */

app.get("/auth/login/success", (req, res) => {

  if (req.user) {

    res.status(200).json({
      success: true,
      user: req.user
    });

  } else {

    res.status(401).json({
      success: false
    });

  }
});

/* FORCE ACCOUNT CHOOSER */

app.get("/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

app.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/"
  }),
  (req, res) => {

    const frontendUrl =
      process.env.NODE_ENV === "production" &&
        process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL
        : "http://localhost:5173";

    res.redirect(`${frontendUrl}/dashboard`);
  }
);

/* LOGOUT */

app.get("/auth/logout", (req, res) => {

  req.logout(() => {

    req.session.destroy(() => {

      res.redirect(process.env.FRONTEND_URL);

    });

  });
});

/* =========================
   REGISTER
========================= */

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.post("/register", authLimiter, async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {

      return res.status(400).json({
        message: "All fields required"
      });

    }

    let user = await User.findOne({ email });
    if (user) {
      if (!user.password) {
        // User exists from Google Sign In, add the password so they can use Email/Password flow
        user.password = await bcrypt.hash(password, 10);
        await user.save();
        return res.status(201).json({ message: "Password added to existing account! You can now Sign In." });
      } else {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({
      message: "Registered Successfully"
    });

  } catch (err) {

    console.log("REGISTER ERROR:", err);

    res.status(500).json({
      message: "Registration Failed"
    });

  }
});

/* =========================
   SEND OTP
========================= */

app.post("/send-otp", authLimiter, async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message: "User not found"
      });

    }

    if (!user.password) {

      return res.status(400).json({
        message: "Use Google Sign In"
      });

    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {

      return res.status(400).json({
        message: "Wrong password"
      });

    }

    const otp = crypto.randomInt(100000, 999999).toString();

    user.otp = otp;

    await user.save();

    /* FIXED NODEMAILER TO EMAILJS */
    
    const emailJsPayload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: email,
        message: `Your OTP is ${otp}`,
        otp: otp
      }
    };

    const emailJsResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailJsPayload)
    });

    if (!emailJsResponse.ok) {
      const errorText = await emailJsResponse.text();
      console.log("EMAILJS ERROR:", errorText);
      return res.status(500).json({ message: "OTP Failed" });
    }

    res.json({
      message: "OTP Sent Successfully"
    });

  } catch (err) {

    console.log("OTP ERROR:", err);

    res.status(500).json({
      message: "OTP Failed"
    });

  }
});

/* =========================
   VERIFY OTP
========================= */

app.post("/verify-otp", async (req, res) => {

  try {

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message: "User not found"
      });

    }

    if (user.otp !== otp) {

      return res.status(400).json({
        message: "Invalid OTP"
      });

    }

    user.otp = "";

    await user.save();

    res.json({
      message: "Login Successful",
      user
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "OTP Verification Failed"
    });

  }
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});