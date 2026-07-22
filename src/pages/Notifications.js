import {
  useContext,
  useState,
} from "react";

import { toast } from "react-toastify";

import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

import {
  ThemeContext,
} from "../context/ThemeContext";

import useFirestoreCollection from "../hooks/useFirestoreCollection";

import {
  deleteUserDocument,
  updateUserDocument,
} from "../services/firestoreData";

import {
  FaCheck,
  FaTrash,
  FaTrashRestore,
  FaExclamationTriangle,
} from "react-icons/fa";

function formatDate(value) {
  if (!value) return "";

  if (value.toDate) {
    return value.toDate().toLocaleString();
  }

  return new Date(value).toLocaleString();
}

function Notifications() {
  const { darkMode, toggleTheme } =
    useContext(ThemeContext);

  const { items: notifications } = useFirestoreCollection(
    "notifications",
    "notifications"
  );

  const [tab, setTab] = useState("inbox");

  const inbox = notifications
    .filter((item) => !item.deleted)
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis
        ? a.createdAt.toMillis()
        : new Date(a.createdAt || 0).getTime();
      const bTime = b.createdAt?.toMillis
        ? b.createdAt.toMillis()
        : new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });

  const trash = notifications.filter((item) => item.deleted);

  const unreadCount = inbox.filter((item) => !item.read).length;

  const markAsRead = async (id) => {
    try {
      await updateUserDocument("notifications", id, {
        read: true,
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const softDelete = async (id) => {
    try {
      await updateUserDocument("notifications", id, {
        deleted: true,
      });

      toast.success("Notification moved to Deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const restore = async (id) => {
    try {
      await updateUserDocument("notifications", id, {
        deleted: false,
      });

      toast.success("Notification restored");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const permanentlyDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Permanently delete this notification? This cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await deleteUserDocument("notifications", id);

      toast.success("Notification permanently deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className={darkMode ? "dashboard dark" : "dashboard"}>
      <Sidebar />

      <div className="main-content">
        <TopNavbar
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />

        <div className="dashboard-header">
          <div>
            <h1>Notifications</h1>
            <p>Budget alerts and account activity</p>
          </div>
        </div>

        <div className="notif-tabs">
          <button
            className={tab === "inbox" ? "active-filter" : ""}
            onClick={() => setTab("inbox")}
          >
            Inbox {unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>

          <button
            className={tab === "trash" ? "active-filter" : ""}
            onClick={() => setTab("trash")}
          >
            Deleted {trash.length > 0 ? `(${trash.length})` : ""}
          </button>
        </div>

        <div className="table-card">
          {tab === "inbox" ? (
            inbox.length === 0 ? (
              <div className="no-data">No notifications yet</div>
            ) : (
              <div className="notif-list">
                {inbox.map((item) => (
                  <div
                    key={item.id}
                    className={
                      item.read
                        ? "notif-item read"
                        : "notif-item unread"
                    }
                  >
                    <div className="notif-icon">
                      {item.type === "budget_exceeded" ? (
                        <FaExclamationTriangle color="#ef4444" />
                      ) : (
                        <FaExclamationTriangle color="#f59e0b" />
                      )}
                    </div>

                    <div className="notif-body">
                      <p>{item.message}</p>
                      <span className="notif-date">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <div className="action-buttons">
                      {!item.read && (
                        <button
                          className="edit-btn"
                          title="Mark as read"
                          onClick={() => markAsRead(item.id)}
                        >
                          <FaCheck />
                        </button>
                      )}

                      <button
                        className="delete-btn"
                        title="Delete"
                        onClick={() => softDelete(item.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : trash.length === 0 ? (
            <div className="no-data">Nothing in Deleted</div>
          ) : (
            <div className="notif-list">
              {trash.map((item) => (
                <div
                  key={item.id}
                  className="notif-item read"
                >
                  <div className="notif-body">
                    <p>{item.message}</p>
                    <span className="notif-date">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      title="Restore"
                      onClick={() => restore(item.id)}
                    >
                      <FaTrashRestore />
                    </button>

                    <button
                      className="delete-btn"
                      title="Delete permanently"
                      onClick={() => permanentlyDelete(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          .notif-tabs {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
          }

          .notif-tabs button {
            padding: 10px 20px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            background: ${darkMode ? "#1e293b" : "#e5e7eb"};
            color: ${darkMode ? "#e5e7eb" : "#111827"};
          }

          .active-filter {
            background: #4f46e5 !important;
            color: white !important;
          }

          .notif-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .notif-item {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            padding: 16px;
            border-radius: 14px;
            background: ${darkMode ? "#1e293b" : "#f9fafb"};
          }

          .notif-item.unread {
            border-left: 4px solid #4f46e5;
          }

          .notif-item.read {
            opacity: 0.7;
          }

          .notif-icon {
            font-size: 18px;
            margin-top: 4px;
          }

          .notif-body {
            flex: 1;
          }

          .notif-body p {
            margin: 0 0 6px 0;
            font-weight: 600;
            color: ${darkMode ? "#f1f5f9" : "#111827"};
          }

          .notif-date {
            font-size: 12px;
            color: ${darkMode ? "#94a3b8" : "#6b7280"};
          }

          .no-data {
            text-align: center;
            padding: 40px;
            font-weight: 600;
            color: ${darkMode ? "#94a3b8" : "#6b7280"};
          }
        `}
      </style>
    </div>
  );
}

export default Notifications;
