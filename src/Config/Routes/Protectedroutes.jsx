import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase/firebaseconfig";

const Protectedroutes = ({ component, allowedRoles }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (allowedRoles.includes("public")) {
          // 🚀 Already logged in but trying to access /login
          navigate("/"); // redirect to dashboard or home
          setLoading(false);
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);

        if (!allowedRoles.includes("public")) {
          navigate("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, allowedRoles, location.pathname]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  // Public route (like login) doesn’t need role checks
  if (allowedRoles.includes("public")) {
    return component;
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(role)) {
    return <h1 className="text-center mt-10">Access Denied 🚫</h1>;
  }

  return component;
};

export default Protectedroutes;
