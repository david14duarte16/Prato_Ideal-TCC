"use client";

import { useRef } from "react";

import { RestaurantCard as RestaurantCardType } from "@/lib/services/restaurantService";
import { Restaurant } from "@/lib/mockData";
import RestaurantCard from "./RestaurantCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RestaurantCarouselProps {
  restaurants: RestaurantCardType[];
  title: string;
  subtitle?: string;
}

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
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-1 text-base">{subtitle}</p>}
        </div>
        
        {/* Navigation Buttons (Hidden on very small screens, visible on md+) */}
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory hide-scrollbar w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {restaurants.map((restaurant) => (
             <div key={restaurant.id} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
               {/* Casting the type to match what RestaurantCard expects */}
               <RestaurantCard restaurant={restaurant as unknown as Restaurant} /> 
             </div>
          ))}
        </div>
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
