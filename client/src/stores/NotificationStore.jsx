import React, { createContext, useContext, useState, useCallback } from "react";
import {seedNotifications} from "../data/NotificationData";

const NotificationContext = createContext(undefined);

let counter = 0;


export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(seedNotifications);

  const addNotification = useCallback((n) => {
    const newNotif = {
      ...n,
      id: `n${++counter + 100}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback((userId) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
  }, []);

  const getUnreadCount = useCallback((userId) => {
    return notifications.filter(n => n.userId === userId && !n.read).length;
  }, [notifications]);

  const getUserNotifications = useCallback((userId) => {
    return notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markRead, markAllRead, getUnreadCount, getUserNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};