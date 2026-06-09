/**
 * Service Layer: Integração com Google Places API.
 * 
 * Abstrai a complexidade do Places API, formatando payloads e limitando os dados
 * retornados através de FieldMask. Isso é mandatório para evitar faturamento (billing) 
 * excessivo no Google Cloud trazendo dados que a UI não vai renderizar.
 */
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
import { normalize } from "@/lib/utils";

export interface RestaurantCard {
  id: string;
  name: string;
  city: string;
  state: string;
  rating: number;
  distance: string;
  image: string;
  openUntil: string;
  openingHours?: string[]; // Array of weekday descriptions
  category?: string;
  discount_pratoideal?: string;
}

export interface ReviewItem {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userEmail?: string;
  userImage?: string | null;
  restaurantId?: string;
  restaurantName?: string;
}

export interface RestaurantDetails extends RestaurantCard {
  address: string;
  phone: string;
  coordinates: { lat: number; lng: number };
  photos: string[];
  reviews: ReviewItem[];
  description: string;
}

interface GooglePlace {
  id: string;
  displayName: { text: string };
  rating?: number;
  location: { latitude: number; longitude: number };
  photos?: Array<{ name: string }>;
  addressComponents?: Array<{
    longText: string;
    shortText: string;
    types: string[];
  }>;
}

