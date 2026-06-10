"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, Suspense } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import SearchBar from "./SearchBar";



export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



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
        scrolled ? "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 shadow-sm" : "bg-white dark:bg-zinc-950 border-b border-transparent"
      }`}
    >
      <nav aria-label="Navegação principal" className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 sm:px-6 lg:px-8 py-3 md:py-0 md:h-20">
        
        {/* Logo & Mock Indicator */}
        <div className="flex items-center gap-4">
          <Link href="/" className="shrink-0 flex items-center gap-2.5 group transition-all duration-300 hover:scale-[1.02]">
            <Image
              src="/logo-icon-48.png"
              alt="Logo Prato Ideal"
              width={40}
              height={40}
              className="object-contain transition-transform duration-500 group-hover:rotate-15"
              priority
            />
            <span className="text-xl font-extrabold tracking-tight font-outfit bg-linear-to-r from-[#B33817] to-[#DD9318] bg-clip-text text-transparent">
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

        {/* Search Bar Refatorada com Suspense Boundary para Next 16 */}
        <Suspense fallback={<div className="flex-1 max-w-2xl mx-8 h-14 bg-gray-50 dark:bg-zinc-900 rounded-2xl animate-pulse border border-gray-100 dark:border-zinc-800 hidden md:block" />}>
          <SearchBar />
        </Suspense>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/" 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors py-2 px-4 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 hidden sm:block"
          >
            Home
          </Link>
          <Link 
            href="/sobre" 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors py-2 px-4 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 hidden sm:block"
          >
            Sobre Nós
          </Link>
          <Link 
            href="/contato" 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors py-2 px-4 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 hidden sm:block"
          >
            Contato
          </Link>

          {status === "authenticated" && session?.user ? (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
                aria-label="Menu do usuário"
                className="flex items-center gap-2 py-1 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    width={32} 
                    height={32} 
                    unoptimized={session.user.image.includes('armazenamentopratoideal') || session.user.image.includes('blob.core.windows.net')}
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover" 
                  />
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
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl dark:shadow-none border border-gray-100 dark:border-zinc-800 py-3 z-50 overflow-hidden"
                  >
                  <div className="px-5 py-3 border-b border-gray-50 dark:border-zinc-800/50 mb-2">
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">{session.user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
                  </div>
                  
                  <div className="px-2 space-y-1">
                    <Link 
                      href="/perfil"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-red-500 dark:hover:text-red-500 rounded-xl transition-all flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Meu Perfil
                    </Link>
                      <Link 
                        href="/favoritos"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-red-500 dark:hover:text-red-500 rounded-xl transition-all flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        Favoritos
                      </Link>
                      <Link 
                        href="/configuracoes"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-red-500 dark:hover:text-red-500 rounded-xl transition-all flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                        Configurações
                      </Link>
                    </div>

                    <div className="border-t border-gray-50 dark:border-zinc-800/50 mt-2 pt-2 px-2">
                      <button 
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl font-bold transition-all flex items-center gap-2"
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
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors py-2 px-4 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 hidden sm:block"
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

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 h-[calc(100vh-64px)] z-50 bg-white dark:bg-zinc-950 overflow-y-auto border-t border-gray-100 dark:border-zinc-800 shadow-2xl"
          >
            <div className="flex flex-col pb-12">
              
              {/* Highlight Profile Info na Liderança (Topo do Mobile Menu) */}
              {status === "authenticated" && session?.user ? (
                <div className="bg-gray-50 dark:bg-zinc-900/80 px-6 py-6 border-b border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-4">
                    {session.user.image ? (
                      <Image 
                        src={session.user.image} 
                        alt="User" 
                        width={56} 
                        height={56}
                        unoptimized={session.user.image.includes('armazenamentopratoideal') || session.user.image.includes('blob.core.windows.net')}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-black text-2xl capitalize shadow-sm">
                        {session.user.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-lg font-black text-gray-900 dark:text-white truncate">{session.user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Links Principais (Navegação Padrão) */}
              <div className="px-6 py-6 flex flex-col gap-5">
                <Link 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block text-lg font-bold text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors"
                >
                  Home
                </Link>
                <Link 
                  href="/sobre" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block text-lg font-bold text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors"
                >
                  Sobre Nós
                </Link>
                <Link 
                  href="/contato" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block text-lg font-bold text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors"
                >
                  Contato
                </Link>
              </div>

              {/* Links Específicos do Usuário (Ou Auth Calls to Action) */}
              {status === "authenticated" && session?.user ? (
                <>
                  <div className="w-full h-px bg-gray-100 dark:bg-zinc-800 my-2" />
                  <div className="px-6 py-6 flex flex-col gap-5">
                    <Link href="/perfil" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-gray-600 dark:text-gray-400 hover:text-red-500">Meu Perfil</Link>
                    <Link href="/favoritos" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-gray-600 dark:text-gray-400 hover:text-red-500">Favoritos</Link>
                    <Link href="/configuracoes" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-gray-600 dark:text-gray-400 hover:text-red-500">Configurações</Link>
                    
                    <button 
                      onClick={() => { signOut(); setIsMobileMenuOpen(false); }} 
                      className="w-full text-center text-base text-red-500 font-bold mt-4 py-3.5 bg-red-50 dark:bg-red-500/10 rounded-2xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                      Sair da Conta
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full h-px bg-gray-100 dark:bg-zinc-800 my-2" />
                  <div className="px-6 py-6 flex flex-col gap-4">
                    <Link 
                      href="/login" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="block font-bold text-center py-4 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-2xl transition-colors text-lg"
                    >
                      Log in
                    </Link>
                    <Link 
                      href="/signup" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="block font-bold text-center py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-colors text-lg shadow-md"
                    >
                      Sign up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}