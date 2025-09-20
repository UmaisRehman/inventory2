import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseconfig";

const Protectedroutes = ({ component }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // Use null as initial state instead of false
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user); // Set user state if logged in
            } else {
                setUser(null); // Set user to null if logged out
                navigate('/login'); // Redirect to login if no user
            }
        });
        
        return () => unsubscribe(); // Clean up listener when component unmounts
    }, [navigate]);

    if (user === null) {
        return <h1>Loading...</h1>; // Show loading state until user is detected
    }

    return component; // Render the protected component if user is logged in
};

export default Protectedroutes;