import React, { useContext, useState, useEffect } from "react";

import { updateProfile } from "firebase/auth";

import { toast } from "react-toastify";

import { auth } from "../firebase/firebase";

import {
  getUserProfile,
  saveUserProfile,
} from "../services/firestoreData";

import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

import { ThemeContext } from "../context/ThemeContext";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaCamera,
  FaBirthdayCake,
  FaBriefcase,
  FaGlobe,
} from "react-icons/fa";

function Profile() {
  const {
    darkMode,
    toggleTheme,
  } = useContext(ThemeContext);

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    dob: "",
    profession: "",
    website: "",
    profileImage:
      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  });

  // LOAD DATA (FIREBASE AUTH + FIRESTORE PROFILE)
  useEffect(() => {
    const currentUser = auth.currentUser;

    const loadProfile = async () => {
      let savedProfile = {};

      try {
        savedProfile = (await getUserProfile()) || {};
      } catch (error) {
        toast.error(error.message);
      }

      setProfile({
        name: savedProfile.name || currentUser?.displayName || "",
        email: currentUser?.email || "",
        phone: savedProfile.phone || "",
        location: savedProfile.location || "",
        bio: savedProfile.bio || "",
        dob: savedProfile.dob || "",
        profession: savedProfile.profession || "",
        website: savedProfile.website || "",
        profileImage:
          savedProfile.profileImage ||
          currentUser?.photoURL ||
          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      });
    };

    loadProfile();
  }, []);

  // HANDLE INPUT
  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // IMAGE UPLOAD (LOCAL + DRIVE SUPPORTED)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setProfile((prev) => ({
          ...prev,
          profileImage: reader.result,
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  // SAVE PROFILE (FIRESTORE + AUTH DISPLAY NAME)
  const saveProfile = async () => {
    try {
      await saveUserProfile({
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        dob: profile.dob,
        profession: profile.profession,
        website: profile.website,
        profileImage: profile.profileImage,
      });

      await updateProfile(auth.currentUser, {
        displayName: profile.name,
      });

      setIsEditing(false);
      toast.success("Profile saved successfully!");
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

        {/* HEADER */}
        <div className="dashboard-header">
          <div>
            <h1>Profile Settings</h1>
            <p>Manage your personal information</p>
          </div>
        </div>

        {/* PROFILE CARD */}
        <div
          style={{
            background: darkMode ? "#1e293b" : "#ffffff",
            padding: "30px",
            borderRadius: "15px",
            marginTop: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          {/* PROFILE IMAGE */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={profile.profileImage}
                alt="Profile"
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid #2563eb",
                }}
              />

              {isEditing && (
                <label
                  style={{
                    position: "absolute",
                    bottom: "5px",
                    right: "5px",
                    background: "#2563eb",
                    color: "#fff",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <FaCamera />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                  />
                </label>
              )}
            </div>

            <h2 style={{ color: darkMode ? "#fff" : "#000" }}>
              {profile.name || "User"}
            </h2>

            <p style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>{profile.email}</p>
          </div>

          {/* FORM */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* NAME */}
            <div>
              <label>Full Name</label>
              <div className="profile-input">
                <FaUser />
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label>Email</label>
              <div className="profile-input">
                <FaEnvelope />
                <input
                  name="email"
                  value={profile.email}
                  disabled
                  readOnly
                  title="Email is tied to your login and can't be changed here"
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label>Phone</label>
              <div className="profile-input">
                <FaPhone />
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* LOCATION */}
            <div>
              <label>Location</label>
              <div className="profile-input">
                <FaMapMarkerAlt />
                <input
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* DOB */}
            <div>
              <label>Date of Birth</label>
              <div className="profile-input">
                <FaBirthdayCake />
                <input
                  type="date"
                  name="dob"
                  value={profile.dob}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* PROFESSION */}
            <div>
              <label>Profession</label>
              <div className="profile-input">
                <FaBriefcase />
                <input
                  name="profession"
                  value={profile.profession}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* WEBSITE */}
            <div>
              <label>Website</label>
              <div className="profile-input">
                <FaGlobe />
                <input
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* BIO */}
            <div style={{ gridColumn: "1 / span 2" }}>
              <label>Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows="4"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  marginTop: "8px",
                  border: darkMode
                    ? "1px solid #475569"
                    : "1px solid #ccc",
                  resize: "none",
                  background: darkMode ? "#334155" : "#fff",
                  color: darkMode ? "#fff" : "#000",
                }}
              />
            </div>
          </div>

          {/* BUTTON */}
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaEdit />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={saveProfile}
                style={{
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaSave />
                Save Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STYLE */}
      <style>
        {`
          .profile-input {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 8px;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid ${darkMode ? "#475569" : "#ccc"};
            background: ${darkMode ? "#334155" : "#fff"};
          }

          .profile-input input {
            width: 100%;
            border: none;
            outline: none;
            background: transparent;
            color: ${darkMode ? "#fff" : "#000"};
          }

          .profile-input svg {
            color: #2563eb;
          }

          label {
            font-weight: 600;
          }
        `}
      </style>
    </div>
  );
}

export default Profile;