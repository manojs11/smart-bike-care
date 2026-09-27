import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation menu"
        ></button>
      )}

      <DashboardHeader openSidebar={openSidebar} />

      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;