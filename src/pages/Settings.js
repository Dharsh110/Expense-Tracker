import {
  useState,
  useEffect,
  useContext,
} from "react";

import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

import { ThemeContext } from "../context/ThemeContext";

import {
  auth,
  db,
  storage,
} from "../firebase/firebase";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  deleteUser,
} from "firebase/auth";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import * as XLSX from "xlsx";

import {
  FaTrash,
  FaMoon,
  FaSun,
} from "react-icons/fa";

function Settings() {
  const { darkMode, toggleTheme } =
    useContext(ThemeContext);

  const user = auth.currentUser;

  const [profile, setProfile] = useState({
  fullName: "",
  email: "",
  phone: "",
  location: "",
  dob: "",
  profession: "",
  website: "",
  bio: "",
  photoURL: "",
});

const [isEditing, setIsEditing] = useState(false);
const [showHelp, setShowHelp] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);

const [exportType, setExportType] =
  useState("all");

  const [imageFile, setImageFile] =
    useState(null);

  const [transactions, setTransactions] =
    useState([]);

  const [filteredTransactions,
    setFilteredTransactions] =
    useState([]);

  const [budgets, setBudgets] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [selectedMonth,
    setSelectedMonth] =
    useState("All");

  const [selectedYear,
    setSelectedYear] =
    useState("All");

  // =========================
  // LOAD USER PROFILE
  // =========================

  useEffect(() => {

    if (!user) return;

    const fetchUser = async () => {

      try {

        const userRef =
          doc(
            db,
            "users",
            user.uid
          );

        const snap =
          await getDoc(
            userRef
          );

        if (snap.exists()) {


              const data = snap.data();

              setProfile({
                fullName: data.fullName || "",
                email: data.email || user.email || "",
                phone: data.phone || "",
                location: data.location || "",
                dob: data.dob || "",
                profession: data.profession || "",
                website: data.website || "",
                bio: data.bio || "",
                photoURL: data.photoURL || "",
              });

        } else {

          await setDoc(
            userRef,
            {
              uid: user.uid,
              email:
                user.email,
              fullName: "",
              phone: "",
              location: "",
              dob: "",
              profession: "",
              website: "",
              bio: "",
              photoURL: "",
              createdAt:
                serverTimestamp(),
            }
          );

          setProfile({
            fullName: "",
            email: user.email,
            phone: "",
            location: "",
            dob: "",
            profession: "",
            website: "",
            bio: "",
            photoURL: "",
          });
        }

      } catch (error) {

        console.log(error);

      }

    };

    fetchUser();

  }, [user]);

  // =========================
  // LOAD TRANSACTIONS
  // =========================

  useEffect(() => {

    if (!user) return;

    const loadData =
      async () => {

        try {

          const transactionQuery =
            query(
              collection(
                db,
                "transactions"
              ),
              where(
                "userId",
                "==",
                user.uid
              )
            );

          const budgetQuery =
            query(
              collection(
                db,
                "budgets"
              ),
              where(
                "userId",
                "==",
                user.uid
              )
            );

          const transactionSnap =
            await getDocs(
              transactionQuery
            );

          const budgetSnap =
            await getDocs(
              budgetQuery
            );

          const transactionData =
            transactionSnap.docs.map(
              (doc) => ({
                docId: doc.id,
                ...doc.data(),
              })
            );

          setTransactions(
            transactionData
          );

          setFilteredTransactions(
            transactionData
          );

          setBudgets(
            budgetSnap.docs.map(
              (doc) => ({
                docId: doc.id,
                ...doc.data(),
              })
            )
          );

        } catch (error) {
            if (
              error.code ===
              "auth/requires-recent-login"
            ) {
              alert(
                "For security reasons, please logout and login again before deleting your account."
              );
              return;
            }

            alert(error.message);
          }

      };

    loadData();

  }, [user]);

  // =========================
  // FILTER TRANSACTIONS
  // =========================

  useEffect(() => {

    let filtered =
      [...transactions];

    if (
      selectedYear !== "All"
    ) {

      filtered =
        filtered.filter(
          (item) => {

            const year =
              new Date(
                item.date
              )
                .getFullYear()
                .toString();

            return (
              year ===
              selectedYear
            );
          }
        );
    }

    if (
      selectedMonth !== "All"
    ) {

      filtered =
        filtered.filter(
          (item) => {

            const month =
              new Date(
                item.date
              )
                .toLocaleString(
                  "default",
                  {
                    month:
                      "short",
                  }
                );

            return (
              month ===
              selectedMonth
            );
          }
        );
    }

    setFilteredTransactions(
      filtered
    );

  }, [
    selectedMonth,
    selectedYear,
    transactions,
  ]);

  // =========================
  // UPDATE PROFILE
  // =========================

  const updateProfile =
    async () => {

      try {

        if (!user) return;

        setLoading(true);

        let photoURL = profile.photoURL || "";

        if (imageFile) {

          const storageRef =
            ref(
              storage,
              `profile/${user.uid}`
            );

          await uploadBytes(
            storageRef,
            imageFile
          );

          photoURL =
            await getDownloadURL(
              storageRef
            );
        }

        console.log({
          uid: user.uid,
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          dob: profile.dob,
          profession: profile.profession,
          website: profile.website,
          bio: profile.bio,
          photoURL,
        });
       await setDoc(
            doc(db, "users", user.uid),
            {
              uid: user.uid || "",
              fullName: profile.fullName || "",
              email: profile.email || "",
              phone: profile.phone || "",
              location: profile.location || "",
              dob: profile.dob || "",
              profession: profile.profession || "",
              website: profile.website || "",
              bio: profile.bio || "",
              photoURL: photoURL || "",
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );

        setProfile(
          (prev) => ({
            ...prev,
            photoURL,
          })
        );

        setIsEditing(false);

        alert(
          "Profile Updated Successfully"
        );

      } catch (error) {

        alert(
          error.message
        );

      } finally {

        setLoading(false);

      }
    };

  // =========================
// EXPORT EXCEL (MULTI SHEET)
// =========================
const exportCSV = () => {
  const allData = filteredTransactions.map((t) => ({
    Title: t.title,
    Amount: t.amount,
    Category: t.category,
    Type: t.type,
    Date: t.date,
    Year: new Date(t.date).getFullYear(),
    Month: new Date(t.date).toLocaleString("default", { month: "short" }),
  }));

  const wb = XLSX.utils.book_new();

  // 1. ALL TRANSACTIONS
  const wsAll = XLSX.utils.json_to_sheet(allData);
  XLSX.utils.book_append_sheet(wb, wsAll, "All Transactions");

  // 2. YEAR WISE SHEETS
  const years = [...new Set(allData.map((t) => t.Year))];

  years.forEach((year) => {
    const yearData = allData.filter((t) => t.Year === year);
    const wsYear = XLSX.utils.json_to_sheet(yearData);
    XLSX.utils.book_append_sheet(wb, wsYear, `${year}`);
  });

  // 3. MONTH-YEAR SHEET
  const wsMonthYear = XLSX.utils.json_to_sheet(
    allData.map((t) => ({
      ...t,
      MonthYear: `${t.Month}-${t.Year}`,
    }))
  );

  XLSX.utils.book_append_sheet(wb, wsMonthYear, "Month-Year");

  XLSX.writeFile(wb, "Transactions_Report.xlsx");
};

  // =========================
  // BACKUP DOWNLOAD
  // =========================

  const backupData =
    async () => {

      try {

        const backup =
          {
            profile,
            transactions,
            budgets,
            exportedAt:
              new Date().toISOString(),
          };

        const blob =
          new Blob(
            [
              JSON.stringify(
                backup,
                null,
                2
              ),
            ],
            {
              type:
                "application/json",
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          url;

        link.download =
          `backup_${Date.now()}.json`;

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        URL.revokeObjectURL(
          url
        );

        alert(
          "Backup Downloaded Successfully"
        );

      } catch (error) {

        alert(
          error.message
        );

      }

    };

  // =========================
  // DELETE ACCOUNT
  // =========================

  const deleteAccount =
    async () => {

      try {

        if (
          !window.confirm(
            "Delete Account Permanently?"
          )
        )
          return;

        const uid =
          user.uid;

        await deleteDoc(
          doc(
            db,
            "users",
            uid
          )
        );

        const transactionSnap =
          await getDocs(
            query(
              collection(
                db,
                "transactions"
              ),
              where(
                "userId",
                "==",
                uid
              )
            )
          );

        await Promise.all(
          transactionSnap.docs.map(
            (d) =>
              deleteDoc(
                d.ref
              )
          )
        );

        const budgetSnap =
          await getDocs(
            query(
              collection(
                db,
                "budgets"
              ),
              where(
                "userId",
                "==",
                uid
              )
            )
          );

        await Promise.all(
          budgetSnap.docs.map(
            (d) =>
              deleteDoc(
                d.ref
              )
          )
        );

        await deleteUser(
          user
        );

        alert(
          "Account Deleted Successfully"
        );

      } catch (error) {

        alert(
          error.message
        );

      }

    };


     return (
  <div className={darkMode ? "dashboard dark" : "dashboard"}>
    <Sidebar />

    <div className="main-content">
      <TopNavbar darkMode={darkMode} toggleTheme={toggleTheme} />

      <h1 className="settings-title">Settings</h1>

      {/* ================= PROFILE ================= */}
      <div className="card">
        <div className="profile-header centered">
          <div className="profile-image-wrapper">
            <img
              src={
                profile.photoURL
                  ? profile.photoURL
                  : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt="Profile"
              className="profile-image"
            />

            {isEditing && (
              <>
                <input
                  type="file"
                  id="profileUpload"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
                <label htmlFor="profileUpload" className="edit-image-btn">
                  ✏️
                </label>
              </>
            )}
          </div>

              <h2>
                {profile.fullName || "User"}
              </h2>

            </div>

            <div className="profile-grid">

              <div className="form-group">
                <label>Full Name</label>
                <input
                  disabled={!isEditing}
                  placeholder="Enter Full Name"
                  value={profile.fullName || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  disabled={!isEditing}
                  placeholder="Enter Email"
                  value={profile.email || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  disabled={!isEditing}
                  placeholder="Enter Phone Number"
                  value={profile.phone || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  disabled={!isEditing}
                  placeholder="Enter Location"
                  value={profile.location || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      location: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  disabled={!isEditing}
                  value={profile.dob || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      dob: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Profession</label>
                <input
                  disabled={!isEditing}
                  placeholder="Enter Profession"
                  value={profile.profession || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      profession: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group full-width">
                <label>Website</label>
                <input
                  disabled={!isEditing}
                  placeholder="https://example.com"
                  value={profile.website || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      website: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  disabled={!isEditing}
                  placeholder="Write something about yourself..."
                  value={profile.bio || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      bio: e.target.value,
                    })
                  }
                />
              </div>

            </div>

          <div className="profile-actions">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          ) : (
            <button onClick={updateProfile} disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </button>
          )}
        </div>

          </div>

        {/* ================= APPEARANCE ================= */}
      <div className="card">
        <h2>Appearance</h2>
        <p className="sub-text">
          Switch between light and dark mode for better comfort.
        </p>

        <div className="appearance-row">
          <button
        type="button"
        className="global-theme-btn"
        onClick={toggleTheme}
      >
        {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
      </button>
        </div>
      </div>


      {/* ================= EXPORT ================= */}
<div className="card">
  <h2>Export Transactions</h2>
  <p className="sub-text">
    Filter and download your transaction data in Excel format (multi-sheet report).
  </p>

  <div className="export-toolbar">

    {/* FILTER GROUP */}
    <div className="filter-group">
      <select
        value={exportType}
        onChange={(e) => setExportType(e.target.value)}
      >
        <option value="all">All Data</option>
        <option value="month">Month Wise</option>
        <option value="year">Year Wise</option>
      </select>

      {exportType !== "all" && (
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option>2023</option>
          <option>2024</option>
          <option>2025</option>
          <option>2026</option>
        </select>
      )}

      {exportType === "month" && (
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option>Jan</option>
          <option>Feb</option>
          <option>Mar</option>
          <option>Apr</option>
          <option>May</option>
          <option>Jun</option>
          <option>Jul</option>
          <option>Aug</option>
          <option>Sep</option>
          <option>Oct</option>
          <option>Nov</option>
          <option>Dec</option>
        </select>
      )}
    </div>

    {/* CSV BUTTON */}
    <button className="csv-btn" onClick={exportCSV}>
      📊 CSV Download
    </button>
  </div>
</div>

        {/* ================= BACKUP ================= */}
      <div className="card">
        <h2>Backup & Restore</h2>
        <p className="sub-text">
          Download a full backup of your profile, transactions, and budgets.
        </p>

        <button onClick={backupData}>Download Backup</button>
      </div>

       {/* ================= HELP ================= */}
      <div className="card">
        <h2>Help Center</h2>
        <p className="sub-text">
          Need help? Contact our support team anytime.
        </p>

        <button onClick={() => setShowHelp(true)}>
          Contact Support
        </button>
      </div>

          {/* ================= ACCOUNT ================= */}
      <div className="card danger-card">
        <h2>Account Settings</h2>
        <p className="sub-text">
          Permanently delete your account and all associated data.
        </p>

        <button
          className="delete-btn full-btn"
          onClick={() => setShowDeleteModal(true)}
        >
          <FaTrash /> Delete My Account
        </button>

          {
            showDeleteModal && (

            <div className="modal">
            <div className="modal-content">

            <h2>
            Delete Account
            </h2>

            <p>
            This action cannot be undone.
            </p>

            <p>
            All data will be removed permanently.
            </p>

            <button
            onClick={() =>
            setShowDeleteModal(false)
            }
            >
            Cancel
            </button>

            <button
            className="delete-btn"
            onClick={deleteAccount}
            >
            Delete Permanently
            </button>

            </div>

            </div>

            )
            }
        </div>

            {
            showHelp && (

            <div className="modal">

            <div className="modal-content">

            <h2>
            Help Center
            </h2>

            <p>
            Email:
            support@expensetracker.com
            </p>

            <p>
            Phone:
            +91 9876543210
            </p>

            <p>
            Available:
            Mon-Fri
            9 AM - 6 PM
            </p>

            <button
            onClick={() =>
            setShowHelp(false)
            }
            >
            Close
            </button>

            </div>

            </div>

            )
            }
      </div>

      <style>{`
.dashboard {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.dashboard.dark {
  background: #0f172a;
  color: white;
}

.main-content {
  flex: 1;
  padding: 25px;
}

.settings-title {
  margin-bottom: 25px;
  font-size: 28px;
  font-weight: 700;
}

/* CARD */

.card {
  background: #ffffff;
  padding: 25px;
  border-radius: 18px;
  margin-bottom: 22px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
}

.dashboard.dark .card {
  background: #1e293b;
  color: white;
}

/* PROFILE */

.centered {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-header {
  margin-bottom: 30px;
}

.profile-image-wrapper {
  position: relative;
}

.profile-image {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #2563eb;
  background: #f1f5f9;
}

.profile-header h2 {
  margin-top: 15px;
  font-size: 24px;
  font-weight: 700;
}

/* GRID */

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.full-width {
  grid-column: span 2;
}

/* INPUTS */

input,
select,
textarea {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 15px;
  background: white;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2563eb;
}

textarea {
  min-height: 140px;
  resize: vertical;
}

/* DARK INPUT */

.dashboard.dark input,
.dashboard.dark select,
.dashboard.dark textarea {
  background: #334155;
  color: white;
  border: 1px solid #475569;
}

/* BUTTON */

button {
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: #2563eb;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  transition: 0.3s;
}

button:hover {
  opacity: 0.9;
}

.profile-actions {
  margin-top: 25px;
}

/* TEXT */

.sub-text {
  color: #64748b;
  font-size: 14px;
  margin-top: 6px;
}

.dashboard.dark .sub-text {
  color: #cbd5e1;
}

/* APPEARANCE */

.appearance-row {
  display: flex;
  align-items: center;
}

/* EXPORT */

.export-toolbar {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 18px;
}

.export-toolbar select {
  min-width: 160px;
}

.download-btn {
  background: #8b5cf6;
}

.download-btn:hover {
  background: #7c3aed;
}

/* BACKUP + HELP */

.card button {
  margin-top: 14px;
}

/* DELETE */

.danger-card {
  border: 1px solid #dc2626;
}

.delete-btn {
  background: #dc2626;
}

.delete-btn:hover {
  background: #b91c1c;
}

.full-btn {
  width: 100%;
}

/* MODAL */

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  width: 450px;
  max-width: 90%;
  padding: 30px;
  border-radius: 16px;
}

.dashboard.dark .modal-content {
  background: #1e293b;
  color: white;
}

.modal-content h2 {
  margin-bottom: 15px;
}

.modal-content p {
  margin-bottom: 10px;
}

/* RESPONSIVE */

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }

  .profile-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .full-width {
    grid-column: auto;
  }

  .appearance-row,
  .export-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  button,
  .export-toolbar select {
    width: 100%;
  }

  .profile-image {
    width: 120px;
    height: 120px;
  }
}

      `}</style>

    </div>
  );
}

export default Settings;
