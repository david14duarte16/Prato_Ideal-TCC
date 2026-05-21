"use client";

import { motion } from "framer-motion";
import { Cookie, Settings, Info, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function PoliticaCookies() {
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: true
  });

  useEffect(() => {
    const saved = localStorage.getItem("cookie-preferences");
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch(e) {}
    } else {
      // Compatibility with banner
      const bannerConsent = localStorage.getItem("cookie-consent");
      if (bannerConsent === "necessary") {
        setPreferences({ analytics: false, marketing: false });
      }
    }
  }, []);

  const togglePreference = (key: 'analytics' | 'marketing') => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    localStorage.setItem("cookie-preferences", JSON.stringify(newPrefs));
    localStorage.setItem("cookie-consent", "custom");
  };

  const cookieTypes = [
    { 
      id: "necessary",
      title: "Necessários", 
      desc: "Essenciais para o funcionamento básico do site, como login e segurança.",
      mandatory: true,
      active: true,
    },
    { 
      id: "preferences",
      title: "Preferências", 
      desc: "Lembram suas escolhas, como idioma preferido ou filtros de busca.",
      mandatory: false,
      active: true,
    },
    { 
      id: "analytics",
      title: "Analíticos", 
      desc: "Nos ajudam a entender como os usuários interagem com as páginas para melhorarmos o serviço.",
      mandatory: false,
      active: preferences.analytics,
    },
    { 
      id: "marketing",
      title: "Marketing", 
      desc: "Utilizados para exibir anúncios relevantes ao seu perfil de interesse.",
      mandatory: false,
      active: preferences.marketing,
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-50 rounded-[3rem] p-12 md:p-16 text-center border border-gray-100 mb-16"
        >
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8 shadow-sm">
            <Cookie size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Política de Cookies</h1>
          <p className="text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
            Usamos pequenos arquivos chamados cookies para melhorar sua experiência. 
            Você pode gerenciar quais tipos de cookies deseja permitir abaixo. Suas escolhas são salvas automaticamente.
          </p>
        </motion.div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-xl mb-4 ml-2">
            <Settings className="text-red-500" />
            <h2>Preferências de Cookies</h2>
          </div>
          
          {cookieTypes.map((cookie, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{cookie.title}</h3>
                  {cookie.mandatory && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">Obrigatório</span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{cookie.desc}</p>
              </div>
              
              <div className="ml-8">
                {cookie.mandatory ? (
                  <CheckCircle2 className="text-green-500" />
                ) : (
                  <div 
                    onClick={() => cookie.id === 'analytics' || cookie.id === 'marketing' ? togglePreference(cookie.id as any) : null}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${cookie.active ? 'bg-red-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${cookie.active ? 'left-7' : 'left-1'}`}></div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 p-8 border border-red-50 rounded-[2.5rem] bg-red-50/30 flex flex-col md:flex-row items-center gap-6"
        >
          <Info className="text-red-500 shrink-0" size={32} />
          <p className="text-sm text-gray-600 leading-relaxed">
            Para mais detalhes sobre como processamos seus dados, visite nossa <a href="/privacidade" className="text-red-500 font-bold underline">Política de Privacidade</a>. Suas configurações são salvas automaticamente neste navegador.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
