"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Restaurant } from "@/lib/mockData";
import RestaurantCard from "./RestaurantCard";

interface RestaurantGridProps {
  restaurants: Restaurant[];
  title?: string;
  subtitle?: string;
  initialNextPageToken?: string;
  searchLat?: number;
  searchLng?: number;
  searchQuery?: string;
  locationName?: string;
}

export default function RestaurantGrid({ 
  restaurants: initialRestaurants, 
  title, 
  subtitle,
  initialNextPageToken,
  searchLat,
  searchLng,
  searchQuery,
  locationName
}: RestaurantGridProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(initialNextPageToken);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRestaurants(initialRestaurants);
    setNextPageToken(initialNextPageToken);
  }, [initialRestaurants, initialNextPageToken]);

  const handleLoadMore = async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch("/api/restaurants/more", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageToken: nextPageToken,
          lat: searchLat,
          lng: searchLng,
          q: searchQuery,
          loc: locationName
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.restaurants) {
          setRestaurants(prev => [...prev, ...data.restaurants]);
          setNextPageToken(data.nextPageToken);
        }
      }
    } catch (error) {
      console.error("Error loading more restaurants:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        document.getElementById("load-more-trigger")?.click();
      }
    }, { threshold: 0.1 });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={restaurants.map(r => r.id).join("-")}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </motion.div>
      </AnimatePresence>

      <button 
        id="load-more-trigger" 
        onClick={handleLoadMore} 
        className="hidden" 
        aria-hidden="true"
      />

      <div ref={observerRef} className="mt-12 flex justify-center py-4 w-full min-h-[40px]">
        {nextPageToken && loadingMore && (
          <div className="flex items-center gap-2 text-orange-600 font-semibold">
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando mais restaurantes...
          </div>
        )}
      </div>
    </section>
  );
}
