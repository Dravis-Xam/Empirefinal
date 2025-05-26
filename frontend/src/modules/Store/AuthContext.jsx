import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "./ToastStore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // not loading by default

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
    }
  };

  // ❌ Remove this — don't auto-fetch on mount
  // useEffect(() => {
  //   fetchUser();
  // }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Login failed");
      }

      // ✅ Only fetch user after successful login
      await fetchUser();
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
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

  // Auto logout when session expires
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
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
