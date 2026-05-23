"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function Contato() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulating API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormState({ name: "", email: "", message: "" });
      setTimeout(() => setIsSent(false), 5000);
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const contactInfo = [
    { icon: <Mail className="text-red-500" />, title: "E-mail", detail: "contato@pratoideal.com.br", sub: "Resposta em até 24h" },
    { icon: <Phone className="text-green-500" />, title: "Telefone", detail: "+55 (11) 99876-5432", sub: "Seg-Sex, 9h às 18h" },
    { icon: <MapPin className="text-blue-500" />, title: "Endereço", detail: "Av. Paulista, 1000", sub: "São Paulo, SP" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Fale com <span className="text-red-500">Gente</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-light">
            Dúvidas, sugestões ou apenas quer bater um papo sobre gastronomia? 
            Estamos aqui para ouvir você.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 space-y-6"
          >
            {contactInfo.map((info, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                whileHover={{ x: 10 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-start gap-4 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0">
                  {info.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{info.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{info.detail}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{info.sub}</p>
                </div>
              </motion.div>
            ))}


          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-xl dark:shadow-none"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Nome Completo</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Como podemos te chamar?"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-transparent dark:border-zinc-800 focus:border-red-500 focus:bg-white dark:focus:bg-zinc-900 outline-none rounded-2xl px-6 py-4 transition-all duration-300 placeholder-gray-300 dark:placeholder-zinc-600 text-gray-700 dark:text-white"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">E-mail</label>
                  <input 
                    required
                    type="email" 
                    placeholder="Seu melhor e-mail"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-transparent dark:border-zinc-800 focus:border-red-500 focus:bg-white dark:focus:bg-zinc-900 outline-none rounded-2xl px-6 py-4 transition-all duration-300 placeholder-gray-300 dark:placeholder-zinc-600 text-gray-700 dark:text-white"
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Mensagem</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Conte-nos tudo..."
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-transparent dark:border-zinc-800 focus:border-red-500 focus:bg-white dark:focus:bg-zinc-900 outline-none rounded-2xl px-6 py-4 transition-all duration-300 placeholder-gray-300 dark:placeholder-zinc-600 text-gray-700 dark:text-white resize-none"
                  value={formState.message}
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                />
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting || isSent}
                className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                  isSent 
                    ? "bg-green-500 text-white" 
                    : "bg-red-500 hover:bg-red-600 text-white shadow-red-200"
                }`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isSent ? (
                  <>Mensagem Enviada!</>
                ) : (
                  <>
                    <Send size={20} />
                    Enviar Mensagem
                  </>
                )}
              </motion.button>

              {isSent && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-green-600 font-medium text-sm"
                >
                  Obrigado! Entraremos em contato em breve.
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
