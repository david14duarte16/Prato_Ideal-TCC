import axios from 'axios';
import { getRestaurantById, RestaurantDetails } from '../lib/services/restaurantService';
import { Favorite } from '../types';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Exemplo de Merge (JOIN): Recebe uma lista de Favoritos (originários do MongoDB ou Backend)
 * e utiliza a Google Places API (nossa camada de mock/serviço) para recarregar os dados ricos visuais.
 */
export async function mergeFavoritesWithGooglePlaces(favoritesDB: Favorite[]): Promise<(Favorite & { restaurant: RestaurantDetails | null })[]> {
  const mergedList = await Promise.all(
    favoritesDB.map(async (fav) => {
      // Faz fetch usando o Google Places via nosso serviço ou Mock
      const restaurantData = await getRestaurantById(fav.place_id);
      return {
        ...fav,
        restaurant: restaurantData
      };
    })
  );

  return mergedList.filter(item => item.restaurant !== null);
}
