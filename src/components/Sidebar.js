import {
  FaChartPie,
  FaWallet,
  FaChartLine,
  FaMoneyBill,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaFileAlt,
  FaList,
  FaBell,
  FaPlusCircle,
} from "react-icons/fa";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  signOut,
} from "firebase/auth";

import {
  auth,
} from "../firebase/firebase";

import { toast } from "react-toastify";

import useFirestoreCollection from "../hooks/useFirestoreCollection";

function Sidebar() {

  const navigate = useNavigate();

  const { items: notifications } = useFirestoreCollection(
    "notifications",
    "notifications"
  );

  const unreadCount = notifications.filter(
    (item) => !item.deleted && !item.read
  ).length;

  // LOGOUT FUNCTION

  const handleLogout = async () => {

    try {

      const darkMode = localStorage.getItem("darkMode");
      const currencyCode = localStorage.getItem("currencyCode");

      await signOut(auth);

      localStorage.clear();

      if (darkMode !== null) {
        localStorage.setItem("darkMode", darkMode);
      }

      if (currencyCode !== null) {
        localStorage.setItem("currencyCode", currencyCode);
      }

      navigate("/");

    } catch (error) {

      toast.error(error.message);

    }
  };

  return (

    <aside className="sidebar">

      <div>

        <h2 className="logo">
          Expense Tracker
        </h2>

        <p className="menu-title">
          MAIN
        </p>

        <ul className="menu">

          <NavLink
            to="/dashboard"
            className="menu-link"
          >
            <li className="menu-item">
              <FaChartPie />
              <span>Dashboard</span>
            </li>
          </NavLink>

          <NavLink
            to="/transactions"
            className="menu-link"
          >
            <li className="menu-item">
              <FaWallet />
              <span>Transactions</span>
            </li>
          </NavLink>

          <NavLink
            to="/add-transaction"
            className="menu-link"
          >
            <li className="menu-item">
              <FaPlusCircle />
              <span>Add Transaction</span>
            </li>
          </NavLink>

          <NavLink
            to="/categories"
            className="menu-link"
          >
            <li className="menu-item">
              <FaList />
              <span>Categories</span>
            </li>
          </NavLink>

          <NavLink
            to="/analytics"
            className="menu-link"
          >
            <li className="menu-item">
              <FaChartLine />
              <span>Analytics</span>
            </li>
          </NavLink>

          <NavLink
            to="/budgets"
            className="menu-link"
          >
            <li className="menu-item">
              <FaMoneyBill />
              <span>Budgets</span>
            </li>
          </NavLink>

          <NavLink
            to="/notifications"
            className="menu-link"
          >
            <li className="menu-item">
              <FaBell />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
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
                    padding: "0 5px",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </li>
          </NavLink>

          <NavLink
            to="/reports"
            className="menu-link"
          >
            <li className="menu-item export-btn">
              <FaFileAlt />
              <span>Reports</span>
            </li>
          </NavLink>

        </ul>

        <p className="menu-title">
          ACCOUNT
        </p>

        <ul className="menu">

          <NavLink
            to="/profile"
            className="menu-link"
          >
            <li className="menu-item">
              <FaUser />
              <span>Profile</span>
            </li>
          </NavLink>

          <NavLink
            to="/settings"
            className="menu-link"
          >
            <li className="menu-item">
              <FaCog />
              <span>Settings</span>
            </li>
          </NavLink>

        </ul>

      </div>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >

        <FaSignOutAlt />

        <span>
          Logout
        </span>

      </button>

    </aside>
  );
}

export default Sidebar;
