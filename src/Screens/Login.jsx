import React, { useState } from "react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Login logic would go here
    console.log("Login attempted:", formData);
  };

  return (
    <div className="flex justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Header with neutral color */}
        <div className="bg-gray-800 py-4">
          <h2 className="text-xl md:text-2xl font-bold text-white text-center">
            Welcome Back
          </h2>
        </div>

        <div className="p-4 md:p-6">
          <p className="text-center text-gray-600 mb-6">
            Please login to continue
          </p>

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
              <button className="btn bg-gray-800 hover:bg-gray-900 text-white rounded-lg py-3 w-full transition-all duration-300">
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
