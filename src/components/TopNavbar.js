import {
  FaBell,
  FaMoon,
  FaSun,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import useFirestoreCollection from "../hooks/useFirestoreCollection";

function TopNavbar({
  darkMode,
  toggleTheme,
}) {

  const navigate = useNavigate();

  const { items: notifications } = useFirestoreCollection(
    "notifications",
    "notifications"
  );

  const unreadCount = notifications.filter(
    (item) => !item.deleted && !item.read
  ).length;

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

        {/* NOTIFICATION */}

        <button
          className="icon-btn"
          style={{ position: "relative" }}
          onClick={() => navigate("/notifications")}
        >

          <FaBell />

          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "#ef4444",
                color: "#fff",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "700",
                minWidth: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}

        </button>

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
