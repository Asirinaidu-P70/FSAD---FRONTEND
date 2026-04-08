import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  loginUser,
  registerUser,
  updateCurrentUser,
  setApiAuthToken,
} from "../services/api";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "workshop-platform-auth";

function readStoredSession() {
  const storedValue = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    return parsedValue?.user || parsedValue || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredSession());
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [user]);

  const login = async (credentials) => {
    setIsAuthLoading(true);

    try {
      const response = await loginUser(credentials);
      setApiAuthToken(response.token);
      setUser(response.user);
      toast.success(`Welcome back, ${response.user.name.split(" ")[0]}.`);
      return response.user;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signup = async (payload) => {
    setIsAuthLoading(true);

    try {
      const response = await registerUser(payload);
      setApiAuthToken(response.token);
      setUser(response.user);
      toast.success("Account created successfully.");
      return response.user;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    setApiAuthToken(null);
    setUser(null);
    toast("Signed out successfully.");
  };

  const updateProfile = async (payload) => {
    const updatedUser = await updateCurrentUser({
      ...(user || {}),
      ...payload,
    });
    setUser(updatedUser);
    toast.success("Profile updated.");
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        updateProfile,
        isAuthLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
