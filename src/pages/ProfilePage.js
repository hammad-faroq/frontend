import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import {
  UserIcon,
  EnvelopeIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Jane Doe",
    email: "jane.doe@example.com",
    role: "Job Seeker",
    bio: "Aspiring data analyst with a passion for AI-driven insights.",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    avatar: "https://via.placeholder.com/120",
  });

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    // Fetch user profile data from API here
    // Example: const data = await getProfile();
    // setProfile(data);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setProfile(formData);
    setEditing(false);
    // Optional: API call to save changes
    // await updateProfile(formData);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} navigate={navigate} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-xl">
          {/* Avatar with upload */}
          <div className="flex flex-col items-center relative">
            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <div
              className="relative cursor-pointer group"
              onClick={() =>
                document.getElementById("avatarUpload").click()
              }
            >
              <img
                src={formData.avatar || profile.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover shadow-md"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-white text-sm">Change</span>
              </div>
            </div>

            <h2 className="mt-4 text-2xl font-semibold">{profile.name}</h2>
            <p className="text-gray-500">{profile.role}</p>
          </div>

          {/* Info */}
          <div className="mt-6 space-y-4">
            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Location</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded-lg p-2 h-24"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-gray-700">
                  <EnvelopeIcon className="h-5 w-5" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <UserIcon className="h-5 w-5" />
                  <span>{profile.phone}</span>
                </div>
                <p className="text-gray-600 mt-3">{profile.bio}</p>
                <p className="text-gray-500 text-sm">{profile.location}</p>

                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 flex items-center justify-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;