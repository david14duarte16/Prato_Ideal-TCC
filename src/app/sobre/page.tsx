"use client";

import { motion } from "framer-motion";
import { Heart, Globe, Users, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SobreNos() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stats = [
    { label: "Restaurantes Parceiros", value: "5.000+" },
    { label: "Usuários Ativos", value: "1M+" },
    { label: "Cidades Atendidas", value: "150+" },
    { label: "Avaliações Reais", value: "2M+" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop"
            alt="Restaurante background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <motion.h1 
            {...fadeIn}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
          >
            Nossa Missão é <span className="text-red-500">Conectar</span>
          </motion.h1>
          <motion.p 
            {...fadeIn}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-light"
          >
            Ajudamos pessoas a descobrir experiências gastronômicas incríveis em todos os cantos de São Paulo.
          </motion.p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">Quem Somos</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              <p>
                O <strong>Prato Ideal</strong> nasceu da paixão por boa comida e da dificuldade de encontrar lugares autênticos em cidades desconhecidas. Começamos como um pequeno blog de avaliações e hoje somos a maior plataforma de descoberta gastronômica do país.
              </p>
              <p>
                Acreditamos que cada refeição é uma oportunidade de criar memórias. Por isso, trabalhamos duro para garantir que nossas avaliações sejam transparentes e que nossos dados estejam sempre atualizados.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {[
              {
                cargo: "Fiscal do Hambúrguer Artesanal",
                frase: "“Se o pão desmonta, eu dou nota baixa.”"
              },
              {
                cargo: "CEO das Sobremesas",
                frase: "“Não confio em restaurante sem brownie.”"
              },
              {
                cargo: "Analista de Molho da Casa",
                frase: "“Pedi extra de molho por motivos profissionais.”"
              },
              {
                cargo: "Diretora de Experiência de Rodízio",
                frase: "“Avalio velocidade do garçom e reposição de frita.”"
              }
            ].map((perfil, index) => (
              <div key={index} className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm border border-gray-100 dark:border-zinc-800/50 hover:shadow-md dark:hover:shadow-none transition-shadow">
                <div className="w-20 h-20 bg-gray-200 dark:bg-zinc-800 rounded-full mb-3 overflow-hidden border-4 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center shrink-0">
                  <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold">FOTO</span>
                </div>
                <input 
                  type="text" 
                  placeholder="[NOME]" 
                  className="bg-transparent font-bold text-gray-900 dark:text-white text-center w-full focus:outline-none mb-1 text-sm border-b border-dashed border-gray-300 dark:border-zinc-700 focus:border-red-500 pb-1"
                />
                <span className="text-[10px] uppercase font-black tracking-widest text-red-500 mb-2">{perfil.cargo}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-auto px-1">{perfil.frase}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 dark:bg-zinc-900/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-black text-red-500 mb-2">{stat.value}</div>
                <div className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 dark:text-white">Nossos Valores</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">O que nos guia todos os dias em nossa jornada.</p>
        </div>
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          {[
            { icon: <Heart className="text-red-500" />, title: "Paixão", desc: "Amamos o que fazemos e a comida que compartilhamos." },
            { icon: <ShieldCheck className="text-blue-500" />, title: "Confiança", desc: "Transparência total em todas as avaliações." },
            { icon: <Users className="text-green-500" />, title: "Comunidade", desc: "Nossa força vem da colaboração de nossos usuários." },
            { icon: <Globe className="text-purple-500" />, title: "Impacto", desc: "Apoiamos o comércio local e pequenos restaurantes." },
          ].map((value, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="p-8 bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/50 rounded-3xl shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-md transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{value.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-red-500 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Pronto para sua próxima descoberta?</h2>
            <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto font-light">
              Junte-se a milhões de pessoas que já transformaram seu jeito de comer fora.
            </p>
            <Link 
              href="/"
              className="inline-block bg-white text-red-500 font-bold px-10 py-4 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Começar Agora
            </Link>
          </div>
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 blur-3xl -ml-32 -mb-32 rounded-full"></div>
        </motion.div>
      </section>
    </div>
  );
}
