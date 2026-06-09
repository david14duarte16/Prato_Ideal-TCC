"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Navigation, 
  MapPin, 
  Star, 
  Loader2, 
  X, 
  Clock, 
  Utensils, 
  SearchX, 
  AlertCircle 
} from "lucide-react";
import { RestaurantCard } from "@/services/restaurantService";

type RecentSearch = 
  | { type: "text"; query: string }
  | { type: "region"; name: string; address: string }
  | { type: "restaurant"; id: string; name: string; city: string; state: string; image: string };

type NavItem = 
  | { type: "recent"; data: RecentSearch; id: string }
  | { type: "category"; data: { id: string; name: string }; id: string }
  | { type: "region"; data: { id: string; name: string; address: string }; id: string }
  | { type: "restaurant"; data: RestaurantCard; id: string }
  | { type: "exact"; query: string; id: string };

const RECENT_SEARCHES_KEY = "pratoideal_recent_searches";

/**
 * Componente principal da barra de busca unificada (Omnibox).
 * 
 * Lida com o roteamento para resultados e orquestra a listagem de Restaurantes, Regiões 
 * e Categorias. Contém lógicas robustas de a11y (focus trapping e setas de teclado).
 */
export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados Core
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de Dados
  const [suggestions, setSuggestions] = useState<RestaurantCard[]>([]);
  const [regions, setRegions] = useState<{id: string, name: string, address: string}[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Estados de Acessibilidade/Navegação
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar buscas recentes no mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erro ao carregar buscas recentes", e);
    }
  }, []);

  // Salvar busca recente
  // INFO: Optamos por um state client-side (localStorage) ao invés do banco de dados.
  // Garante latência zero pro usuário na renderização das "buscas recentes" e economiza I/O do DB.
  const saveRecentSearch = useCallback((item: RecentSearch) => {
    setRecentSearches((prev) => {
      // Remove duplicada
      let newSearches = prev.filter(s => {
        if (s.type === "text" && item.type === "text") return s.query !== item.query;
        if (s.type === "region" && item.type === "region") return s.name !== item.name;
        if (s.type === "restaurant" && item.type === "restaurant") return s.id !== item.id;
        return true;
      });
      // Adiciona no topo
      newSearches = [item, ...newSearches].slice(0, 5); // Limita a 5 itens
      
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
      } catch (e) {
        console.error("Erro ao salvar busca recente", e);
      }
      return newSearches;
    });
  }, []);

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Limpar busca ao voltar pra home limpa
  useEffect(() => {
    if (window.location.pathname === "/" && !searchParams.has("q") && !searchParams.has("lat")) {
      setSearchQuery("");
    }
  }, [searchParams]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock scroll em mobile
  useEffect(() => {
    if (showDropdown && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showDropdown]);

  // Busca na API com debounce
  // INFO: Debounce de 300ms crucial aqui. Ele segura as requisições enquanto o usuário 
  // ainda estiver digitando para reduzir a carga do nosso BFF (/api/autocomplete) e os custos da API de Places.
  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = searchQuery.trim();
      
      if (q.length > 1 && q !== "Localização Atual") {
        setIsLoading(true);
        setError(null);
        
        try {
          const params = new URLSearchParams();
          params.set("q", q);
          
          const response = await fetch(`/api/autocomplete?${params.toString()}`);
          if (!response.ok) throw new Error("Falha na comunicação com a API");
          
          const results = await response.json();
          console.log("Resultados da API:", results); // Log requisitado para debug
          setSuggestions(results.restaurants?.slice(0, 5) || []);
          setRegions(results.regions || []);
          setCategories(results.categories || []);
          setShowDropdown(true);
          setFocusedIndex(-1); // Resetar foco ao carregar novos dados
        } catch (error) {
          console.error("Erro na busca de sugestões:", error);
          setError("Ocorreu um erro ao buscar os resultados. Tente novamente.");
          setSuggestions([]);
          setRegions([]);
          setCategories([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setRegions([]);
        setCategories([]);
        setError(null);
        // Se limpou o input e ainda tá focado, reseta o index pra navegar nos recentes
        setFocusedIndex(-1); 
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Construir a lista de itens navegáveis
  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [];
    
    if (searchQuery.trim().length === 0) {
      // Mostrar buscas recentes
      recentSearches.forEach((item, index) => {
        items.push({ type: "recent", data: item, id: `recent-${index}` });
      });
    } else {
      // Mostrar resultados da API agrupados
      categories.forEach((cat) => {
        items.push({ type: "category", data: cat, id: cat.id });
      });
      regions.forEach((reg) => {
        items.push({ type: "region", data: reg, id: reg.id });
      });
      suggestions.forEach((res) => {
        items.push({ type: "restaurant", data: res, id: `res-${res.id}` });
      });
      if (categories.length > 0 || regions.length > 0 || suggestions.length > 0) {
        items.push({ type: "exact", query: searchQuery, id: `exact-${searchQuery}` });
      }
    }
    return items;
  }, [searchQuery, recentSearches, regions, categories, suggestions]);

  // Ações de seleção
  const handleSelect = (item: NavItem) => {
    setShowDropdown(false);
    
    if (item.type === "recent") {
      const rs = item.data;
      if (rs.type === "text") {
        setSearchQuery(rs.query);
        router.push(`/?q=${encodeURIComponent(rs.query)}`);
      } else if (rs.type === "region") {
        setSearchQuery("");
        router.push(`/?loc=${encodeURIComponent(rs.name)}`);
      } else if (rs.type === "restaurant") {
        router.push(`/restaurante/${rs.id}`);
      }
      // Re-salvar a busca recente para jogá-la no topo
      saveRecentSearch(rs);
      
    } else if (item.type === "category") {
      setSearchQuery("");
      saveRecentSearch({ type: "text", query: item.data.name });
      router.push(`/?q=${encodeURIComponent(item.data.name)}`);

    } else if (item.type === "region") {
      setSearchQuery("");
      saveRecentSearch({ type: "region", name: item.data.name, address: item.data.address });
      router.push(`/?loc=${encodeURIComponent(item.data.name)}`);
      
    } else if (item.type === "restaurant") {
      setSearchQuery(item.data.name);
      saveRecentSearch({ 
        type: "restaurant", 
        id: item.data.id, 
        name: item.data.name, 
        city: item.data.city, 
        state: item.data.state, 
        image: item.data.image 
      });
      router.push(`/restaurante/${item.data.id}`); // Idealmente iria para a página do restaurante
      // Fallback pra busca caso não tenha página de restaurante implementada (ajuste conforme seu projeto)
      // router.push(`/?q=${encodeURIComponent(item.data.name)}`);
      
    } else if (item.type === "exact") {
      saveRecentSearch({ type: "text", query: item.query });
      router.push(`/?q=${encodeURIComponent(item.query)}`);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    if (focusedIndex >= 0 && focusedIndex < navItems.length) {
      handleSelect(navItems[focusedIndex]);
    } else {
      saveRecentSearch({ type: "text", query: q });
      setShowDropdown(false);
      router.push(`/?q=${encodeURIComponent(q)}`);
    }
  };

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown && e.key !== "Escape") {
      setShowDropdown(true);
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => (prev < navItems.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        handleSearchSubmit();
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
    }
  };

  const detectLocation = () => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setSearchQuery("");
          setShowDropdown(false);
          setIsDetecting(false);
          
          const params = new URLSearchParams();
          params.set("lat", lat.toString());
          params.set("lng", lng.toString());
          router.push(`/?${params.toString()}`);
        },
        () => setIsDetecting(false)
      );
    } else {
      setIsDetecting(false);
    }
  };

  const activeDescendant = focusedIndex >= 0 ? navItems[focusedIndex]?.id : undefined;

  return (
    <div 
      ref={searchRef} 
      className={`order-last md:order-0 w-full md:w-auto md:flex-1 max-w-2xl md:mx-8 mt-3 md:mt-0 relative flex
        ${showDropdown ? 'z-100 md:z-auto' : ''}
      `}
    >
      {/* Overlay Mobile */}
      {showDropdown && (
        <div 
          className="fixed inset-0 bg-white dark:bg-zinc-950 z-90 md:hidden"
          onClick={() => setShowDropdown(false)}
        />
      )}

      <div className={`w-full flex items-center bg-white dark:bg-zinc-900 border transition-all duration-300 shadow-sm overflow-visible z-100
        ${showDropdown ? 'border-red-500 ring-2 ring-red-500/20 md:rounded-t-2xl md:rounded-b-none' : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-2xl hover:shadow-md dark:shadow-none'}
        h-12 md:h-14 
        ${showDropdown ? 'fixed top-0 left-0 right-0 h-16 rounded-none border-x-0 border-t-0 md:relative md:h-14 md:border-x md:border-t md:rounded-t-2xl px-4 md:px-0' : ''}
      `}>
        
        <div className="relative flex items-center h-full flex-1">
          {/* Back button on mobile when open */}
          {showDropdown && (
            <button 
              className="md:hidden mr-2 text-gray-500 shrink-0" 
              onClick={() => setShowDropdown(false)}
            >
              <Navigation size={20} className="rotate-270" />
            </button>
          )}

          {!showDropdown && <Search size={20} className="ml-4 text-gray-400 shrink-0" />}
          {showDropdown && <Search size={20} className="ml-0 md:ml-4 text-red-500 shrink-0 hidden md:block" />}
          
          <form onSubmit={handleSearchSubmit} className="flex-1 h-full">
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls="search-dropdown"
              aria-activedescendant={activeDescendant}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="Pesquise por cidade, restaurante ou prato..."
              aria-label="Procurar restaurante, prato ou culinária"
              className="w-full bg-transparent outline-none text-sm md:text-base text-gray-700 dark:text-gray-200 placeholder-gray-400 h-full pl-3 pr-4"
            />
          </form>

          {/* Action Buttons Right */}
          <div className="flex items-center gap-1 mr-2 shrink-0">
            {isLoading && (
              <Loader2 size={18} className="text-gray-400 animate-spin mr-2" />
            )}
            
            {!isLoading && searchQuery.length > 0 && (
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchQuery("");
                  inputRef.current?.focus();
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors mr-1"
                aria-label="Limpar busca"
              >
                <X size={16} />
              </button>
            )}

            {!searchQuery && (
              <button 
                type="button"
                onClick={detectLocation}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors flex items-center justify-center"
                title="Detectar minha localização"
                aria-label="Detectar localização atual"
              >
                <Navigation size={18} className={isDetecting ? "animate-spin" : ""} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                id="search-dropdown"
                role="listbox"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 shadow-2xl rounded-xl z-9999 overflow-hidden min-h-[100px] max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700"
              >
                <div className="px-3 py-2 md:px-5 md:py-3">
                  
                  {/* Empty State / Error */}
                  {error && (
                     <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                      <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-3">
                        <AlertCircle size={24} className="text-red-500" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Ops, algo deu errado!</p>
                      <p className="text-xs text-gray-500 mt-1">{error}</p>
                    </div>
                  )}

                  {!error && !isLoading && searchQuery.length > 1 && navItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                      <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-3">
                        <SearchX size={24} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Nenhum resultado encontrado</p>
                      <p className="text-xs text-gray-500 mt-1">Tente buscar por um prato, região ou restaurante diferente.</p>
                    </div>
                  )}

                  {/* Resultados da Busca ou Recentes */}
                  {!error && navItems.length > 0 && (
                    <div className="space-y-1">
                      
                      {/* Header de Recentes */}
                      {searchQuery.trim().length === 0 && recentSearches.length > 0 && (
                        <div className="flex items-center justify-between px-2 mb-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Buscas Recentes</p>
                          <button 
                            onClick={clearRecentSearches}
                            className="text-[10px] font-bold text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            LIMPAR
                          </button>
                        </div>
                      )}
                      
                      {/* Itens agrupados dinamicamente */}
                      {navItems.map((item, index) => {
                        const isFocused = index === focusedIndex;
                        
                        // Determinar se precisa renderizar o título da seção
                        let sectionTitle = null;
                        if (index === 0 || navItems[index - 1].type !== item.type) {
                          if (item.type === "category") sectionTitle = "Categorias e Pratos";
                          if (item.type === "region") sectionTitle = "Cidades e Regiões";
                          if (item.type === "restaurant") sectionTitle = "Restaurantes";
                        }
                        
                        return (
                          <div key={item.id}>
                            {sectionTitle && (
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-3 mb-1 px-2">
                                {sectionTitle}
                              </p>
                            )}
                            <div 
                              id={item.id}
                              role="option"
                              aria-selected={isFocused}
                              onMouseDown={(e) => {
                                e.preventDefault(); // Previne que o input perca o foco precocemente
                                handleSelect(item);
                              }}
                              onMouseEnter={() => setFocusedIndex(index)}
                              className={`
                                w-full flex items-center gap-3 py-2.5 px-3 rounded-xl cursor-pointer transition-colors text-left group
                                ${isFocused ? 'bg-zinc-100 dark:bg-zinc-800/80' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}
                                ${item.type === 'region' && !isFocused ? 'bg-red-50/50 dark:bg-red-500/5' : ''}
                                ${item.type === 'exact' ? 'border-t border-gray-100 dark:border-zinc-800 mt-2 rounded-t-none' : ''}
                              `}
                            >
                            
                            {/* Render Icon/Image based on type */}
                            {item.type === "recent" && (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gray-100 dark:bg-zinc-800 text-gray-500">
                                {item.data.type === 'text' && <Clock size={18} />}
                                {item.data.type === 'region' && <MapPin size={18} />}
                                {item.data.type === 'restaurant' && <Utensils size={18} />}
                              </div>
                            )}

                            {item.type === "category" && (
                              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center shrink-0">
                                <Utensils size={18} />
                              </div>
                            )}

                            {item.type === "region" && (
                              <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                                <MapPin size={20} />
                              </div>
                            )}

                            {item.type === "restaurant" && (
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0">
                                <Image src={item.data.image} alt={item.data.name} fill sizes="40px" className="object-cover" />
                              </div>
                            )}

                            {item.type === "exact" && (
                              <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                                <Search size={18} />
                              </div>
                            )}

                            {/* Render Content */}
                            <div className="min-w-0 flex-1">
                              {item.type === "recent" && (
                                <>
                                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {item.data.type === 'text' ? item.data.query : item.data.name}
                                  </h4>
                                  {item.data.type === 'restaurant' && (
                                    <p className="text-xs text-gray-400 truncate">{item.data.city}, {item.data.state}</p>
                                  )}
                                </>
                              )}

                              {item.type === "category" && (
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">Busca por Categoria: {item.data.name}</h4>
                              )}

                              {item.type === "region" && (
                                <>
                                  <h4 className="text-sm font-bold text-red-700 dark:text-red-400 truncate">Região: {item.data.name}</h4>
                                  <p className="text-xs text-red-500/80 truncate">{item.data.address || "Localidade"}</p>
                                </>
                              )}

                              {item.type === "restaurant" && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-2">{item.data.name}</h4>
                                    {item.data.rating > 0 && (
                                      <div className="flex items-center gap-1 text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold shrink-0">
                                        {item.data.rating.toFixed(1)} <Star size={8} fill="currentColor" />
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 truncate">{item.data.city}, {item.data.state}</p>
                                </>
                              )}

                              {item.type === "exact" && (
                                <>
                                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">Pesquisar por &quot;{item.query}&quot;</h4>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
