import "../../Styles/Inscription.css";
export default function Message({ message }) {
  if (!message) return null;

  return (
    <p className={`auth-message ${message.type}`}>
      {message.text}
    </p>
  );
}