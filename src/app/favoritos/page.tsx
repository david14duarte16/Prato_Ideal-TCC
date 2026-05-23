"use client";

import { useFavorites } from "@/lib/hooks/useFavorites";
import Navbar from "@/components/layout/Navbar";
import { Heart, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

export default function FavoritosPage() {
  const { favorites, toggleFavorite, isLoaded } = useFavorites();
  const { status } = useSession();

  if (status === "loading" || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar />
      
      <main className="pt-32 pb-20 container mx-auto px-4 max-w-5xl">
        <div className="mb-10 text-center md:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-gray-900 dark:text-white font-outfit mb-4 flex items-center justify-center md:justify-start gap-3"
          >
            <Heart className="text-red-500 fill-red-500 w-10 h-10" />
            Meus Favoritos
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 text-lg"
          >
            Todos os seus restaurantes salvos em um só lugar.
          </motion.p>
        </div>

        {favorites.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-[3rem] shadow-sm border border-gray-100 dark:border-zinc-800 p-16 text-center max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-red-300 dark:text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nenhum favorito ainda</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Explore o Prato Ideal e clique no coração nos restaurantes que mais gostar para salvá-los aqui!
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-red-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
            >
              <Search size={20} />
              Explorar Restaurantes
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {favorites.map((fav, index) => (
                <motion.div
                  key={fav.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/restaurante/${fav.place_id}`} className="group block h-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50 rounded-[1.5rem] relative">
                    <article className="bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-red-500/10 transition-all duration-300 h-full flex flex-col">
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image 
                          src={fav.image} 
                          alt={fav.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700" 
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-6 flex flex-col grow">
                        <h3 className="font-outfit font-extrabold text-xl text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-red-500 transition-colors">
                          {fav.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 font-medium justify-between">
                          <span className="flex items-center gap-1 text-red-500 font-bold bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors">
                            Ver Detalhes <ChevronRight size={16} />
                          </span>
                        </div>
                      </div>
                    </article>
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(fav, e as any);
                      }}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg text-red-500 hover:bg-white hover:scale-110 active:scale-95 transition-all z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50"
                      aria-label="Remover dos favoritos"
                    >
                      <Heart size={20} className="fill-red-500 hover:fill-transparent transition-colors" />
                    </button>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
