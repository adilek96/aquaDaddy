"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 p-4 rounded-lg shadow-lg backdrop-blur-md border ${getToastStyles(toast.type)}`}
            >
              {getToastIcon(toast.type)}
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-current opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Close"
              >
                <FiX className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function getToastStyles(type: ToastType): string {
  switch (type) {
    case "success":
      return "bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300";
    case "error":
      return "bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300";
    case "warning":
      return "bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300";
    case "info":
    default:
      return "bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300";
  }
}

function getToastIcon(type: ToastType) {
  const className = "w-5 h-5 flex-shrink-0";
  switch (type) {
    case "success":
      return <FiCheckCircle className={className} />;
    case "error":
      return <FiXCircle className={className} />;
    case "warning":
      return <FiAlertTriangle className={className} />;
    case "info":
    default:
      return <FiInfo className={className} />;
  }
}
