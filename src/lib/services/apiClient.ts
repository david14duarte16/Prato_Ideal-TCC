import axios from 'axios';
import { getRestaurantById, RestaurantDetails } from './restaurantService';
import { Favorite } from '../types';

const isServer = typeof window === 'undefined';

export const apiClient = axios.create({
  // No servidor, acessa a API direto. No navegador, usa o Proxy do Next.js para evitar CORS.
  baseURL: isServer ? 'https://apirestaurantes.onrender.com/api' : '/api/render',
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
