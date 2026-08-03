import { useState } from "react";
// import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "../components/admin/Navbar";
import Sidebar from "../components/admin/Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      
      {/* Navbar */}
      <Navbar
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(prev => !prev)}
      />

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 bg-gray-100 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
