import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "./ToastStore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // not loading by default

  const fetchUser = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
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

  useEffect(() => { fetchUser(); }, []);
  const login = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || data.message || "Login failed");
        return null;
      }

      if (!data.role) {
        toast.error("Incomplete login response from server");
        return null;
      }

      sessionStorage.setItem("role", data.role);
      localStorage.setItem("username", formData.username);
      toast.success("Login successful");

      await fetchUser(); // Fetch user info after login

      return data.role; // Return role so the component can decide what to do
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
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
        logout,
        loading,
        login,
        fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
