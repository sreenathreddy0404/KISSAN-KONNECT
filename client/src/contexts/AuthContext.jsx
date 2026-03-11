import React, { createContext, useContext, useState, ReactNode } from "react";
import { usersData, emptyAddress } from "@/data/usersData";


const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([...usersData]);
  const [currentUser, setCurrentUser] = useState(() => {
    const savedId = localStorage.getItem("kk_user_id");
    if (savedId) return usersData.find(u => u.id === savedId) || null;
    return null;
  });

  const role = currentUser?.role || null;
  const userName = currentUser?.name || "";
  const userId = currentUser?.id || "";
  const userEmail = currentUser?.email || "";
  const userAddress = currentUser?.address || emptyAddress;
  const userPhone = currentUser?.phone || "";
  const userPhoto = currentUser?.photo || "";

  const setRole = (r) => {
    if (!r) {
      setCurrentUser(null);
      localStorage.removeItem("kk_user_id");
    }
  };

  const login = (email, password, selectedRole) => {
    const user = users.find(u => u.email === email && u.password === password && u.role === selectedRole);
    if (!user) return { success: false, error: "Invalid credentials or role mismatch" };
    setCurrentUser(user);
    localStorage.setItem("kk_user_id", user.id);
    return { success: true };
  };

  const register = (name, email, password, role, address, phone) => {
    if (users.find(u => u.email === email)) {
      return { success: false, error: "Email already registered" };
    }
    const id = role === "farmer" ? `f${Date.now()}` : `bu${Date.now()}`;
    const newUser = { id, name, email, password, role, address, phone, joinedAt: new Date().toISOString().split("T")[0], photo: "" };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem("kk_user_id", newUser.id);
    return { success: true };
  };

  const updateProfile = (data) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  };

  const changePassword = (oldPw, newPw) => {
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (currentUser.password !== oldPw) return { success: false, error: "Current password is incorrect" };
    if (newPw.length < 6) return { success: false, error: "New password must be at least 6 characters" };
    const updated = { ...currentUser, password: newPw };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("kk_user_id");
  };

  return (
    <AuthContext.Provider value={{
      role, userName, userId, userEmail, userAddress, userPhone, userPhoto, currentUser,
      setRole, login, register, updateProfile, changePassword, logout, allUsers: users,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
