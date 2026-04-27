import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const DashboardLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const orgId = localStorage.getItem("orgId");
    
    if (!token) {
      navigate("/login");
    } else if (!orgId) {
      navigate("/onboarding");
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8F9FA] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
