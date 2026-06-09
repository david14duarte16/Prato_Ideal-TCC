"use client";

import React, { createContext, useContext, useState } from "react";
import AuthModal from "../ui/AuthModal";

interface AuthModalContextProps {
  openAuthModal: (customMessage?: string) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextProps | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const openAuthModal = (customMessage?: string) => {
    setMessage(customMessage);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={closeAuthModal} message={message} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
