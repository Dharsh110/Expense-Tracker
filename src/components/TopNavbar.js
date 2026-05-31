import {
  FaMoon,
  FaSun,
} from "react-icons/fa";

function TopNavbar({
  darkMode,
  toggleTheme,
}) {

  return (

    <div className="top-navbar">

      {/* LEFT */}

      <div className="top-navbar-left">

        <h2 className="top-title">
          My Wallet 📈✨
        </h2>

      </div>

      {/* RIGHT */}

      <div className="top-navbar-right">

        {/* THEME */}

        <button
          className="icon-btn"
          onClick={toggleTheme}
        >

          {
            darkMode

              ? <FaSun />

              : <FaMoon />
          }

        </button>

      </div>

    </div>
  );
}

export default TopNavbar;