const MOCK_RESTAURANTS: RestaurantCard[] = [
  {
    id: "mock-1",
    name: "La Bella Italia",
    city: "São Paulo",
    state: "SP",
    rating: 4.8,
    distance: "800m",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:00",
  },
  {
    id: "mock-2",
    name: "Sushi Master",
    city: "São Paulo",
    state: "SP",
    rating: 4.5,
    distance: "1.2km",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
    openUntil: "22:30",
  },
  {
    id: "mock-3",
    name: "Burguer Haven",
    city: "São Paulo",
    state: "SP",
    rating: 4.2,
    distance: "2.5km",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    openUntil: "00:00",
  },
  {
    id: "mock-4",
    name: "Veggie Delight",
    city: "São Paulo",
    state: "SP",
    rating: 4.7,
    distance: "3.1km",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    openUntil: "21:00",
  },
  {
    id: "mock-5",
    name: "Figueira Rubaiyat",
    city: "Santo André",
    state: "SP",
    rating: 4.9,
    distance: "1.5km",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:30",
  },
  {
    id: "mock-6",
    name: "Padaria Brasileira",
    city: "Santo André",
    state: "SP",
    rating: 4.6,
    distance: "500m",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
    openUntil: "22:00",
  },
  {
    id: "mock-7",
    name: "Mauá Plaza Food",
    city: "Mauá",
    state: "SP",
    rating: 4.1,
    distance: "2.1km",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800",
    openUntil: "22:00",
  },
  {
    id: "mock-8",
    name: "Cantina do Interior",
    city: "Campinas",
    state: "SP",
    rating: 4.8,
    distance: "1.2km",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:00",
  },
  {
    id: "mock-9",
    name: "Peixe do Litoral",
    city: "Santos",
    state: "SP",
    rating: 4.6,
    distance: "500m",
    image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=800",
    openUntil: "22:00",
  },
  {
    id: "mock-10",
    name: "Sorocaba Steakhouse",
    city: "Sorocaba",
    state: "SP",
    rating: 4.5,
    distance: "3.5km",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    openUntil: "00:00",
  },
  {
    id: "mock-11",
    name: "Cantina di Napolli",
    city: "São Caetano",
    state: "SP",
    rating: 4.7,
    distance: "1.1km",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:00",
  },
  {
    id: "mock-12",
    name: "Burger & Beer SC",
    city: "São Caetano",
    state: "SP",
    rating: 4.4,
    distance: "400m",
    image: "https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&q=80&w=800",
    openUntil: "01:00",
  },
  {
    id: "mock-13",
    name: "Sushi ABC",
    city: "São Bernardo",
    state: "SP",
    rating: 4.6,
    distance: "2.3km",
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=800",
    openUntil: "22:30",
  },
  {
    id: "mock-14",
    name: "Pizzaria Florença",
    city: "São Paulo",
    state: "SP",
    rating: 4.8,
    distance: "1.2km",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:45",
  },
  {
    id: "mock-15",
    name: "O Queijo Nobre",
    city: "São Caetano",
    state: "SP",
    rating: 4.9,
    distance: "3.5km",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
    openUntil: "22:00",
  },
  {
    id: "mock-16",
    name: "Burger & Co",
    city: "São Bernardo",
    state: "SP",
    rating: 4.5,
    distance: "2.1km",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    openUntil: "02:00",
  },
  {
    id: "mock-17",
    name: "Poke Bowl",
    city: "São Paulo",
    state: "SP",
    rating: 4.7,
    distance: "800m",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    openUntil: "21:30",
  },
  // --- NOVOS DADOS PARA PREENCHER OS CARROSSEIS NA HOME (SÃO PAULO) ---
  // Hambúrgueres
  {
    id: "mock-18",
    name: "Holy Burger",
    city: "São Paulo",
    state: "SP",
    rating: 4.8,
    distance: "1.2km",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:00",
  },
  {
    id: "mock-19",
    name: "Z Deli Sandwiches",
    city: "São Paulo",
    state: "SP",
    rating: 4.9,
    distance: "2.5km",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
    openUntil: "00:00",
  },
  {
    id: "mock-20",
    name: "Patties Hambúrguer",
    city: "São Paulo",
    state: "SP",
    rating: 4.6,
    distance: "3.1km",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
    openUntil: "22:30",
  },
  {
    id: "mock-21",
    name: "Tradi Hambúrgueria",
    city: "São Paulo",
    state: "SP",
    rating: 4.7,
    distance: "4.0km",
    image: "https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:45",
  },
  // Pizzarias
  {
    id: "mock-22",
    name: "Braz Pizzaria",
    city: "São Paulo",
    state: "SP",
    rating: 4.9,
    distance: "1.8km",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800",
    openUntil: "00:00",
  },
  {
    id: "mock-23",
    name: "1900 Pizzeria",
    city: "São Paulo",
    state: "SP",
    rating: 4.7,
    distance: "2.2km",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:30",
  },
  {
    id: "mock-24",
    name: "Carlos Pizza",
    city: "São Paulo",
    state: "SP",
    rating: 4.8,
    distance: "3.5km",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:00",
  },
  {
    id: "mock-25",
    name: "Speranza Pizzaria",
    city: "São Paulo",
    state: "SP",
    rating: 4.6,
    distance: "5.0km",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:45",
  },
  // Populares (Mistura)
  {
    id: "mock-26",
    name: "Mocotó Restaurante",
    city: "São Paulo",
    state: "SP",
    rating: 4.9,
    distance: "8.5km",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:00",
  },
  {
    id: "mock-27",
    name: "A Casa do Porco",
    city: "São Paulo",
    state: "SP",
    rating: 4.9,
    distance: "2.0km",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    openUntil: "00:00",
  },
  {
    id: "mock-28",
    name: "Bar do Juarez",
    city: "São Paulo",
    state: "SP",
    rating: 4.5,
    distance: "1.5km",
    image: "https://images.unsplash.com/photo-1572715376701-98568319fd0b?auto=format&fit=crop&q=80&w=800",
    openUntil: "01:00",
  },
  // --- JAPONÊS E SUSHI ---
  {
    id: "mock-29",
    name: "Aizomê",
    city: "São Paulo",
    state: "SP",
    rating: 4.8,
    distance: "2.8km",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:00",
  },
  {
    id: "mock-30",
    name: "Kinoshita",
    city: "São Paulo",
    state: "SP",
    rating: 4.9,
    distance: "4.5km",
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:30",
  },
  {
    id: "mock-31",
    name: "Mori Sushi",
    city: "São Paulo",
    state: "SP",
    rating: 4.6,
    distance: "1.2km",
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:00",
  },
  {
    id: "mock-32",
    name: "Temakeria Makis",
    city: "São Paulo",
    state: "SP",
    rating: 4.5,
    distance: "3.2km",
    image: "https://images.unsplash.com/photo-1558239023-eb56e87d4650?auto=format&fit=crop&q=80&w=800",
    openUntil: "02:00",
  },
  // --- OPÇÕES SAUDÁVEIS E SALADAS ---
  {
    id: "mock-33",
    name: "Green House Salads",
    city: "São Paulo",
    state: "SP",
    rating: 4.7,
    distance: "1.0km",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    openUntil: "22:00",
  },
  {
    id: "mock-34",
    name: "Vegan & Co",
    city: "São Paulo",
    state: "SP",
    rating: 4.8,
    distance: "2.1km",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:00",
  },
  {
    id: "mock-35",
    name: "Let's Poke",
    city: "São Paulo",
    state: "SP",
    rating: 4.6,
    distance: "4.8km",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800",
    openUntil: "22:30",
  },
  {
    id: "mock-36",
    name: "Nattu Restaurante Orgânico",
    city: "São Paulo",
    state: "SP",
    rating: 4.9,
    distance: "5.5km",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
    openUntil: "23:00",
  }
];

