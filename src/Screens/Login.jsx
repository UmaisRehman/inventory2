import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, signInWithCustomToken } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../Config/firebase/firebaseService";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Initialize VK ID
    const initVKID = async () => {
      try {
        // Replace with your actual VK app ID
        const vkid = new VKID('YOUR_VK_APP_ID');

        // Configure VK ID button
        vkid.init({
          container: 'vk-login-button',
          style: {
            width: '100%',
            height: 40,
            borderRadius: 8,
          },
          onSuccess: async (data) => {
            try {
              // Handle VK login success
              const { user, token } = data;

              // Create or get Firebase user
              const firebaseToken = await authenticateWithFirebase(user, token);

              // Sign in with Firebase custom token
              await signInWithCustomToken(auth, firebaseToken);

              toast.success("VK Login successful! Redirecting...");
              setTimeout(() => {
                navigate("/");
              }, 2000);
            } catch (error) {
              console.error('VK authentication error:', error);
              toast.error("Failed to authenticate with VK");
            }
          },
          onError: (error) => {
            console.error('VK login error:', error);
            toast.error("VK login failed");
          }
        });
      } catch (error) {
        console.error('VK ID initialization error:', error);
      }
    };

    initVKID();
  }, [auth, navigate]);

  const authenticateWithFirebase = async (vkUser, vkToken) => {
    try {
      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', `vk_${vkUser.id}`);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          vkId: vkUser.id,
          email: vkUser.email || null,
          firstName: vkUser.first_name,
          lastName: vkUser.last_name,
          avatar: vkUser.photo_200,
          role: 'admin', // Default role
          provider: 'vk',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Here you would typically call your backend to create a Firebase custom token
      // For now, we'll simulate this - in production, call your server endpoint
      const response = await fetch('/api/auth/vk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vkUser,
          vkToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get Firebase token');
      }

      const { firebaseToken } = await response.json();
      return firebaseToken;
    } catch (error) {
      console.error('Firebase authentication error:', error);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again.";

      switch (error.code) {
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/user-not-found":
          errorMessage = "User not registered. Please sign up first.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format.";
          break;
        default:
          errorMessage = "Unable to login. Please check your details.";
          break;
      }

      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gray-800 py-4">
          <h2 className="text-xl md:text-2xl font-bold text-white text-center">
            Welcome Back
          </h2>
        </div>

        <div className="p-4 md:p-6">
          <p className="text-center text-gray-600 mb-6">
            Please login to continue
          </p>

          {/* VK Login Button */}
          <div className="form-control mb-4">
            <div id="vk-login-button"></div>
          </div>

          <div className="divider">OR</div>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-control mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 border-gray-300"
                required
              />
            </div>

            {/* Password Field */}
            <div className="form-control mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 border-gray-300"
                required
              />
              <div className="flex justify-between items-center mt-1">
                <label className="cursor-pointer label justify-start">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="checkbox checkbox-sm mr-2 rounded focus:ring-gray-500 border-gray-300"
                  />
                  <span className="label-text text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Login Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn bg-gray-800 hover:bg-gray-900 text-white rounded-lg py-3 w-full transition-all duration-300"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
