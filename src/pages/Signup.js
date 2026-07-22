// SIGNUP PAGE

import {
  useState,
  useContext,
} from "react";

import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {
  auth,
  googleProvider,
} from "../firebase/firebase";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import { toast } from "react-toastify";

import {
  FaEnvelope,
  FaLock,
  FaSun,
  FaMoon,
} from "react-icons/fa";

import {
  ThemeContext,
} from "../context/ThemeContext";

function Signup() {

  const navigate = useNavigate();

  const {
    darkMode,
    toggleTheme,
  } = useContext(ThemeContext);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // SIGNUP FUNCTION

  const handleSignup = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      toast.success(
        "Signup Successful"
      );

      navigate("/");

    } catch (error) {

      toast.error(error.message);

    } finally {

      setLoading(false);

    }
  };

  // GOOGLE SIGNUP

  const handleGoogleSignup =
    async () => {

      try {

        setLoading(true);

        await signInWithPopup(
          auth,
          googleProvider
        );

        toast.success(
          "Google Signup Successful"
        );

        navigate("/dashboard");

      } catch (error) {

        // IGNORE POPUP CLOSE ERROR

        if (
          error.code !==
          "auth/cancelled-popup-request"
        ) {

          toast.error(error.message);

        }

      } finally {

        setLoading(false);

      }
    };

  return (

    <div
      className={
        darkMode
          ? "auth-page dark"
          : "auth-page"
      }
    >

      {/* THEME BUTTON */}

      <button
        type="button"
        className="global-theme-btn"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >

        {
          darkMode

            ? <FaSun />

            : <FaMoon />
        }

      </button>

      {/* LEFT */}

      <div className="auth-left">

        <h1>
          Expense Tracker
        </h1>

        <p>

          Create your account and
          manage your finances
          smarter with analytics
          and beautiful reports.

        </p>

      </div>

      {/* RIGHT */}

      <div className="auth-right">

        <form
          className="modern-form"
          onSubmit={handleSignup}
        >

          <h2>
            Create Account 🚀
          </h2>

          {/* EMAIL */}

          <div className="input-with-icon">
            <FaEnvelope />
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
            />
          </div>

          {/* PASSWORD */}

          <div className="input-with-icon">
            <FaLock />
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />
          </div>

          {/* SIGNUP BUTTON */}

          <button
            type="submit"
            disabled={loading}
          >

            {
              loading
                ? "Creating..."
                : "Signup"
            }

          </button>

          {/* OR DIVIDER */}

          <div className="or-divider">
            <span>OR</span>
          </div>

          {/* GOOGLE BUTTON */}

          <button
            type="button"
            className="google-btn"
            onClick={
              handleGoogleSignup
            }
          >

            Continue with Google

          </button>

          {/* LOGIN LINK */}

          <p>

            Already have account?

            <Link to="/">
              Login
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default Signup;