// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

// Aqui viriam os dados da sua API futuramente
const initialNotifications = [
  { id: "1", titulo: "Congresso de IA 2025", status: "aprovada", feedback: "Certificado válido...", data: "2026-03-08", lida: false },
  { id: "2", titulo: "Palestra Design Thinking", status: "rejeitada", feedback: "Carga horária ilegível...", data: "2026-03-07", lida: false },
  { id: "3", titulo: "Monitoria Cálculo I", status: "pendente", feedback: "Em análise...", data: "2026-03-05", lida: true },
];

interface Notification {
  id: string;
  titulo: string;
  status: string;
  feedback: string;
  data: string;
  lida: boolean;
}

interface NotificationContextData {
  notifications: Notification[];
  unreadCount: number;
  toggleReadStatus: (id: string, currentStatus: boolean) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const toggleReadStatus = (id: string, currentStatus: boolean) => {
    setNotifications((current) =>
      current.map((notif) => (notif.id === id ? { ...notif, lida: !currentStatus } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((notif) => ({ ...notif, lida: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, toggleReadStatus, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);