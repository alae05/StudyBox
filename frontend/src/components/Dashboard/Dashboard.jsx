import SideBar from "../SideBar";
import DashboardContent from "./DashboardContent";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-wrapper">
      <SideBar />
      <DashboardContent />
    </div>
  );
}