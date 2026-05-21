"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { mockFavoritesAPIResponse } from "../../services/mockData";
import { apiClient } from "../../services/apiClient";
import { announce } from "../../components/accessibility/AriaAnnouncer";

export interface FavoriteItem {
  id: string; // The ID compatible with the internal interface
  place_id: string; // Real Google Places ID parameter
  name: string;
  image: string;
}

export function useFavorites() {
  const { data: session } = useSession();

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        if (session || true) { // Forçando o teste local
          // Fake Backend DB (Local Storage)
          const localDb = localStorage.getItem('saborcia_mock_db_favorites');
          if (localDb) {
            setFavorites(JSON.parse(localDb));
          } else {
            // Initial mock data se for a primeira vez
            const initialFavs = mockFavoritesAPIResponse.map(f => ({
              id: f.place_id,
              place_id: f.place_id,
              name: "Restaurante (Load via Mock DB)",
              image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"
            }));
            setFavorites(initialFavs);
            localStorage.setItem('saborcia_mock_db_favorites', JSON.stringify(initialFavs));
          }
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("Failed to fetch favorites from API", error);
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
    
    // Otimistic UI Update & Fake DB Backup
    setFavorites(prev => {
      const exists = prev.some(f => f.place_id === item.place_id || f.id === item.id);
      const newState = exists 
        ? prev.filter(f => f.place_id !== item.place_id && f.id !== item.id)
        : [...prev, item];
      
      // Save to our 'fake database'
      localStorage.setItem('saborcia_mock_db_favorites', JSON.stringify(newState));
      
      const message = exists 
        ? `${item.name} removido dos favoritos` 
        : `${item.name} adicionado aos favoritos`;
      announce(message);

      return newState;
    });

    try {
      const exists = favorites.some(f => f.place_id === item.place_id || f.id === item.id);
      
      if (exists) {
        // Exemplo: DELETE request
        // await apiClient.delete(`/favorites/${item.place_id}`);
        console.log(`[Mock API] DELETE /api/favorites/${item.place_id}`);
      } else {
        // Exemplo: POST request
        // await apiClient.post('/favorites', { place_id: item.place_id });
        console.log(`[Mock API] POST /api/favorites`, { place_id: item.place_id });
      }
    } catch (error) {
      console.error("Failed to save favorite in backend", error);
      // Aqui reverteríamos o optimistic update se necessário.
    }
  };

  const isFavorite = (id: string) => favorites.some(f => f.place_id === id || f.id === id);

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
