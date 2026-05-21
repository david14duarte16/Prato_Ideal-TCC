"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "necessary");
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookie-consent", "custom");
    setIsVisible(false);
    setShowManage(false);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && !showManage && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 pointer-events-none"
          >
            <div className="max-w-7xl mx-auto pointer-events-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <div className="flex-1 flex gap-5 items-start">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Cookie size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Sua privacidade é importante</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    Utilizamos cookies para personalizar conteúdo, anúncios e melhorar a sua experiência no site. 
                    Ao continuar navegando, você concorda com a nossa <Link href="/cookies" className="text-red-500 hover:underline font-medium">Política de Cookies</Link> e <Link href="/privacidade" className="text-red-500 hover:underline font-medium">Política de Privacidade</Link>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <button 
                  onClick={handleReject}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-colors"
                >
                  Recusar
                </button>
                <button 
                  onClick={() => setShowManage(true)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-colors"
                >
                  Gerenciar
                </button>
                <button 
                  onClick={handleAcceptAll}
                  className="px-8 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-sm transition-colors"
                >
                  Aceitar Todos
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Gerenciamento */}
      <AnimatePresence>
        {showManage && isVisible && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManage(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full relative z-10 p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowManage(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={24} className="text-red-500" />
                <h3 className="text-2xl font-bold text-gray-900">Gerenciar Cookies</h3>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Estritamente Necessários</h4>
                    <p className="text-sm text-gray-500">Essenciais para o funcionamento do site. Não podem ser desativados.</p>
                  </div>
                  <input type="checkbox" checked disabled className="mt-1" />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Desempenho e Analíticos</h4>
                    <p className="text-sm text-gray-500">Ajudam-nos a entender como os visitantes interagem com o site.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 accent-red-500" />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Marketing</h4>
                    <p className="text-sm text-gray-500">Usados para exibir anúncios relevantes para você.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 accent-red-500" />
                </div>
              </div>

              <button 
                onClick={handleSavePreferences}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Salvar Preferências
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
