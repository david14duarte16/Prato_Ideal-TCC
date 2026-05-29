"use client";

import { motion, Variants, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { RestaurantDetails } from "@/lib/services/restaurantService";
import { Star, MapPin, Phone, Clock, MessageSquare, Navigation, User, Heart, Send, Share2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useSession, signIn } from "next-auth/react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { apiClient } from "@/lib/services/apiClient";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/Toast";

interface Props {
  restaurant: RestaurantDetails;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function RestaurantDetailClient({ restaurant }: Props) {
  const [activePhoto, setActivePhoto] = useState(restaurant.photos[0] || restaurant.image);

  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();

  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const favorite = isLoaded ? isFavorite(restaurant.id) : false;

  const [localReviews, setLocalReviews] = useState(restaurant.reviews || []);
  const [prevId, setPrevId] = useState(restaurant.id);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer state update to next tick to avoid synchronous "cascading render" warnings
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize state when the restaurant changes to avoid stale data
  if (restaurant.id !== prevId) {
    setPrevId(restaurant.id);
    setLocalReviews(restaurant.reviews || []);
  }

  const [newReview, setNewReview] = useState({ rating: 5, comment: "", userName: "", files: [] as File[] });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const allReviewPhotos = localReviews?.flatMap(r => r.photos || []) || [];

  const openLightbox = (photoUrl: string) => {
    const index = allReviewPhotos.indexOf(photoUrl);
    setActivePhotoIndex(index !== -1 ? index : 0);
    setLightboxOpen(true);
  };


  useEffect(() => {
    let isSubscribed = true;
    const fetchReviews = async () => {
      try {
        const res = await apiClient.get(`/Review/restaurante/${restaurant.id}`);
        if (res.data && Array.isArray(res.data) && isSubscribed) {
          const mapped = res.data.map((r: any, index: number) => {
            // C# APIs often serialize to PascalCase or camelCase depending on the JSON formatter
            const id = r.id || r.Id || `api-review-${index}-${Date.now()}`;
            const rating = r.nota || r.Nota || 0;
            const comment = r.comentario || r.Comentario || "";
            const rawDate = r.data || r.Data || new Date().toISOString();
            
            // Check for valid date
            let formattedDate = "";
            try {
              const d = new Date(rawDate);
              formattedDate = isNaN(d.getTime()) ? new Date().toLocaleDateString('pt-BR') : d.toLocaleDateString('pt-BR');
            } catch {
              formattedDate = new Date().toLocaleDateString('pt-BR');
            }

            return {
              id,
              userName: "Membro da Comunidade", // API não retorna o nome no GET do Review
              rating,
              comment,
              date: formattedDate,
              userImage: null,
              photos: r.fotos || r.Fotos || [],
              restaurantId: r.idRestaurante || r.IdRestaurante,
            };
          });
          // Prepend new mock reviews to existing restaurant.reviews just for display
          const combined = [...mapped, ...(restaurant.reviews || [])];
          setLocalReviews(combined);
        }
      } catch (e) {
        console.error("Failed to fetch reviews", e);
        // Fallback para mock/local storage se falhar
        const stored = localStorage.getItem(`reviews_${restaurant.id}`);
        if (stored && isSubscribed) {
          try {
            setLocalReviews(JSON.parse(stored));
          } catch {}
        }
      }
    };
    fetchReviews();
    return () => { isSubscribed = false; };
  }, [restaurant.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    
    try {
      if (session?.user && (session.user as any).id) {
        const userId = (session.user as any).id;
        const token = (session.user as any).accessToken;
        // Salva na API Render
        try {
          const formData = new FormData();
          formData.append('IdRestaurante', restaurant.id);
          formData.append('NomeRestaurante', restaurant.name);
          formData.append('Nota', newReview.rating.toString());
          formData.append('Comentario', newReview.comment);
          formData.append('Data', new Date().toISOString());
          
          if (newReview.files && newReview.files.length > 0) {
            newReview.files.forEach(file => {
              formData.append('Fotos', file);
            });
          }
          
          const headers: HeadersInit = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log("Token JWT anexado com sucesso. Tamanho:", token.length);
          } else {
            console.error("ALERTA: O token JWT está vazio ou indefinido!");
          }

          console.log("Enviando formulário:", Array.from(formData.entries()));

          const response = await fetch('/api/render/Review', {
            method: 'POST',
            headers,
            body: formData
          });

          if (!response.ok) {
            if (response.status === 400) {
              console.warn("API retornou 400. Salvando apenas no LocalStorage como fallback.");
            } else {
              const errText = await response.text();
              throw new Error(`API Error ${response.status}: ${errText}`);
            }
          }
        } catch (apiError: any) {
          console.error("Erro na API ao enviar avaliação:", apiError);
        }
      }
      
      // Atualização otimista na tela
      const photoUrls = newReview.files.map(f => URL.createObjectURL(f));

      const review = {
        id: `local-${Date.now()}`,
        userName: session?.user?.name || newReview.userName || "Visitante",
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toLocaleDateString('pt-BR'),
        userEmail: session?.user?.email || "guest",
        userImage: session?.user?.image,
        photos: photoUrls,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name
      };
      
      const updated = [review, ...localReviews];
      setLocalReviews(updated);
      localStorage.setItem(`reviews_${restaurant.id}`, JSON.stringify(updated));
      
      setNewReview({ rating: 5, comment: "", userName: "", files: [] });
      setShowReviewForm(false);
      toast("Avaliação publicada com sucesso!", "success");
    } catch (error) {
      console.error("Falha ao salvar review", error);
      toast("Houve um erro ao salvar sua avaliação. Tente novamente.", "error");
    }
  };

  const displayRating = localReviews.length > 0 
    ? (localReviews.reduce((acc, cur) => acc + cur.rating, 0) / localReviews.length).toFixed(1)
    : restaurant.rating.toFixed(1);

  return (
    <motion.main 
      initial="hidden" 
      animate="visible" 
      variants={staggerContainer}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
    >
      {/* Hero Section */}
      <motion.div variants={fadeInUp} className="relative h-[40vh] md:h-[50vh] w-full rounded-3xl overflow-hidden shadow-2xl mb-8 group">
        <Image
          src={activePhoto}
          alt={restaurant.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-5 md:p-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold font-outfit mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-4 text-gray-200">
              <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <MapPin size={16} /> {restaurant.city}, {restaurant.state}
              </span>
              <span className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/20 font-semibold">
                <Star size={16} className="fill-current" /> {displayRating}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (navigator.share) {
                  navigator.share({
                    title: `Conheça ${restaurant.name} no Prato Ideal!`,
                    text: `Olha só esse restaurante incrível que eu encontrei!`,
                    url: window.location.href,
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast("Link copiado para a área de transferência!", "success");
                }
              }}
              className="p-3 rounded-xl backdrop-blur-md border border-white/10 bg-black/40 text-white hover:bg-black/60 transition-all shadow-lg flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
              aria-label="Compartilhar"
            >
              <Share2 size={24} />
            </button>
            <button 
              onClick={(e) => {
                if (status === "unauthenticated") {
                  openAuthModal("Para salvar seus restaurantes favoritos, você precisa ter uma conta ativa.");
                  return;
                }
                toggleFavorite({ place_id: restaurant.id, id: restaurant.id, name: restaurant.name, image: restaurant.image }, e);
              }}
              className={`p-3 rounded-xl backdrop-blur-md border transition-all shadow-lg flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 ${favorite ? 'bg-white/90 border-white text-red-500 hover:bg-white' : 'bg-black/40 border-white/10 text-white hover:bg-black/60'}`}
              aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart size={24} className={favorite ? "fill-red-500" : ""} />
            </button>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Traçar rota para ${restaurant.name} no Google Maps`}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Navigation size={20} aria-hidden="true" />
              Como Chegar
            </a>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Section */}
          <motion.section variants={fadeInUp} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Sobre o Restaurante</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              {restaurant.description}
            </p>
          </motion.section>

          {/* Photo Gallery */}
          {restaurant.photos.length > 1 && (
            <motion.section variants={fadeInUp} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Fotos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {restaurant.photos.map((photo, index) => (
                  <button 
                    key={index}
                    onClick={() => setActivePhoto(photo)}
                    aria-label={`Visualizar foto ${index + 1}`}
                    aria-pressed={activePhoto === photo}
                    className={`relative h-24 md:h-32 rounded-2xl overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500 ${activePhoto === photo ? 'ring-4 ring-red-500 ring-offset-2 scale-95' : 'hover:scale-105 hover:shadow-lg opacity-80 hover:opacity-100'}`}
                  >
                    <Image src={photo} alt={`Foto ${index + 1}`} fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Reviews Section */}
          <motion.section variants={fadeInUp} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Avaliações</h2>
              <button 
                onClick={() => {
                  if (status === "unauthenticated") {
                    openAuthModal("Para realizar uma avaliação e contar sua experiência, você precisa ter uma conta ativa.");
                    return;
                  }
                  if (!showReviewForm && !newReview.userName) {
                    setNewReview(prev => ({ ...prev, userName: session?.user?.name || "" }));
                  }
                  setShowReviewForm(!showReviewForm);
                }}
                aria-label="Deixar uma avaliação"
                className="text-red-500 hover:text-red-600 font-medium flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg px-2 py-1"
              >
                <MessageSquare size={18} aria-hidden="true" /> Avaliar
              </button>
            </div>

            <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mb-12"
                  >
                    {status === "unauthenticated" ? (
                      <div className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 rounded-3xl p-10 text-center shadow-inner mt-4">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <User size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Faça login para avaliar</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 font-light max-w-sm mx-auto">
                          Autentique-se com sua conta para compartilhar sua experiência com outras pessoas e manter um histórico no seu Perfil.
                        </p>
                        <button 
                          onClick={() => signIn("google")}
                          className="bg-red-500 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-600 hover:-translate-y-1 transition-all"
                        >
                          Entrar com Google
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-5 md:p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-none mt-4 relative">
                        <div className="absolute -top-3 left-10 w-6 h-6 bg-white dark:bg-zinc-800 border-t border-l border-gray-100 dark:border-zinc-700 rotate-45"></div>
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Sua avaliação</h3>
                        <div className="flex gap-2 mb-4">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button 
                              key={star} 
                              type="button" // Important to prevent form submission
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full p-1 transition-transform hover:scale-110"
                            >
                              <Star size={24} className={star <= newReview.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"} />
                            </button>
                          ))}
                        </div>
                        <input 
                          type="text" 
                          placeholder={mounted ? (session?.user?.name || "Seu nome") : "Seu nome"} 
                          value={newReview.userName}
                          onChange={(e) => setNewReview({...newReview, userName: e.target.value})}
                          className="w-full mb-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-zinc-700 dark:text-white" 
                        />
                        <textarea 
                          placeholder="Conte-nos sobre sua experiência..." 
                          value={newReview.comment}
                          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                          rows={3}
                          className="w-full mb-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-zinc-700 dark:text-white resize-none" 
                        />
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Anexar Fotos (Máximo de 5)
                          </label>
                          <input 
                            type="file" 
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const selectedFiles = Array.from(e.target.files || []);
                              if (selectedFiles.length > 5) {
                                toast("Limite excedido: Você só pode anexar no máximo 5 fotos.", "error");
                                e.target.value = ''; // Reseta o input
                                return;
                              }
                              setNewReview({...newReview, files: selectedFiles});
                            }}
                            className="w-full text-sm text-gray-500 dark:text-gray-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-red-50 file:text-red-700
                              dark:file:bg-red-500/10 dark:file:text-red-400
                              hover:file:bg-red-100 dark:hover:file:bg-red-500/20
                              cursor-pointer"
                          />
                          {newReview.files.length > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              {newReview.files.length} foto(s) selecionada(s).
                            </p>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                          <button type="button" onClick={() => setShowReviewForm(false)} className="px-5 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors">Cancelar</button>
                          <button 
                            type="submit" 
                            disabled={!newReview.comment.trim()} 
                            className="w-full bg-red-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                            Publicar Avaliação <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            {localReviews && localReviews.length > 0 ? (
              <div className="space-y-6" role="list" aria-label="Lista de avaliações">
                {localReviews.map((review) => (
                  <div key={review.id} role="listitem" className="p-6 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 hover:border-gray-200 dark:hover:border-zinc-600 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {review.userImage ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-700">
                            <Image src={review.userImage} alt={review.userName} width={40} height={40} className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-linear-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                            <User size={20} />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{review.userName}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full shadow-sm text-sm font-semibold text-gray-800 dark:text-gray-200" aria-label={`Avaliação: ${review.rating} estrelas`}>
                        <Star size={14} className="text-yellow-500 fill-current" aria-hidden="true" />
                        {(Number(review.rating) || 0).toFixed(1)}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                    {review.photos && review.photos.length > 0 && (
                      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x">
                        {review.photos.map((photo: string, i: number) => (
                           <div 
                             key={i} 
                             onClick={() => openLightbox(photo)}
                             className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 shadow-sm snap-start group cursor-pointer"
                           >
                             <img src={photo} alt={`Foto enviada por ${review.userName}`} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" />
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* ESTADO VAZIO / TEMPLATE (SKELETON) */
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 border-dashed">
                <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4" aria-hidden="true">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Seja o primeiro a avaliar!</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                  Estamos integrando nosso novo banco de dados. Em breve as avaliações estarão disponíveis.
                </p>
                <div className="w-full max-w-md space-y-4 opacity-40 select-none pointer-events-none" aria-hidden="true">
                  {/* Skeletons para ilustrar o modelo Pós-API */}
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(localReviews && localReviews.length > 0) && (
              <button className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                Carregar mais avaliações
              </button>
            )}
          </motion.section>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Info Card */}
          <motion.section variants={fadeInUp} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-zinc-800 sticky top-24">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Informações</h3>
            
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500 font-medium mb-1">Horário de Funcionamento</p>
                  {restaurant.openingHours && restaurant.openingHours.length > 0 ? (
                    <div className="text-gray-900 font-medium text-sm w-full mt-2 flex flex-col gap-1">
                      {restaurant.openingHours.map((hour, idx) => {
                        const parts = hour.split(': ');
                        const day = parts[0];
                        const time = parts.length > 1 ? parts.slice(1).join(': ') : '';
                        
                        const isToday = idx === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

                        return (
                          <div 
                            key={idx} 
                            className={`flex flex-col xl:flex-row justify-between xl:items-start gap-1 py-2 border-b border-dashed border-gray-100 last:border-0 ${isToday ? "bg-green-50/50 px-3 rounded-lg -mx-3 shadow-sm ring-1 ring-green-100/50" : ""}`}
                          >
                            <span className={`capitalize shrink-0 xl:w-28 mt-0.5 ${isToday ? "font-bold text-green-700" : "text-gray-500 font-normal"}`}>{day}</span>
                            <span className={`xl:text-right leading-relaxed ${isToday ? "font-black text-green-700 font-outfit tracking-wide" : "text-gray-800"}`}>
                              {time || hour}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-900 font-medium">Aberto até {restaurant.openUntil}</p>
                      <p className="text-sm text-green-600 mt-1">Verifique localmente</p>
                    </>
                  )}
                </div>
              </li>
              
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Contato</p>
                  <p className="text-gray-900 dark:text-white font-medium">{restaurant.phone}</p>
                </div>
              </li>

              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Endereço</p>
                  <p className="text-gray-900 dark:text-white font-medium leading-relaxed">{restaurant.address}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{restaurant.distance}</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
              <div className="w-full h-64 bg-gray-100 dark:bg-zinc-800 rounded-2xl overflow-hidden relative border border-gray-200/50 dark:border-zinc-700">
                <iframe
                  title="Mapa do Restaurante"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${restaurant.coordinates.lat},${restaurant.coordinates.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ', ' + restaurant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 mt-1 bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl flex items-center justify-center gap-2 border border-gray-200 dark:border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <MapPin size={18} /> Abrir no Google Maps
              </a>
            </div>
          </motion.section>

        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxOpen && allReviewPhotos.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          >
            {/* Close Button */}
            <button 
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-white/10 rounded-full transition-colors z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={28} />
            </button>

            {/* Content */}
            <div className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center p-4 md:p-12">
              
              {/* Prev Button */}
              {allReviewPhotos.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex(prev => prev === 0 ? allReviewPhotos.length - 1 : prev - 1);
                  }}
                  className="absolute left-4 md:left-12 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-white/10 rounded-full transition-colors z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronLeft size={32} />
                </button>
              )}

              {/* Main Image */}
              <motion.img 
                key={activePhotoIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                src={allReviewPhotos[activePhotoIndex]} 
                alt={`Foto da galeria ${activePhotoIndex + 1}`} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />

              {/* Next Button */}
              {allReviewPhotos.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex(prev => prev === allReviewPhotos.length - 1 ? 0 : prev + 1);
                  }}
                  className="absolute right-4 md:right-12 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-white/10 rounded-full transition-colors z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronRight size={32} />
                </button>
              )}

              {/* Counter Indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white/90 text-sm font-medium tracking-wider">
                {activePhotoIndex + 1} / {allReviewPhotos.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
