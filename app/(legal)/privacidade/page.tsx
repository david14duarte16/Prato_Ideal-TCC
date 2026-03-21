"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Bell } from "lucide-react";

export default function PoliticaPrivacidade() {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compromisso com a LGPD</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Estamos totalmente em conformidade com a Lei Geral de Proteção de Dados (LGPD). Isso significa que você tem o direito de saber quais dados temos, para que os usamos e pode solicitar mudanças a qualquer momento.
          </p>
          <div className="flex flex-wrap gap-4">
            <div>
              <button className="bg-gray-900 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors">
                Solicitar Meus Dados
              </button>
              <p className="text-[10px] text-red-400 mt-2 font-mono ml-2"># TODO: Implementar fluxo de exportação de dados (LGPD)</p>
            </div>
            <div>
              <button className="border border-gray-200 text-gray-600 font-bold py-3 px-8 rounded-full hover:bg-gray-50 transition-colors">
                Limpar Cookies
              </button>
              <p className="text-[10px] text-red-400 mt-2 font-mono ml-2"># TODO: Implementar lógica de limpeza de cookies e storage</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