export async function getNearbyRestaurants(lat: number, lon: number, locationName?: string, pageToken?: string): Promise<{ restaurants: RestaurantCard[], nextPageToken?: string }> {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
  console.log(`[RestaurantService] getNearbyRestaurants - Mock: ${isMock}, Key exists: ${!!GOOGLE_MAPS_API_KEY}`);
  
  if (isMock) {
    console.log("Using Mock Data for restaurants", { lat, lon, locationName });
    
    if (locationName) {
      // Filtro rigoroso pela cidade selecionada
      return { restaurants: MOCK_RESTAURANTS.filter(r => 
        normalize(r.city).includes(normalize(locationName)) ||
        normalize(locationName).includes(normalize(r.city))
      )};
    }
    
    return { restaurants: MOCK_RESTAURANTS };
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY não configurada.");
    return { restaurants: [] };
  }

  try {
    // INFO: Limitamos a busca usando searchNearby para pegar apenas o que está no raio.
    // O { revalidate: 3600 } injeta o fetch no Data Cache do Next.js por 1 hora. 
    // É essencial pra não estourar o limite da API se a home tiver picos de tráfego.
    const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.rating,places.photos,places.addressComponents,places.regularOpeningHours",
      },
      next: { revalidate: 3600 },
      body: JSON.stringify({
        includedTypes: ["restaurant"],
        maxResultCount: 20,
        languageCode: "pt-BR",
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lon },
            radius: 3000.0,
          },
        },
        ...(pageToken ? { pageToken } : {})
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Places API Erro:", errorData);
      return { restaurants: [] };
    }

    const data = await response.json();
    const places: GooglePlace[] = data.places || [];
    const nextPageToken = data.nextPageToken;

    const mapped = places.map((place: GooglePlace) => {
      // Filtra postos de gasolina que o Google categoriza erroneamente
      const lowerName = (place.displayName?.text || "").toLowerCase();
      if (lowerName.includes("posto ") || lowerName.includes("ipiranga") || lowerName.includes("petrobras") || lowerName.includes("shell") || lowerName.includes("auto posto")) {
        return null;
      }

      const addressComponents = place.addressComponents || [];
      const cityComp = addressComponents.find((c) => c?.types?.includes("locality") || c?.types?.includes("administrative_area_level_2"));
      const stateComp = addressComponents.find((c) => c?.types?.includes("administrative_area_level_1"));
      
      const city = cityComp?.longText || "São Paulo";
      const state = stateComp?.shortText || "SP";

      // Foto do Google
      const photoName = place.photos?.[0]?.name;
      const imageUrl = photoName 
        ? `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${GOOGLE_MAPS_API_KEY}`
        : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800";

      return {
        id: place.id,
        name: place.displayName?.text || "Restaurante",
        city: city,
        state: state,
        rating: place.rating || 0,
        distance: "Próximo a você",
        image: imageUrl,
        openUntil: "23:00",
      };
    }).filter(Boolean);
    
    return { restaurants: mapped as RestaurantCard[], nextPageToken };
  } catch (error) {
    console.error("Erro no Restaurant Service (Google):", error);
    return { restaurants: [] };
  }
}

