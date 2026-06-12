"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { RestaurantCard as RestaurantCardType } from "@/services/restaurantService";
import RestaurantCard from "./RestaurantCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RestaurantCarouselProps {
  restaurants: RestaurantCardType[];
  title: string;
  subtitle?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function RestaurantCarousel({ restaurants, title, subtitle }: RestaurantCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Aproximadamente a largura de um card + gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!restaurants || restaurants.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden" aria-labelledby="carousel-title">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 id="carousel-title" className="text-[1.5rem] sm:text-[1.875rem] font-extrabold text-gray-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-1 text-[1rem] font-medium">{subtitle}</p>}
        </div>
        
        {/* Navigation Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => scroll('left')}
            className="p-3 rounded-full border border-gray-200 text-gray-600 bg-white shadow-sm hover:bg-gray-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/10"
            aria-label="Rolar para a esquerda"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-3 rounded-full border border-gray-200 text-gray-600 bg-white shadow-sm hover:bg-gray-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/10"
            aria-label="Rolar para a direita"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative" role="region" aria-label={`Carrossel de ${title}`}>
        <motion.div 
          ref={scrollContainerRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-row overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {restaurants.map((restaurant) => (
             <div key={restaurant.id} className="flex-none w-[85vw] sm:w-[320px] snap-center">
               <RestaurantCard restaurant={restaurant} /> 
             </div>
          ))}
        </motion.div>
      </div>
      
      {/* Hide scrollbar injected styles (better to have in global css, but keeping self-contained here) */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
