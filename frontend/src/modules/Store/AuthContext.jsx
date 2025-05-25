import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "./ToastStore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Use Vite or your bundler's environment config
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Not authenticated");

      const data = await res.json();
      const { userId, username, role, exp } = data;

      localStorage.setItem("username", username);
      localStorage.setItem("userId", userId);
      sessionStorage.setItem("role", role);

      setUser({ userId, username, role, exp });
    } catch (err) {
      console.error("Fetch user failed:", err);
      setUser(null);
      clearStoredAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async () => {
    await fetchUser();
  };

  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }

    clearStoredAuth();
    setUser(null);
  };

  const clearStoredAuth = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    sessionStorage.removeItem("role");
  };

  // Auto logout on token/session expiration
  useEffect(() => {
    if (user?.exp) {
      const timeout = user.exp * 1000 - Date.now();

      if (timeout <= 1000) {
        logout();
      } else {
        const timer = setTimeout(() => {
          toast.error("Session expired. You have been logged out.");
          logout();
        }, timeout);

        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};