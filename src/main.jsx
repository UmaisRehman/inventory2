import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Layout from "./Layout.jsx";
import Dashboard from "./Screens/Dashboard.jsx";
import Login from "./Screens/Login.jsx";
import Register from "./Screens/Register.jsx";
import Protectedroutes from "./Config/Routes/Protectedroutes.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Inventory from "./Screens/Inventory.jsx";
import Startprocurement from "./Screens/Startprocurement.jsx";
import Profile from "./Screens/Profile.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element:<Protectedroutes component={<Dashboard />} allowedRoles={["superadmin" , "admin"]} />
      },
      {
        path: "login",
        element: <Protectedroutes component={<Login />} allowedRoles={["public"]} />
      },
      {
        path: "register",
        element:<Protectedroutes component={<Register />} allowedRoles={["public"]} />
      },
      {
        path: "inventory",
        element:<Protectedroutes component={<Inventory />} allowedRoles={["superadmin" , "admin"]} />
      },
      {
        path: "startprocurement",
        element:<Protectedroutes component={<Startprocurement />} allowedRoles={["superadmin" , "admin"]} />
      },
      {
        path: "profile",
        element:<Protectedroutes component={<Profile />} allowedRoles={["superadmin" , "admin"]} />
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
