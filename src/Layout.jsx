import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";

const Layout = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-100 mb-0 pb-0">
        <Navbar />
        <Outlet />
        {/* Global Toast Container - persists across all pages */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{
            "--toastify-toast-width": "320px",
            "--toastify-toast-min-height": "48px",
            "--toastify-font-family": "inherit",
            "--toastify-z-index": 9999,
            top: "20px",
            right: "20px",
          }}
        />
      </div>
    </>
  );
};

export default Layout;
