import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaCloudUploadAlt, FaEnvelope, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import { userService } from "../Config/firebase/firebaseService";

const ProfileForm = ({ userData, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(userData?.profileImage || "");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
    reset: resetEmail,
  } = useForm({
    defaultValues: {
      email: userData?.email || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm();

  const uploadImage = () => {
    let myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dkzm5hoxm",
        uploadPreset: "exper-hackathon",
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          console.log("Image uploaded successfully: ", result.info);
          setImageUrl(result.info.secure_url);
          toast.success("Image uploaded! Click Update Image to save.");
        }
      }
    );
    myWidget.open();
  };

  const updateImage = async () => {
    if (!imageUrl || imageUrl === userData?.profileImage) {
      toast.info("No new image to update");
      return;
    }

    setLoading(true);
    try {
      await userService.updateUserProfile({ profileImage: imageUrl });
      toast.success("Profile image updated successfully!");
      onUpdate && onUpdate();
    } catch (error) {
      console.error("Image update error:", error);
      toast.error(error.message || "Failed to update image");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitEmail = async (data) => {
    if (data.email === userData?.email) {
      toast.info("Email is unchanged");
      return;
    }

    if (!currentPasswordForEmail) {
      toast.error("Current password is required for email update");
      return;
    }

    setLoading(true);
    try {
      await userService.updateEmail(data.email, currentPasswordForEmail);
      toast.success("Email updated successfully!");
      resetEmail();
      setCurrentPasswordForEmail("");
      onUpdate && onUpdate();
    } catch (error) {
      console.error("Email update error:", error);
      toast.error(error.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword(data.currentPassword, data.newPassword);
      toast.success("Password changed successfully!");
      resetPassword();
    } catch (error) {
      console.error("Password change error:", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Current password is incorrect");
      } else {
        toast.error(error.message || "Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Update Section
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <FaEnvelope className="text-green-600" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Update Email</h3>
        </div>

        <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-4">
          Current Password for Re-auth
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password (for verification)
            </label>
            <input
              type="password"
              value={currentPasswordForEmail}
              onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter current password"
              required
            />
          </div>

          New Email
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="email"
                {...registerEmail("email", {
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Invalid email address",
                  },
                })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            {emailErrors.email && (
              <p className="text-red-500 text-sm mt-1">{emailErrors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Email"}
          </button>
        </form>
      </div> */}

      {/* Profile Image Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FaCloudUploadAlt className="text-blue-600" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Profile Image</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaCloudUploadAlt
                className="text-2xl text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={uploadImage}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={uploadImage}
              >
                Upload Image
              </button>
            </div>
            {imageUrl && (
              <div className="flex items-center space-x-2">
                <img
                  src={imageUrl}
                  alt="Profile Preview"
                  className="w-12 h-12 object-cover rounded-full border-2 border-gray-200"
                />
                <span className="text-sm text-gray-600">New image ready</span>
              </div>
            )}
          </div>

          {imageUrl && imageUrl !== userData?.profileImage && (
            <button
              type="button"
              onClick={updateImage}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Image"}
            </button>
          )}
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-red-100 p-2 rounded-lg">
            <FaLock className="text-red-600" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        </div>

        <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              {...registerPassword("currentPassword", {
                required: "Current password is required",
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter current password"
            />
            {passwordErrors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              {...registerPassword("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter new password"
            />
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              {...registerPassword("confirmPassword", {
                required: "Please confirm your new password",
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
