import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore login state from localStorage on page refresh
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("user_role");
    const savedSuperuser = localStorage.getItem("is_superuser");

    if (savedToken) {
      setToken(savedToken);
      setRole(savedRole);
      setIsSuperuser(savedSuperuser === "true");
    }

    setLoading(false);
  }, []);

  const login = (tokenValue, userRole, isSuperuserFlag) => {
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user_role", userRole);
    localStorage.setItem("is_superuser", isSuperuserFlag);

    setToken(tokenValue);
    setRole(userRole);
    setIsSuperuser(isSuperuserFlag);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("is_superuser");

    setToken(null);
    setRole(null);
    setIsSuperuser(false);
  };

  return (
    <AuthContext.Provider value={{ token, role, isSuperuser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
