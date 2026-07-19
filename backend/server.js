const express = require("express");
const fs = require("fs");
// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
const cors = require("cors");
const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const multer = require("multer");
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
// Serve uploaded profile pictures
app.use('/uploads', express.static('uploads'));

// Allow any localhost origin (dynamic port) and any configured FRONTEND_URL
app.use(cors({
  origin: function (origin, callback) {
    // If no origin (e.g., same‑origin request) allow
    if (!origin) {
      callback(null, true);
      return;
    }
    // Allow any http://localhost:* request (development)
    if (origin.startsWith('http://localhost:')) {
      callback(null, true);
      return;
    }
    // Allow explicitly configured FRONTEND_URL
    const allowed = process.env.FRONTEND_URL;
    if (allowed && origin === allowed) {
      callback(null, true);
      return;
    }
    // Disallow everything else
    callback(new Error('Not allowed by CORS'));
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

app.use(async (req, res, next) => {
  if (req.session && req.session.userId && !req.user) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) req.user = user;
    } catch (e) {}
  }
  next();
});

/* =========================
   MONGODB
========================= */

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/otp-auth";

if (!process.env.MONGO_URI) {
  console.log("⚠️ MONGO_URI not found in .env. Falling back to local MongoDB:", MONGO_URI);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB connection error. Make sure MongoDB is running locally!", err.message);
  });

/* =========================
   USER MODEL
========================= */

const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  otp: String,
  profilePic: String // Path to uploaded profile picture
}));

/* =========================
   GOOGLE AUTH
========================= */

const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/auth/google/callback`
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
        } else {
          // Update name to full Google Display Name if they had registered with a partial name earlier
          if (user.name !== profile.displayName) {
            user.name = profile.displayName;
            await user.save();
          }
        }
  
        return done(null, user);
  
      } catch (err) {
        console.error("Google auth error:", err);
        return done(err, null);
      }
    }));
} else {
  console.log("⚠️ GOOGLE_CLIENT_ID missing in .env. Google Sign-In will be disabled.");
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
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

app.get("/auth/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(400).send("Google Sign-In is not configured for local development. Please add GOOGLE_CLIENT_ID to your .env file.");
  }
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })(req, res, next);
});

app.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/"
  }),
  (req, res) => {

    // Determine where to send the user after a successful Google sign‑in.
    // Prefer the incoming request's origin (the frontend dev server),
    // fall back to FRONTEND_URL from .env, and finally to a hard‑coded default.
    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5178';
    res.redirect(`${origin}/dashboard`);
  }
);

/* LOGOUT */

app.get("/auth/logout", (req, res) => {

  req.logout(() => {

    req.session.destroy(() => {

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(frontendUrl);

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

    console.error("REGISTER ERROR:", err);

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

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

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

    /* EMAILJS REST API OR LOCAL MOCK */
    if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
      console.log(`\n======================================================`);
      console.log(`[LOCAL DEV] EmailJS credentials missing in .env`);
      console.log(`[LOCAL DEV] OTP for ${email} is: ${otp}`);
      console.log(`======================================================\n`);
      return res.json({ message: "OTP Generated (Check server console)" });
    }

    const emailJsPayload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: email,
        email: email,
        user_email: email,
        reply_to: email,
        message: `Your OTP is ${otp}`,
        otp: otp,
        OTP: otp,
        passcode: otp,
        time: new Date(Date.now() + 5 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    const emailJsResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailJsPayload)
    });

    if (!emailJsResponse.ok) {
      const errorText = await emailJsResponse.text();
      console.error("EMAILJS ERROR:", errorText);
      return res.status(500).json({ message: "OTP Failed" });
    }

    res.json({
      message: "OTP Sent Successfully"
    });

  } catch (err) {

    console.error("OTP ERROR:", err);

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

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message: "User not found"
      });

    }

    if (!user.otp || user.otp !== otp) {

      return res.status(400).json({
        message: "Invalid OTP"
      });

    }

    user.otp = "";

    await user.save();

      // Set session for OTP login
      req.session.userId = user._id;
      await req.session.save();
      res.json({
        message: "Login Successful",
        user
      });

  } catch (err) {

    console.error("VERIFY OTP ERROR:", err);

    res.status(500).json({
      message: "OTP Verification Failed"
    });

  }
});

/* =========================
   FORGOT PASSWORD OTP
========================= */

app.post("/forgot-password-otp", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.password) {
      return res.status(400).json({ message: "Account uses Google Sign-In" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    await user.save();

    /* EMAILJS REST API OR LOCAL MOCK */
    if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
      console.log(`\n======================================================`);
      console.log(`[LOCAL DEV] EmailJS credentials missing in .env`);
      console.log(`[LOCAL DEV] Password Reset OTP for ${email} is: ${otp}`);
      console.log(`======================================================\n`);
      return res.json({ message: "OTP Generated (Check server console)" });
    }

    const emailJsPayload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: email,
        email: email,
        user_email: email,
        reply_to: email,
        message: `Your password reset OTP is ${otp}`,
        otp: otp,
        OTP: otp,
        passcode: otp,
        time: new Date(Date.now() + 5 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    const emailJsResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailJsPayload)
    });

    if (!emailJsResponse.ok) {
      const errorText = await emailJsResponse.text();
      console.error("EMAILJS ERROR:", errorText);
      return res.status(500).json({ message: "OTP Failed" });
    }

    res.json({ message: "Password Reset OTP Sent" });
  } catch (err) {
    console.error("FORGOT OTP ERROR:", err);
    res.status(500).json({ message: "OTP Failed" });
  }
});

/* =========================
   RESET PASSWORD
========================= */

app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = "";
    await user.save();

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Password Reset Failed" });
  }
});

// Profile routes (protected)
app.get('/profile', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ user: req.user });
});

app.put('/profile', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { name, password } = req.body;
  if (name) req.user.name = name;
  if (password) req.user.password = await bcrypt.hash(password, 10);
  await req.user.save();
  res.json({ message: 'Profile updated', user: req.user });
});

// Profile picture upload route
const path = require('path');
// Configure multer to preserve original file extension
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });
app.post('/profile/picture', upload.single('picture'), async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const backendBase = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  // Store absolute URL
  req.user.profilePic = `${backendBase}/uploads/${req.file.filename}`;
  await req.user.save();
  res.json({ message: 'Profile picture updated', url: req.user.profilePic });
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});