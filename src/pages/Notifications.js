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
  const [readDateFilter, setReadDateFilter] = useState("");

  const sortByNewest = (a, b) => {
    const aTime = a.createdAt?.toMillis
      ? a.createdAt.toMillis()
      : new Date(a.createdAt || 0).getTime();
    const bTime = b.createdAt?.toMillis
      ? b.createdAt.toMillis()
      : new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  };

  const unread = notifications
    .filter((item) => !item.deleted && !item.read)
    .sort(sortByNewest);

  const readMessages = notifications
    .filter((item) => !item.deleted && item.read)
    .sort(sortByNewest);

  const filteredReadMessages = readDateFilter
    ? readMessages.filter((item) => {
        const raw = item.createdAt?.toDate
          ? item.createdAt.toDate()
          : new Date(item.createdAt || 0);
        const itemDate = raw.toISOString().slice(0, 10);
        return itemDate === readDateFilter;
      })
    : readMessages;

  const trash = notifications.filter((item) => item.deleted);

  const unreadCount = unread.length;

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
            className={tab === "read" ? "active-filter" : ""}
            onClick={() => setTab("read")}
          >
            Read {readMessages.length > 0 ? `(${readMessages.length})` : ""}
          </button>

          <button
            className={tab === "trash" ? "active-filter" : ""}
            onClick={() => setTab("trash")}
          >
            Deleted {trash.length > 0 ? `(${trash.length})` : ""}
          </button>
        </div>

        {tab === "read" && (
          <div className="read-date-filter">
            <label>Filter by date</label>
            <input
              type="date"
              value={readDateFilter}
              onChange={(e) => setReadDateFilter(e.target.value)}
            />
            {readDateFilter && (
              <button
                className="clear-date-btn"
                onClick={() => setReadDateFilter("")}
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div className="table-card">
          {tab === "inbox" ? (
            unread.length === 0 ? (
              <div className="no-data">No new notifications</div>
            ) : (
              <div className="notif-list">
                {unread.map((item) => (
                  <div key={item.id} className="notif-item unread">
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
                      <button
                        className="edit-btn"
                        title="Mark as read"
                        onClick={() => markAsRead(item.id)}
                      >
                        <FaCheck />
                      </button>

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
          ) : tab === "read" ? (
            filteredReadMessages.length === 0 ? (
              <div className="no-data">
                {readDateFilter
                  ? "No read messages on this date"
                  : "No read messages yet"}
              </div>
            ) : (
              <div className="notif-list">
                {filteredReadMessages.map((item) => (
                  <div key={item.id} className="notif-item read">
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

          .read-date-filter {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
          }

          .read-date-filter label {
            font-weight: 600;
            font-size: 14px;
            color: ${darkMode ? "#e2e8f0" : "#374151"};
          }

          .read-date-filter input[type="date"] {
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid ${darkMode ? "#334155" : "#d1d5db"};
            background: ${darkMode ? "#1e293b" : "white"};
            color: ${darkMode ? "#e2e8f0" : "#111827"};
          }

          .clear-date-btn {
            padding: 8px 14px;
            border-radius: 8px;
            border: none;
            background: ${darkMode ? "#334155" : "#e5e7eb"};
            color: ${darkMode ? "#e2e8f0" : "#111827"};
            font-weight: 600;
            cursor: pointer;
          }
        `}
      </style>
    </div>
  );
}

export default Notifications;
