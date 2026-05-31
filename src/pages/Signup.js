import { useState, useContext } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { FaMoon, FaSun } from "react-icons/fa";

import {
  auth,
  googleProvider,
  db,
} from "../firebase/firebase";

import { setDoc, doc, serverTimestamp } from "firebase/firestore";

import { useNavigate, Link } from "react-router-dom";

import { ThemeContext } from "../context/ThemeContext";

function Signup() {
  const navigate = useNavigate();

  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // CREATE USER PROFILE
  const createUserProfile = async (user, type) => {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      authType: type,
      createdAt: serverTimestamp(),
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await createUserProfile(userCredential.user, "email");

      alert("Signup Successful ✅");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);

      await createUserProfile(result.user, "google");

      alert("Google Signup Successful ✅");
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
        <p>Create account and manage finances smarter.</p>
      </div>

      <div className="auth-right">
        <form className="modern-form" onSubmit={handleSignup}>
          <h2>Create Account 🚀</h2>

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
            {loading ? "Creating..." : "Signup"}
          </button>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleSignup}
          >
            Continue with Google
          </button>

          <p>
            Already have account? <Link to="/">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;