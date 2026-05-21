"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Camera, MapPin, Calendar, Edit3, Shield, Star, Heart, Clock, ChevronRight, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { FavoriteItem } from "@/lib/hooks/useFavorites";
import { ReviewItem } from "@/lib/services/restaurantService";
import { mockFavoritesAPIResponse, mockReviewsAPIResponse, mockUsers } from "@/services/mockData";
import { Badge } from "@/components/ui/Badge";
import { getUserLevelData, GAMIFICATION_LEVELS } from "@/lib/utils/gamification";
import Link from "next/link";

const LEVEL_INDEX: Record<string, number> = { gray: 0, blue: 1, purple: 2, amber: 3 };

const BACKGROUND_OPTIONS = [
  { id: 'bg1', name: 'Café Aconchegante', url: '/backgrounds/profile_bg_cozy_cafe_1779381875294.png', requiredLevel: 'gray' },
  { id: 'bg2', name: 'Ingredientes Frescos', url: '/backgrounds/profile_bg_fresh_ingredients_1779381936191.png', requiredLevel: 'gray' },
  { id: 'bg3', name: 'Forno a Lenha', url: '/backgrounds/profile_bg_pizza_oven_1779382066289.png', requiredLevel: 'gray' },
  { id: 'bg4', name: 'Feira Noturna', url: '/backgrounds/profile_bg_street_food_1779382114704.png', requiredLevel: 'gray' },
  { id: 'bg5', name: 'Arte Gourmet', url: '/backgrounds/profile_bg_gourmet_plating_1779382163500.png', requiredLevel: 'blue' },
  { id: 'bg6', name: 'Adega Exclusiva', url: '/backgrounds/profile_bg_wine_tasting_1779382193346.png', requiredLevel: 'purple' },
  { id: 'bg7', name: 'Cozinha Estrelada', url: '/backgrounds/profile_bg_michelin_kitchen_1779382233976.png', requiredLevel: 'amber' },
  { id: 'bg8', name: 'Banquete Dourado', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200', requiredLevel: 'amber' },
  
  // Novas opções em estilo de arte
  { id: 'bg9', name: 'Rascunho de Café (Arte)', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200', requiredLevel: 'gray' },
  { id: 'bg10', name: 'Aquarela de Sabores (Arte)', url: 'https://images.unsplash.com/photo-1499892477393-f675706cbe6e?auto=format&fit=crop&q=80&w=1200', requiredLevel: 'blue' },
  { id: 'bg11', name: 'Pintura de Vinho (Arte)', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1200', requiredLevel: 'purple' },
  { id: 'bg12', name: 'Ilustração Estrelada (Arte)', url: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&q=80&w=1200', requiredLevel: 'amber' },
];

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("activity");
  const [showAllActivity, setShowAllActivity] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [showBgModal, setShowBgModal] = useState(false);
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0].url);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState("Explorador da gastronomia digital testando o novo sistema Prato Ideal. 🚀");

  useEffect(() => {
    if (status === "loading") return;

    // Defer state updates to next tick to avoid synchronous "cascading render" warnings
    // and ensure the initial client-side render matches the server-side render.
    const timer = setTimeout(() => {
      const userEmail = session?.user?.email || "guest";
      
      const savedBg = localStorage.getItem('saborcia_profile_bg');
      if (savedBg) setSelectedBg(savedBg);

      const savedBio = localStorage.getItem('saborcia_profile_bio');
      if (savedBio) setBio(savedBio);

      // Load favorites via Fake DB (Local Storage simulation for tests)
      const localDb = localStorage.getItem('saborcia_mock_db_favorites');
      if (localDb) {
        setFavorites(JSON.parse(localDb));
      } else {
        const apiFavs = mockFavoritesAPIResponse;
        const mappedFavorites = apiFavs.map(f => ({
          id: f.place_id,
          place_id: f.place_id,
          name: "Restaurante (Load via API)",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"
        }));
        setFavorites(mappedFavorites);
        localStorage.setItem('saborcia_mock_db_favorites', JSON.stringify(mappedFavorites));
      }

      // Load reviews via MOCK API
      const apiReviews = mockReviewsAPIResponse;
      const mappedReviews: ReviewItem[] = apiReviews.map(r => ({
        id: r._id || "rev",
        userName: mockUsers[0].name,
        userEmail: mockUsers[0].email,
        rating: r.rating,
        comment: r.comment,
        date: new Date(r.createdAt).toLocaleDateString('pt-BR'),
        restaurantId: r.place_id,
        restaurantName: "Restaurante Avaliado (Load via API)"
      }));
      
      // Load user manual local storage reviews to allow them to test
      const allReviews: ReviewItem[] = [...mappedReviews];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("reviews_")) {
          try {
            const storedResReviews = JSON.parse(localStorage.getItem(key) || "[]") as ReviewItem[];
            allReviews.push(...storedResReviews);
          } catch {}
        }
      }

      const userReviews = allReviews.filter(r => r.userEmail === userEmail || session); // se for guest, mostra tudo para teste
      
      // Sort reviews by id timestamp (descending)
      userReviews.sort((a, b) => {
        const timeA = a.id.includes('-') ? parseInt(a.id.split('-')[1] || "0") : 0;
        const timeB = b.id.includes('-') ? parseInt(b.id.split('-')[1] || "0") : 0;
        return timeB - timeA;
      });

      setReviews(userReviews);
      setIsLoaded(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [session, status]);

  const handleSaveBio = () => {
    localStorage.setItem('saborcia_profile_bio', bio);
    setIsEditingBio(false);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  if (status === "loading" || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4">
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl text-center flex flex-col items-center"
        >
          {/* Friendly visual */}
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-tr from-orange-500/20 to-rose-500/20 border border-orange-500/30 animate-pulse mb-8">
            <div className="absolute inset-2 rounded-full bg-linear-to-tr from-orange-500 to-rose-500 opacity-15 blur-md" />
            <Shield className="w-10 h-10 text-orange-500" />
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center border-2 border-zinc-950">
              <Lock size={12} className="text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-white mb-4 tracking-tight font-outfit">
            Acesso Restrito
          </h2>
          
          <p className="text-zinc-400 text-base mb-8 leading-relaxed font-light">
            O seu Perfil é onde guardamos suas conquistas, avaliações e restaurantes favoritos de forma organizada. Para acessar, faça login ou cadastre-se grátis!
          </p>

          <div className="w-full space-y-4">
            <Link 
              href="/login"
              className="w-full bg-linear-to-r from-orange-500 to-rose-500 text-white rounded-2xl py-4 font-semibold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 group hover:shadow-orange-500/40 transition-all outline-none"
            >
              <span>Fazer Login</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/signup"
              className="w-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 transition-all outline-none"
            >
              Criar Conta Grátis
            </Link>
          </div>

          <Link 
            href="/"
            className="mt-6 text-sm text-zinc-500 hover:text-zinc-300 font-medium transition-colors hover:underline"
          >
            Voltar para o início
          </Link>
        </motion.div>
      </div>
    );
  }

  const name = session?.user?.name || "Visitante";
  const email = session?.user?.email || "Conta não vinculada";
  const image = session?.user?.image;
  
  // Gamification Data
  const levelData = getUserLevelData(reviews.length);

  // Interleave and sort by most recent logic
  interface ActivityItem { type: string; place: string; date: string; rating: number | null; link: string; }
  const recentActivity: ActivityItem[] = [];
  const maxLen = Math.max(reviews.length, favorites.length);
  for (let i = 0; i < maxLen; i++) {
    // Para favoritos (novos salvos no final do array local)
    if (i < favorites.length) {
      const f = favorites[favorites.length - 1 - i];
      recentActivity.push({ type: "favorite", place: f.name, date: "Favorito", rating: null, link: `/restaurante/${f.id}` });
    }
    // Para avaliações (estão sorteadas por timestamp em ordem descrescente)
    if (i < reviews.length) {
      const r = reviews[i];
      recentActivity.push({ type: "review", place: r.restaurantName || "Restaurante", date: r.date, rating: r.rating, link: `/restaurante/${r.restaurantId}` });
    }
  }

  const displayedActivity = showAllActivity ? recentActivity : recentActivity.slice(0, 3);

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
          <div 
            className="h-48 relative bg-cover bg-center"
            style={{ backgroundImage: `url(${selectedBg})` }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute top-0 right-0 p-6 z-10">
              <button 
                onClick={() => setShowBgModal(true)}
                className="bg-white/20 backdrop-blur-md text-white border border-white/30 p-3 rounded-2xl hover:bg-white/30 transition-all"
              >
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
                <div className="w-40 h-40 rounded-[2.5rem] border-8 border-white shadow-lg bg-red-100 flex items-center justify-center text-red-500 text-6xl font-black shrink-0">
                  {name.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-2 right-2 p-2 bg-gray-900/95 text-white rounded-xl shadow-lg border-2 border-white cursor-pointer hover:bg-red-500 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-red-500">
                <Camera size={18} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-6">
              <div>
                <motion.h1 
                  {...fadeIn}
                  className={`text-[2.25rem] font-black text-gray-900 mb-2 tracking-tight flex items-center gap-3 relative ${
                    levelData.currentLevelColor === 'purple' ? 'drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 
                    levelData.currentLevelColor === 'amber' ? 'drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]' : ''
                  }`}
                >
                  {name}
                  {/* Elite Glow Effect for high levels */}
                  {(levelData.currentLevelColor === 'purple' || levelData.currentLevelColor === 'amber') && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className={`absolute -inset-x-4 -inset-y-2 rounded-2xl blur-xl -z-10 ${
                        levelData.currentLevelColor === 'purple' ? 'bg-purple-200' : 'bg-amber-200'
                      }`}
                    />
                  )}
                  <Badge title={levelData.currentTitle} color={levelData.currentLevelColor} />
                </motion.h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Mail size={16} />
                    <span className="text-sm">{email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <MapPin size={16} />
                    <span className="text-sm">São Paulo, SP</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Calendar size={16} />
                    <span className="text-sm">Membro Recente</span>
                  </div>
                </div>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-red-200 transition-all hover:-translate-y-1 shrink-0">
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
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group/bio"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Sobre mim</h3>
                {!isEditingBio && (
                  <button onClick={() => setIsEditingBio(true)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover/bio:opacity-100 transition-all">
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
              
              {isEditingBio ? (
                <div className="space-y-3">
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all resize-none h-24"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setIsEditingBio(false); setBio(localStorage.getItem('saborcia_profile_bio') || "Explorador da gastronomia digital testando o novo sistema Prato Ideal. 🚀"); }} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancelar</button>
                    <button onClick={handleSaveBio} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shadow-sm">Salvar</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 leading-relaxed font-light">
                  {bio}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button onClick={() => setActiveTab("reviews")} className="text-center p-4 bg-gray-50 rounded-3xl group hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                  <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="text-yellow-500" />
                  </div>
                  <div className="text-lg font-black text-gray-900">{reviews.length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Avaliações</div>
                </button>
                <Link href="/favoritos" className="block text-center p-4 bg-gray-50 rounded-3xl group hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                  <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="text-red-500" />
                  </div>
                  <div className="text-lg font-black text-gray-900">{favorites.length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Favoritos</div>
                </Link>
              </div>

              {/* Progress Bar */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Progresso de Nível</span>
                  {levelData.nextAt && (
                    <span className="text-xs font-bold text-gray-600">
                      {reviews.length} / {levelData.nextAt} avaliações
                    </span>
                  )}
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative group-hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-300">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${levelData.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full relative overflow-hidden ${
                      levelData.currentLevelColor === 'gray' ? 'bg-gray-400' :
                      levelData.currentLevelColor === 'blue' ? 'bg-blue-500' :
                      levelData.currentLevelColor === 'purple' ? 'bg-purple-500' :
                      'bg-amber-500'
                    }`}
                  >
                     <motion.div
                       className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[20deg]"
                       animate={{ x: ['-200%', '200%'] }}
                       transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                     />
                  </motion.div>
                </div>
                {levelData.remaining > 0 ? (
                  <p className="text-[11px] text-gray-400 mt-2 italic font-medium">
                    Faltam {levelData.remaining} avaliações para o próximo título!
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-500 mt-2 font-bold flex items-center gap-1">
                    <Star size={12} className="fill-amber-500" /> Nível Máximo Atingido!
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="bg-gray-950 p-8 rounded-[2.5rem] text-white relative overflow-hidden group border border-white/5"
            >
              <h3 className="text-xl font-bold mb-6 text-white relative z-10 flex items-center justify-between">
                Suas Conquistas
                <Shield className="text-gray-700 w-6 h-6" />
              </h3>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                {GAMIFICATION_LEVELS.map((level, i) => {
                  const unlocked = reviews.length >= level.min;
                  const icons = ["🍳", "🍜", "🍷", "👨‍🍳"];
                  const humor = ["Ovo Frito", "Miojo Gourmet", "Sommelier de Água", "Chef Jacquin"];
                  
                  const colorMap: Record<string, string> = {
                    gray: 'border-gray-500 shadow-gray-500/20 text-gray-300',
                    blue: 'border-blue-500 shadow-blue-500/30 text-blue-400',
                    purple: 'border-purple-500 shadow-purple-500/40 text-purple-400',
                    amber: 'border-amber-500 shadow-amber-500/50 text-amber-400'
                  };

                  return (
                    <motion.div 
                      key={i} 
                      whileHover={unlocked ? { scale: 1.05 } : {}}
                      className={`p-4 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 border-2 ${
                        unlocked 
                          ? `bg-gray-900 ${colorMap[level.color]} shadow-lg` 
                          : 'bg-gray-900/50 border-gray-800 opacity-40 grayscale'
                      }`}
                    >
                      <div className="text-4xl mb-2 filter drop-shadow-md">{icons[i]}</div>
                      <div className="font-bold text-xs leading-tight mb-1">{level.title}</div>
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black">{humor[i]}</div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl -mr-20 -mt-20 rounded-full pointer-events-none"></div>
            </motion.div>
          </div>

          {/* Right Column - Tabs & Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-2 rounded-3xl inline-flex gap-2 border border-gray-100 shadow-sm mb-4">
              {["activity", "info", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all focus-visible:outline-none focus:ring-2 focus:ring-red-400 ${
                    activeTab === tab 
                      ? "bg-red-500 text-white shadow-md shadow-red-200" 
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {tab === "info" ? "Informações" : tab === "reviews" ? "Avaliações" : "Sua Atividade"}
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
                        <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-2xl truncate">{name}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">E-mail Vinculado</label>
                        <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-2xl truncate">{email}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Total de Interações</label>
                        <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-2xl">{recentActivity.length} iterações anotadas</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Status de Armazenamento</label>
                        <p className="text-red-500 font-black bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-2">
                          <CheckCircle size={16} className="text-red-500" /> Sincronizado
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {reviews.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-[2.5rem] border border-gray-100">
                      <div className="text-gray-300 flex justify-center mb-4"><Star size={48} /></div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Sem avaliações</h3>
                      <p className="text-gray-500">Você ainda não avaliou nenhum restaurante.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {reviews.map((r, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                           <div className="flex-1 space-y-2">
                             <div className="flex justify-between items-start">
                               <Link href={`/restaurante/${r.restaurantId}`} className="font-bold text-lg text-gray-900 hover:text-red-500 transition-colors">
                                 {r.restaurantName}
                               </Link>
                               <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">{r.date}</span>
                             </div>
                             <div className="flex items-center gap-1 text-amber-500 text-sm">
                               {Array.from({ length: 5 }).map((_, j) => (
                                 <Star key={j} size={14} className={j < (r.rating || 0) ? "fill-amber-500" : "text-gray-200"} />
                               ))}
                             </div>
                             <p className="text-gray-600 text-sm italic">"{r.comment}"</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-[2.5rem] border border-gray-100">
                      <div className="text-gray-300 flex justify-center mb-4"><Star size={48} /></div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Nada por aqui ainda</h3>
                      <p className="text-gray-500">Explore restaurantes, deixe avaliações ou adicione aos favoritos e acompanhe tudo por aqui.</p>
                      <Link href="/" className="mt-6 inline-flex border border-red-500 text-red-500 px-6 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
                        Explorar Restaurantes
                      </Link>
                    </div>
                  ) : (
                    <>
                      {displayedActivity.map((act, i) => (
                        <Link href={act.link} key={i}>
                          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow mb-4 group cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                act.type === "review" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                              }`}>
                                {act.type === "review" ? <Star size={20} /> : <Heart size={20} />}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate pr-4">
                                  {act.place}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Clock size={12} className="text-gray-400" />
                                  <span className="text-[0.75rem] text-gray-400 font-medium">{act.date}</span>
                                  {act.rating && (
                                    <span className="text-[0.75rem] font-black text-yellow-500 ml-2">★ {act.rating.toFixed(1)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button className="p-3 text-gray-400 group-hover:text-red-500 group-hover:bg-red-50 rounded-xl transition-all">
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        </Link>
                      ))}
                      
                      {recentActivity.length > 3 && (
                        <button
                          onClick={() => setShowAllActivity(!showAllActivity)}
                          className="w-full mt-4 py-4 rounded-2xl font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 shadow-sm transition-all text-sm"
                        >
                          {showAllActivity ? "Mostrar Menos" : `Ver todas as ${recentActivity.length} atividades`}
                        </button>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Background Selector Modal */}
      <AnimatePresence>
        {showBgModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBgModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="shrink-0">
                <h2 className="text-2xl font-black text-gray-900 mb-2 font-outfit">Escolha seu fundo exclusivo</h2>
                <p className="text-gray-500 mb-6 font-medium text-sm">Novos fundos são liberados ao atingir novos níveis escrevendo avaliações!</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-2">
                {BACKGROUND_OPTIONS.map(bg => {
                  const hasAccess = LEVEL_INDEX[levelData.currentLevelColor] >= LEVEL_INDEX[bg.requiredLevel];
                  return (
                    <div 
                      key={bg.id}
                      onClick={() => {
                        if (hasAccess) {
                          setSelectedBg(bg.url);
                          localStorage.setItem('saborcia_profile_bg', bg.url);
                          setShowBgModal(false);
                        }
                      }}
                      className={`relative aspect-video rounded-2xl overflow-hidden cursor-pointer transition-all ${!hasAccess ? 'opacity-70 grayscale-[50%]' : 'hover:scale-105 hover:shadow-lg hover:z-10'} ${selectedBg === bg.url ? 'ring-4 ring-red-500 ring-offset-2' : 'ring-1 ring-gray-200'}`}
                    >
                      <Image src={bg.url} alt={bg.name} fill className="object-cover" />
                      {!hasAccess && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                          <Lock size={20} className="mb-1 text-white/90" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 px-2 text-center">{bg.requiredLevel === 'blue' ? 'Explorador' : bg.requiredLevel === 'purple' ? 'Crítico' : 'Mestre'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setShowBgModal(false)}
                className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors shrink-0"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function CheckCircle({ size = 20, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