export async function searchRestaurants(locationName: string, query?: string, options?: { openNow?: boolean, pageToken?: string }): Promise<{ restaurants: RestaurantCard[], nextPageToken?: string }> {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
  console.log(`[RestaurantService] searchRestaurants - Mock: ${isMock}, Key exists: ${!!GOOGLE_MAPS_API_KEY}`);
  
  if (isMock) {
    console.log("Using Mock Data for searchRestaurants", { locationName, query });
    let results = MOCK_RESTAURANTS;
    
    if (locationName) {
      results = results.filter(r => 
        normalize(r.city).includes(normalize(locationName)) ||
        normalize(locationName).includes(normalize(r.city))
      );
    }
    if (query) {
      const lowerQuery = normalize(query);
      results = results.filter(r => 
        normalize(r.name).includes(lowerQuery) || 
        normalize(r.city).includes(lowerQuery) ||
        (r.category && normalize(r.category).includes(lowerQuery)) ||
        (r as RestaurantCard & { neighborhood?: string }).neighborhood?.toLowerCase().includes(lowerQuery)
      );
    }
    if (options?.openNow) {
      const now = new Date();
      const currentHour = now.getHours();
      results = results.filter(r => {
        if (!r.openUntil) return true;
        const [closingHourStr] = r.openUntil.split(':');
        const closingHour = parseInt(closingHourStr, 10);
        // Ex: openUntil "01:00" is next day -> closingHour 1
        // Se fecha 00:00 ou mais tarde que atual, ou na madrugada (menor que 5h da manhã)
        return closingHour === 0 || closingHour > currentHour || closingHour < 5;
      });
    }
    
    return { restaurants: results };
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY não configurada.");
    return { restaurants: [] };
  }

  // Forçar uma busca abrangente por "restaurantes em X" no Google API caso a query seja curta e pareça uma cidade
  const textQuery = query 
    ? (query.split(" ").length === 1 && !query.toLowerCase().includes("restaurante") ? `restaurantes em ${query}` : query) 
    : `Restaurantes em ${locationName}`;

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.photos,places.addressComponents,places.regularOpeningHours",
      },
      next: { revalidate: 3600 },
      body: JSON.stringify({
        textQuery: textQuery,
        // Restrição estrita adicionada: Garante que apenas restaurantes sejam retornados,
        // impedindo que a API retorne a rua em si (ex: "Avenida Paulista") como um resultado válido,
        // retornando ao invés disso os restaurantes localizados na Avenida Paulista.
        includedType: "restaurant",
        maxResultCount: 20,
        languageCode: "pt-BR",
        ...(options?.openNow ? { openNow: true } : {}),
        ...(options?.pageToken ? { pageToken: options.pageToken } : {})
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Places API Erro (Text Search):", errorData);
      return { restaurants: [] };
    }

    const data = await response.json();
    const places: GooglePlace[] = data.places || [];
    const nextPageToken = data.nextPageToken;

    const mapped = places.map((place: GooglePlace) => {
      // Filtra postos de gasolina que o Google categoriza erroneamente
      const lowerName = (place.displayName?.text || "").toLowerCase();
      if (lowerName.includes("posto ") || lowerName.includes("ipiranga") || lowerName.includes("petrobras") || lowerName.includes("shell") || lowerName.includes("auto posto")) {
        return null;
      }

      const addressComponents = place.addressComponents || [];
      const cityComp = addressComponents.find((c) => c?.types?.includes("locality") || c?.types?.includes("administrative_area_level_2"));
      const stateComp = addressComponents.find((c) => c?.types?.includes("administrative_area_level_1"));
      
      const city = cityComp?.longText || locationName || "São Paulo";
      const state = stateComp?.shortText || "SP";

      // Foto do Google
      const photoName = place.photos?.[0]?.name;
      const imageUrl = photoName 
        ? `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${GOOGLE_MAPS_API_KEY}`
        : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800";

      return {
        id: place.id,
        name: place.displayName?.text || "Restaurante",
        city: city,
        state: state,
        rating: place.rating || 0,
        distance: "Próximo a você",
        image: imageUrl,
        openUntil: "23:00",
      };
    }).filter(Boolean);
    
    return { restaurants: mapped as RestaurantCard[], nextPageToken };
  } catch (error) {
    console.error("Erro no searchRestaurants (Google TextSearch):", error);
    return { restaurants: [] };
  }
}

