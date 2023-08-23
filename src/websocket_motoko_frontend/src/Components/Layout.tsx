import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="bg-gray-900 text-gray-300">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;