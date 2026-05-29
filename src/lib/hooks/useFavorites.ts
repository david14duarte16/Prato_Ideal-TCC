"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiClient } from "../services/apiClient";
import { getRestaurantById } from "../services/restaurantService";
import { announce } from "../../components/accessibility/AriaAnnouncer";
import { useRouter } from "next/navigation";

export interface FavoriteItem {
  id: string; // The ID compatible with the internal interface
  place_id: string; // Real Google Places ID parameter
  name: string;
  image: string;
}

export function useFavorites() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (status === "loading") return;

      if (!session || !(session.user as any)?.accessToken || !(session.user as any)?.id) {
        setFavorites([]);
        setIsLoaded(true);
        return;
      }

      try {
        const token = (session.user as any).accessToken;
        const userId = (session.user as any).id;
        
        // Fetch user data to get the Favoritos array
        const res = await apiClient.get(`/Usuario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const favIds: string[] = res.data.Favoritos || [];
        
        // Fetch details from Google Places for each favorite id
        // Running in parallel for performance
        const results = await Promise.all(
          favIds.map(async (placeId) => {
            try {
              const details = await getRestaurantById(placeId);
              if (details) {
                return {
                  id: placeId,
                  place_id: placeId,
                  name: details.name,
                  image: details.image || "",
                };
              }
            } catch (err) {
              console.error(`Failed to fetch details for place ${placeId}`, err);
            }
            return null;
          })
        );
        
        setFavorites(results.filter((r): r is FavoriteItem => r !== null));
      } catch (error) {
        console.error("Failed to load favorites from API", error);
        setFavorites([]);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchFavorites();
  }, [session, status]);

  const toggleFavorite = async (item: FavoriteItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!session || !(session.user as any)?.accessToken) {
      announce("Faça login para favoritar restaurantes");
      router.push("/login");
      return;
    }
    
    const token = (session.user as any).accessToken;
    const exists = favorites.some(f => f.place_id === item.place_id || f.id === item.id);
    const message = exists 
      ? `${item.name} removido dos favoritos` 
      : `${item.name} adicionado aos favoritos`;
      
    // Optimistic update
    const nextFavorites = exists 
      ? favorites.filter(f => f.place_id !== item.place_id && f.id !== item.id)
      : [...favorites, item];
      
    setFavorites(nextFavorites);
    setTimeout(() => announce(message), 0);
    
    // API Call
    try {
      if (exists) {
        await apiClient.delete(`/Usuario/favoritos/${item.place_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await apiClient.post(`/Usuario/favoritos/${item.place_id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error("Failed to sync favorite with API", err);
    }
  };

  const isFavorite = (id: string) => favorites.some(f => f.place_id === id || f.id === id);

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
