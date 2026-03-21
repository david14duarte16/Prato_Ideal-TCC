"use client";

import { motion } from "framer-motion";
import { FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TermosDeUso() {
  const sections = [
    { title: "1. Aceitação dos Termos", content: "Ao acessar e usar este site, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços." },
    { title: "2. Uso do Serviço", content: "Nosso serviço destina-se a fornecer informações sobre restaurantes e permitir avaliações. Você concorda em usar o serviço apenas para fins lícitos e de maneira que não infrinja os direitos de terceiros." },
    { title: "3. Cadastro e Segurança", content: "Para certas funcionalidades, pode ser necessário criar uma conta. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta." },
    { title: "4. Propriedade Intelectual", content: "Todo o conteúdo presente no site, incluindo textos, gráficos, logotipos e ícones, é de nossa propriedade ou de nossos licenciadores e está protegido por leis de direitos autorais." },
    { title: "5. Limitação de Responsabilidade", content: "Não nos responsabilizamos por quaisquer danos diretos, indiretos ou consequentes resultantes do uso ou da incapacidade de usar nossos serviços." },
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b border-gray-100 pb-8"
        >
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <FileText size={24} />
            <span className="font-bold uppercase tracking-widest text-sm">Documento Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Termos de Uso</h1>
          <p className="text-gray-500 font-light">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.section 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 p-8 rounded-3xl border border-transparent hover:border-red-100 transition-colors"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChevronRight size={18} className="text-red-500" />
                {section.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {section.content}
              </p>
            </motion.section>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 p-8 bg-gray-900 rounded-[2.5rem] text-white text-center"
        >
          <h3 className="text-xl font-bold mb-4">Dúvidas sobre nossos termos?</h3>
          <p className="text-gray-400 mb-6 font-light">Entre em contato com nosso time jurídico para esclarecimentos adicionais.</p>
          <Link 
            href="/contato"
            className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            Falar com Jurídico
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
