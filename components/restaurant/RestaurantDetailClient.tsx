"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { RestaurantDetails } from "@/lib/services/restaurantService";
import { Star, MapPin, Phone, Clock, MessageSquare, Navigation, Map as MapIcon, User } from "lucide-react";

import { useState } from "react";

interface Props {
  restaurant: RestaurantDetails;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function RestaurantDetailClient({ restaurant }: Props) {
  const [activePhoto, setActivePhoto] = useState(restaurant.photos[0] || restaurant.image);

  return (
    <motion.main 
      initial="hidden" 
      animate="visible" 
      variants={staggerContainer}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
    >
      {/* Hero Section */}
      <motion.div variants={fadeInUp} className="relative h-[40vh] md:h-[50vh] w-full rounded-3xl overflow-hidden shadow-2xl mb-8 group">
        <Image
          src={activePhoto}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold font-outfit mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-4 text-gray-200">
              <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <MapPin size={16} /> {restaurant.city}, {restaurant.state}
              </span>
              <span className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/20 font-semibold">
                <Star size={16} className="fill-current" /> {restaurant.rating.toFixed(1)}
              </span>
            </div>
          </div>
          
          <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2">
            <Navigation size={20} />
            Como Chegar
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Section */}
          <motion.section variants={fadeInUp} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Sobre o Restaurante</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {restaurant.description}
            </p>
          </motion.section>

          {/* Photo Gallery */}
          {restaurant.photos.length > 1 && (
            <motion.section variants={fadeInUp} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Fotos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {restaurant.photos.map((photo, index) => (
                  <button 
                    key={index}
                    onClick={() => setActivePhoto(photo)}
                    className={`relative h-24 md:h-32 rounded-2xl overflow-hidden transition-all duration-300 ${activePhoto === photo ? 'ring-4 ring-red-500 ring-offset-2 scale-95' : 'hover:scale-105 hover:shadow-lg opacity-80 hover:opacity-100'}`}
                  >
                    <Image src={photo} alt={`Foto ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Reviews Section */}
          <motion.section variants={fadeInUp} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Avaliações</h2>
              <button className="text-red-500 hover:text-red-600 font-medium flex items-center gap-2 transition-colors">
                <MessageSquare size={18} /> Avaliar
              </button>
            </div>

            <div className="space-y-6">
              {restaurant.reviews.map((review) => (
                <div key={review.id} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-500">
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm text-sm font-semibold text-gray-800">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      {review.rating.toFixed(1)}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-medium">
              Carregar mais avaliações
            </button>
          </motion.section>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Info Card */}
          <motion.section variants={fadeInUp} className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-24">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Informações</h3>
            
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Horário de Funcionamento</p>
                  <p className="text-gray-900 font-medium">Aberto até {restaurant.openUntil}</p>
                  <p className="text-sm text-green-600 mt-1">Aberto agora</p>
                </div>
              </li>
              
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Contato</p>
                  <p className="text-gray-900 font-medium">{restaurant.phone}</p>
                </div>
              </li>

              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Endereço</p>
                  <p className="text-gray-900 font-medium leading-relaxed">{restaurant.address}</p>
                  <p className="text-sm text-gray-500 mt-1">{restaurant.distance}</p>
                </div>
              </li>
            </ul>

            {/* Map Placeholder */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="w-full h-48 bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden relative group cursor-pointer border border-gray-200/50">
                {/* Visual placeholder for Map */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-80 group-hover:opacity-100 transition-opacity">
                  <MapIcon size={32} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                  <span className="text-sm font-medium">Ver Mapa Interativo</span>
                </div>
                {/* Marker mock */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 drop-shadow-md group-hover:-translate-y-2 transition-transform duration-300">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2">
              <Phone size={18} /> Ligar agora
            </button>
          </motion.section>

        </div>
      </div>
    </motion.main>
  );
}
