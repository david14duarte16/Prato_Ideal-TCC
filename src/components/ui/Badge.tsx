import React from 'react';
import { motion, useAnimation } from 'framer-motion';

interface BadgeProps {
  title: string;
  color?: string;
}

const colorMap: Record<string, string> = {
  gray: "bg-gray-100 text-gray-600 border-gray-200 shadow-gray-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100 shadow-purple-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100",
};

export const Badge: React.FC<BadgeProps> = ({ title, color = "gray" }) => {
  const colorClass = colorMap[color] || colorMap.gray;
  const controls = useAnimation();

  const handleClick = async () => {
    if (color === 'amber') {
      // Mestre do Sabor: Explosão de escala e brilho
      await controls.start({ 
        scale: [1, 1.4, 1],
        boxShadow: ["0px 0px 0px rgba(245, 158, 11, 0)", "0px 0px 20px rgba(245, 158, 11, 0.6)", "0px 0px 0px rgba(245, 158, 11, 0)"],
        transition: { duration: 0.5 } 
      });
    } else if (color === 'purple') {
      // Crítico Local: Rotação estilosa
      await controls.start({ 
        rotate: [0, -10, 10, -10, 0],
        scale: [1, 1.1, 1],
        transition: { duration: 0.4 } 
      });
    } else if (color === 'blue') {
      // Explorador: Pulso de "radar"
      await controls.start({ 
        scale: [1, 1.25, 1],
        opacity: [1, 0.8, 1],
        transition: { duration: 0.3 } 
      });
    } else {
      // Novato: Bounce simples
      await controls.start({ 
        y: [0, -4, 0],
        transition: { duration: 0.2 } 
      });
    }
  };

  return (
    <motion.button
      animate={controls}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-3 py-1 rounded-full text-[10px] font-black border ${colorClass} uppercase tracking-widest shadow-sm cursor-pointer select-none transition-shadow`}
    >
      {title}
    </motion.button>
  );
};
