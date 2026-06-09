"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, ArrowRight, UserPlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent body scrolling
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle click outside modal content
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          {/* Backdrop Overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
            className="absolute inset-0 bg-[#0a0a0af2] backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="relative w-full max-w-md overflow-hidden rounded-4xl bg-zinc-950 border border-zinc-800 p-8 sm:p-10 shadow-2xl text-center"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            {/* Icon Graphic */}
            <div className="flex justify-center mb-6">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-tr from-[#B33817]/10 to-[#DD9318]/10 border border-[#B33817]/20 shadow-xl group">
                <Image
                  src="/logo-icon-128.png"
                  alt="Logo Prato Ideal"
                  width={44}
                  height={44}
                  className="object-contain transition-transform duration-500 group-hover:rotate-[15deg]"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-linear-to-r from-[#B33817] to-[#DD9318] flex items-center justify-center border border-zinc-950 shadow-md">
                  <Lock size={11} className="text-white" />
                </div>
              </div>
            </div>

            {/* Text details */}
            <h3
              id="auth-modal-title"
              className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight font-outfit"
            >
              Que bom ter você por aqui!
            </h3>
            
            <p className="text-zinc-400 text-sm sm:text-base mb-8 leading-relaxed font-light">
              {message || "Para salvar seus restaurantes favoritos, realizar avaliações e compartilhar suas experiências, você precisa ter uma conta ativa."}
            </p>

            {/* Primary Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => handleNavigate("/login")}
                className="w-full bg-linear-to-r from-orange-500 to-rose-500 text-white rounded-2xl py-4 font-semibold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 group hover:shadow-orange-500/40 transition-all outline-none active:scale-[0.99] border-0"
              >
                <span>Fazer Login</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleNavigate("/signup")}
                className="w-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 transition-all outline-none active:scale-[0.99]"
              >
                <UserPlus className="w-5 h-5 text-zinc-400" />
                <span>Criar uma Conta Grátis</span>
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="mt-6 text-sm text-zinc-500 hover:text-zinc-300 font-medium transition-colors outline-none hover:underline"
            >
              Continuar navegando
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
