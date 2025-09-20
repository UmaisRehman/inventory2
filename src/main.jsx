import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Layout from "./Layout.jsx";
import Dashboard from "./Screens/Dashboard.jsx";
import Login from "./Screens/Login.jsx";
import Register from "./Screens/Register.jsx";
import Protectedroutes from "./Config/Routes/Protectedroutes.jsx";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Inventory from "./Screens/Inventory.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Dashboard/>
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register/>
      },
      {
        path: "inventory",
        element:<Protectedroutes component={<Inventory />}/>
      }
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
