"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Restaurant } from "@/lib/mockData";
import RestaurantCard from "./RestaurantCard";

interface RestaurantGridProps {
  restaurants: Restaurant[];
  title?: string;
  subtitle?: string;
}

export default function RestaurantGrid({ restaurants, title, subtitle }: RestaurantGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>}
          {subtitle && <p className="text-gray-500 mt-2 text-lg">{subtitle}</p>}
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
            <motion.div key={restaurant.id} variants={item}>
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
