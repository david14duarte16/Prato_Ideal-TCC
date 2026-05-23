"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastEvent {
  id: string;
  message: string;
  type: ToastType;
}

export function toast(message: string, type: ToastType = "info") {
  if (typeof window === "undefined") return;
  const event = new CustomEvent<ToastEvent>("toast", {
    detail: { id: Math.random().toString(36).substring(7), message, type }
  });
  window.dispatchEvent(event);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const handleToast = (e: CustomEvent<ToastEvent>) => {
      const newToast = e.detail;
      setToasts(prev => [...prev, newToast]);
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener("toast", handleToast as EventListener);
    return () => window.removeEventListener("toast", handleToast as EventListener);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success": return <CheckCircle2 className="text-green-500 w-6 h-6" />;
      case "error": return <AlertCircle className="text-red-500 w-6 h-6" />;
      case "info": return <Info className="text-blue-500 w-6 h-6" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case "success": return "bg-green-50 border-green-200 text-green-800";
      case "error": return "bg-red-50 border-red-200 text-red-800";
      case "info": return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 pr-12 rounded-2xl border shadow-lg relative min-w-[300px] max-w-[400px] ${getStyles(t.type)}`}
          >
            <div className="shrink-0 mt-0.5">{getIcon(t.type)}</div>
            <p className="text-sm font-medium leading-relaxed">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
