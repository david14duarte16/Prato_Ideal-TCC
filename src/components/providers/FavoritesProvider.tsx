"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { apiClient } from "@/lib/services/apiClient";
import { getRestaurantById } from "@/lib/services/restaurantService";
import { announce } from "@/components/accessibility/AriaAnnouncer";
import { useRouter } from "next/navigation";

export interface FavoriteItem {
  id: string; // The ID compatible with the internal interface
  place_id: string; // Real Google Places ID parameter
  name: string;
  image: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isLoaded: boolean;
  toggleFavorite: (item: FavoriteItem, e?: React.MouseEvent) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (status === "loading") return;

      if (!session || !(session.user as { accessToken?: string; id?: string })?.accessToken || !(session.user as { accessToken?: string; id?: string })?.id) {
        setFavorites([]);
        setIsLoaded(true);
        return;
      }

      try {
        const token = (session.user as { accessToken?: string }).accessToken;
        const userId = (session.user as { id?: string }).id;
        
        // Fetch user data to get the Favoritos array
        const res = await apiClient.get(`/Usuario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Use Set to deduplicate IDs right from the API!
        const favIds: string[] = Array.from(new Set(res.data.Favoritos || []));
        
        // Fetch details from Google Places for each favorite id
        const results = await Promise.all(
          favIds.map(async (placeId) => {
            try {
              const details = await getRestaurantById(placeId as string);
              if (details) {
                return {
                  id: placeId as string,
                  place_id: placeId as string,
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
      } catch (error: unknown) {
        console.error("Failed to load favorites from API", error);
        
        const err = error as { response?: { status?: number } };
        // Se a API retornar 404 (Usuário não encontrado, ex: banco em memória reiniciou) ou 401 (Token expirado)
        if (err.response?.status === 404 || err.response?.status === 401) {
          console.warn("Sessão inválida ou banco resetado. Deslogando usuário...");
          signOut({ callbackUrl: '/login?message=Sessão expirada' });
        }
        
        setFavorites([]);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchFavorites();
  }, [session, status]);

  const toggleFavorite = useCallback(async (item: FavoriteItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!session || !(session.user as { accessToken?: string })?.accessToken) {
      announce("Faça login para favoritar restaurantes");
      router.push("/login");
      return;
    }
    
    const token = (session.user as { accessToken?: string }).accessToken;
    
    setFavorites(prevFavorites => {
      const exists = prevFavorites.some(f => f.place_id === item.place_id || f.id === item.id);
      const message = exists 
        ? `${item.name} removido dos favoritos` 
        : `${item.name} adicionado aos favoritos`;
        
      // Optimistic update
      const nextFavorites = exists 
        ? prevFavorites.filter(f => f.place_id !== item.place_id && f.id !== item.id)
        : [...prevFavorites, item];
        
      setTimeout(() => announce(message), 0);

      // Fire and forget API Call to avoid blocking the state update
      (async () => {
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
        } catch (error: unknown) {
          const err = error as { response?: { status?: number, data?: unknown } };
          console.error("Failed to sync favorite with API", err.response?.status, err.response?.data);
          
          // Rollback state since API failed
          setFavorites(prevFavorites);
          announce(`Erro ao atualizar favoritos. ${item.name} não foi salvo.`);
          
          // NOTA: Retiramos o signOut daqui. Se a API retornar 404 ao favoritar,
          // pode significar que o idRestaurante não foi encontrado no backend.
          // Não devemos deslogar o usuário por causa de um restaurante não encontrado.
        }
      })();

      return nextFavorites;
    });
  }, [session, router]);

  const isFavorite = useCallback((id: string) => {
    return favorites.some(f => f.place_id === id || f.id === id);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, isLoaded }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavoritesContext must be used within a FavoritesProvider");
  }
  return context;
}
