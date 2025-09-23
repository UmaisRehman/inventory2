import React, { useState } from "react";
import { auth, db } from "../Config/firebase/firebaseconfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

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
        }
      }
    );
    myWidget.open();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill the form correctly");
      return;
    }

    setLoading(true);

    const { firstName, lastName, email, password, role } = formData;

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("Image URL to be saved:", imageUrl);

      // Store user data in Firestore with profile image
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        role,
        profileImage: imageUrl || "",
        createdAt: new Date(),
      });

      toast.success("Account created successfully!");

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      });
      setImageUrl("");

      // Navigate after success message
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        toast.error("This email is already registered");
      } else if (err.code === "auth/invalid-email") {
        toast.error("Invalid email address");
      } else if (err.code === "auth/weak-password") {
        toast.error("Password is too weak");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center bg-gray-50 py-8 px-4 min-h-screen">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 my-8">
        <div className="bg-gray-800 py-4">
          <h2 className="text-xl md:text-2xl font-bold text-white text-center">
            Add New Account
          </h2>
        </div>

        <div className="p-4 md:p-6">
          <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={`input input-bordered w-full rounded-lg p-2 border ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-gray-500`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={`input input-bordered w-full rounded-lg p-2 border ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-gray-500`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`input input-bordered w-full rounded-lg p-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-gray-500`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input input-bordered w-full rounded-lg p-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-gray-500`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input input-bordered w-full rounded-lg p-2 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-gray-500`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Dropdown */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`select select-bordered w-full rounded-lg p-2 border ${
                  errors.role ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-gray-500`}
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>

            {/* Image Upload Field */}
            <div className="mt-4 flex flex-col items-center">
              <div className="flex items-center space-x-2">
                <FaCloudUploadAlt
                  className="text-2xl text-gray-500 cursor-pointer"
                  onClick={uploadImage}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={uploadImage}
                >
                  Upload Profile Image
                </button>
              </div>
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="Uploaded Profile"
                    className="w-24 h-24 object-cover rounded-full border shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`btn w-full rounded-lg py-3 text-white ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-900"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
