import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./components/Index/Index";
import Inscription from "./components/Auth/Inscription";
import Connexion from "./components/Auth/Connexion";
import ForgotPassword from "./components/Auth/ForgotPassword";
import VerificationCode from "./components/Auth/VerificationCode";
import Newpassword from "./components/Auth/Newpassword";
import Dashboard from "./components/Dashboard/Dashboard";
import Modulepage from "./components/Module/ModulePage";
import PagePlanner from "./components/Planner/PagePlanner";
import ProfilePage from "./components/Profile/Profilepage";
import Revision from "./components/Revision/Revision";
import Notes from "./components/Notes/Notes";
import StudyTimer from "./components/Timer/StudyTimer";
 
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verification-code" element={<VerificationCode />} />
        <Route path="/new-password" element={<Newpassword />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/modules" element={<Modulepage />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/planner" element={<PagePlanner />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/revision" element={<Revision />} />
        <Route path="*" element={
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",flexDirection:"column",gap:12}}>
            <span style={{fontSize:48}}>🔍</span>
            <h2 style={{color:"#1e293b"}}>Page non trouvée</h2>
            <a href="/" style={{color:"#3b82f6",fontSize:14}}>Retour à l'accueil</a>
          </div>
        } />
      </Routes>
      <StudyTimer />
    </Router>
  );
}
