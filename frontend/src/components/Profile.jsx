import React, { useContext, useState, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

// Dynamic backend URL for production or development
const BACKEND_URL = "http://localhost:5000";

const getProfilePicUrl = (user, picOverride) => {
  const pic = picOverride || user?.profilePicture;
  if (pic) {
    if (pic.startsWith("http")) return pic;
    return `${BACKEND_URL}${pic}`;
  }
  if (user?.picture) return user.picture;
  return "/default-profile.jpg";
};

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [profilePic, setProfilePic] = useState(getProfilePicUrl(user));
  const [picFile, setPicFile] = useState(null);
  const [passwords, setPasswords] = useState({ current: "", new: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const fileInputRef = useRef();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  // Handle profile info update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      const res = await api.put("/users/me", form);
      if (res && res.user) {
        setUser({ ...user, ...res.user });
        localStorage.setItem("user", JSON.stringify({ ...user, ...res.user }));
        setProfilePic(getProfilePicUrl({ ...user, ...res.user }));
        setMsg("Profile updated");
        setErr("");
        setEditMode(false);
      } else {
        setErr("Unexpected response from server");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setErr(
        error.response?.data?.details ||
          error.response?.data?.error ||
          error.message ||
          "Could not update profile"
      );
    }
  };

  // Handle profile picture upload
  const handlePicUpload = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (!picFile) return;
    const data = new FormData();
    data.append("profilePicture", picFile);
    try {
      const res = await api.post("/users/me/profile-picture", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res && res.profilePicture) {
        setProfilePic(getProfilePicUrl(user, res.profilePicture));
        setUser({ ...user, profilePicture: res.profilePicture });
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, profilePicture: res.profilePicture })
        );
      }
      setMsg("Profile picture updated!");
      setPicFile(null);
      fileInputRef.current.value = "";
    } catch (error) {
      setErr(error.response?.data?.error || "Could not upload picture");
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await api.put("/users/me/password", {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      setMsg("Password changed successfully!");
      setPasswords({ current: "", new: "" });
    } catch (error) {
      setErr(error.response?.data?.details || "Could not change password");
    }
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-md-8 mx-auto text-center">
          <img
            src={profilePic}
            alt="Profile"
            className="rounded-circle mb-3 shadow"
            width={100}
            height={100}
            style={{ objectFit: "cover", border: "3px solid #eee" }}
          />
          <form className="mb-3" onSubmit={handlePicUpload}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setPicFile(e.target.files[0])}
              className="form-control mb-2"
              style={{ maxWidth: 300, margin: "0 auto" }}
            />
            <button
              className="btn btn-outline-primary btn-sm"
              type="submit"
              disabled={!picFile}
            >
              Upload Picture
            </button>
          </form>
          <h2 className="fw-bold mb-1">{user.name}</h2>
          <p className="text-muted mb-4">{user.email}</p>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-6">
          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-danger">{err}</div>}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title">Profile Details</h5>
              {editMode ? (
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <button className="btn btn-primary me-2" type="submit">
                    Save
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <div className="mb-2">
                    <strong>Name:</strong> {user.name}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {user.email}
                  </div>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setEditMode(true)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Change Password</h5>
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
