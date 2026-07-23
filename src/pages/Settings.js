import React, {
  useContext,
  useState,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { deleteUser } from "firebase/auth";

import { auth } from "../firebase/firebase";

import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

import { ThemeContext } from "../context/ThemeContext";

import {
  CurrencyContext,
  CURRENCIES,
} from "../context/CurrencyContext";

import {
  clearUserCollection,
  getUserCollectionData,
  getUserProfile,
  saveUserProfile,
} from "../services/firestoreData";

import {
  FaBell,
  FaMoon,
  FaWallet,
  FaDownload,
} from "react-icons/fa";

function Settings() {
  const navigate = useNavigate();

  const { darkMode, toggleTheme } =
    useContext(ThemeContext);

  const { currencyCode, setCurrencyCode } =
    useContext(CurrencyContext);

  const currentUser = auth.currentUser;

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getUserProfile();

        if (
          profile &&
          typeof profile.notificationsEnabled === "boolean"
        ) {
          setNotificationsEnabled(profile.notificationsEnabled);
        }
      } catch (error) {
        // keep default (enabled) if the read fails
      }
    })();
  }, []);

  const updateNotifications = async (value) => {
    setNotificationsEnabled(value);

    try {
      await saveUserProfile({ notificationsEnabled: value });
    } catch (error) {
      toast.error(error.message);
    }
  };

  // EXPORT / BACKUP DATA
  const exportData = async () => {
    let transactions = [];

    try {
      transactions =
        await getUserCollectionData(
          "transactions"
        );
    } catch (error) {
      transactions =
        JSON.parse(
          localStorage.getItem(
            "transactions"
          )
        ) || [];
    }

    const blob = new Blob(
      [
        JSON.stringify(
          transactions,
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const link =
      document.createElement("a");

    link.href =
      URL.createObjectURL(blob);

    link.download =
      "expense-data.json";

    link.click();

    toast.success("Backup downloaded");
  };

  // CLEAR TRANSACTIONS
  const clearTransactions = async () => {
    const confirmDelete =
      window.confirm(
        "Delete all transactions?"
      );

    if (confirmDelete) {
      try {

        await clearUserCollection(
          "transactions"
        );

        localStorage.removeItem(
          "transactions"
        );

      } catch (error) {

        toast.error(error.message);
        return;

      }

      toast.success(
        "All Transactions Deleted"
      );
    }
  };

  // DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "This will permanently delete your account and all your data. This cannot be undone. Continue?"
    );

    if (!confirmDelete) return;

    try {

      await clearUserCollection("transactions");
      await clearUserCollection("budgets");

      await deleteUser(auth.currentUser);

      localStorage.clear();

      toast.success("Account deleted");

      navigate("/");

    } catch (error) {

      if (error.code === "auth/requires-recent-login") {

        toast.error(
          "Please log out and log back in, then retry deleting your account."
        );

      } else {

        toast.error(error.message);

      }
    }
  };

  return (
    <div
      className={
        darkMode
          ? "dashboard dark"
          : "dashboard"
      }
    >
      <Sidebar />

      <div className="main-content">
        <TopNavbar
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />

        {/* TOPBAR */}
        <div className="settings-topbar">
          <div>
            <h1>Settings</h1>

            <p>
              Manage your account and preferences
            </p>
          </div>
        </div>

        {/* PROFILE CARD */}
        <div
          className={`profile-card ${
            darkMode
              ? "dark-card"
              : ""
          }`}
        >
          <div className="profile-left">
            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="profile"
            />

            <div>
              <h2>
                {currentUser?.displayName ||
                  currentUser?.email ||
                  "User"}
              </h2>

              <p>
                {currentUser?.email}
              </p>
            </div>
          </div>

          <button
            className="settings-edit-btn"
            onClick={() => navigate("/profile")}
          >
            Edit Profile
          </button>
        </div>

        {/* SETTINGS CARD */}
        <div
          className={`settings-card ${
            darkMode
              ? "dark-card"
              : ""
          }`}
        >
          {/* CURRENCY */}
          <div className="setting-row">
            <div className="setting-info">
              <FaWallet />

              <div>
                <h4>Currency</h4>

                <p>
                  Default app currency
                </p>
              </div>
            </div>

            <select
              value={currencyCode}
              onChange={(e) =>
                setCurrencyCode(
                  e.target.value
                )
              }
            >
              {
                Object.values(CURRENCIES).map(
                  (item) => (
                    <option
                      key={item.code}
                      value={item.code}
                    >
                      {item.label}
                    </option>
                  )
                )
              }
            </select>
          </div>

          {/* DARK MODE */}
          <div className="setting-row">
            <div className="setting-info">
              <FaMoon />

              <div>
                <h4>Dark Mode</h4>

                <p>
                  Toggle app theme
                </p>
              </div>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={
                  toggleTheme
                }
              />

              <span className="slider"></span>
            </label>
          </div>

          {/* NOTIFICATIONS */}
          <div className="setting-row">
            <div className="setting-info">
              <FaBell />

              <div>
                <h4>
                  Notifications
                </h4>

                <p>
                  Budget alerts and account activity
                </p>
              </div>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) =>
                  updateNotifications(
                    e.target.checked
                  )
                }
              />

              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div
          className={`danger-zone ${
            darkMode
              ? "dark-card"
              : ""
          }`}
        >
          <div className="danger-header">
            <h3>
              Data & Account
            </h3>

            <p>
              Backups are safe. The rest cannot be undone.
            </p>
          </div>

          <div className="danger-actions">
            <button
              className="backup-btn"
              onClick={exportData}
            >
              <FaDownload /> Backup Data
            </button>

            <button
              className="clear-btn"
              onClick={
                clearTransactions
              }
            >
              Clear All Data
            </button>

            <button
              className="settings-delete-btn"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* STYLES */}
      <style>
        {`
          .settings-topbar{
            margin-bottom:25px;
          }

          .settings-topbar h1{
            font-size:34px;
            margin-bottom:5px;
            color:${darkMode ? "#ffffff" : "#111827"};
          }

          .settings-topbar p{
            color:${darkMode ? "#94a3b8" : "gray"};
          }

          .profile-card{
            background:${darkMode ? "#1e293b" : "white"};
            border-radius:24px;
            padding:25px;
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:20px;
            flex-wrap:wrap;
            margin-bottom:25px;
          }

          .profile-left{
            display:flex;
            align-items:center;
            gap:20px;
          }

          .profile-left img{
            width:80px;
            height:80px;
            border-radius:50%;
          }

          .profile-left h2{
            color:${darkMode ? "#ffffff" : "#111827"};
          }

          .profile-left p{
            color:${darkMode ? "#94a3b8" : "gray"};
            margin:6px 0 0;
          }

          .settings-edit-btn{
            padding:12px 20px;
            border:none;
            border-radius:12px;
            background:#4f46e5;
            color:white;
            cursor:pointer;
            font-weight:600;
            white-space:nowrap;
            flex-shrink:0;
          }

          .settings-card{
            background:${darkMode ? "#1e293b" : "white"};
            border-radius:24px;
            padding:10px 25px;
            margin-bottom:25px;
          }

          .setting-row{
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:20px 0;
            border-bottom:1px solid ${
              darkMode ? "#334155" : "#e5e7eb"
            };
            gap:20px;
          }

          .setting-row:last-child{
            border-bottom:none;
          }

          .setting-info{
            display:flex;
            align-items:center;
            gap:15px;
          }

          .setting-info svg{
            font-size:20px;
            color:#4f46e5;
          }

          .setting-info h4{
            color:${darkMode ? "#ffffff" : "#111827"};
          }

          .setting-info p{
            color:${darkMode ? "#94a3b8" : "gray"};
            font-size:14px;
            margin-top:2px;
          }

          .settings-card select{
            padding:10px 14px;
            border-radius:12px;
            border:1px solid ${
              darkMode ? "#334155" : "#d1d5db"
            };
            background:${darkMode ? "#0f172a" : "white"};
            color:${darkMode ? "#ffffff" : "#111827"};
          }

          .switch{
            position:relative;
            display:inline-block;
            width:55px;
            height:28px;
          }

          .switch input{
            opacity:0;
            width:0;
            height:0;
          }

          .slider{
            position:absolute;
            cursor:pointer;
            inset:0;
            background:${darkMode ? "#334155" : "#d1d5db"};
            border-radius:30px;
            transition:0.4s;
          }

          .slider:before{
            position:absolute;
            content:"";
            height:22px;
            width:22px;
            left:3px;
            bottom:3px;
            background:white;
            border-radius:50%;
            transition:0.4s;
          }

          input:checked + .slider{
            background:#4f46e5;
          }

          input:checked + .slider:before{
            transform:translateX(26px);
          }

          .danger-zone{
            background:${darkMode ? "#1e1215" : "#fff5f5"};
            border:1px solid ${
              darkMode ? "#7f1d1d" : "#fecaca"
            };
            border-radius:24px;
            padding:25px;
            display:flex;
            flex-direction:column;
            align-items:flex-start;
            gap:16px;
          }

          .danger-header h3{
            color:${darkMode ? "#f87171" : "#dc2626"};
            margin-bottom:8px;
          }

          .danger-header p{
            color:${darkMode ? "#fca5a5" : "#7f1d1d"};
          }

          .danger-actions{
            display:flex;
            gap:15px;
            flex-wrap:wrap;
          }

          .backup-btn{
            display:flex;
            align-items:center;
            gap:8px;
            padding:12px 18px;
            border:none;
            border-radius:12px;
            background:#4f46e5;
            color:white;
            cursor:pointer;
            font-weight:600;
            white-space:nowrap;
            flex-shrink:0;
          }

          .clear-btn{
            padding:12px 18px;
            border:none;
            border-radius:12px;
            background:#ef4444;
            color:white;
            cursor:pointer;
            font-weight:600;
            white-space:nowrap;
            flex-shrink:0;
          }

          .settings-delete-btn{
            padding:12px 18px;
            border:none;
            border-radius:12px;
            white-space:nowrap;
            flex-shrink:0;
            background:#991b1b;
            color:white;
            cursor:pointer;
            font-weight:600;
          }

          @media(max-width:768px){
            .profile-card{
              flex-direction:column;
              align-items:flex-start;
            }

            .setting-row{
              flex-direction:column;
              align-items:flex-start;
            }

            .danger-zone{
              flex-direction:column;
              align-items:flex-start;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Settings;
