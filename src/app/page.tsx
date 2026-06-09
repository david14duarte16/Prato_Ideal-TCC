import Link from "next/link";
import RestaurantGrid from "@/components/features/restaurant/RestaurantGrid";
import RestaurantCarousel from "@/components/features/restaurant/RestaurantCarousel";
import CollectionsSection from "@/components/features/home/CollectionsSection";
import PromoBanner from "@/components/features/home/PromoBanner";
import { searchRestaurants, getNearbyRestaurants, RestaurantCard } from "@/services/restaurantService";
import { normalize } from "@/lib/utils";
import { Restaurant, mockRestaurants } from "@/lib/mockData";

export default async function Home(props: { 
  searchParams: Promise<{ loc?: string; q?: string; lat?: string; lng?: string }> 
}) {
  const searchParams = await props.searchParams;
  const locationName = searchParams.loc || "São Paulo";
  const query = (searchParams.q || "").trim();
  const lat = searchParams.lat ? parseFloat(searchParams.lat) : undefined;
  const lng = searchParams.lng ? parseFloat(searchParams.lng) : undefined;
  
  let searchResults: Restaurant[] = [];
  let nextPageToken: string | undefined = undefined;
  const isSearchMode = !!query || (lat !== undefined && lng !== undefined) || !!searchParams.loc;
  
  // Categorias para a Discovery View (quando não está pesquisando)
  let popularRestaurants: RestaurantCard[] = [];
  let burgerRestaurants: RestaurantCard[] = [];
  let pizzaRestaurants: RestaurantCard[] = [];
  let sushiRestaurants: RestaurantCard[] = [];
  let healthyRestaurants: RestaurantCard[] = [];
  let topRatedOpenRestaurants: RestaurantCard[] = [];
  // Novas categorias
  let meatRestaurants: RestaurantCard[] = [];
  let italianRestaurants: RestaurantCard[] = [];
  let cafeRestaurants: RestaurantCard[] = [];
  let seafoodRestaurants: RestaurantCard[] = [];

  try {
    if (isSearchMode) {
      // Modo Pesquisa Pura
      let rawRestaurants: RestaurantCard[] = [];
      if (lat !== undefined && lng !== undefined) {
        const result = await getNearbyRestaurants(lat, lng, locationName);
        rawRestaurants = result.restaurants;
        nextPageToken = result.nextPageToken;
      } else {
        const result = await searchRestaurants(locationName, query);
        rawRestaurants = result.restaurants;
        nextPageToken = result.nextPageToken;
      }
      
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
      const [popular, burgers, pizzas, sushis, healthy, topRatedOpenRaw, meats, italians, cafes, seafoods] = await Promise.all([
        searchRestaurants(locationName, `Melhores restaurantes em ${locationName}`).then(r => r.restaurants),
        searchRestaurants(locationName, `Hambúrguer em ${locationName}`).then(r => r.restaurants),
        searchRestaurants(locationName, `Pizzaria em ${locationName}`).then(r => r.restaurants),
        searchRestaurants(locationName, `Japonês em ${locationName}`).then(r => r.restaurants),
        searchRestaurants(locationName, `Saudável em ${locationName}`).then(r => r.restaurants),
        searchRestaurants(locationName, `Melhores bem avaliados em ${locationName}`, { openNow: true }).then(r => r.restaurants),
        searchRestaurants(locationName, `Churrascaria e Carnes em ${locationName}`).then(r => r.restaurants),
        searchRestaurants(locationName, `Restaurante Italiano em ${locationName}`).then(r => r.restaurants),
        searchRestaurants(locationName, `Cafeteria e Doceria em ${locationName}`).then(r => r.restaurants),
        searchRestaurants(locationName, `Frutos do mar em ${locationName}`).then(r => r.restaurants)
      ]);
      
      popularRestaurants = popular;
      burgerRestaurants = burgers;
      pizzaRestaurants = pizzas;
      sushiRestaurants = sushis;
      healthyRestaurants = healthy;
      topRatedOpenRestaurants = topRatedOpenRaw.filter(r => r.rating && r.rating >= 4.5);
      meatRestaurants = meats;
      italianRestaurants = italians;
      cafeRestaurants = cafes;
      seafoodRestaurants = seafoods;
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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pt-36 md:pt-20">
      {/* Breadcrumb Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-red-500 transition-colors font-medium text-gray-600 dark:text-gray-300">
            Início
          </Link>
          
          {query && !searchParams.loc && lat === undefined ? (
            <>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <span className="text-gray-600 dark:text-gray-300 font-medium">Busca</span>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <span className="text-gray-400 dark:text-gray-500 italic">
                Resultados para &ldquo;{query}&rdquo;
              </span>
            </>
          ) : (searchParams.loc || lat !== undefined) ? (
            <>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <Link
                href={`/?loc=${locationName}`}
                className="hover:text-red-500 transition-colors text-gray-600 dark:text-gray-300 font-medium"
              >
                {locationName}
              </Link>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <span className="text-gray-400 dark:text-gray-500 italic">
                {query ? `Restaurantes com "${query}"` : "Restaurantes"}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <main className="flex flex-col items-center justify-between pb-16">
        {isSearchMode ? (
          <div className="w-full mt-8">
            <RestaurantGrid 
              restaurants={searchResults} 
              title={query ? `Resultados para "${query}"` : (searchParams.loc ? `Restaurantes em ${searchParams.loc}` : "Restaurantes próximos a você")}
              initialNextPageToken={nextPageToken}
              searchLat={lat}
              searchLng={lng}
              searchQuery={query}
              locationName={locationName}
            />
          </div>
        ) : (
          <div className="w-full">
            {/* Hero Section */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                Descubra os melhores sabores em <span className="text-red-500">{locationName}</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Explore restaurantes super bem avaliados, de lanches rápidos a jantares sofisticados, todos próximos de você.
              </p>
            </div>

            <CollectionsSection />

            {/* Carousels */}
            {topRatedOpenRestaurants.length > 0 && (
              <RestaurantCarousel 
                title="Abertos Agora & Bem Avaliados" 
                subtitle="Os melhores locais abertos neste momento."
                restaurants={topRatedOpenRestaurants} 
              />
            )}

            <PromoBanner />

            {popularRestaurants.length > 0 && (
              <RestaurantCarousel 
                title="Mais Populares na Região" 
                subtitle="Os queridinhos da galera que você precisa conhecer."
                restaurants={popularRestaurants} 
              />
            )}
            
            {meatRestaurants.length > 0 && (
              <RestaurantCarousel 
                title="Churrascarias e Carnes" 
                subtitle="Para os apaixonados por um bom corte e churrasco de qualidade."
                restaurants={meatRestaurants} 
              />
            )}

            {burgerRestaurants.length > 0 && (
              <RestaurantCarousel 
                title="Hambúrgueres Incríveis" 
                subtitle="Para matar aquela fome de um bom artesanal."
                restaurants={burgerRestaurants} 
              />
            )}

            {italianRestaurants.length > 0 && (
              <RestaurantCarousel 
                title="Culinária Italiana" 
                subtitle="Massas frescas, cantinas tradicionais e o sabor da Itália."
                restaurants={italianRestaurants} 
              />
            )}

            {pizzaRestaurants.length > 0 && (
              <RestaurantCarousel 
                title="Noite da Pizza" 
                subtitle="Classicas, diferentonas e sempre deliciosas."
                restaurants={pizzaRestaurants} 
              />
            )}

            {sushiRestaurants.length > 0 && (
              <RestaurantCarousel 
                title="Festival Japonês" 
                subtitle="Sushis frescos e comida oriental autêntica."
                restaurants={sushiRestaurants} 
              />
            )}
            
            {seafoodRestaurants.length > 0 && (
              <RestaurantCarousel 
                title="Frutos do Mar e Peixes" 
                subtitle="Moquecas, peixes frescos e delícias direto do litoral."
                restaurants={seafoodRestaurants} 
              />
            )}
            
            {cafeRestaurants.length > 0 && (
              <RestaurantCarousel 
                title="Cafeterias e Docerias" 
                subtitle="Aquele café da tarde especial ou uma sobremesa irresistível."
                restaurants={cafeRestaurants} 
              />
            )}

            {healthyRestaurants.length > 0 && (
              <RestaurantCarousel 
                title="Opções Saudáveis" 
                subtitle="Saladas, bowls e refeições leves para todos os dias."
                restaurants={healthyRestaurants} 
              />
            )}
            
            {/* Se mock data ou api falharem ou não voltarem nada, mostraremos um aviso amigável se todas estiverem vazias */}
            {popularRestaurants.length === 0 && burgerRestaurants.length === 0 && pizzaRestaurants.length === 0 && sushiRestaurants.length === 0 && healthyRestaurants.length === 0 && topRatedOpenRestaurants.length === 0 && meatRestaurants.length === 0 && italianRestaurants.length === 0 && cafeRestaurants.length === 0 && seafoodRestaurants.length === 0 && (
              <div className="text-center py-20 px-4 text-gray-500 dark:text-gray-400">
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
