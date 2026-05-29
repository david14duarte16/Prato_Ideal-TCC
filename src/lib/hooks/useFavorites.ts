"use client";

import { useFavoritesContext } from "../../components/providers/FavoritesProvider";
import type { FavoriteItem } from "../../components/providers/FavoritesProvider";

export type { FavoriteItem };

export function useFavorites() {
  return useFavoritesContext();
}
