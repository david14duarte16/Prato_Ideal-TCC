import Image from "next/image";
import Link from "next/link";
import { RestaurantCard as RestaurantType } from "@/lib/services/restaurantService";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useSession } from "next-auth/react";
import { Heart, Star, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

import { useAuthModal } from "@/components/providers/AuthModalProvider";

interface RestaurantCardProps {
  restaurant: RestaurantType;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  const favorite = isLoaded ? isFavorite(restaurant.id) : false;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="group h-full"
    >
      <article className="flex flex-col relative h-full overflow-hidden rounded-[1.25rem] bg-white border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-shadow duration-300">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={restaurant.image}
            alt={`Foto do restaurante ${restaurant.name}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div 
            className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-sm font-bold text-[0.875rem] flex items-center gap-1 text-gray-900 border border-white/20"
            role="img" 
            aria-label={`Avaliação: ${restaurant.rating.toFixed(1)} estrelas`}
          >
            <Star size={14} className="text-amber-500 fill-amber-500" aria-hidden="true" />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>
          
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (status === "unauthenticated") {
                openAuthModal("Para salvar seus restaurantes favoritos, você precisa ter uma conta ativa.");
                return;
              }
              toggleFavorite({ place_id: restaurant.id, id: restaurant.id, name: restaurant.name, image: restaurant.image }, e);
            }}
            className={`absolute top-5 right-5 p-2.5 z-20 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50 active:scale-90 ${
              favorite 
                ? "bg-red-500 text-white" 
                : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white"
            }`}
            aria-label={favorite ? `Remover ${restaurant.name} dos favoritos` : `Adicionar ${restaurant.name} aos favoritos`}
            aria-pressed={favorite}
          >
            <Heart size={18} className={favorite ? "fill-white" : ""} aria-hidden="true" />
          </button>
        </div>
        
        <div className="p-5 flex flex-col gap-2 grow relative z-10">
          <h3 className="font-outfit font-extrabold text-[1.125rem] text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors leading-tight">
            <Link 
              href={`/restaurante/${restaurant.id}`} 
              className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50 rounded-lg"
              aria-label={`Ver detalhes do restaurante ${restaurant.name}`}
            >
              {restaurant.name}
            </Link>
          </h3>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-[0.8125rem]" aria-label={`Localização: ${restaurant.city}, distância: ${restaurant.distance}`}>
              <MapPin size={14} className="shrink-0 text-red-400" aria-hidden="true" />
              <span className="line-clamp-1">{restaurant.city} • {restaurant.distance}</span>
            </div>
            
            <div className="flex items-start gap-2 pt-1" aria-label="Horário de funcionamento">
              <Clock size={14} className="text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col gap-0.5">
                <span className="text-emerald-600 font-bold text-[0.8125rem] leading-none">
                  {restaurant.openingHours && restaurant.openingHours.length > 0 
                    ? "Horários disponíveis nos detalhes" 
                    : `Aberto até ${restaurant.openUntil}`}
                </span>
                {restaurant.openingHours && restaurant.openingHours.length > 0 && (
                  <span className="text-[0.6875rem] text-gray-400 font-medium">
                    {restaurant.openingHours[0].split(': ')[0]} a Domingo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
