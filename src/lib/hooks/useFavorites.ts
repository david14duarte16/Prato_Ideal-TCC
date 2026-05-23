"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { mockFavoritesAPIResponse } from "../mockData";
import { apiClient } from "../services/apiClient";
import { announce } from "../../components/accessibility/AriaAnnouncer";

export interface FavoriteItem {
  id: string; // The ID compatible with the internal interface
  place_id: string; // Real Google Places ID parameter
  name: string;
  image: string;
}

// Fallback to local storage only while API is disconnected
export function useFavorites() {
  const { data: session } = useSession();

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchFavorites = () => {
      try {
        const userId = session?.user?.email || "guest";
        const stored = localStorage.getItem(`saborcia_favorites_${userId}`);
        if (stored) {
          setFavorites(JSON.parse(stored));
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("Failed to load favorites from localStorage", error);
        setFavorites([]);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchFavorites();
  }, [session]);

  const toggleFavorite = async (item: FavoriteItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const exists = favorites.some(f => f.place_id === item.place_id || f.id === item.id);
    const message = exists 
      ? `${item.name} removido dos favoritos` 
      : `${item.name} adicionado aos favoritos`;
      
    const nextFavorites = exists 
      ? favorites.filter(f => f.place_id !== item.place_id && f.id !== item.id)
      : [...favorites, item];
      
    setFavorites(nextFavorites);
    
    // Save to localStorage
    try {
      const userId = session?.user?.email || "guest";
      localStorage.setItem(`saborcia_favorites_${userId}`, JSON.stringify(nextFavorites));
    } catch (err) {
      console.error("Failed to save favorites to localStorage", err);
    }

    setTimeout(() => announce(message), 0);
  };

  const isFavorite = (id: string) => favorites.some(f => f.place_id === id || f.id === id);

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
