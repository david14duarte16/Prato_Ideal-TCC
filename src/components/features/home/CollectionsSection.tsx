"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const collections = [
  {
    id: "hamburgueres",
    title: "Top Hambúrgueres",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    link: "/?q=hamburguer"
  },
  {
    id: "romantico",
    title: "Para ir a Dois",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
    link: "/?q=romantico"
  },
  {
    id: "japonesa",
    title: "Comida Japonesa",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
    link: "/?q=japones"
  },
  {
    id: "saudavel",
    title: "Opções Saudáveis",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    link: "/?q=saudavel"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

export default function CollectionsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit mb-3">
            Coleções
          </h2>
          <p className="text-gray-600 text-lg">
            Explore listas temáticas com os melhores restaurantes e pratos.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {collections.map((collection) => (
            <motion.div key={collection.id} variants={itemVariants} className="h-full">
              <Link href={collection.link} className="group block relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-md group-hover:text-red-500 transition-colors duration-300 font-outfit">
                    {collection.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
