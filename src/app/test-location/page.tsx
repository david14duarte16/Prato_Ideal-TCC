"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { motion } from "framer-motion";
import { MapPin, Info, Globe, Loader2, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";

interface ApiLocationResponse {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  source?: string;
  error?: string;
  message?: string;
}

export default function LocationTestPage() {
  const browserLoc = useGeolocation();
  const [apiLoc, setApiLoc] = useState<ApiLocationResponse | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const fetchApiLocation = async () => {
    setApiLoading(true);
    try {
      const res = await fetch("/api/geolocation");
      const data = await res.json();
      setApiLoc(data);
    } catch (e) {
      console.error(e);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchApiLocation();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Navigation size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Geolocalização API</h1>
          <p className="text-gray-500 max-w-xl mx-auto font-light">
            Implementamos duas formas de obter sua localização: via GPS do navegador e via IP do servidor.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Browser Geolocation (Hook) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">GPS do Navegador</h2>
            </div>

            {browserLoc.isLoading ? (
              <div className="flex items-center gap-3 text-gray-400">
                <Loader2 className="animate-spin" size={18} />
                <span>Solicitando permissão...</span>
              </div>
            ) : browserLoc.error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
                {browserLoc.error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Latitude</p>
                    <p className="text-gray-900 font-mono font-bold">{browserLoc.lat?.toFixed(6)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Longitude</p>
                    <p className="text-gray-900 font-mono font-bold">{browserLoc.lng?.toFixed(6)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-xs font-bold">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Localização Real (Alta Precisão)
                </div>
              </div>
            )}
          </motion.div>

          {/* API Geolocation (IP-based) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                <Globe size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">IP do Servidor</h2>
            </div>

            {apiLoading ? (
              <div className="flex items-center gap-3 text-gray-400">
                <Loader2 className="animate-spin" size={18} />
                <span>Consultando API...</span>
              </div>
            ) : apiLoc?.error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
                {apiLoc.message}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Latitude</p>
                    <p className="text-gray-900 font-mono font-bold">{apiLoc?.latitude?.toFixed(6)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Longitude</p>
                    <p className="text-gray-900 font-mono font-bold">{apiLoc?.longitude?.toFixed(6)}</p>
                  </div>
                </div>
                <div className="p-4 border border-gray-100 rounded-2xl text-sm">
                  <p className="text-gray-500">
                    Sua cidade aproximada: <span className="text-gray-900 font-bold">{apiLoc?.city}, {apiLoc?.region}</span>
                  </p>
                  <p className="text-[10px] text-gray-300 mt-2">Fonte: {apiLoc?.source}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-red-50 rounded-3xl flex items-start gap-4"
        >
          <Info className="text-red-500 shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-red-900 text-sm">Por que latitude e longitude?</h4>
            <p className="text-red-700 text-xs leading-relaxed mt-1">
              Essas coordenadas permitem que o sistema encontre restaurantes próximos a você com precisão matemática. 
              O GPS do navegador é mais preciso (metros), enquanto a localização por IP é uma estimativa baseada no seu provedor de internet (quilômetros).
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
