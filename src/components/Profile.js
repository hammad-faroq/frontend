import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    nick_name: "",
    gender: "",
    country: "",
    language: "en",
    time_zone: "UTC",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    job_title: "",
    company: "",
    industry: "",
    years_of_experience: "",
    highest_education: "",
    university: "",
    graduation_year: "",
    bio: "",
    profile_picture: null,
    profile_picture_url: null
  });
  
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      setUser({
        ...response.data,
        profile_picture_url: response.data.profile_picture 
          ? `http://127.0.0.1:8000${response.data.profile_picture}` 
          : null
      });
      
      // Fetch additional emails
      const emailResponse = await axios.get("http://127.0.0.1:8000/api/profile/emails/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setAdditionalEmails(emailResponse.data);
      
      // Fetch profile summary for completion percentage
      const summaryResponse = await axios.get("http://127.0.0.1:8000/api/profile/summary/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setProfileCompletion(summaryResponse.data.profile_completion || 0);
      
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Add user fields
    if (user.first_name) formData.append("first_name", user.first_name);
    if (user.last_name) formData.append("last_name", user.last_name);
    
    // Add profile fields
    const profileFields = [
      'nick_name', 'gender', 'country', 'language', 'time_zone',
      'phone_number', 'address', 'city', 'state', 'postal_code',
      'job_title', 'company', 'industry', 'years_of_experience',
      'highest_education', 'university', 'graduation_year', 'bio'
    ];
    
    profileFields.forEach(field => {
      if (user[field] !== undefined && user[field] !== null) {
        formData.append(field, user[field]);
      }
    });
    
    // Add profile picture if selected
    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }

    try {
      const response = await axios.put("http://127.0.0.1:8000/api/profile/", formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      setUser({
        ...response.data.profile,
        profile_picture_url: response.data.profile.profile_picture 
          ? `http://127.0.0.1:8000${response.data.profile.profile_picture}` 
          : null
      });
      
      if (response.data.image_url) {
        setUser(prev => ({ ...prev, profile_picture_url: response.data.image_url }));
      }
      
      setEditing(false);
      setProfilePicture(null);
      setPreviewImage(null);
      alert("Profile updated successfully!");
      fetchProfile(); // Refresh data
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error);
      alert(error.response?.data?.errors?.time_zone?.[0] || "Failed to update profile. Please check all fields.");
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle adding new email
  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/profile/emails/",
        { email: newEmail },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      
      setNewEmail("");
      fetchProfile(); // Refresh emails
      alert("Email added successfully! Please check your inbox for verification.");
    } catch (error) {
      console.error("Error adding email:", error.response?.data || error);
      alert(error.response?.data?.error || "Failed to add email.");
    }
  };

  // Handle setting primary email
  const handleSetPrimaryEmail = async (emailId) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/profile/emails/${emailId}/set-primary/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      
      fetchProfile(); // Refresh emails
      alert("Primary email updated successfully!");
    } catch (error) {
      console.error("Error setting primary email:", error.response?.data || error);
      alert(error.response?.data?.error || "Failed to set primary email.");
    }
  };

  // Handle verifying email
  const handleVerifyEmail = async (emailId) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/profile/emails/${emailId}/verify/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      
      fetchProfile(); // Refresh emails
      alert("Email verified successfully!");
    } catch (error) {
      console.error("Error verifying email:", error.response?.data || error);
      alert(error.response?.data?.error || "Failed to verify email.");
    }
  };

  // Handle deleting email
  const handleDeleteEmail = async (emailId) => {
    if (!window.confirm("Are you sure you want to delete this email address?")) {
      return;
    }

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/profile/emails/${emailId}/delete/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      
      fetchProfile(); // Refresh emails
      alert("Email deleted successfully!");
    } catch (error) {
      console.error("Error deleting email:", error.response?.data || error);
      alert(error.response?.data?.error || "Failed to delete email.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Profile completion progress bar
  const ProgressBar = ({ percentage }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
      <div 
        className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} navigate={navigate} />
      
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">👤 Profile</h1>
            <p className="text-gray-600 mt-2">Manage your personal and professional information</p>
          </div>
          <div className="text-right">
            <div className="text-gray-600">Profile Completion</div>
            <div className="text-2xl font-bold text-green-600">{profileCompletion}%</div>
            <ProgressBar percentage={profileCompletion} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-100">
                    {previewImage || user.profile_picture_url ? (
                      <img 
                        src={previewImage || user.profile_picture_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-4xl text-indigo-600">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  {editing && (
                    <label className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      📷
                    </label>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-gray-600 mb-4">{user.email}</p>
                
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setProfilePicture(null);
                        setPreviewImage(null);
                        fetchProfile(); // Reset to original data
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-700 mb-3">Profile Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium">{user.role || "User"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Management */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Email Addresses</h3>
              
              <div className="space-y-3">
                {/* Primary Email */}
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-gray-600">Primary Email</div>
                    </div>
                    <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">Primary</span>
                  </div>
                </div>
                
                {/* Additional Emails */}
                {additionalEmails.map((email) => (
                  <div key={email.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{email.email}</div>
                        <div className="text-sm text-gray-600">
                          Added {new Date(email.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!email.is_primary && (
                          <button
                            onClick={() => handleSetPrimaryEmail(email.id)}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                            disabled={!email.is_verified}
                          >
                            {email.is_verified ? "Set Primary" : "Verify First"}
                          </button>
                        )}
                        {!email.is_verified && (
                          <button
                            onClick={() => handleVerifyEmail(email.id)}
                            className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {email.is_primary && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                        {email.is_verified ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Unverified
                          </span>
                        )}
                      </div>
                      {!email.is_primary && (
                        <button
                          onClick={() => handleDeleteEmail(email.id)}
                          className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add New Email */}
                <div className="mt-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleAddEmail}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Add additional email addresses for notifications
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={user.first_name}
                      onChange={(e) => setUser({...user, first_name: e.target.value})}
                      disabled={!editing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={user.last_name}
                      onChange={(e) => setUser({...user, last_name: e.target.value})}
                      disabled={!editing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nick Name
                    </label>
                    <input
                      type="text"
                      value={user.nick_name || ""}
                      onChange={(e) => setUser({...user, nick_name: e.target.value})}
                      disabled={!editing}
                      placeholder="Your nick name"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={user.gender || ""}
                      onChange={(e) => setUser({...user, gender: e.target.value})}
                      disabled={!editing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={user.country || ""}
                      onChange={(e) => setUser({...user, country: e.target.value})}
                      disabled={!editing}
                      placeholder="Your country"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Contact Info Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={user.phone_number || ""}
                      onChange={(e) => setUser({...user, phone_number: e.target.value})}
                      disabled={!editing}
                      placeholder="+1234567890"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      value={user.language || "en"}
                      onChange={(e) => setUser({...user, language: e.target.value})}
                      disabled={!editing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ur">Urdu</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Zone
                    </label>
                    <select
                      value={user.time_zone || "UTC"}
                      onChange={(e) => setUser({...user, time_zone: e.target.value})}
                      disabled={!editing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="EST">Eastern Standard Time (UTC-5)</option>
                      <option value="PST">Pacific Standard Time (UTC-8)</option>
                      <option value="CST">Central Standard Time (UTC-6)</option>
                      <option value="GMT">Greenwich Mean Time (UTC+0)</option>
                      <option value="CET">Central European Time (UTC+1)</option>
                      <option value="IST">Indian Standard Time (UTC+5:30)</option>
                      <option value="PKT">Pakistan Standard Time (UTC+5)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={user.address || ""}
                      onChange={(e) => setUser({...user, address: e.target.value})}
                      disabled={!editing}
                      placeholder="Your full address"
                      rows="2"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={user.city || ""}
                        onChange={(e) => setUser({...user, city: e.target.value})}
                        disabled={!editing}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={user.state || ""}
                        onChange={(e) => setUser({...user, state: e.target.value})}
                        disabled={!editing}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={user.postal_code || ""}
                        onChange={(e) => setUser({...user, postal_code: e.target.value})}
                        disabled={!editing}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="mt-8 pt-6 border-t">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Professional Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={user.job_title || ""}
                        onChange={(e) => setUser({...user, job_title: e.target.value})}
                        disabled={!editing}
                        placeholder="e.g., Senior Software Engineer"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={user.company || ""}
                        onChange={(e) => setUser({...user, company: e.target.value})}
                        disabled={!editing}
                        placeholder="Your company name"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={user.industry || ""}
                        onChange={(e) => setUser({...user, industry: e.target.value})}
                        disabled={!editing}
                        placeholder="e.g., Information Technology"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        value={user.years_of_experience || ""}
                        onChange={(e) => setUser({...user, years_of_experience: e.target.value})}
                        disabled={!editing}
                        min="0"
                        max="50"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Highest Education
                      </label>
                      <input
                        type="text"
                        value={user.highest_education || ""}
                        onChange={(e) => setUser({...user, highest_education: e.target.value})}
                        disabled={!editing}
                        placeholder="e.g., Bachelor's in Computer Science"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        University
                      </label>
                      <input
                        type="text"
                        value={user.university || ""}
                        onChange={(e) => setUser({...user, university: e.target.value})}
                        disabled={!editing}
                        placeholder="University name"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Graduation Year
                      </label>
                      <input
                        type="number"
                        value={user.graduation_year || ""}
                        onChange={(e) => setUser({...user, graduation_year: e.target.value})}
                        disabled={!editing}
                        min="1900"
                        max="2030"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="mt-8 pt-6 border-t">
                <h2 className="text-xl font-bold text-gray-800 mb-6">About Me</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={user.bio || ""}
                    onChange={(e) => setUser({...user, bio: e.target.value})}
                    disabled={!editing}
                    placeholder="Tell us about yourself, your skills, and experience..."
                    rows="4"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum 500 characters. {(user.bio || "").length}/500
                  </p>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="mt-8 pt-6 border-t">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Privacy Settings</h2>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={user.is_public || true}
                    onChange={(e) => setUser({...user, is_public: e.target.checked})}
                    disabled={!editing}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="is_public" className="ml-2 text-gray-700">
                    Make my profile public (visible to other users)
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  When enabled, other users can view your basic profile information.
                </p>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setProfilePicture(null);
                      setPreviewImage(null);
                      fetchProfile();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
          <div className="flex justify-between items-center">
            <span>Copyright Reserved © {new Date().getFullYear()} TalentMatch</span>
            <div className="space-x-4">
              <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600">Terms of Use</a>
              <a href="#" className="hover:text-indigo-600">Contact Us</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Profile;