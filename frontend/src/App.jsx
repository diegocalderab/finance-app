import { useState } from "react";
import { getToken } from "./lib/api";
import Auth from "./screens/Auth";
import Shell from "./screens/Shell";

export default function App() {
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(null);

  const handleAuth = (data) => {
    setTokenState(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    setTokenState(null);
    setUser(null);
  };

  if (!token) return <Auth onAuth={handleAuth} />;
  return <Shell user={user} onLogout={handleLogout} />;
}
