import React, { useState } from "react";

const AddAccount = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Header with neutral color */}
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
                className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 border-gray-300"
                required
              />
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
                className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 border-gray-300"
                required
              />
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
                className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 border-gray-300"
                required
              />
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
                className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 border-gray-300"
                required
              />
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
                className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 border-gray-300"
                required
              />
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
                className="select select-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 border-gray-300"
                required
              >
                <option value="" disabled>Select Role</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="form-control pt-4">
              <button 
                type="submit" 
                className="btn bg-gray-800 hover:bg-gray-900 text-white rounded-lg py-3 w-full transition-all duration-300"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAccount;