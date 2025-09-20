import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const Layout = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-100 mb-0 pb-0">
        <Navbar />
        <Outlet />
        {/* Rest of content */}
      </div>
    </>
  );
};

export default Layout;
