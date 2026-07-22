// LOGIN PAGE

import {
  useState,
  useContext,
} from "react";

import {
  signInWithEmailAndPassword,
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
  FaMagic,
  FaSun,
  FaMoon,
} from "react-icons/fa";

import {
  ThemeContext,
} from "../context/ThemeContext";

function Login() {

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

  // LOGIN FUNCTION

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      toast.success("Login Successful");

      navigate("/dashboard");

    } catch (error) {

      toast.error(error.message);

    } finally {

      setLoading(false);

    }
  };

  // GOOGLE LOGIN

  const handleGoogleLogin =
    async () => {

      try {

        setLoading(true);

        await signInWithPopup(
          auth,
          googleProvider
        );

        toast.success(
          "Google Login Successful"
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

          Track your expenses,
          manage budgets and
          analyze financial growth
          with modern dashboards.

        </p>

      </div>

      {/* RIGHT */}

      <div className="auth-right">

        <form
          className="modern-form"
          onSubmit={handleLogin}
        >

          <h2>
            Welcome Back 👋
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

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
          >

            {
              loading
                ? "Loading..."
                : "Login"
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
              handleGoogleLogin
            }
          >

            Continue with Google

          </button>

          {/* LINK */}

          <p>

            Don't have account?

            <Link to="/signup">
              Signup
            </Link>

          </p>

        </form>

        {/* DEMO ACCOUNT CALLOUT — below the login box, same width */}

        <div
          className={
            darkMode
              ? "demo-callout-footer dark"
              : "demo-callout-footer"
          }
        >
          <div className="demo-callout">
            <div className="demo-callout-icon">
              <FaMagic />
            </div>

            <div className="demo-callout-text">
              <strong>Just exploring?</strong>
              <span>Skip signup and try a live demo account.</span>
            </div>

            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                setEmail("dharsh@gmail.com");
                setPassword("dharsh123");
              }}
            >
              Try Demo Account
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Login;