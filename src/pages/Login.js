import { useState, useContext } from "react";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {
  auth,
  googleProvider,
  db,
} from "../firebase/firebase";

import { FaMoon, FaSun } from "react-icons/fa";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { useNavigate, Link } from "react-router-dom";

import { ThemeContext } from "../context/ThemeContext";

function Login() {
  const navigate = useNavigate();

  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ENSURE USER PROFILE EXISTS
  const ensureUserProfile = async (user, type) => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        authType: type,
        createdAt: serverTimestamp(),
      });
    }

    // update last login
    await setDoc(
      userRef,
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      await ensureUserProfile(result.user, "email");

      alert("Login Successful ✅");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);

      await ensureUserProfile(result.user, "google");

      alert("Google Login Successful ✅");
      navigate("/dashboard");
    } catch (error) {
      if (error.code !== "auth/cancelled-popup-request") {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={darkMode ? "auth-page dark" : "auth-page"}>
      <button
        type="button"
        className="global-theme-btn"
        onClick={toggleTheme}
      >
        {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
      </button>

      <div className="auth-left">
        <h1>Expense Tracker</h1>
        <p>Track expenses and manage budgets easily.</p>
      </div>

      <div className="auth-right">
        <form className="modern-form" onSubmit={handleLogin}>
          <h2>Welcome Back 👋</h2>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>

          <p>
            Don't have account? <Link to="/signup">Signup</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login; 