"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { motion } from "framer-motion";
import { Utensils, Search, Loader2, MapPin, AlertTriangle } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Image from "next/image";

interface RestaurantResult {
  id: string;
  name: string;
  city: string;
  state: string;
  rating?: number;
  distance: number;
  image: string;
}

export default function RestaurantTestPage() {
  const { lat, lng, isLoading: geoLoading, error: geoError } = useGeolocation();
  const [restaurants, setRestaurants] = useState<RestaurantResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRestaurants = async () => {
    if (!lat || !lng) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/restaurants?lat=${lat}&lon=${lng}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Erro na busca");
      }
      
      setRestaurants(data);
      if (data.length === 0) {
        setError("Nenhum restaurante encontrado com esta chave de API.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-4 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Utensils size={32} />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            {process.env.NEXT_PUBLIC_USE_MOCK === "true" ? (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-200">
                Modo Simulado Ativo
              </span>
            ) : (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-blue-200">
                API Google Real Ativa
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Testar API de Restaurantes</h1>
          <p className="text-gray-500 max-w-xl mx-auto font-light">
            Verifique em tempo real se a integração com o Google Places está trazendo os dados e fotos corretamente para sua localização.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Status Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-red-500" />
                Sua Localização
              </h2>
              
              {geoLoading ? (
                <div className="flex items-center gap-3 text-gray-400 py-4">
                  <Loader2 className="animate-spin" size={18} />
                  <span className="text-sm">Obtendo GPS...</span>
                </div>
              ) : geoError ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-medium mb-4">
                  {geoError}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Lat</p>
                      <p className="text-gray-900 font-mono text-xs font-bold">{lat?.toFixed(4)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Lon</p>
                      <p className="text-gray-900 font-mono text-xs font-bold">{lng?.toFixed(4)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={searchRestaurants}
                    disabled={loading || !lat}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    Buscar Restaurantes
                  </button>
                </div>
              )}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 p-6 rounded-4xl flex items-start gap-4"
              >
                <AlertTriangle className="text-red-500 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-red-900 text-sm">Erro de API</h4>
                  <p className="text-red-700 text-xs leading-relaxed mt-1">{error}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-xl min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Resultados da API ({restaurants.length})</h2>
                {restaurants.length > 0 && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Sucesso</span>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                  <Loader2 className="animate-spin" size={40} />
                  <p className="animate-pulse">Consultando Foursquare Places...</p>
                </div>
              ) : restaurants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-10">
                  <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} />
                  </div>
                  <p className="text-gray-400 text-sm">Aguardando busca. Clique no botão ao lado para testar sua chave.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {restaurants.map((rest) => (
                    <motion.div 
                      key={rest.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-orange-200 transition-all flex gap-4"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                        <Image src={rest.image} alt={rest.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="font-bold text-gray-900 truncate text-sm">{rest.name}</h4>
                        <p className="text-[10px] text-gray-500 truncate">{rest.city}, {rest.state}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-bold">
                            {rest.distance > 1000 ? `${(rest.distance/1000).toFixed(1)}km` : `${rest.distance}m`}
                          </span>
                          <span className="text-yellow-500 text-[10px] flex items-center gap-0.5">
                            ★ {rest.rating?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
