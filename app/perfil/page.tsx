"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Camera, MapPin, Calendar, Edit3, Shield, Star, Heart, Clock } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("info");

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Model data for the UI
  const userModel = {
    bio: "Amante da gastronomia paulistana e caçador dos melhores hambúrgueres da cidade. 🍔",
    location: "São Paulo, SP",
    memberSince: "Março de 2024",
    stats: [
      { label: "Avaliações", value: "24", icon: <Star className="text-yellow-500" /> },
      { label: "Fotos", value: "112", icon: <Camera className="text-blue-500" /> },
      { label: "Favoritos", value: "15", icon: <Heart className="text-red-500" /> },
    ],
    recentActivity: [
      { type: "review", place: "Artisan Burger", date: "Há 2 dias", rating: 5 },
      { type: "favorite", place: "Sushi Zen", date: "Há 1 semana", rating: null },
      { type: "review", place: "Pastifício Giovanni", date: "Há 2 semanas", rating: 4 },
    ]
  };

  const name = session?.user?.name || "Usuário";
  const email = session?.user?.email || "usuario@exemplo.com";
  const image = session?.user?.image;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-4 max-w-5xl">
        {/* Header/Cover Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="h-48 bg-linear-to-r from-red-500 to-orange-400 relative">
            <div className="absolute top-0 right-0 p-6">
              <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 p-3 rounded-2xl hover:bg-white/30 transition-all">
                <Edit3 size={20} />
              </button>
            </div>
          </div>
          
          <div className="px-8 pb-8 pt-0 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="relative -mt-20 mb-6 group">
              {image ? (
                <Image 
                  src={image} 
                  alt={name} 
                  width={160}
                  height={160}
                  className="rounded-[2.5rem] border-8 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-40 h-40 rounded-[2.5rem] border-8 border-white shadow-lg bg-red-100 flex items-center justify-center text-red-500 text-6xl font-black">
                  {name.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-2 right-2 p-2 bg-gray-900 text-white rounded-xl shadow-lg border-2 border-white cursor-pointer hover:bg-red-500 transition-colors">
                <Camera size={18} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-6">
              <div>
                <motion.h1 
                  {...fadeIn}
                  className="text-4xl font-black text-gray-900 mb-2 tracking-tight"
                >
                  {name}
                </motion.h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Mail size={16} />
                    <span className="text-sm">{email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <MapPin size={16} />
                    <span className="text-sm">{userModel.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Calendar size={16} />
                    <span className="text-sm">Membro desde {userModel.memberSince}</span>
                  </div>
                </div>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-red-200 transition-all hover:-translate-y-1">
                Editar Perfil
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Bio */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sobre mim</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                {userModel.bio}
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                {userModel.stats.map((stat, i) => (
                  <div key={i} className="text-center p-4 bg-gray-50 rounded-3xl group hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all duration-300">
                    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    <div className="text-lg font-black text-gray-900">{stat.value}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <Shield className="text-red-500 mb-4 w-10 h-10" />
                <h3 className="text-xl font-bold mb-2">Conta Verificada</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                  Seu perfil possui o selo de autenticidade Sabor & Cia. Suas avaliações têm maior visibilidade.
                </p>
                <div className="flex items-center gap-2 text-red-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Saber mais <ChevronRight size={14} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16 rounded-full"></div>
            </motion.div>
          </div>

          {/* Right Column - Tabs & Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-2 rounded-3xl inline-flex gap-2 border border-gray-100 shadow-sm mb-4">
              {["info", "activity", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all ${
                    activeTab === tab 
                      ? "bg-red-500 text-white shadow-md shadow-red-200" 
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {tab === "info" ? "Informações" : tab === "activity" ? "Atividade" : "Preferências"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                      Meus Dados
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Nome Completo</label>
                        <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-2xl">{name}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">E-mail</label>
                        <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-2xl">{email}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Cidade Principal</label>
                        <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-2xl">{userModel.location}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Tipo de Conta</label>
                        <p className="text-red-500 font-black bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-2">
                          <Star size={16} fill="currentColor" /> Premium
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "activity" && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {userModel.recentActivity.map((act, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          act.type === "review" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                        }`}>
                          {act.type === "review" ? <Star size={20} /> : <Heart size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {act.type === "review" ? `Avaliou ${act.place}` : `Favoritou ${act.place}`}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-400 font-medium">{act.date}</span>
                            {act.rating && (
                              <span className="text-xs font-black text-yellow-500 ml-2">★ {act.rating}.0</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size = 20, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
