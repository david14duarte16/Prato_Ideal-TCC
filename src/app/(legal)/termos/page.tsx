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

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <p className="text-gray-600">
            Abaixo você pode ler e fazer o download dos nossos Termos de Uso atualizados, que incluem nossa adequação rigorosa à LGPD.
          </p>
          <a 
            href="/termos_de_uso_prato_ideal.pdf" 
            download="termos de uso prato ideal.pdf"
            className="shrink-0 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <FileText size={20} />
            Baixar PDF Completo
          </a>
        </div>

        <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-200 h-[70vh] w-full shadow-inner relative">
          <object 
            data="/termos_de_uso_prato_ideal.pdf" 
            type="application/pdf" 
            className="w-full h-full"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-50">
              <FileText size={48} className="mb-4 text-gray-300" />
              <p className="mb-4 font-medium text-lg text-gray-700">Seu navegador não suporta visualização de PDF integrada.</p>
              <a href="/termos_de_uso_prato_ideal.pdf" download="termos de uso prato ideal.pdf" className="text-red-500 font-bold hover:underline">
                Clique aqui para baixar o arquivo
              </a>
            </div>
          </object>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 p-8 bg-gray-900 rounded-[2.5rem] text-white text-center"
        >
          <h3 className="text-xl font-bold mb-4">Dúvidas sobre nossos termos?</h3>
          <p className="text-gray-400 mb-6 font-light">Entre em contato com nosso time jurídico para esclarecimentos adicionais ou requisições da LGPD.</p>
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
