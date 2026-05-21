import Link from "next/link";
import RestaurantGrid from "@/components/restaurant/RestaurantGrid";
import RestaurantCarousel from "@/components/restaurant/RestaurantCarousel";
import CollectionsSection from "@/components/home/CollectionsSection";
import PromoBanner from "@/components/home/PromoBanner";
import { searchRestaurants, RestaurantCard } from "@/lib/services/restaurantService";
import { normalize } from "@/lib/utils";
import { Restaurant, mockRestaurants } from "@/lib/mockData";

export default async function Home(props: { 
  searchParams: Promise<{ loc?: string; q?: string }> 
}) {
  const searchParams = await props.searchParams;
  const locationName = searchParams.loc || "São Paulo";
  const query = (searchParams.q || "").trim();


  
  let searchResults: Restaurant[] = [];
  const isSearchMode = !!query;
  
  // Categorias para a Discovery View (quando não está pesquisando)
  let popularRestaurants: RestaurantCard[] = [];
  let burgerRestaurants: RestaurantCard[] = [];
  let pizzaRestaurants: RestaurantCard[] = [];
  let sushiRestaurants: RestaurantCard[] = [];
  let healthyRestaurants: RestaurantCard[] = [];
  let topRatedOpenRestaurants: RestaurantCard[] = [];

  try {
    if (isSearchMode) {
      // Modo Pesquisa Pura
      const rawRestaurants = await searchRestaurants(locationName, query);
      searchResults = rawRestaurants.map((r: RestaurantCard) => ({
        id: r.id,
        name: r.name,
        city: r.city,
        state: r.state,
        rating: r.rating || 0,
        distance: r.distance,
        openUntil: r.openUntil,
        image: r.image
      }));
    } else {
      // Modo Descoberta (Home)
      // Buscamos categorias em paralelo para os carrosséis
      const [popular, burgers, pizzas, sushis, healthy, topRatedOpenRaw] = await Promise.all([
        searchRestaurants(locationName, "Melhores restaurantes"),
        searchRestaurants(locationName, "Hambúrguer"),
        searchRestaurants(locationName, "Pizzaria"),
        searchRestaurants(locationName, "Japonês"),
        searchRestaurants(locationName, "Saudável"),
        searchRestaurants(locationName, "Melhores bem avaliados", { openNow: true })
      ]);
      
      popularRestaurants = popular;
      burgerRestaurants = burgers;
      pizzaRestaurants = pizzas;
      sushiRestaurants = sushis;
      healthyRestaurants = healthy;
      topRatedOpenRestaurants = topRatedOpenRaw.filter(r => r.rating && r.rating >= 4.5);
    }
  } catch (error) {
    console.error("Erro ao carregar restaurantes na Home:", error);
    if (isSearchMode) {
      let fallback = mockRestaurants;
      if (locationName) fallback = fallback.filter(r => normalize(r.city).includes(normalize(locationName)) || normalize(locationName).includes(normalize(r.city)));
      if (query) fallback = fallback.filter(r => normalize(r.name).includes(normalize(query)) || normalize(r.city).includes(normalize(query)));
      searchResults = fallback;
    }
    // Falha silenciosa para a página inicial, os carrosséis simplesmente não renderizarão se vazios
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-red-500 transition-colors font-medium text-gray-600">
            Início
          </Link>
          {(searchParams.loc || query) && (
            <>
              <span className="text-gray-300">/</span>
              <Link
                href={`/?loc=${locationName}`}
                className="hover:text-red-500 transition-colors text-gray-600 font-medium"
              >
                {locationName}
              </Link>
            </>
          )}
          {query && (
            <>
              <span className="text-gray-300">/</span>
              <span className="text-gray-400 italic">
                Restaurantes com &ldquo;{query}&rdquo;
              </span>
            </>
          )}
        </div>
      </div>

      <main className="flex flex-col items-center justify-between pb-16">
        {isSearchMode ? (
          <div className="w-full mt-8">
            <RestaurantGrid 
              restaurants={searchResults} 
              title={`Resultados para "${query}"`}
              subtitle={`Encontrados ${searchResults.length} restaurantes em ${locationName}.`}
            />
          </div>
        ) : (
          <div className="w-full">
            {/* Hero Section */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                Descubra os melhores sabores em <span className="text-red-500">{locationName}</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
                Explore restaurantes super bem avaliados, de lanches rápidos a jantares sofisticados, todos próximos de você.
              </p>
            </div>

            <CollectionsSection />

            {/* Carousels */}
            <RestaurantCarousel 
              title="Abertos Agora & Bem Avaliados" 
              subtitle="Os melhores locais abertos neste momento."
              restaurants={topRatedOpenRestaurants} 
            />

            <PromoBanner />

            <RestaurantCarousel 
              title="Mais Populares na Região" 
              subtitle="Os queridinhos da galera que você precisa conhecer."
              restaurants={popularRestaurants} 
            />
            
            <RestaurantCarousel 
              title="Hambúrgueres Incríveis" 
              subtitle="Para matar aquela fome de um bom artesanal."
              restaurants={burgerRestaurants} 
            />

            <RestaurantCarousel 
              title="Noite da Pizza" 
              subtitle="Classicas, diferentonas e sempre deliciosas."
              restaurants={pizzaRestaurants} 
            />

            <RestaurantCarousel 
              title="Festival Japonês" 
              subtitle="Sushis frescos e comida oriental autêntica."
              restaurants={sushiRestaurants} 
            />
            
            <RestaurantCarousel 
              title="Opções Saudáveis" 
              subtitle="Saladas, bowls e refeições leves para todos os dias."
              restaurants={healthyRestaurants} 
            />
            
            {/* Se mock data ou api falharem ou não voltarem nada, mostraremos um aviso amigável se todas estiverem vazias */}
            {popularRestaurants.length === 0 && burgerRestaurants.length === 0 && pizzaRestaurants.length === 0 && sushiRestaurants.length === 0 && healthyRestaurants.length === 0 && topRatedOpenRestaurants.length === 0 && (
              <div className="text-center py-20 px-4 text-gray-500">
                <p className="text-xl font-medium mb-2">Nenhum restaurante encontrado em {locationName}.</p>
                <p>Tente buscar por outra cidade usando o seletor no topo.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
