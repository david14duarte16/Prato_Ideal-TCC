import Image from "next/image";
import Link from "next/link";
import { Restaurant } from "@/lib/mockData";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurante/${restaurant.id}`} className="group cursor-pointer rounded-2xl bg-white border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm font-semibold text-sm flex items-center gap-1 text-gray-800">
          <span className="text-yellow-500 mr-1">★</span>
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-2 grow">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-red-500 transition-colors">
          {restaurant.name}
        </h3>
        
        <div className="text-sm text-gray-500 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{restaurant.city}, {restaurant.state} • {restaurant.distance}</span>
          </div>
          
          <div className="flex items-center gap-1.5 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-green-600 font-medium">Aberto até {restaurant.openUntil}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
