import "./Dashboard.css";


export default function HeaderDashboard({ title = "Dashboard" }) {
  

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-left">
        <h1 className="dashboard-title">{title}</h1>
      </div>  
    </header>
  );
}