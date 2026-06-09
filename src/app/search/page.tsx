import RestaurantGrid from "@/components/features/restaurant/RestaurantGrid";
import { getNearbyRestaurants } from "@/services/restaurantService";
import Navbar from "@/components/layout/Navbar";



export default async function SearchPage(props: { 
  searchParams: Promise<{ q?: string; loc?: string }> 
}) {
  const searchParams = await props.searchParams;
  const query = (searchParams.q || "").trim();
  const location = searchParams.loc || "São Paulo";
  
  // Coordenadas de exemplo baseadas na localização (simplificado)
  // Em uma app real, poderíamos geocodificar o nome da cidade 'loc'
  const lat = -23.5505;
  const lon = -46.6333;
  
  let restaurants: {
    id: string;
    name: string;
    city: string;
    state: string;
    rating: number;
    distance: string;
    openUntil: string;
    image: string;
  }[] = [];
  
  try {
    const rawRestaurants = await getNearbyRestaurants(lat, lon);
    
    // Mapeia os dados
    restaurants = rawRestaurants.map(r => ({
      id: r.id,
      name: r.name,
      city: r.city,
      state: r.state,
      rating: r.rating || 0,
      distance: r.distance,
      openUntil: r.openUntil,
      image: r.image
    }));

    // Se houver uma query, filtramos (mesmo que simplificado no lado do cliente/mock para demonstração)
    if (query) {
      restaurants = restaurants.filter(r => 
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.city.toLowerCase().includes(query.toLowerCase())
      );
    }
  } catch (error) {
    console.error("Erro na página de busca:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-36 md:pt-20">
      <Navbar />
      <main className="flex-1 pb-16">
        <RestaurantGrid 
          restaurants={restaurants} 
          title={`Resultados para "${query || 'Tudo'}"`} 
          subtitle={`Encontrados em ${location}`}
        />
        
        {restaurants.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🔍</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum resultado encontrado</h2>
            <p className="text-gray-500 max-w-md">
              Não encontramos nenhum restaurante para &quot;{query}&quot; em {location}. 
              Tente buscar por termos mais genéricos ou verifique se a cidade está correta.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
