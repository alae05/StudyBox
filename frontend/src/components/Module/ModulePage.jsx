import SideBar from "../SideBar";
import Module from "./Module";
import { useState } from "react";

import "../Dashboard/Dashboard.css";

export default function ModulePage() {
  const [activeModuleId, setActiveModuleId] = useState(null);

  return (
    <div className="dashboard-wrapper">
      <SideBar />
      <Module
        setActiveModuleId={setActiveModuleId}
      />
    </div>
  );
}
