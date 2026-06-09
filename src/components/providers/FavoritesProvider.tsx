"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { apiClient } from "@/services/apiClient";
import { getRestaurantById } from "@/services/restaurantService";
import { announce } from "@/components/features/accessibility/AriaAnnouncer";
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
        
        // Fetch details from the server-side API route for each favorite id
        const results = await Promise.all(
          favIds.map(async (placeId) => {
            try {
              const res = await fetch(`/api/restaurants/${placeId}`);
              if (res.ok) {
                const details = await res.json();
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
    
    // Avalia o estado atual baseado nas dependências para o side-effect
    const exists = favorites.some(f => f.place_id === item.place_id || f.id === item.id);
    const message = exists 
      ? `${item.name} removido dos favoritos` 
      : `${item.name} adicionado aos favoritos`;
        
    setTimeout(() => announce(message), 0);

    // Atualização Otimista: Não coloque side-effects dentro do setState!
    setFavorites(prevFavorites => {
      const currentExists = prevFavorites.some(f => f.place_id === item.place_id || f.id === item.id);
      return currentExists 
        ? prevFavorites.filter(f => f.place_id !== item.place_id && f.id !== item.id)
        : [...prevFavorites, item];
    });

    // Chamada a API FORA do setState para evitar double-invoke no StrictMode
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
      
      // Se estamos adicionando e a API retorna 409 (Já existe), ignoramos e consideramos sucesso
      if (!exists && err.response?.status === 409) {
        console.warn("Restaurante já estava nos favoritos no servidor (409). Ignorando erro.");
        return;
      }
      
      let errorMessage = `Erro ao atualizar favoritos. ${item.name} não foi salvo.`;
      
      if (err.response?.status === 404) {
        // Usa console.warn ao invés de error para evitar quebrar a tela (overlay) no ambiente de dev do Next.js
        console.warn(`[Favorites] 404 API: Restaurante '${item.name}' (${item.place_id}) não está registrado no banco de dados do backend. O backend não permite favoritar locais não avaliados/registrados.`);
        errorMessage = `${item.name} ainda não pode ser favoritado pois não está registrado no banco de dados do sistema.`;
      } else {
        console.error("Failed to sync favorite with API", err.response?.status, err.response?.data);
      }
      
      // Rollback do estado porque a API falhou
      setFavorites(prevFavorites => {
        const currentExists = prevFavorites.some(f => f.place_id === item.place_id || f.id === item.id);
        if (exists && !currentExists) {
          // Queríamos remover, falhou -> Adiciona de volta
          return [...prevFavorites, item];
        } else if (!exists && currentExists) {
          // Queríamos adicionar, falhou -> Remove
          return prevFavorites.filter(f => f.place_id !== item.place_id && f.id !== item.id);
        }
        return prevFavorites;
      });
      announce(errorMessage);
    }
  }, [session, router, favorites]);

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
