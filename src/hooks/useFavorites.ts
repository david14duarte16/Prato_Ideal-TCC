"use client";

import { useFavoritesContext } from "@/components/providers/FavoritesProvider";

export function useFavorites() {
  return useFavoritesContext();
}
