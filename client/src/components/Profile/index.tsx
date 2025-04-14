import React, { useState } from "react";
import { useUser } from "../../context/user";
import { logoutUser } from "../../api/auth";
import { updateMe } from "../../api/profile";
import "./styles.scss";

type formDataType = {
  username: string;
  email: string;
  phoneNo?: string;
};

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useUser();
  const [formData, setFormData] = useState<formDataType>({
    username: user?.username || "",
    email: user?.email || "",
    phoneNo: user?.phoneNo || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      phoneNo: user?.phoneNo || "",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return console.error("User is not logged in.");

    try {
      const response = await updateMe(formData.username, formData.phoneNo);
      if (response?.success) {
        updateUser({
          ...user,
          username: formData.username,
          phoneNo: formData.phoneNo,
        });
        console.log("Profile updated successfully.");
      } else {
        console.error("Failed to update profile:", response?.data?.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      if (res?.success) logout();
      else console.error("Logout failed:", res?.message);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <button className="btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <form className="profile-form" onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <p className="email-display">{user?.email}</p>
        </div>

        <div className="form-group">
          <label htmlFor="phoneNo">Phone Number</label>
          <input
            type="text"
            id="phoneNo"
            name="phoneNo"
            value={formData.phoneNo}
            onChange={handleChange}
          />
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={handleCancel}
            className="btn cancel-btn"
          >
            Cancel
          </button>
          <button type="submit" className="btn save-btn">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
