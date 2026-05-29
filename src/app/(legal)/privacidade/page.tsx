"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Bell } from "lucide-react";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

// inside the component:
export default function PoliticaPrivacidade() {
  const [lgpdAction, setLgpdAction] = useState("export");
  const [requestStatus, setRequestStatus] = useState<"idle" | "loading" | "success">("idle");
  
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();

  const handleLgpdRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setRequestStatus("success");
    }, 1500);
  };

  const topics = [
    { icon: <Eye size={20} />, title: "Quais dados coletamos?", content: "Coletamos informações que você nos fornece diretamente (como nome e e-mail no cadastro) e dados gerados pelo uso do site (como avaliações de restaurantes e localização aproximada)." },
    { icon: <Lock size={20} />, title: "Como protegemos você?", content: "Utilizamos criptografia de ponta a ponta e protocolos de segurança rigorosos para garantir que seus dados pessoais nunca sejam acessados por pessoas não autorizadas." },
    { icon: <Shield size={20} />, title: "Compartilhamento de dados", content: "Não vendemos seus dados para terceiros. O compartilhamento ocorre apenas com parceiros essenciais para o funcionamento do serviço ou por obrigação legal." },
    { icon: <Bell size={20} />, title: "Suas Escolhas", content: "Você tem total controle sobre seus dados. A qualquer momento, você pode solicitar a exportação ou exclusão definitiva de todas as suas informações de nossa base." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-xs mb-4">
            <Shield size={14} />
            Privacidade Garantida
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Política de Privacidade</h1>
          <p className="text-gray-500 max-w-2xl mx-auto font-light">
            Sua privacidade é nossa prioridade. Entenda como cuidamos dos seus dados com transparência e respeito.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {topics.map((topic, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                {topic.icon}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{topic.title}</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                {topic.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Painel do Titular de Dados (LGPD)</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Utilize o formulário abaixo para exercer seus direitos como titular de dados. Você pode solicitar uma cópia de todos os seus dados armazenados ou pedir a exclusão permanente de sua conta.
          </p>
          <div className="relative mt-2">
            {status === "unauthenticated" && (
              <div className="absolute inset-0 bg-gray-50/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-3xl border border-gray-200">
                <Lock size={32} className="text-gray-400 mb-3" />
                <p className="text-gray-700 font-medium mb-4 text-center px-4">
                  Faça login para gerenciar seus dados.
                </p>
                <button 
                  onClick={() => openAuthModal("Faça login para acessar o painel LGPD e gerenciar seus dados.")}
                  className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Entrar na Conta
                </button>
              </div>
            )}
            
            <form onSubmit={handleLgpdRequest} className={`bg-gray-50 p-6 rounded-3xl border border-gray-200 transition-all ${status === "unauthenticated" ? "opacity-60 pointer-events-none select-none grayscale" : ""}`}>
              {requestStatus === "success" ? (
              <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-200">
                <Shield size={32} className="text-green-500 mx-auto mb-3" />
                <h3 className="text-green-800 font-bold text-lg mb-2">Solicitação Recebida!</h3>
                <p className="text-green-700 text-sm">
                  Sua requisição foi registrada com sucesso. Nossa equipe jurídica processará o pedido e enviará um retorno para o e-mail informado em até 72 horas úteis.
                </p>
                <button 
                  type="button" 
                  onClick={() => setRequestStatus("idle")}
                  className="mt-4 text-green-600 font-bold hover:underline text-sm"
                >
                  Fazer nova solicitação
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">E-mail associado à conta</label>
                  <input 
                    type="email" 
                    required
                    readOnly
                    value={session?.user?.email || ""}
                    placeholder="Faça login para preencher"
                    className="w-full p-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Solicitação</label>
                  <select 
                    value={lgpdAction}
                    onChange={(e) => setLgpdAction(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all bg-white"
                  >
                    <option value="export">Baixar meus dados (Exportação)</option>
                    <option value="delete">Excluir meus dados permanentemente</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={requestStatus === "loading"}
                    className="w-full md:w-auto bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {requestStatus === "loading" ? (
                      <>Processando...</>
                    ) : (
                      <>Enviar Solicitação LGPD</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        </motion.section>
      </div>
    </div>
  );
}
