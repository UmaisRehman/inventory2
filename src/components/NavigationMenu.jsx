import React from "react";
import { useAuth } from "../hooks/useAuth";

const NavigationMenu = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <MenuItem>
        <div className="block px-4 py-2 text-sm text-gray-500">Loading...</div>
      </MenuItem>
    );
  }

  return (
    <div>
      {/* Only show for superadmin */}
      {user?.isLoggedIn && user?.role === "superadmin" && (
        <MenuItem>
          <a
            href="/register"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Add New Account
          </a>
        </MenuItem>
      )}
    </div>
  );
};

export default NavigationMenu;