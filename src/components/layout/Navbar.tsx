"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Navigation, Star, ChevronDown, ChevronUp } from "lucide-react";
import { RestaurantCard } from "@/lib/services/restaurantService";

import { normalize } from "@/lib/utils";

const locations = [
  // Capital e Região Metropolitana (GSP)
  { name: "São Paulo, Brasil", short: "São Paulo" },
  { name: "Santo André, SP, Brasil", short: "Santo André" },
  { name: "São Bernardo do Campo, SP", short: "São Bernardo" },
  { name: "São Caetano do Sul, SP", short: "São Caetano" },
  { name: "Mauá, SP, Brasil", short: "Mauá" },
  { name: "Osasco, SP, Brasil", short: "Osasco" },
  { name: "Guarulhos, SP, Brasil", short: "Guarulhos" },
  { name: "Mogi das Cruzes, SP, Brasil", short: "Mogi das Cruzes" },
  { name: "Barueri (Alphaville), SP", short: "Barueri" },
  { name: "Santana de Parnaíba, SP", short: "Santana de Parnaíba" },

  // Interior de São Paulo
  { name: "Campinas, SP, Brasil", short: "Campinas" },
  { name: "Sorocaba, SP, Brasil", short: "Sorocaba" },
  { name: "Jundiaí, SP, Brasil", short: "Jundiaí" },
  { name: "São José dos Campos, SP", short: "São José dos Campos" },
  { name: "Ribeirão Preto, SP, Brasil", short: "Ribeirão Preto" },
  { name: "São José do Rio Preto, SP", short: "Rio Preto" },
  { name: "Bauru, SP, Brasil", short: "Bauru" },
  { name: "Piracicaba, SP, Brasil", short: "Piracicaba" },
  { name: "Indaiatuba, SP, Brasil", short: "Indaiatuba" },

  // Litoral de São Paulo
  { name: "Santos, SP, Brasil", short: "Santos" },
  { name: "Guarujá, SP, Brasil", short: "Guarujá" },
  { name: "Praia Grande, SP, Brasil", short: "Praia Grande" },
  { name: "Bertioaga, SP, Brasil", short: "Bertioga" },
  { name: "Ubatuba, SP, Brasil", short: "Ubatuba" },
  { name: "São Sebastião, SP, Brasil", short: "São Sebastião" },

  // Bairros Famosos da Capital (Para teste de busca por bairro)
  { name: "Santo Amaro, São Paulo, SP", short: "Santo Amaro" },
  { name: "Itaim Bibi, São Paulo, SP", short: "Itaim Bibi" },
  { name: "Vila Madalena, São Paulo, SP", short: "Vila Madalena" },
  { name: "Moema, São Paulo, SP", short: "Moema" },
  { name: "Pinheiros, São Paulo, SP", short: "Pinheiros" },
  { name: "Jardins, São Paulo, SP", short: "Jardins" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [location, setLocation] = useState("São Paulo");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<RestaurantCard[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  // New states for location searching
  const [locationInput, setLocationInput] = useState("São Paulo");

  const filteredLocations = showLocationDropdown
    ? locations.filter(loc => normalize(loc.name).includes(normalize(locationInput)))
    : [];

  const locationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // Busca em tempo real da API / Mock consolidado
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const params = new URLSearchParams();
          if (location) params.set("loc", location);
          if (searchQuery) params.set("q", searchQuery);
          
          const response = await fetch(`/api/restaurants?${params.toString()}`);
          if (!response.ok) throw new Error("Failed to fetch suggestions");
          
          const results = await response.json();
          setSuggestions(results.slice(0, 5)); // Mostra até 5 resultados
          setShowSearchDropdown(true);
        } catch (error) {
          console.error("Erro na busca de sugestões:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, location]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSearchDropdown(false);
    setShowLocationDropdown(false);
    
    if (searchQuery.trim() || location.trim()) {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (location) params.set("loc", location);
      router.push(`/?${params.toString()}`);
    }
  };

  const selectLocation = (loc: string) => {
    setLocation(loc);
    setShowLocationDropdown(false);
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    params.set("loc", loc);
    router.push(`/?${params.toString()}`);
  };

  const detectLocation = () => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Em uma app real, usaríamos reverse geocoding aqui
          // Para o mock, vamos fingir que detectamos São Paulo
          setTimeout(() => {
            selectLocation("São Paulo");
            setIsDetecting(false);
          }, 1500);
        },
        () => setIsDetecting(false)
      );
    } else {
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (["/login", "/signup"].includes(pathname)) return null;

  return (
    <header 
      id="main-nav"
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm" : "bg-white border-b border-transparent"
      }`}
    >
      <nav aria-label="Navegação principal" className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        
        {/* Logo & Mock Indicator */}
        <div className="flex items-center gap-4">
          <Link href="/" className="shrink-0 flex items-center gap-2.5 group transition-all duration-300 hover:scale-[1.02]">
            <Image
              src="/logo-icon-48.png"
              alt="Logo Prato Ideal"
              width={40}
              height={40}
              className="object-contain transition-transform duration-500 group-hover:rotate-[15deg]"
              priority
            />
            <span className="text-xl font-extrabold tracking-tight font-outfit bg-gradient-to-r from-[#B33817] to-[#DD9318] bg-clip-text text-transparent">
              Prato Ideal
            </span>
          </Link>

          {process.env.NEXT_PUBLIC_USE_MOCK === "true" && (
            <div className="flex animate-in fade-in slide-in-from-left-2 duration-700">
              <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-200 shadow-sm flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                MODO SIMULADO ATIVO
              </span>
            </div>
          )}
        </div>

        {/* Unified Search Bar (Zomato Style) */}
        <div 
          className="hidden md:flex flex-1 max-w-2xl mx-8 relative"
          role="search"
          aria-label="Busca de restaurantes e localidades"
        >
          <div className="w-full flex items-center bg-white border border-gray-200 hover:border-gray-300 rounded-2xl h-14 transition-all duration-300 shadow-sm hover:shadow-md overflow-visible">
            
            {/* Location Section */}
            <div ref={locationRef} className="relative flex items-center h-full flex-[0.4] min-w-[150px]">
              <MapPin size={20} className="ml-4 text-red-500 shrink-0" />
              <input 
                type="text" 
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setShowLocationDropdown(true);
                  setShowSearchDropdown(false);
                }}
                onFocus={() => {
                  setLocationInput("");
                  setShowLocationDropdown(true);
                  setShowSearchDropdown(false);
                }}
                onBlur={() => {
                  // Restaura o nome da cidade se o usuário sair sem selecionar nada
                  setTimeout(() => {
                    if (!showLocationDropdown) setLocationInput(location);
                  }, 200);
                }}
                placeholder={location}
                className="w-full bg-transparent text-sm font-medium outline-none text-gray-700 placeholder-gray-500 pl-2 pr-2"
              />
              <button 
                onClick={() => {
                  if (!showLocationDropdown) {
                    setLocationInput("");
                  }
                  setShowLocationDropdown(!showLocationDropdown);
                }}
                aria-expanded={showLocationDropdown}
                aria-haspopup="listbox"
                aria-label="Selecionar localização"
                className="p-1 mr-2 hover:bg-gray-100 rounded-md transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {showLocationDropdown ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              <AnimatePresence>
                {showLocationDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    role="listbox"
                    className="absolute left-0 top-[calc(100%+12px)] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 overflow-hidden"
                  >
                    <button 
                      onClick={detectLocation}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 mb-2 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <Navigation size={18} className={isDetecting ? "animate-spin" : ""} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-500">Detectar localização</p>
                        <p className="text-[10px] text-gray-400 font-medium">Using GPS</p>
                      </div>
                    </button>

                    <div className="px-5 py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Localidades {locationInput ? 'Encontradas' : 'Recentes'}</p>
                      <div className="space-y-1">
                        {filteredLocations.map((loc) => (
                          <button 
                            key={loc.name}
                            onClick={() => {
                              selectLocation(loc.short);
                              setLocationInput(loc.short);
                            }}
                            className="w-full flex items-center gap-3 py-3 text-sm text-gray-600 hover:text-red-500 transition-colors border-b border-gray-50 last:border-0 group/loc"
                          >
                            <MapPin size={14} className="text-gray-300 group-hover/loc:text-red-400" />
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 group-hover/loc:text-red-500 transition-colors">{loc.short}</span>
                              <span className="text-[10px] text-gray-400">{loc.name.split(',')[1] || 'S/N'}</span>
                            </div>
                          </button>
                        ))}
                        {filteredLocations.length === 0 && (
                          <div className="py-8 text-center">
                            <MapPin size={24} className="mx-auto text-gray-200 mb-2" />
                            <p className="text-sm text-gray-400">Nenhum local encontrado</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-gray-300 mx-2 shrink-0" />

            {/* Search Section */}
            <div ref={searchRef} className="relative flex items-center h-full flex-1">
              <Search size={20} className="ml-2 text-gray-400 shrink-0 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setShowLocationDropdown(false);
                  if (suggestions.length > 0 || searchQuery.length > 1) setShowSearchDropdown(true);
                }}
                placeholder="Procurar por um restaurante, prato ou culinária..."
                aria-label="Procurar restaurante, prato ou culinária"
                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 h-full pl-3 pr-4"
              />

              <AnimatePresence>
                {showSearchDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    role="listbox"
                    className="absolute right-0 top-[calc(100%+12px)] w-full bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 max-h-[400px] overflow-y-auto"
                  >
                    <div className="px-5 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Resultados Encontrados</p>
                      <div className="space-y-3">
                        {suggestions.map((res) => (
                          <button 
                            key={res.id}
                            onClick={() => {
                              setSearchQuery(res.name);
                              handleSearch();
                            }}
                            className="w-full flex items-center gap-4 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              <Image src={res.image} alt={res.name} fill sizes="48px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-900 truncate">{res.name}</h4>
                                <div className="flex items-center gap-1 text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold">
                                  {res.rating ? res.rating.toFixed(1) : "N/A"} <Star size={8} fill="currentColor" />
                                </div>
                              </div>
                              <p className="text-xs text-gray-400 font-medium">{res.city}, {res.state}</p>
                            </div>
                          </button>
                        ))}
                        {suggestions.length === 0 && searchQuery.length > 1 && (
                          <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                              <Search size={20} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Nenhum resultado encontrado</p>
                            <p className="text-xs text-gray-400 mt-1">Tente buscar por outro nome ou prato</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors py-2 px-4 rounded-full hover:bg-gray-100 hidden sm:block"
          >
            Home
          </Link>
          <Link 
            href="/sobre" 
            className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors py-2 px-4 rounded-full hover:bg-gray-100 hidden sm:block"
          >
            Sobre Nós
          </Link>
          <Link 
            href="/contato" 
            className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors py-2 px-4 rounded-full hover:bg-gray-100 hidden sm:block"
          >
            Contato
          </Link>

          {status === "authenticated" && session?.user ? (
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
                aria-label="Menu do usuário"
                className="flex items-center gap-2 py-1 px-2 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {session.user.image ? (
                  <Image src={session.user.image} alt={session.user.name || "User"} width={32} height={32} className="w-8 h-8 rounded-full border border-gray-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-bold text-xs capitalize">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden lg:block">{session.user.name?.split(" ")[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 overflow-hidden"
                  >
                  <div className="px-5 py-3 border-b border-gray-50 mb-2">
                    <p className="text-sm font-black text-gray-900 truncate">{session.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                  </div>
                  
                  <div className="px-2 space-y-1">
                    <Link 
                      href="/perfil"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-500 rounded-xl transition-all flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Meu Perfil
                    </Link>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-500 rounded-xl transition-all flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                        Favoritos
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-500 rounded-xl transition-all flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                        Configurações
                      </button>
                    </div>

                    <div className="border-t border-gray-50 mt-2 pt-2 px-2">
                      <button 
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                        Sair da Conta
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors py-2 px-4 rounded-full hover:bg-gray-100 hidden sm:block"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="bg-red-500 hover:bg-red-600 text-white font-medium text-sm py-2.5 px-6 rounded-full shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Mobile Menu */}
          <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
        </div>

      </nav>
    </header>
  );
}