export async function getRestaurantById(id: string): Promise<RestaurantDetails | null> {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true" || id.startsWith("mock-");
  console.log(`[RestaurantService] getRestaurantById - Mock: ${isMock}, Key exists: ${!!GOOGLE_MAPS_API_KEY}`);
  
  if (isMock) {
    const base = MOCK_RESTAURANTS.find(r => r.id === id);
    if (!base) return null;
    
    // Tenta buscar os dados reais do restaurante mockado no Google Places
    if (GOOGLE_MAPS_API_KEY) {
      try {
        const searchRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": "places.id",
          },
          body: JSON.stringify({
            textQuery: `${base.name} em ${base.city}, SP`,
            // Restrição estrita adicionada para seguir o padrão do searchRestaurants
            includedType: "restaurant",
            maxResultCount: 1,
            languageCode: "pt-BR",
          }),
        });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.places && searchData.places.length > 0) {
            const realId = searchData.places[0].id;
            // Busca os detalhes usando o ID real
            const realData = await fetch(`https://places.googleapis.com/v1/places/${realId}?languageCode=pt-BR`, {
              method: "GET",
              headers: {
                "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                "X-Goog-FieldMask": "id,displayName,rating,photos,formattedAddress,nationalPhoneNumber,location,reviews,addressComponents,regularOpeningHours,editorialSummary",
              },
              next: { revalidate: 3600 },
            });
            if (realData.ok) {
              const place = await realData.json();
              const addressComponents = place.addressComponents || [];
              const cityComp = addressComponents.find((c: { types?: string[]; longText?: string }) => c?.types?.includes("locality") || c?.types?.includes("administrative_area_level_2"));
              const stateComp = addressComponents.find((c: { types?: string[]; shortText?: string }) => c?.types?.includes("administrative_area_level_1"));
              const city = cityComp?.longText || base.city;
              const state = stateComp?.shortText || base.state;
          
              const photos = place.photos?.slice(0, 4).map((p: { name: string }) => 
                `https://places.googleapis.com/v1/${p.name}/media?maxHeightPx=1080&maxWidthPx=1920&key=${GOOGLE_MAPS_API_KEY}`
              ) || [base.image];
          
              return {
                id: base.id, // Manter o ID do mock para não quebrar a navegação se necessário
                name: place.displayName?.text || base.name,
                city,
                state,
                rating: place.rating || base.rating,
                distance: "Consulte no mapa",
                image: photos[0],
                openUntil: base.openUntil,
                address: place.formattedAddress || `${city}, ${state}`,
                phone: place.nationalPhoneNumber || "Não informado",
                coordinates: { 
                  lat: place.location?.latitude || -23.5505, 
                  lng: place.location?.longitude || -46.6333 
                },
                photos,
                description: place.editorialSummary?.text || "Um ambiente acolhedor oferecendo uma experiência gastronômica única, combinando sabores selecionados e um serviço cuidadoso.",
                reviews: [], // Deixando as avaliações em branco como modelo para a API
                openingHours: place.regularOpeningHours?.weekdayDescriptions || []
              };
            }
          }
        }
      } catch (e) {
        console.error("Erro ao buscar dados reais para mock:", e);
      }
    }

    return {
      ...base,
      address: `Rua Principal, 1000 - Centro, ${base.city} - ${base.state}`,
      phone: "(11) 99999-9999",
      coordinates: { lat: -23.5505, lng: -46.6333 },
      photos: [
        base.image,
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
      ],
      description: "Um ambiente acolhedor e moderno, perfeito para encontrar amigos e familiares. Ingredientes selecionados e preparados com o maior cuidado para lhe proporcionar uma experiência inesquecível.",
      reviews: [] // Deixando as avaliações em branco como modelo para a API
    };
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("GOOGLE_MAPS_API_KEY não configurada. Retornando dados fictícios para evitar quebra de layout.");
    const fallback = MOCK_RESTAURANTS[0];
    return {
      ...fallback,
      id,
      address: `Rua Fictícia, 1000 - Centro, ${fallback.city} - ${fallback.state}`,
      phone: "(11) 99999-9999",
      coordinates: { lat: -23.5505, lng: -46.6333 },
      photos: [fallback.image],
      description: "Um ambiente acolhedor e moderno (Dados de demonstração).",
      reviews: [],
      openingHours: []
    };
  }

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=pt-BR`, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "id,displayName,rating,photos,formattedAddress,nationalPhoneNumber,location,reviews,addressComponents,regularOpeningHours,editorialSummary",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("Google Places API Erro (Details):", await response.json());
      return null;
    }

    const place = await response.json();
    
    const addressComponents = place.addressComponents || [];
    const cityComp = addressComponents.find((c: { types?: string[]; longText?: string }) => c?.types?.includes("locality") || c?.types?.includes("administrative_area_level_2"));
    const stateComp = addressComponents.find((c: { types?: string[]; shortText?: string }) => c?.types?.includes("administrative_area_level_1"));
    const city = cityComp?.longText || "São Paulo";
    const state = stateComp?.shortText || "SP";

    const photos = place.photos?.slice(0, 4).map((p: { name: string }) => 
      `https://places.googleapis.com/v1/${p.name}/media?maxHeightPx=1080&maxWidthPx=1920&key=${GOOGLE_MAPS_API_KEY}`
    ) || ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1920"];

    return {
      id: place.id,
      name: place.displayName?.text || "Restaurante",
      city,
      state,
      rating: place.rating || 0,
      distance: "Consulte no mapa", // We can't easily calculate distance here without user location
      image: photos[0],
      openUntil: "23:00", // Would need Place Details opening_hours
      address: place.formattedAddress || `${city}, ${state}`,
      phone: place.nationalPhoneNumber || "Não informado",
      coordinates: { 
        lat: place.location?.latitude || -23.5505, 
        lng: place.location?.longitude || -46.6333 
      },
      photos,
      description: place.editorialSummary?.text || "Um ambiente acolhedor oferecendo uma experiência gastronômica única, combinando sabores selecionados com um serviço especial para os clientes.",
      reviews: [], // Deixando as avaliações em branco como modelo para a API
      openingHours: place.regularOpeningHours?.weekdayDescriptions || []
    };
  } catch (error) {
    console.error("Erro no getRestaurantById (Google):", error);
    return null;
  }
}
