import "../../Styles/Inscription.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Message from "./Message";
export default function Inscription(){
const [nomComplet,setNomComplet]=useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message,setMessage]=useState(null);
const [loading,setLoading]=useState(false); 

const navigate=useNavigate();
 async function register(){
  try{
  setLoading(true); 
   await new Promise((resolve) => setTimeout(resolve, 2000));
   const response=await fetch(
    "http://localhost:3000/auth/register",{
      method:'POST',
      headers:{
         "Content-Type": "application/json"
      },
      body:JSON.stringify({nomComplet,email,password})
    }
   );
   const data=await response.text();
   if(data==="ok"){
     setLoading(false);
     setMessage({text:"Compte créé avec succès !",type:"success"});
     setTimeout(() => {navigate("/connexion");}, 2000);
   }else{
    setLoading(false);
    setMessage({text:data,type:"error"});
   }
 }catch(err){
      setMessage({
      text:"Erreur serveur ou connexion",
      type:"error"
    });
}finally{
  setLoading(false);
}}
  return (    
  <form onSubmit={(e) => {e.preventDefault();register();}}> 
     <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo" onClick={()=> navigate("/")}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
 
        <h1 className="auth-title">Inscription</h1>
        <p className="auth-subtitle">Créez votre compte pour commencer</p>
        <Message message={message} />
        <div className="field-group">
          <label className="field-label">Nom complet</label>
          <div className="input-wrapper">
            <svg
              className="input-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              name="nom"
              placeholder="Votre nom"
              value={nomComplet}
              onChange={(e) => setNomComplet(e.target.value)}
              className="auth-input"
              onFocus={()=>{setMessage(null)}}
              required
            />
          </div>
        </div>
 
        <div className="field-group">
          <label className="field-label">Email</label>
          <div className="input-wrapper">
            <svg
              className="input-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              type="email"
              name="email"
              placeholder="votre@email.com"
              value={email}
              onFocus={()=>{setMessage(null)}}
              onChange={(e)=>setEmail(e.target.value)}
              className="auth-input"
              required
            />
          </div>
        </div>
 
        <div className="field-group">
          <label className="field-label">Mot de passe</label>
          <div className="input-wrapper">
            <svg
              className="input-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type="password"
              name="motDePasse"
              minLength={6}
              placeholder="Min. 6 caractères"
              value={password}
              onFocus={()=>{setMessage(null)}}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />

          </div>
        </div>
 
        <button type="submit" className="btn-Inscrip-primary" > 
          {loading ? <span className="spinner"></span> : "Créer mon compte"}
        </button>
 
        <p className="auth-redirect">
          Déjà un compte ?{" "}
          <span className="auth-link" onClick={()=>navigate("/connexion")}>
            Se connecter
          </span>
        </p>
      </div>
    </div>
  </form>
    );
}