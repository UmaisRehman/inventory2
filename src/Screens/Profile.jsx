import React, { useState, useEffect } from "react";
import { FaUser, FaCrown } from "react-icons/fa";
import { toast } from "react-toastify";
import { userService } from "../Config/firebase/firebaseService";
import ProfileForm from "../components/ProfileForm";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [user, userRole] = await Promise.all([
        userService.getCurrentUser(),
        userService.getCurrentUserRole(),
      ]);

      setUserData(user);
      setRole(userRole);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    // Refresh user data after update
    fetchUserData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaUser className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={userData.profileImage || "/default-avatar.png"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
              {role === "superadmin" && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-white p-1 rounded-full">
                  <FaCrown size={12} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-gray-600">{userData.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {role === "superadmin" ? "Super Admin" : "Admin"}
                </span>
                <span className="text-sm text-gray-500">
                  Member since {userData.createdAt?.toDate?.().getFullYear() || "2024"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <ProfileForm userData={userData} onUpdate={handleProfileUpdate} />
      </div>
    </div>
  );
};

export default Profile;
