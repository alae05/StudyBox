import SideBar from "../SideBar";
import ProfileMain from "./ProfileMain";
import "../Dashboard/Dashboard.css";

export default function ProfilePage() {
  return (
    <div className="dashboard-wrapper">
      <SideBar />
      <ProfileMain />
    </div>
  );
}
