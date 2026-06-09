"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, X, Copy, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { announce } from "@/components/features/accessibility/AriaAnnouncer";

export default function PromoBanner() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText("PRATOIDEAL");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenModal = () => {
    if (!session) {
      announce("Faça login para resgatar cupons");
      router.push("/login");
      return;
    }
    setShowModal(true);
  };

  return (
    <section className="py-12 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="bg-linear-to-r from-red-600 to-orange-500 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white font-outfit mb-4 leading-tight">
              Cupom Exclusivo <br className="hidden md:block" />
              <span className="text-yellow-300">PratoIdeal:</span> Ganhe até 50% OFF
            </h2>
            <p className="text-white/90 text-lg md:text-xl max-w-xl">
              Faça sua primeira reserva com nosso código especial e descubra os melhores restaurantes da cidade pagando menos!
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-red-600 hover:text-red-700 font-bold text-lg md:text-xl px-8 py-4 rounded-full shadow-lg transition-colors flex items-center gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
              onClick={handleOpenModal}
            >
              <Ticket size={24} />
              <span>Pegar Meu Cupom</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full relative z-10 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              {/* Confetti decoration */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />

              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <X size={24} />
              </button>

              <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
                <Ticket size={40} className="transform -rotate-45" />
              </div>

              <h3 className="text-3xl font-extrabold text-gray-900 font-outfit mb-2">Parabéns! 🎉</h3>
              <p className="text-gray-600 mb-8 text-lg">Aqui está o seu cupom exclusivo. Use na sua próxima reserva e aproveite!</p>
              
              <div className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4 flex items-center justify-between mb-8">
                <span className="font-mono text-2xl font-bold text-gray-800 tracking-wider">PRATOIDEAL</span>
                <button 
                  onClick={handleCopy}
                  className={`p-3 rounded-xl transition-all flex items-center justify-center ${copied ? 'bg-green-100 text-green-600' : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 shadow-sm'}`}
                  aria-label="Copiar cupom"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-linear-to-r from-red-600 to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50"
              >
                Entendi, obrigado!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
