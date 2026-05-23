"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { Leaf, WheatOff, MilkOff, Bell, Moon, Sun, Monitor, Save, Check, Star } from "lucide-react";
import { useTheme } from "next-themes";

export default function ConfiguracoesPage() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState("diet");
  const [saved, setSaved] = useState(false);

  // States for Diet
  const [diet, setDiet] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    lactoseFree: false
  });

  // States for Notifications
  const [notifications, setNotifications] = useState({
    newRestaurants: true,
    promotions: false,
    reviewLikes: true
  });

  // State for Theme
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved preferences from LocalStorage
    const savedDiet = localStorage.getItem("saborcia_pref_diet");
    if (savedDiet) setDiet(JSON.parse(savedDiet));

    const savedNotif = localStorage.getItem("saborcia_pref_notif");
    if (savedNotif) setNotifications(JSON.parse(savedNotif));

    setMounted(true);
  }, []);

  const handleSave = () => {
    // Save to LocalStorage to simulate DB update
    localStorage.setItem("saborcia_pref_diet", JSON.stringify(diet));
    localStorage.setItem("saborcia_pref_notif", JSON.stringify(notifications));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (status === "loading" || !mounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center"><div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const tabs = [
    { id: "diet", label: "Restrições Alimentares", icon: Leaf },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "appearance", label: "Aparência", icon: Sun },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
      <Navbar />
      
      <div className="pt-32 container mx-auto px-4 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Configurações</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Gerencie suas preferências e adapte o Prato Ideal ao seu estilo de vida.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-row md:flex-col gap-2 overflow-x-auto hide-scrollbar">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                      isActive ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-red-500" : "text-gray-400"} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 dark:border-zinc-800 min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === "diet" && (
                <motion.div 
                  key="diet"
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Restrições e Dieta</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Ajude o Prato Ideal a recomendar os melhores restaurantes baseados no que você consome. Essa preferência afetará suas buscas.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Vegetariano */}
                      <label className={`flex items-start gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all ${diet.vegetarian ? 'border-green-500 bg-green-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input type="checkbox" className="hidden" checked={diet.vegetarian} onChange={() => setDiet({...diet, vegetarian: !diet.vegetarian})} />
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${diet.vegetarian ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                          {diet.vegetarian && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2 text-gray-900"><Leaf size={18} className="text-green-500"/> Vegetariano</div>
                          <div className="text-xs text-gray-500 mt-1.5 leading-relaxed">Não consumo carnes, mas aceito laticínios, ovos e derivados.</div>
                        </div>
                      </label>

                      {/* Vegano */}
                      <label className={`flex items-start gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all ${diet.vegan ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input type="checkbox" className="hidden" checked={diet.vegan} onChange={() => setDiet({...diet, vegan: !diet.vegan})} />
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${diet.vegan ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>
                          {diet.vegan && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2 text-gray-900"><Leaf size={18} className="text-emerald-600"/> Vegano</div>
                          <div className="text-xs text-gray-500 mt-1.5 leading-relaxed">Não consumo nenhum tipo de produto de origem animal.</div>
                        </div>
                      </label>

                      {/* Zero Glúten */}
                      <label className={`flex items-start gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all ${diet.glutenFree ? 'border-amber-500 bg-amber-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input type="checkbox" className="hidden" checked={diet.glutenFree} onChange={() => setDiet({...diet, glutenFree: !diet.glutenFree})} />
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${diet.glutenFree ? 'bg-amber-500 text-white' : 'bg-gray-100'}`}>
                          {diet.glutenFree && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2 text-gray-900"><WheatOff size={18} className="text-amber-500"/> Zero Glúten</div>
                          <div className="text-xs text-gray-500 mt-1.5 leading-relaxed">Intolerante ou alérgico a glúten. Exibir locais seguros.</div>
                        </div>
                      </label>

                      {/* Sem Lactose */}
                      <label className={`flex items-start gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all ${diet.lactoseFree ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input type="checkbox" className="hidden" checked={diet.lactoseFree} onChange={() => setDiet({...diet, lactoseFree: !diet.lactoseFree})} />
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${diet.lactoseFree ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                          {diet.lactoseFree && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2 text-gray-900"><MilkOff size={18} className="text-blue-500"/> Sem Lactose</div>
                          <div className="text-xs text-gray-500 mt-1.5 leading-relaxed">Intolerante ou alérgico a laticínios e seus derivados.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div 
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Alertas e Push</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Controle quais avisos você deseja receber no seu e-mail e direto no seu celular.</p>

                    <div className="space-y-4">
                      {/* Notificação 1 */}
                      <div className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-red-500"><Bell size={20} /></div>
                          <div>
                            <p className="font-bold text-gray-900">Novos Restaurantes</p>
                            <p className="text-xs text-gray-500 mt-1">Avisar quando abrir um local que seja o seu estilo.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setNotifications({...notifications, newRestaurants: !notifications.newRestaurants})}
                          className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${notifications.newRestaurants ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${notifications.newRestaurants ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                      {/* Notificação 2 */}
                      <div className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-yellow-500"><Star size={20} /></div>
                          <div>
                            <p className="font-bold text-gray-900">Promoções Exclusivas</p>
                            <p className="text-xs text-gray-500 mt-1">Saber de cupons de desconto disponíveis perto de mim.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setNotifications({...notifications, promotions: !notifications.promotions})}
                          className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${notifications.promotions ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${notifications.promotions ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "appearance" && (
                <motion.div 
                  key="appearance"
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Aparência do App</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Personalize como o Prato Ideal é exibido na sua tela para mais conforto visual.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button 
                        onClick={() => setTheme("light")}
                        className={`flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all relative ${theme === 'light' ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 shadow-md shadow-red-100 dark:shadow-none' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50'}`}
                      >
                        {theme === 'light' && <div className="absolute top-3 right-3 text-red-500"><Check size={16} strokeWidth={3} /></div>}
                        <Sun size={28} />
                        <span className="font-bold">Modo Claro</span>
                      </button>
                      
                      <button 
                        onClick={() => setTheme("dark")}
                        className={`flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all relative ${theme === 'dark' ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 shadow-md shadow-red-100 dark:shadow-none' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50'}`}
                      >
                        {theme === 'dark' && <div className="absolute top-3 right-3 text-red-500"><Check size={16} strokeWidth={3} /></div>}
                        <Moon size={28} />
                        <span className="font-bold">Modo Escuro</span>
                      </button>

                      <button 
                        onClick={() => setTheme("system")}
                        className={`flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all relative ${theme === 'system' ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 shadow-md shadow-red-100 dark:shadow-none' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50'}`}
                      >
                        {theme === 'system' && <div className="absolute top-3 right-3 text-red-500"><Check size={16} strokeWidth={3} /></div>}
                        <Monitor size={28} />
                        <span className="font-bold">Sistema</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSave}
                className="bg-gray-900 hover:bg-black text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-gray-200 transition-all hover:-translate-y-1 flex items-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left ease-out duration-300"></div>
                <div className="relative flex items-center gap-3 z-10">
                  {saved ? <Check size={20} className="text-green-400 group-hover:text-white" /> : <Save size={20} />}
                  {saved ? "Salvo com Sucesso!" : "Salvar Configurações"}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
